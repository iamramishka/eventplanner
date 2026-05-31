import { InvitationExperience } from "@/components/invitation/invitation-experience";
import { buildMetadata } from "@/lib/metadata";

type DirectRsvpPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export async function generateMetadata({ params }: DirectRsvpPageProps) {
  const { token } = await params;

  return buildMetadata({
    title: "RSVP",
    description: "Direct RSVP entry for a wedding invitation.",
    path: `/rsvp/${token}`,
    noIndex: true,
  });
}

export default async function DirectRsvpPage({ params }: DirectRsvpPageProps) {
  const { token } = await params;

  return <InvitationExperience token={token} entryMode="rsvp" />;
}
