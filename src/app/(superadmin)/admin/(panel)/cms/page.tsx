import { Metadata } from "next";
import { CmsManagement } from "@/components/admin/cms-management";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "CMS Management",
  description: "Manage CMS publish state in the Vinyup Super Admin system.",
  path: "/admin/cms",
  noIndex: true,
});

export default function AdminCmsPage() {
  return <CmsManagement />;
}
