export interface PaymentCustomer {
  customerId: string;
  email: string;
  name: string;
}

export interface PaymentResult {
  confirmationToken: string;
  setupIntentStatus: string;
  setupIntentClientSecret?: string;
}

export interface UserUpdates {
  confirmationTokenId?: string;
  paymentProcessed?: boolean;
  paymentMethodId?: string;
}

export interface PaymentSetupConfig {
  apiEndpoint?: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
  onUserUpdate?: (customerId: string, updates: UserUpdates) => void;
}

export interface PaymentSetupFormProps {
  customer: PaymentCustomer;
  stripePublishableKey: string;
  config?: PaymentSetupConfig;
  className?: string;
  disabled?: boolean;
}

export interface PaymentSetupPageProps {
  customer?: PaymentCustomer;
  stripePublishableKey: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
  onUserUpdate?: (customerId: string, updates: UserUpdates) => void;
  onUnauthenticated?: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export interface PaymentSetupState {
  isProcessing: boolean;
  error: string | null;
  isComplete: boolean;
}

export interface UsePaymentSetupOptions {
  customer: PaymentCustomer;
  apiEndpoint?: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
  onUserUpdate?: (customerId: string, updates: UserUpdates) => void;
}

export interface UsePaymentSetupResult {
  state: PaymentSetupState;
  setupPayment: (stripe: any, elements: any) => Promise<void>;
  resetError: () => void;
}