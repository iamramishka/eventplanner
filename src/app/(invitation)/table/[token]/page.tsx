import { InvitationExperience } from "@/components/invitation/invitation-experience";
import { buildMetadata } from "@/lib/metadata";

type DirectTablePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export async function generateMetadata({ params }: DirectTablePageProps) {
  const { token } = await params;

  return buildMetadata({
    title: "Find My Table",
    description: "Direct table lookup for a wedding invitation.",
    path: `/table/${token}`,
    noIndex: true,
  });
}

export default async function DirectTablePage({ params }: DirectTablePageProps) {
  const { token } = await params;

  return <InvitationExperience token={token} entryMode="table" />;
}
