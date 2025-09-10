'use client';

import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentSetupFormProps } from '../types';
import { usePaymentSetup } from '../hooks/use-payment-setup';

function PaymentFormContent({ 
  customer, 
  config = {},
  className = "",
  disabled = false 
}: Omit<PaymentSetupFormProps, 'stripePublishableKey'>) {
  const stripe = useStripe();
  const elements = useElements();
  
  const { state, setupPayment, resetError } = usePaymentSetup({
    customer,
    apiEndpoint: config.apiEndpoint,
    onSuccess: config.onSuccess,
    onError: config.onError,
    onUserUpdate: config.onUserUpdate,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled || !stripe || !elements) {
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
        disabled={!stripe || state.isProcessing || disabled}
        className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state.isProcessing ? 'Processing...' : 'Save Payment Method'}
      </button>
    </form>
  );
}

export function PaymentSetupForm({ 
  customer, 
  stripePublishableKey, 
  config = {},
  className = "",
  disabled = false 
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
        customer={customer}
        config={config}
        className={className}
        disabled={disabled}
      />
    </Elements>
  );
}