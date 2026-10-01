"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// A pop-up form on the native <dialog>, so focus stays inside, Esc closes it and
// focus returns to the button that opened it.
export function Modal({ open, title, description, onClose, children, footer }: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="ac-modal" aria-labelledby="ac-modal-title" onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className="ac-modal-card">
        <header>
          <div><h2 id="ac-modal-title">{title}</h2>{description && <p>{description}</p>}</div>
          <button type="button" className="adm-icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="ac-modal-body">{children}</div>
        <footer>{footer}</footer>
      </div>
    </dialog>
  );
}
