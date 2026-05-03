const ja = {
  tabs: {
    feed: 'フィード',
    friends: 'フレンド',
    settings: '設定',
  },
  feed: {
    searchBooks: '本を探す',
    emptyTitle: '読書フィードは、まだ静かです',
    emptyBody: '友だちが本を読み終えると、ここにお便りが届きます。',
  },
  friends: {
    emptyTitle: '読書仲間を見つけよう',
    emptyBody: '友だちをフォローすると、読み終えた本がここに届きます。',
  },
  bookSearch: {
    placeholder: 'タイトルや著者で検索',
    button: '検索',
    noResults: '結果が見つかりませんでした',
    unknownAuthor: '著者不明',
  },
  bookDetail: {
    unknownAuthor: '著者不明',
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
    notificationHeading: '小さな知らせが届きます',
    notificationBody: 'フォローしている人が本を読み終えたときだけ。',
    allowButton: '通知を許可する',
    skipLink: '後で',
  },
} as const;

export default ja;
