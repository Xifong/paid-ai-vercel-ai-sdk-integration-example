import { useState, useCallback } from 'react';
import {
  UsePaymentSetupOptions,
  UsePaymentSetupResult,
  PaymentResult,
  PaymentSetupState,
  UserUpdates
} from '../types';

export function usePaymentSetup(options: UsePaymentSetupOptions): UsePaymentSetupResult {
  const {
    customer,
    onSuccess,
    onError,
    onUserUpdate
  } = options;

  const [state, setState] = useState<PaymentSetupState>({
    isProcessing: false,
    error: null,
    isComplete: false,
  });

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setupPayment = useCallback(async (stripe: any, elements: any) => {
    if (!stripe || !elements || !customer) {
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error: tokenError, confirmationToken } = await stripe.createConfirmationToken({
        elements,
      });

      if (tokenError) {
        throw new Error(tokenError.message || 'Failed to create confirmation token');
      }

      if (!confirmationToken) {
        throw new Error('No confirmation token received');
      }

      console.log('Confirmation token created:', confirmationToken.id);


      const response = await fetch(`/api/paid-setup-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customer.customerId,
          confirmationToken: confirmationToken.id,
          metadata: {
            email: customer.email,
            name: customer.name,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment with Paid');
      }

      const paidResponse = await response.json();
      console.log('Paid setup intent response:', paidResponse);

      const si = paidResponse?.data?.setup_intent;
      let finalStatus = si?.status || 'succeeded';

      if (si?.status === 'requires_action') {
        const { error: nextErr } = await stripe.handleNextAction({
          clientSecret: si.client_secret,
        });
        if (nextErr) {
          throw new Error(nextErr.message || 'Authentication failed');
        }
        finalStatus = 'succeeded';
      }

      const result: PaymentResult = {
        confirmationToken: confirmationToken.id,
        setupIntentStatus: finalStatus,
        setupIntentClientSecret: si?.client_secret,
      };

      const userUpdates: UserUpdates = {
        confirmationTokenId: confirmationToken.id,
        paymentProcessed: true
      };

      setState(prev => ({ ...prev, isProcessing: false, isComplete: true }));

      // Call callbacks
      if (onUserUpdate) {
        onUserUpdate(customer.customerId, userUpdates);
      }

      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment setup failed';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        isComplete: false
      }));

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [customer, onSuccess, onError, onUserUpdate]);

  return {
    state,
    setupPayment,
    resetError,
  };
}
