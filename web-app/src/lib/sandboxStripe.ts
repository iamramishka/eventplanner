import { auditLog } from './audit';

let idCounter = 1000;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}_sandbox_${idCounter}`;
}

export function createMockCustomer(email?: string) {
  const id = nextId('cus');
  auditLog({ event: 'sandbox.customer.created', customerId: id, email });
  return { id, email };
}

export function createMockCheckoutSession(priceId?: string, customerEmail?: string) {
  const id = nextId('sess');
  const url = `http://localhost:3000/mock-checkout/${id}`;
  auditLog({ event: 'sandbox.checkout.created', sessionId: id, priceId, customerEmail });
  return { id, url, priceId, customerEmail };
}

export function createMockSubscription(customerId?: string) {
  const id = nextId('sub');
  auditLog({ event: 'sandbox.subscription.created', subscriptionId: id, customerId });
  return { id, status: 'active', customerId };
}
