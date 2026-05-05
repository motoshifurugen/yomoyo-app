import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';

const REGION = 'asia-northeast1';

export interface SendTestPushInput {
  token?: string;
  title?: string;
  body?: string;
}

export interface SendTestPushResult {
  ok: true;
  ticket: { status: 'ok' | 'error'; id?: string };
}

export async function devSendTestPush(
  input: SendTestPushInput = {},
): Promise<SendTestPushResult> {
  const functions = getFunctions(firebaseApp, REGION);
  const callable = httpsCallable<SendTestPushInput, SendTestPushResult>(
    functions,
    'sendTestPush',
  );
  const res = await callable(input);
  return res.data;
}
