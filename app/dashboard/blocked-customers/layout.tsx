import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blocked Customers | Dashboard",
  description: "Manage blocked customers and their access to chat widgets",
};

export default function BlockedCustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
