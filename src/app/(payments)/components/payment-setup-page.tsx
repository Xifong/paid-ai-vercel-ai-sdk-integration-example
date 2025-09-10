'use client';

import { useEffect } from 'react';
import { PaymentSetupForm } from './payment-setup-form';
import { PaymentSetupPageProps } from '../types';

export function PaymentSetupPage({
  customer,
  stripePublishableKey,
  onSuccess,
  onError,
  onUserUpdate,
  onUnauthenticated,
  title = "Setup Payment",
  subtitle = "Add a payment method to complete your account setup",
  className = "",
}: PaymentSetupPageProps) {

  useEffect(() => {
    if (!customer && onUnauthenticated) {
      onUnauthenticated();
    }
  }, [customer, onUnauthenticated]);

  if (!customer) {
    return (
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Please log in to set up your payment method.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full max-w-md py-24 mx-auto stretch ${className}`}>
      <h1 className="text-2xl font-bold mb-8 text-center">{title}</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 text-center">
        {subtitle}
      </p>

      <PaymentSetupForm
        customer={customer}
        stripePublishableKey={stripePublishableKey}
        config={{
          onSuccess,
          onError,
          onUserUpdate,
        }}
      />
    </div>
  );
}
