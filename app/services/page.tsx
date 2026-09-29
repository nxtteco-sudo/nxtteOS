import type { Metadata } from "next";
import { ServicesPageContent } from "@/components/home/home-page";
import "@/components/home/home.css";

export const metadata: Metadata = {
  title: "Services and pricing: packages from RM 1,199/month | nxtte",
  description:
    "Three monthly social media packages (Starter, Growth, Pro) and a menu of fixed-price services: content, ads, landing pages and brand.",
};

export default function Page() {
  return <ServicesPageContent />;
}
