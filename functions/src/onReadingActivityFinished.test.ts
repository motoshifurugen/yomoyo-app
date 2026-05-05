import {
  validateActivityForNotification,
  buildNotificationPayload,
  excludeActor,
} from './onReadingActivityFinished';

describe('validateActivityForNotification', () => {
  it('rejects null input', () => {
    const result = validateActivityForNotification(null);
    expect(result.ok).toBe(false);
  });

  it('rejects non-object input', () => {
    const result = validateActivityForNotification('not-a-doc');
    expect(result.ok).toBe(false);
  });

  it('rejects when status is not "finished"', () => {
    const result = validateActivityForNotification({
      status: 'reading',
      userId: 'A',
      displayLabel: 'Foxy',
      title: 'Norwegian Wood',
    });
    expect(result).toEqual({ ok: false, reason: 'status-not-finished' });
  });

  it('rejects when userId is missing', () => {
    const result = validateActivityForNotification({
      status: 'finished',
      displayLabel: 'Foxy',
      title: 'Norwegian Wood',
    });
    expect(result).toEqual({ ok: false, reason: 'missing-userId' });
  });

  it('rejects when userId is empty string', () => {
    const result = validateActivityForNotification({
      status: 'finished',
      userId: '',
      displayLabel: 'Foxy',
      title: 'Norwegian Wood',
    });
    expect(result).toEqual({ ok: false, reason: 'missing-userId' });
  });

  it('rejects when displayLabel is missing', () => {
    const result = validateActivityForNotification({
      status: 'finished',
      userId: 'A',
      title: 'Norwegian Wood',
    });
    expect(result).toEqual({ ok: false, reason: 'missing-displayLabel' });
  });

  it('rejects when displayLabel is empty string', () => {
    const result = validateActivityForNotification({
      status: 'finished',
      userId: 'A',
      displayLabel: '',
      title: 'Norwegian Wood',
    });
    expect(result).toEqual({ ok: false, reason: 'missing-displayLabel' });
  });

  it('rejects when title is missing', () => {
    const result = validateActivityForNotification({
      status: 'finished',
      userId: 'A',
      displayLabel: 'Foxy',
    });
    expect(result).toEqual({ ok: false, reason: 'missing-title' });
  });

  it('rejects when title is empty string', () => {
    const result = validateActivityForNotification({
      status: 'finished',
      userId: 'A',
      displayLabel: 'Foxy',
      title: '',
    });
    expect(result).toEqual({ ok: false, reason: 'missing-title' });
  });

  it('accepts a valid finished activity and returns the extracted fields', () => {
    const result = validateActivityForNotification({
      status: 'finished',
      userId: 'A',
      displayLabel: '眠たいキツネ',
      title: 'ノルウェイの森',
      bookId: 'b1',
      authors: ['村上春樹'],
    });
    expect(result).toEqual({
      ok: true,
      data: {
        userId: 'A',
        displayLabel: '眠たいキツネ',
        title: 'ノルウェイの森',
      },
    });
  });
});

describe('buildNotificationPayload', () => {
  it('builds the expected one-line Japanese body', () => {
    const payload = buildNotificationPayload('眠たいキツネ', 'ノルウェイの森');
    expect(payload).toEqual({
      title: 'Yomoyo',
      body: '眠たいキツネが「ノルウェイの森」を読み終えました。',
    });
  });

  it('preserves arbitrary characters in label and title', () => {
    const payload = buildNotificationPayload('A & B', 'Title-with-dashes');
    expect(payload.title).toBe('Yomoyo');
    expect(payload.body).toBe('A & Bが「Title-with-dashes」を読み終えました。');
  });
});

describe('excludeActor', () => {
  it('returns the input unchanged when the actor is not in the list', () => {
    const recipients = [
      { uid: 'A', token: 't1' },
      { uid: 'B', token: 't2' },
    ];
    expect(excludeActor(recipients, 'X')).toEqual(recipients);
  });

  it('removes a single recipient entry that matches the actor', () => {
    const recipients = [
      { uid: 'A', token: 't1' },
      { uid: 'B', token: 't2' },
    ];
    expect(excludeActor(recipients, 'A')).toEqual([{ uid: 'B', token: 't2' }]);
  });

  it('removes multiple actor entries (multi-device)', () => {
    const recipients = [
      { uid: 'A', token: 't1' },
      { uid: 'A', token: 't2' },
      { uid: 'B', token: 't3' },
    ];
    expect(excludeActor(recipients, 'A')).toEqual([{ uid: 'B', token: 't3' }]);
  });

  it('returns an empty array when only the actor was in the list', () => {
    const recipients = [{ uid: 'A', token: 't1' }];
    expect(excludeActor(recipients, 'A')).toEqual([]);
  });
});
