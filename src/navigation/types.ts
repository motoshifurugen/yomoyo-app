import type { Book } from '@/lib/books/searchBooks';

export type RootStackParamList = {
  MainTabs: undefined;
  BookSearch: undefined;
  BookDetail: { book: Book };
};

export type MainTabParamList = {
  Feed: undefined;
  Friends: undefined;
  Settings: undefined;
};

export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingNotification: undefined;
};
