import { NavItem } from "@/types/public";

export const siteConfig = {
  name: "Vinyup Weddings",
  shortName: "Vinyup",
  url: "https://www.vinyup.com",
  description:
    "A premium wedding planning and guest management platform for modern couples who want beautiful invitations and calm coordination.",
};

export const primaryNavItems: NavItem[] = [
  { label: "Features", href: "/features" },
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/pricing" },
  { label: "Vendors", href: "/vendors" },
  { label: "FAQ", href: "/faq" },
];

export const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Templates", href: "/templates" },
      { label: "Pricing", href: "/pricing" },
      { label: "Auth Entry", href: "/auth" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Vendors", href: "/vendors" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Entry",
    links: [
      { label: "Start Free", href: "/auth?tab=signup" },
      { label: "Sign In", href: "/auth?tab=signin" },
      { label: "Find My Event", href: "/auth?tab=find-event" },
    ],
  },
];
