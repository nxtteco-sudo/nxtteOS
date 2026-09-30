import type { Metadata } from "next";
import { ContactView } from "@/components/contact/contact-view";
import "@/components/home/home.css";
import "@/components/forms/lead-form.css";
import "@/components/contact/contact.css";

export const metadata: Metadata = {
  title: "Contact nxtte: message us on WhatsApp | nxtte",
  description: "Message nxtte on WhatsApp, or leave your details and we reply within 24 hours.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactView />;
}
