import type { Metadata } from "next";
import { RefundsView } from "@/components/legal/refunds-view";
import "@/components/home/home.css";
import "@/components/legal/legal.css";

export const metadata: Metadata = {
  title: "Refund policy | nxtte",
  description: "When you can get your money back from nxtte, and how to ask.",
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
  return <RefundsView />;
}
