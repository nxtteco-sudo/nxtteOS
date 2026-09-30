import type { Metadata } from "next";
import { ThanksView } from "@/components/thanks/thanks-view";
import { MetaPixelLead } from "@/components/meta-pixel-lead";
import "@/components/home/home.css";
import "@/components/thanks/thanks.css";

export const metadata: Metadata = {
  title: "Thanks: we will WhatsApp you within 24 hours | nxtte",
  description: "Your details are in. We will WhatsApp you within 24 hours.",
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <>
      <MetaPixelLead />
      <ThanksView />
    </>
  );
}
