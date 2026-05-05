import type { Book } from '@/lib/books/searchBooks';

export type RootStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  BookSearch: undefined;
  BookDetail: { book: Book };
  UserProfile: { uid: string };
  AddFriend: undefined;
};

export type MainTabParamList = {
  Timeline: undefined;
  Shelf: undefined;
  Settings: undefined;
};

export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingAvatar: undefined;
  OnboardingNotification: undefined;
};
