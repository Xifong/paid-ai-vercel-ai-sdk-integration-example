'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { userStore } from '@/app/utils/userStore';
import { PaymentSetupPage } from '../components/payment-setup-page';
import { PaymentResult, UserUpdates } from '../types';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51S2vuU6VZ0JAwqpDJUwAOC5fbyQo4S2axB986wbh2V9zZym2WqkraGVwhNdTFkbMtrNPt8j8oXrVAKqCqzeZlzOM00ONr4knZ6';

export default function PaymentSetup() {
  const router = useRouter();
  const { isLoggedIn, userData } = useAuth();

  const handleSuccess = (result: PaymentResult) => {
    console.log('Payment setup successful:', result);
    router.push('/');
  };

  const handleError = (error: string) => {
    console.error('Payment setup error:', error);
  };

  const handleUserUpdate = (customerId: string, updates: UserUpdates) => {
    userStore.updateUser(customerId, updates);
  };

  const handleUnauthenticated = () => {
    router.push('/sign-up');
  };

  return (
    isLoggedIn &&
    <PaymentSetupPage
      customer={userData ? {
        customerId: userData.customerId,
        email: userData.email,
        name: userData.name,
      } : undefined}
      stripePublishableKey={STRIPE_PUBLISHABLE_KEY}
      onSuccess={handleSuccess}
      onError={handleError}
      onUserUpdate={handleUserUpdate}
      onUnauthenticated={handleUnauthenticated}
    />
  );
}
