'use client';

import RsvpFormCore, { type RsvpContext } from '@/components/RsvpFormCore';

export default function RsvpTokenForm({ token, context }: { token: string; context: RsvpContext }) {
  return <RsvpFormCore token={token} context={context} variant="page" />;
}
