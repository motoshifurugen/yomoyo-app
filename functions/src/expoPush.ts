export interface ExpoPushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: Record<string, unknown>;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function sendExpoPush(
  token: string,
  payload: ExpoPushPayload,
): Promise<ExpoPushTicket> {
  const message = {
    to: token,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    ...(payload.data ? { data: payload.data } : {}),
  };

  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    throw new Error(`Expo push HTTP ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: ExpoPushTicket | ExpoPushTicket[];
  };
  const ticket = Array.isArray(json.data) ? json.data[0] : json.data;
  if (!ticket) {
    throw new Error('Expo push: empty response');
  }
  if (ticket.status === 'error') {
    const code =
      typeof ticket.details?.error === 'string'
        ? ticket.details.error
        : 'unknown';
    throw new Error(
      `Expo push error: ${code} (${ticket.message ?? 'no message'})`,
    );
  }
  return ticket;
}
