'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { userStore } from '@/app/utils/userStore';
import { PaymentResult } from '../core/types';
import { useEffect } from 'react';
import { PaymentSetupPage } from '../core/payment-setup-page';
import { StripeProvider } from '../payment-providers/stripe';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51S2vuU6VZ0JAwqpDJUwAOC5fbyQo4S2axB986wbh2V9zZym2WqkraGVwhNdTFkbMtrNPt8j8oXrVAKqCqzeZlzOM00ONr4knZ6';

export default function PaymentSetup() {
  const router = useRouter();
  const { isLoggedIn, userData } = useAuth();
  const provider = new StripeProvider();

  const handleSuccess = (result: PaymentResult) => {
    if (!userData) return;
    userStore.updateUser(userData?.customerId, {
      "confirmationTokenId": result.confirmationToken,
      "paymentProcessed": true,
    });
    console.log('Payment setup successful:', result);
    router.push('/');
  };

  const handleError = (error: string) => {
    console.error('Payment setup error:', error);
  };

  useEffect(() => {
    if (!userData) {
      router.push('/sign-up');
    }
  }, [userData]);

  return (
    isLoggedIn && userData &&
    <PaymentSetupPage
      customerID={userData.customerId}
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      provider={provider}
      apiEndpoint="/api/paid-setup-intent"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
