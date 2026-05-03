const en = {
  tabs: {
    feed: 'Feed',
    friends: 'Friends',
    settings: 'Settings',
  },
  feed: {
    searchBooks: 'Search books',
    emptyTitle: 'Your reading feed is quiet',
    emptyBody: 'When friends finish books, their notes will appear here.',
  },
  friends: {
    emptyTitle: 'Find your reading people',
    emptyBody: 'Follow friends to see the books they finish.',
  },
  bookSearch: {
    placeholder: 'Search by title or author',
    button: 'Search',
    noResults: 'No results found',
    unknownAuthor: 'Unknown author',
  },
  bookDetail: {
    unknownAuthor: 'Unknown author',
  },
  settings: {
    languageTitle: 'Language',
  },
  onboarding: {
    heading: 'Yomoyo',
    concept: "When someone you follow finishes a book, you'll know.",
    signInWithGoogle: 'Sign in with Google',
    signInWithApple: 'Sign in with Apple',
    signInError: 'Sign-in failed. Please try again.',
    notificationHeading: 'A little note arrives',
    notificationBody: 'Only when someone you follow finishes a book.',
    allowButton: 'Allow notifications',
    skipLink: 'Maybe later',
  },
} as const;

export default en;
