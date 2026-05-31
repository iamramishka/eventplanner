import { InvitationExperience } from "@/components/invitation/invitation-experience";
import { buildMetadata } from "@/lib/metadata";

type InvitationPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    guest?: string;
  }>;
};

export async function generateMetadata({ params }: InvitationPageProps) {
  const { slug } = await params;

  return buildMetadata({
    title: "Wedding Invitation",
    description: "Guest-facing wedding invitation website.",
    path: `/w/${slug}`,
    noIndex: true,
  });
}

export default async function WeddingInvitationPage({
  params,
  searchParams,
}: InvitationPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  return <InvitationExperience slug={slug} token={query.guest ?? null} entryMode="invitation" />;
}
