import { redirect } from 'next/navigation'

// Redirect legacy /:slug route to canonical /invitation/:slug
export default async function LegacyInvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/invitation/${slug}`)
}
