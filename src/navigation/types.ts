export type OnboardingStackParamList = {
  Welcome: undefined;
  LocationPermission: undefined;
  PhotoPermission: undefined;
  OnboardingDone: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Trips: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  TripTimeline: {tripId: string};
  StepEdit: {tripId: string; stepId?: string};
  BookPreview: {tripId: string};
  Checkout: {tripId: string};
  OrderConfirmation: {orderId: string; tripId: string};
};
