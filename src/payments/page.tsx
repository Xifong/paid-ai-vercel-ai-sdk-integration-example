'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { userStore } from '@/app/utils/userStore';
import { PaymentSetupPage } from './components/payment-setup-page';
import { PaymentResult, UserUpdates } from './types';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51S2vuZ8wBPYbZq7jCxOkFwHVRN7wBnZaymul9w0uRaZgNlEE3GZg4XLYy0JrSqut1bxVJhKOEk4Cv49f3NmKYInl002Nm1h0lP';

export default function PaymentSetup() {
  const router = useRouter();
  const { userData } = useAuth();

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
