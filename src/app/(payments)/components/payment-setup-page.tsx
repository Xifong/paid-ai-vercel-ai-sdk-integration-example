import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { usePaymentSetup } from '../hooks/use-payment-setup';
import { PaymentResult } from '../types';

type PaymentSetupConfig = {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

type PaymentSetupFormProps = {
  customerID: string;
  stripePublishableKey: string;
  handlers?: PaymentSetupConfig;
  className?: string;
}

type PaymentSetupPageProps = {
  customerID: string;
  stripePublishableKey: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}


function PaymentFormContent({
  customerID,
  handlers = {},
  className = "",
}: Omit<PaymentSetupFormProps, 'stripePublishableKey'>) {
  const stripe = useStripe();
  const elements = useElements();

  const { state, setupPayment, resetError } = usePaymentSetup({
    customerID,
    onSuccess: handlers.onSuccess,
    onError: handlers.onError,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    await setupPayment(stripe, elements);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium mb-2">
          Payment Details
        </label>
        <div className="p-3 border border-zinc-300 dark:border-zinc-800 rounded dark:bg-zinc-900">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>
      </div>

      {state.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex justify-between items-start">
            <span>{state.error}</span>
            <button
              type="button"
              onClick={resetError}
              className="ml-2 text-red-500 hover:text-red-700 text-sm"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || state.isProcessing}
        className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state.isProcessing ? 'Processing...' : 'Save Payment Method'}
      </button>
    </form>
  );
}

export function PaymentSetupForm({
  customerID,
  stripePublishableKey,
  handlers = {},
}: PaymentSetupFormProps) {
  const stripePromise = loadStripe(stripePublishableKey);

  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'stripe',
        },
        mode: "setup",
        currency: "usd",
      }}
    >
      <PaymentFormContent
        customerID={customerID}
        handlers={handlers}
      />
    </Elements>
  );
}

export function PaymentSetupPage({
  customerID,
  stripePublishableKey,
  onSuccess,
  onError,
}: PaymentSetupPageProps) {

  return (
    <div className={`flex flex-col w-full max-w-md py-24 mx-auto stretch`}>
      <h1 className="text-2xl font-bold mb-8 text-center">Setup Payment</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 text-center">
        Add a payment method to complete your account setup
      </p>

      <PaymentSetupForm
        customerID={customerID}
        stripePublishableKey={stripePublishableKey}
        handlers={{
          onSuccess,
          onError,
        }}
      />
    </div>
  );
}
