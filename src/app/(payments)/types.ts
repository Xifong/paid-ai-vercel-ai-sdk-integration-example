export interface PaymentResult {
  confirmationToken: string;
  setupIntentStatus: string;
  setupIntentClientSecret?: string;
}

interface PaymentSetupConfig {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

export interface PaymentSetupFormProps {
  customerID: string;
  stripePublishableKey: string;
  handlers?: PaymentSetupConfig;
  className?: string;
}

export interface PaymentSetupPageProps {
  customerID: string;
  stripePublishableKey: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

export interface PaymentSetupState {
  isProcessing: boolean;
  error: string | null;
  isComplete: boolean;
}

export interface UsePaymentSetupOptions {
  customerID: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

export interface UsePaymentSetupResult {
  state: PaymentSetupState;
  setupPayment: (stripe: any, elements: any) => Promise<void>;
  resetError: () => void;
}
