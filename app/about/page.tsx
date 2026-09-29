import type { Metadata } from "next";
import { AboutPageContent } from "@/components/home/home-page";
import "@/components/home/home.css";

export const metadata: Metadata = {
  title: "About nxtte: meet Ms. Nemila and Mr. Jay | nxtte",
  description:
    "nxtte is run by Ms. Nemila and Mr. Jay, with the Aurexis Solution team building the sites and funnels your content feeds.",
};

export default function Page() {
  return <AboutPageContent />;
}
