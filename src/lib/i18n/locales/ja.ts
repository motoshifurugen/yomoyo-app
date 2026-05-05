const ja = {
  common: {
    back: '戻る',
  },
  tabs: {
    timeline: '読書ログ',
    shelf: '本棚',
    settings: '設定',
  },
  timeline: {
    finishedReading: '読み終えました',
    emptyBody: '友達の読了した記録が表示されます。',
    loadErrorBody: '読み込みに失敗しました。もう一度お試しください。',
    modalViewProfile: 'プロフィールを見る',
    modalClose: '閉じる',
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
    addBook: '読み終えた本を記録する',
    markAsFinished: '読了にする',
  },
  settings: {
    languageTitle: '言語',
    profileLinkTitle: 'プロフィールリンク',
    copyLink: 'リンクをコピー',
    linkCopied: 'コピーしました',
  },
  userProfile: {
    follow: 'おたよりを受け取る',
    unfollow: '受け取るのをやめる',
    notFound: 'このページは存在しません',
    emptyBooks: '読了した本はまだありません',
    ownPageNote: 'これはあなたのページです',
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
