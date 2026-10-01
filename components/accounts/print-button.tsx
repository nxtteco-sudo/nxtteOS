"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return <button type="button" className="ov-btn" onClick={() => window.print()}><Printer size={16} /> Print or save as PDF</button>;
}
