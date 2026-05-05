import type { Book } from '@/lib/books/searchBooks';

export type RootStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  BookSearch: undefined;
  BookDetail: { book: Book };
  UserProfile: { uid: string };
};

export type MainTabParamList = {
  Feed: undefined;
  Shelf: undefined;
  Settings: undefined;
};

export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingAvatar: undefined;
  OnboardingNotification: undefined;
};
