import type { Metadata } from "next";
import { NotFoundView } from "@/components/thanks/not-found-view";
import "@/components/home/home.css";
import "@/components/thanks/thanks.css";

export const metadata: Metadata = { title: "Page not found | nxtte", robots: { index: false, follow: false } };

export default function NotFound() {
  return <NotFoundView />;
}
