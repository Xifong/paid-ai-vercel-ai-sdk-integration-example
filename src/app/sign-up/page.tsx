'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

interface LoginFormData {
  name: string;
  email: string;
  password: string;
}

const createCustomer = async (email: string, name: string) => {
  const response = await fetch('/api/create-customer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, name }),
  });

  if (!response.ok) {
    throw new Error('Failed to create customer');
  }

  const data = await response.json();
  return data.customerId;
};

export default function Signup() {
  const [formData, setFormData] = useState<LoginFormData>({
    name: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { signup, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [router, isLoggedIn]);

  const handleSignup = async (formData: LoginFormData): Promise<void> => {
    console.log('[SIGNUP] 1. Starting handleSignup', { email: formData.email, name: formData.name });

    const customerId = await createCustomer(formData.email, formData.name);
    console.log('[SIGNUP] 2. Customer created', { customerId });

    const userData = {
      customerId,
      name: formData.name,
      email: formData.email,
      password: formData.password
    };
    console.log('[SIGNUP] 3. UserData prepared', userData);

    console.log('[SIGNUP] 4. Calling signup function');
    await signup(userData);
    console.log('[SIGNUP] 5. Signup completed successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[SIGNUP] 6. Form submitted', formData);

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      console.log('[SIGNUP] 7. Validation failed - empty fields');
      return;
    }
    console.log('[SIGNUP] 8. Validation passed');

    setIsSubmitting(true);
    console.log('[SIGNUP] 9. Set submitting to true');

    try {
      console.log('[SIGNUP] 10. Calling handleSignup');
      await handleSignup(formData);
      console.log('[SIGNUP] 11. handleSignup completed, navigating to payment-setup');
      router.push('/payment-setup');
      console.log('[SIGNUP] 12. Navigation initiated');
    } catch (error) {
      console.error('[SIGNUP] ERROR in handleSubmit:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-8 text-center">Sign Up</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border border-zinc-300 dark:border-zinc-800 rounded dark:bg-zinc-900"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 border border-zinc-300 dark:border-zinc-800 rounded dark:bg-zinc-900"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border border-zinc-300 dark:border-zinc-800 rounded dark:bg-zinc-900"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.name.trim() || !formData.email.trim() || !formData.password.trim()}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
