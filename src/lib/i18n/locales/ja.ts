const ja = {
  tabs: {
    feed: 'フィード',
    friends: 'フレンド',
    shelf: '本棚',
    settings: '設定',
  },
  feed: {
    searchBooks: '本を探す',
    emptyTitle: '読書フィードは、まだ静かです',
    emptyBody: 'タイムラインで読書記録を見つけてみましょう。',
    finishedReading: '読み終えました',
  },
  friends: {
    timelineTab: 'タイムライン',
    updatesTab: 'おたより',
    timelineEmptyTitle: 'まだ読書記録がありません',
    timelineEmptyBody: '他のリーダーの読書記録がここに表示されます。',
    updatesEmptyTitle: 'まだおたよりはありません',
    updatesEmptyBody: 'タイムラインで他のリーダーを探しましょう。',
    follow: 'おたよりを受け取る',
    following: '受け取り中',
    unfollow: '受け取りをやめる',
  },
  bookSearch: {
    placeholder: 'タイトルや著者で検索',
    button: '検索',
    noResults: '結果が見つかりませんでした',
    unknownAuthor: '著者不明',
    searchError: '検索に失敗しました。もう一度お試しください。',
    rateLimitError: '検索回数が多すぎます。少し待ってからお試しください。',
  },
  bookDetail: {
    unknownAuthor: '著者不明',
  },
  shelf: {
    finished: '読了',
    emptyFinished: '読了した本はまだありません',
    markAsFinished: '読了にする',
  },
  settings: {
    languageTitle: '言語',
  },
  onboarding: {
    heading: 'Yomoyo',
    concept: 'フォローしている人が本を読み終えたとき、そっと知らせます。',
    signInWithGoogle: 'Googleでサインイン',
    signInWithApple: 'Appleでサインイン',
    signInError: 'サインインに失敗しました。もう一度お試しください。',
    avatarHeading: 'あなたの森のなまえ',
    rerollButton: 'もう一度',
    avatarContinue: 'これにする',
    notificationHeading: '小さな知らせが届きます',
    notificationBody: 'フォローしている人が本を読み終えたときだけ。',
    allowButton: '通知を許可する',
    skipLink: '後で',
  },
} as const;

export default ja;
