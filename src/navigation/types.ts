import type { Book } from '@/lib/books/searchBooks';

export type AddFriendStackParamList = {
  AddFriend: undefined;
  UserProfile: { uid: string; fromAddFriend?: boolean };
};

export type RootStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  BookSearch: undefined;
  BarcodeScan: undefined;
  BookDetail: { book: Book };
  UserProfile: { uid: string; fromAddFriend?: boolean };
  AddFriendFlow: undefined;
};

export type MainTabParamList = {
  Timeline: undefined;
  Shelf: undefined;
};

export type OnboardingStackParamList = {
  OnboardingAvatar: undefined;
  OnboardingNotification: undefined;
  OnboardingSending: undefined;
};
