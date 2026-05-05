import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { sendExpoPush } from './expoPush';
import { resolveRecipients } from './recipients';

const REGION = 'asia-northeast1';
const PUSH_TITLE = 'Yomoyo';

export interface ValidatedActivity {
  userId: string;
  displayLabel: string;
  title: string;
}

export type ValidationResult =
  | { ok: true; data: ValidatedActivity }
  | { ok: false; reason: string };

export function validateActivityForNotification(
  raw: unknown,
): ValidationResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, reason: 'no-data' };
  }
  const data = raw as Record<string, unknown>;
  if (data.status !== 'finished') {
    return { ok: false, reason: 'status-not-finished' };
  }
  const userId = data.userId;
  if (typeof userId !== 'string' || userId.length === 0) {
    return { ok: false, reason: 'missing-userId' };
  }
  const displayLabel = data.displayLabel;
  if (typeof displayLabel !== 'string' || displayLabel.length === 0) {
    return { ok: false, reason: 'missing-displayLabel' };
  }
  const title = data.title;
  if (typeof title !== 'string' || title.length === 0) {
    return { ok: false, reason: 'missing-title' };
  }
  return { ok: true, data: { userId, displayLabel, title } };
}

export function buildNotificationPayload(
  displayLabel: string,
  bookTitle: string,
): { title: string; body: string } {
  return {
    title: PUSH_TITLE,
    body: `${displayLabel}が「${bookTitle}」を読み終えました。`,
  };
}

export function excludeActor<T extends { uid: string }>(
  recipients: readonly T[],
  actorUid: string,
): T[] {
  return recipients.filter((r) => r.uid !== actorUid);
}

export const onReadingActivityFinished = onDocumentCreated(
  {
    document: 'readingActivities/{activityId}',
    region: REGION,
  },
  async (event) => {
    const activityId = event.params.activityId;
    const snap = event.data;
    if (!snap) {
      logger.warn('onReadingActivityFinished: no snapshot', { activityId });
      return;
    }

    const validation = validateActivityForNotification(snap.data());
    if (!validation.ok) {
      logger.info('onReadingActivityFinished: skipped', {
        activityId,
        reason: validation.reason,
      });
      return;
    }
    const { userId: sourceUid, displayLabel, title } = validation.data;

    const db = getFirestore();
    const activityRef = db.collection('readingActivities').doc(activityId);

    const claimed = await db.runTransaction(async (txn) => {
      const cur = await txn.get(activityRef);
      if (!cur.exists) return false;
      if (cur.get('notifiedAt')) return false;
      txn.update(activityRef, { notifiedAt: FieldValue.serverTimestamp() });
      return true;
    });
    if (!claimed) {
      logger.info('onReadingActivityFinished: already notified', {
        activityId,
        sourceUid,
      });
      return;
    }

    const allRecipients = await resolveRecipients(db, sourceUid);
    const recipients = excludeActor(allRecipients, sourceUid);

    if (recipients.length === 0) {
      logger.info('onReadingActivityFinished: no recipients', {
        activityId,
        sourceUid,
      });
      return;
    }

    const payload = buildNotificationPayload(displayLabel, title);
    const results = await Promise.allSettled(
      recipients.map((r) => sendExpoPush(r.token, payload)),
    );
    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - sent;

    logger.info('onReadingActivityFinished: dispatched', {
      activityId,
      sourceUid,
      recipientCount: recipients.length,
      sent,
      failed,
    });
  },
);
