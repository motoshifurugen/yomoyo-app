import { sendExpoPush } from './expoPush';

const TOKEN = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
const PAYLOAD = { title: 'Yomoyo', body: 'hello' };

type FetchMock = jest.Mock<Promise<Response>, Parameters<typeof fetch>>;

function mockFetchOnce(status: number, body: unknown): FetchMock {
  const mock: FetchMock = jest.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
  global.fetch = mock as unknown as typeof fetch;
  return mock;
}

describe('sendExpoPush', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns the ticket on a successful response', async () => {
    const fetchMock = mockFetchOnce(200, {
      data: { status: 'ok', id: 'ticket-1' },
    });

    const ticket = await sendExpoPush(TOKEN, PAYLOAD);

    expect(ticket).toEqual({ status: 'ok', id: 'ticket-1' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://exp.host/--/api/v2/push/send');
    expect(init?.method).toBe('POST');
    const sent = JSON.parse(String(init?.body));
    expect(sent.to).toBe(TOKEN);
    expect(sent.title).toBe('Yomoyo');
    expect(sent.body).toBe('hello');
  });

  it('throws when Expo returns an error ticket', async () => {
    mockFetchOnce(200, {
      data: {
        status: 'error',
        message: 'Invalid push token',
        details: { error: 'DeviceNotRegistered' },
      },
    });

    await expect(sendExpoPush(TOKEN, PAYLOAD)).rejects.toThrow(
      /DeviceNotRegistered/,
    );
  });

  it('throws on a non-2xx HTTP response', async () => {
    mockFetchOnce(503, {});

    await expect(sendExpoPush(TOKEN, PAYLOAD)).rejects.toThrow(
      /Expo push HTTP 503/,
    );
  });
});
