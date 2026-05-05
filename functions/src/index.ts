import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { sendExpoPush } from './expoPush';
import { resolveRecipients } from './recipients';

export { onReadingActivityFinished } from './onReadingActivityFinished';

initializeApp();

const REGION = 'asia-northeast1';

const DEFAULT_TITLE = 'Yomoyo';
const DEFAULT_BODY = '眠たいキツネが「ノルウェイの森」を読み終えました。';

interface SendTestPushInput {
  token?: string;
  title?: string;
  body?: string;
}

export const sendTestPush = onCall<SendTestPushInput>(
  { region: REGION, invoker: 'public' },
  async (req) => {
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Sign-in required.');
    }
    const uid = req.auth.uid;
    const data = req.data ?? {};
    const explicitToken =
      typeof data.token === 'string' && data.token.length > 0
        ? data.token
        : undefined;
    const title = typeof data.title === 'string' ? data.title : DEFAULT_TITLE;
    const body = typeof data.body === 'string' ? data.body : DEFAULT_BODY;

    const token = explicitToken ?? (await loadOwnLatestToken(uid));
    if (!token) {
      throw new HttpsError(
        'failed-precondition',
        'No push token available for this user.',
      );
    }

    const tokenPrefix = redactToken(token);
    logger.info('sendTestPush invoked', { uid, tokenPrefix });

    try {
      const ticket = await sendExpoPush(token, { title, body });
      logger.info('sendTestPush sent', {
        uid,
        tokenPrefix,
        ticketStatus: ticket.status,
      });
      return { ok: true as const, ticket };
    } catch (err) {
      logger.error('sendTestPush failed', {
        uid,
        tokenPrefix,
        error: err instanceof Error ? err.message : String(err),
      });
      throw new HttpsError('internal', 'Failed to send push notification.');
    }
  },
);

async function loadOwnLatestToken(uid: string): Promise<string | null> {
  const db = getFirestore();
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('pushTokens')
    .get();
  if (snap.empty) return null;

  type Candidate = { token: string; updatedAtMs: number };
  const candidates: Candidate[] = [];
  for (const doc of snap.docs) {
    if (doc.get('enabled') !== true) continue;
    const token = doc.get('token');
    if (typeof token !== 'string' || token.length === 0) continue;
    const updatedAt = doc.get('updatedAt');
    const updatedAtMs =
      updatedAt && typeof updatedAt.toMillis === 'function'
        ? updatedAt.toMillis()
        : 0;
    candidates.push({ token, updatedAtMs });
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
  return candidates[0].token;
}

function redactToken(token: string): string {
  const head = token.slice(0, 18);
  return `${head}…`;
}

interface DryRunResolveRecipientsInput {
  sourceUid?: string;
}

interface DryRunRecipient {
  uid: string;
  tokenPrefix: string;
}

interface DryRunResolveRecipientsResult {
  count: number;
  recipients: DryRunRecipient[];
}

export const dryRunResolveRecipients = onCall<DryRunResolveRecipientsInput>(
  { region: REGION, invoker: 'public' },
  async (req): Promise<DryRunResolveRecipientsResult> => {
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Sign-in required.');
    }
    const callerUid = req.auth.uid;
    const requestedSourceUid = req.data?.sourceUid;
    if (
      typeof requestedSourceUid === 'string' &&
      requestedSourceUid.length > 0 &&
      requestedSourceUid !== callerUid
    ) {
      throw new HttpsError(
        'permission-denied',
        'sourceUid override is not allowed.',
      );
    }

    const db = getFirestore();
    try {
      const recipients = await resolveRecipients(db, callerUid);
      const safe: DryRunRecipient[] = recipients.map((r) => ({
        uid: r.uid,
        tokenPrefix: redactToken(r.token),
      }));

      logger.info('dryRunResolveRecipients invoked', {
        uid: callerUid,
        count: safe.length,
      });

      return { count: safe.length, recipients: safe };
    } catch (err) {
      logger.error('dryRunResolveRecipients failed', {
        uid: callerUid,
        error: err instanceof Error ? err.message : String(err),
      });
      throw new HttpsError('internal', 'Failed to resolve recipients.');
    }
  },
);
