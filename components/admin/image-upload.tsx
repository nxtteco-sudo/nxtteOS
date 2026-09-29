"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage } from "@/app/admin/actions";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadFile(file: File, folder: "insights" | "work" = "insights"): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!TYPES.includes(file.type)) return { ok: false, error: "Use a JPG, PNG, WebP or AVIF image." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Images must be 5 MB or smaller." };
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  return uploadImage(fd);
}

// Cover image picker: click or drag an image in, replace or remove it.
export function ImageUpload({ value, onChange, onError, folder = "insights" }: { value: string | null; onChange: (url: string | null) => void; onError: (text: string) => void; folder?: "insights" | "work" }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  async function take(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    const res = await uploadFile(file, folder);
    setBusy(false);
    if (!res.ok) return onError(res.error);
    onChange(res.url);
  }

  const picker = <input ref={input} type="file" accept={TYPES.join(",")} hidden onChange={(e) => take(e.target.files?.[0])} />;

  if (value) {
    return (
      <div className="adm-cover">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
        <img src={value} alt="" />
        <div className="adm-cover-actions">
          <button type="button" className="adm-btn" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? <Loader2 size={15} className="adm-spin" /> : <ImagePlus size={15} />} Replace
          </button>
          <button type="button" className="adm-btn adm-btn-ghost" onClick={() => onChange(null)}><X size={15} /> Remove</button>
        </div>
        {picker}
      </div>
    );
  }

  return (
    <>
    <button
      type="button"
      className={`adm-drop ${over ? "is-over" : ""}`}
      onClick={() => input.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files?.[0]); }}
      disabled={busy}
    >
      {busy ? <Loader2 size={20} className="adm-spin" /> : <ImagePlus size={20} />}
      <strong>{busy ? "Uploading" : "Add a cover image"}</strong>
      <small>Drag it here or click. JPG, PNG, WebP or AVIF, up to 5 MB. 16:9 works best.</small>
    </button>
    {picker}
    </>
  );
}
