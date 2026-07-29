import { getAdminSettings } from '@/lib/adminSettings';
import CheckoutClient from './CheckoutClient';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const premiumPlan = getAdminSettings().plans.find((plan) => plan.id === 'premium');

  return (
    <main style={{ padding: 24 }}>
      <h1>Upgrade to {premiumPlan?.name || 'Premium'}</h1>
      <p>{premiumPlan?.description || 'Full planning, invitation, and vendor discovery access.'}</p>
      <p style={{ fontWeight: 700 }}>{premiumPlan?.price || '$49 / one-time'}</p>
      <p>Test-mode checkout for subscriptions. Use a test card in Stripe (4242...).</p>
      <CheckoutClient />
    </main>
  );
}
