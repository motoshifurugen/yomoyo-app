const en = {
  common: {
    back: 'Go back',
  },
  tabs: {
    timeline: 'Timeline',
    shelf: 'My Shelf',
    settings: 'Settings',
  },
  timeline: {
    finishedReading: 'Finished reading',
    emptyBody: 'Reading records from your friends will appear here.',
    loadErrorBody: 'Something went wrong. Please try again.',
    modalViewProfile: 'View profile',
    modalClose: 'Close',
  },
  bookSearch: {
    placeholder: 'Search by title or author',
    button: 'Search',
    noResults: 'No results found',
    unknownAuthor: 'Unknown author',
    searchError: 'Search failed. Please try again.',
    rateLimitError: 'Too many searches. Please wait a moment.',
  },
  bookDetail: {
    unknownAuthor: 'Unknown author',
  },
  shelf: {
    finished: 'Finished',
    emptyFinished: 'No finished books yet',
    addBook: 'Record a finished book',
    markAsFinished: 'Mark as Finished',
  },
  settings: {
    languageTitle: 'Language',
    profileLinkTitle: 'Profile Link',
    copyLink: 'Copy Link',
    linkCopied: 'Copied!',
  },
  userProfile: {
    follow: 'Receive updates',
    unfollow: 'Stop receiving',
    notFound: 'This page does not exist.',
    emptyBooks: 'No finished books yet',
    ownPageNote: 'This is your page',
  },
  onboarding: {
    heading: 'Yomoyo',
    concept: "When someone you follow finishes a book, you'll know.",
    signInWithGoogle: 'Sign in with Google',
    signInWithApple: 'Sign in with Apple',
    signInError: 'Sign-in failed. Please try again.',
    avatarHeading: 'Your forest identity',
    rerollButton: 'Try another',
    avatarContinue: 'This one',
    notificationHeading: 'A little note arrives',
    notificationBody: 'Only when someone you follow finishes a book.',
    allowButton: 'Allow notifications',
    skipLink: 'Maybe later',
  },
} as const;

export default en;
