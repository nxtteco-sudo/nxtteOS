import Image from "next/image";
import { Lightbulb } from "lucide-react";
import type { AUTHORS, Faq } from "@/lib/content-seo";

type Author = (typeof AUTHORS)[number];

// Pieces of a post shared by the public page and the editor preview: the author
// byline, the key takeaways box (a direct answer AI tools can quote) and the FAQs.

export function PostByline({ author }: { author: Author | null }) {
  if (!author) return null;
  return (
    <span className="ip-byline">
      <span className="ip-byline-photo"><Image src={author.photo} alt="" fill sizes="36px" /></span>
      <span>By <strong>{author.name}</strong><small>{author.role}, nxtte</small></span>
    </span>
  );
}

export function PostTakeaways({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.replace(/^[-•]\s*/, "").trim()).filter(Boolean);
  if (!lines.length) return null;
  return (
    <aside className="ip-takeaways" aria-label="Key takeaways">
      <p><Lightbulb size={16} aria-hidden="true" /> Key takeaways</p>
      <ul>{lines.map((l) => <li key={l}>{l}</li>)}</ul>
    </aside>
  );
}

export function PostFaqs({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section className="ip-faqs" aria-labelledby="ip-faqs-title">
      <h2 id="ip-faqs-title">Common questions</h2>
      {faqs.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </section>
  );
}
