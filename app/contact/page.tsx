import type { Metadata } from "next";
import { ContactView } from "@/components/contact/contact-view";
import { JsonLd } from "@/components/seo/json-ld";
import { FAQ_ITEMS, PRICE_ANSWER } from "@/lib/faq";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import "@/components/home/home.css";
import "@/components/forms/lead-form.css";
import "@/components/contact/contact.css";

export const metadata: Metadata = pageMetadata({
  title: "Contact nxtte: message us on WhatsApp | nxtte",
  description: "Message nxtte on WhatsApp at +60 11-7472 1429, or leave your details and a real person replies within 24 hours. Based in Kuala Lumpur.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={[faqJsonLd([PRICE_ANSWER, ...FAQ_ITEMS]), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])]} />
      <ContactView />
    </>
  );
}
