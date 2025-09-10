'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { userStore } from '@/app/utils/userStore';
import { PaymentResult } from '../types';
import { PaymentSetupPage } from '../components/payment-setup-page';
import { useEffect } from 'react';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51S2vuU6VZ0JAwqpDJUwAOC5fbyQo4S2axB986wbh2V9zZym2WqkraGVwhNdTFkbMtrNPt8j8oXrVAKqCqzeZlzOM00ONr4knZ6';

export default function PaymentSetup() {
  const router = useRouter();
  const { isLoggedIn, userData } = useAuth();

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
      stripePublishableKey={STRIPE_PUBLISHABLE_KEY}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
