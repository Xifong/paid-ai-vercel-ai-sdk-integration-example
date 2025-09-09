# Paid.ai Payment Setup Components

React components for integrating Paid.ai payment setup with Stripe in Next.js applications.

## Setup

### 1. Install Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Add API Route

Copy `api/route.ts` to your Next.js app:
```bash
cp src/payments/api/route.ts src/app/api/paid-setup-intent/route.ts
```

### 3. Configure Environment Variables

Add to `.env.local`:
```bash
PAID_API_KEY=your_paid_api_key
PAID_API_URL=https://api.paid.ai
PAID_ORG_ID=your_organization_id
NEXT_PUBLIC_STRIPE_KEY=your_stripe_publishable_key
```

## Usage

### Basic Integration

```tsx
import { PaymentSetupForm } from '@/payments';

function PaymentPage() {
  const customer = {
    customerId: "user_123",
    email: "user@example.com",
    name: "John Doe"
  };

  return (
    <PaymentSetupForm
      customer={customer}
      stripePublishableKey={process.env.NEXT_PUBLIC_STRIPE_KEY!}
      config={{
        onSuccess: (result) => {
          console.log('Payment setup complete:', result);
          // Redirect or update UI
        },
        onError: (error) => {
          console.error('Payment failed:', error);
        }
      }}
    />
  );
}
```

### With Your Auth System

```tsx
import { PaymentSetupForm } from '@/payments';

function PaymentPage() {
  const { user } = useAuth(); // Your auth hook
  
  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <PaymentSetupForm
      customer={{
        customerId: user.id,
        email: user.email,
        name: user.name
      }}
      stripePublishableKey={process.env.NEXT_PUBLIC_STRIPE_KEY!}
      config={{
        onSuccess: (result) => {
          // Save payment info to your database
          updateUser(user.id, { 
            paymentMethodId: result.confirmationToken 
          });
          router.push('/success');
        }
      }}
    />
  );
}
```

## Components

### PaymentSetupForm
Core payment form component.

**Props:**
- `customer`: Object with `customerId`, `email`, `name`
- `stripePublishableKey`: Your Stripe publishable key
- `config`: Optional callbacks (`onSuccess`, `onError`, `onUserUpdate`)

### PaymentSetupPage
Full-page wrapper with auth handling.

**Props:**
- All of `PaymentSetupForm` props
- `onUnauthenticated`: Called when no customer provided
- `title`/`subtitle`: Customizable page text

### usePaymentSetup
Hook for custom implementations.

```tsx
const { state, setupPayment } = usePaymentSetup({
  customer,
  onSuccess: handleSuccess
});
```

## Files

- `components/` - React components
- `hooks/` - Payment setup hook
- `api/` - Server route for Paid.ai API
- `types.ts` - TypeScript definitions
- `index.ts` - Public exports