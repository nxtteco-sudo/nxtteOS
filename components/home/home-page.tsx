"use client";

// Homepage design ported from the Vite prototype (_vite-scaffold-archive).
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { CONTACT } from "@/lib/site";
import { BrandMark } from "@/components/brand-mark";
import { trackEvent } from "@/lib/analytics";
import { siFacebook, siInstagram, siPinterest, siThreads, siTiktok, siWhatsapp, siX, siYoutube } from "simple-icons";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  CalendarCheck,
  CalendarX,
  CalendarRange,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileBarChart,
  Handshake,
  Ghost,
  Globe,
  FileText,
  Heart,
  IdCard,
  Image as ImageIcon,
  Inbox,
  LayoutTemplate,
  Instagram,
  Layers3,
  Mail,
  Map as MapIcon,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  MoveUpRight,
  Play,
  Plus,
  ScanSearch,
  Send,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
  Ticket,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Timer,
  Receipt,
  Type as TypeIcon,
  Unlock,
  Users,
  Workflow,
  X,
  Zap,
  Wallet,
  Moon,
  Minus,
  Flag,
  Flame,
  Languages,
  ShoppingBag,
  GraduationCap,
  Wrench,
  Scissors,
  Coffee,
} from "lucide-react";

const whatsappHref = buildWhatsAppLink("Hi nxtte, I'd like to talk about turning my content into bookings.");

const navItems = [
  ["Services", "/services"],
  ["Work", "/work"],
  ["About", "/about"],
  ["Insights", "/insights"],
  ["Contact", "/contact"],
];

// Prices and inclusions from nxtte Services & Pricing 2026 (valid from October 2026).
const packages = [
  {
    name: "Starter",
    price: "RM 1,199",
    note: "per month",
    detail: "Show up consistently on one platform.",
    included: ["1 platform", "12 posts (single image and carousel)", "Captions and hashtags", "Monthly content calendar", "Monthly report"],
  },
  {
    name: "Growth",
    price: "RM 2,299",
    note: "per month",
    detail: "Reels, where most new customers find local businesses today.",
    included: ["2 platforms", "12 posts + 4 reels or TikToks", "Captions, hashtags and calendar", "Monthly report", "Monthly strategy call"],
    featured: true,
  },
  {
    name: "Pro",
    price: "RM 3,399",
    note: "per month",
    detail: "Content, ads and shoots handled together.",
    included: ["3 platforms", "16 posts + 6 reels or TikToks", "Ads management on 1 platform", "Half-day weekend shoot every quarter", "Report and monthly strategy call"],
  },
]

const services = [
  {
    index: "01",
    icon: Sparkles,
    title: "Content Creation",
    body: "Ideas, scripts and finished posts designed to make your offer easy to understand and easy to act on.",
    audience: "For businesses with something good to say but no repeatable way to say it.",
    price: "Included in every package",
  },
  {
    index: "02",
    icon: Layers3,
    title: "Social Media Management",
    body: "A calm, consistent operating rhythm across your channels — publishing, replying and reporting without the noise.",
    audience: "For owners who want a reliable presence without another thing on their plate.",
    price: "Included in every package",
  },
  {
    index: "03",
    icon: TrendingUp,
    title: "Ads & Growth",
    body: "Campaign structure, creative testing and conversion tracking that gives your best content somewhere to go.",
    audience: "For businesses with a proven offer and a clear next step for prospects.",
    price: "RM 1,200/month, or 15% of ad spend if higher",
  },
  {
    index: "04",
    icon: Target,
    title: "Brand & Business",
    body: "The foundations underneath the content: positioning, landing pages and a clearer path from attention to enquiry.",
    audience: "For teams who need the content, site and funnel to feel like one system.",
    price: "Landing page RM 1,399 · Company profile RM 699",
  },
];



function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`logo-lockup ${light ? "logo-lockup-light" : ""}`} aria-label="nxtte home">
      {/* The logo is never recoloured; it sits in a solid black container (CLAUDE.md rule 5). */}
      <span className="logo-badge"><Image src="/brand/nxtte-logo.png" alt="nxtte" width={480} height={204} priority sizes="120px" /></span>
    </Link>
  );
}

function PrimaryButton({ href = whatsappHref, children = "Start a conversation", className = "" }: { href?: string; children?: React.ReactNode; className?: string }) {
  return (
    <a className={`btn btn-primary ${className}`} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} onClick={() => trackEvent("whatsapp_click")}>
      {children}
      <ArrowUpRight size={17} strokeWidth={2.2} />
    </a>
  );
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="btn btn-secondary" href={href}>
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <div className={`eyebrow ${light ? "eyebrow-light" : ""}`}><span className="eyebrow-dot" />{children}</div>;
}

function SectionHeading({ eyebrow, title, body, light = false, align = "left" }: { eyebrow: string; title: React.ReactNode; body?: string; light?: boolean; align?: "left" | "center" }) {
  return (
    <div className={`section-heading ${light ? "section-heading-light" : ""} ${align === "center" ? "section-heading-center" : ""}`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}

function Nav({ stripped = false }: { stripped?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  // Sliding hover pill behind the desktop links.
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number; on: boolean }>({ x: 0, w: 0, on: false });
  const movePill = (el: HTMLElement) => setPill({ x: el.offsetLeft, w: el.offsetWidth, on: true });

  if (stripped) {
    return <header className="audit-nav"><div className="site-shell"><Logo /></div></header>;
  }

  return (
    <>
      <header className={`site-nav ${scrolled ? "site-nav-scrolled" : ""} ${menuOpen ? "site-nav-hidden" : ""}`}>
        <div className="nav-inner">
          <Logo />
          <nav ref={navRef} className="desktop-nav" aria-label="Main navigation" onMouseLeave={() => setPill((p) => ({ ...p, on: false }))}>
            <span className={`nav-pill ${pill.on ? "is-on" : ""}`} style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} aria-hidden="true" />
            {navItems.map(([label, href]) => <Link key={href} href={href} className={location === href ? "active" : ""} aria-current={location === href ? "page" : undefined} onMouseEnter={(e) => movePill(e.currentTarget)} onFocus={(e) => movePill(e.currentTarget)}>{label}</Link>)}
          </nav>
          <a className="nav-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click")}><MessageCircle size={15} /> WhatsApp us <ArrowUpRight size={15} className="nav-wa-arrow" /></a>
          <button className="mobile-menu-btn" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
        </div>
      </header>
      <div className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-top"><Logo /><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div>
        <div className="mobile-links">{navItems.map(([label, href], index) => <Link key={href} href={href}><span>0{index + 1}</span>{label}<ArrowUpRight size={22} /></Link>)}</div>
        <div className="mobile-menu-bottom"><span>Built for bookings.</span><a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp us <ArrowUpRight size={17} /></a></div>
      </div>
    </>
  );
}

// Footer: its own rounded dark panel with a glowing top edge, real social logos,
// and a giant gradient wordmark. Email and SSM stay as visible placeholders
// (content gaps) until the real details are supplied.
const FOOTER_SOCIALS = [
  { label: "WhatsApp", logo: siWhatsapp, href: whatsappHref },
  { label: "Instagram", logo: siInstagram, href: CONTACT.instagramUrl },
  { label: "TikTok", logo: siTiktok, href: CONTACT.tiktokUrl },
];

function Footer() {
  return (
    <footer className="site-footer ft">
      <div className="ft-panel">
        <div className="site-shell">
          <div className="ft-main">
            <div className="ft-brand">
              <Logo light />
              <p>Content that produces bookings, not just likes.</p>
            </div>
          <div className="ft-cols">
            <div className="ft-col">
              <span className="footer-label">Explore</span>
              {navItems.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </div>
            <div className="ft-col">
              <span className="footer-label">Say hello</span>
              <div className="ft-socials">
                {FOOTER_SOCIALS.map(({ label, logo, href }) => (
                  <a key={label} className="ft-social" href={href} target="_blank" rel="noreferrer" aria-label={`nxtte on ${label}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d={logo.path} /></svg>
                  </a>
                ))}
              </div>
            </div>
            <div className="ft-col">
              <span className="footer-label">Find us</span>
              <a className="ft-line" href={`mailto:${CONTACT.email}`}><Mail size={15} /> {CONTACT.email}</a>
              <span className="ft-line"><MapPin size={15} /> Kuala Lumpur, Malaysia</span>
            </div>
          </div>
          </div>
          <div className="ft-bottom">
            <span>© 2026 nxtte, a sub-brand of Aurexis Solution</span>
            <span>SSM NS0315281-P</span>
            <a className="ft-top-btn" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to top <ArrowUp size={14} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PageShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`page ${className}`}><Nav />{children}<Footer /></div>;
}

// /audit: stripped header, no links out except the logo (AGENTS.md section 5).
function StrippedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page page-stripped">
      <Nav stripped />
      {children}
      <footer className="stripped-foot"><div className="site-shell"><span>&copy; {new Date().getFullYear()} nxtte, a sub-brand of Aurexis Solution</span><span>SSM NS0315281-P</span></div></footer>
    </div>
  );
}



// Hero background: brand gradient + fine white grid with a few lit cells on the
// edges (away from the headline and phone). Cells light up once on load, then
// pulse slowly; paused off-screen and still for reduced-motion users.
// [grid column offset from centre, grid row, tone]
const HERO_CELLS: [number, number, "glass" | "pink"][] = [
  [-11, 3, "glass"], [-10, 5, "pink"], [-12, 7, "glass"], [-9, 9, "glass"], [-11, 11, "pink"],
  [9, 2, "pink"], [11, 4, "glass"], [10, 7, "glass"], [12, 9, "pink"], [9, 11, "glass"],
];

// Light signals travelling along grid lines: [axis, line index, duration s, delay s].
// Rows/columns chosen to stay clear of the headline.
const HERO_SIGNALS: ["h" | "v", number, number, number][] = [
  ["h", 1, 9, -2], ["h", 9, 11, -6], ["h", 12, 8, -1],
  ["v", -10, 7, -3], ["v", 11, 9, -5], ["v", -13, 10, -8], ["v", 13, 8, -4],
];

function HeroBackground() {
  const [ref, inView] = useInView<HTMLDivElement>();
  // Cursor spotlight on the grid (desktop pointers only).
  useEffect(() => {
    const bg = ref.current;
    const hero = bg?.parentElement;
    if (!bg || !hero || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        bg.style.setProperty("--mx", `${e.clientX - r.left}px`);
        bg.style.setProperty("--my", `${e.clientY - r.top}px`);
        bg.classList.add("hg-lit");
      });
    };
    const onLeave = () => bg.classList.remove("hg-lit");
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => { cancelAnimationFrame(raf); hero.removeEventListener("mousemove", onMove); hero.removeEventListener("mouseleave", onLeave); };
  }, [ref]);
  return (
    <div ref={ref} className={`hero-bg hg ${inView ? "" : "loop-paused"}`} aria-hidden="true">
      <div className="hg-veil" />
      <div className="hg-grid" />
      <div className="hg-dots" />
      <div className="hg-spot" />
      <div className="hg-signals">
        {HERO_SIGNALS.map(([axis, n, dur, del], i) => (
          <span key={i} className={`hg-signal hg-signal-${axis}`} style={axis === "h" ? { top: n * 56, animationDuration: `${dur}s`, animationDelay: `${del}s` } : { left: `calc(50% - 28px + ${n * 56}px)`, animationDuration: `${dur}s`, animationDelay: `${del}s` }} />
        ))}
      </div>
      {HERO_CELLS.map(([col, row, tone], i) => (
        <span key={i} className={`hg-cell hg-${tone}`} style={{ left: `calc(50% - 28px + ${col * 56}px)`, top: row * 56, ["--cd" as string]: `${500 + i * 110}ms`, ["--tw" as string]: `${5 + (i % 4)}s` }} />
      ))}
      <div className="hg-phone-glow" />
      <div className="hero-grain" />
    </div>
  );
}


const heroPromises = [
  { icon: Clock3, label: "First calendar in 5 working days" },
  { icon: BarChart3, label: "Published pricing" },
  { icon: Check, label: "Month to month after 3 months" },
  { icon: MessageCircle, label: "Reply within 24 hours" },
];

// Illustrative phone: a post turning into a WhatsApp enquiry (the spec's
// "attention into bookings"). No stock photos, ratings or partner logos: those
// would be fabricated proof.
function HeroStage() {
  return (
    <div className="hero-stage" aria-hidden="true">
      <svg className="hero-arcs" viewBox="0 0 1000 520" preserveAspectRatio="none">
        <path fill="none" d="M40 470 C 220 120, 780 120, 960 470" />
        <path fill="none" d="M130 500 C 300 250, 700 250, 870 500" />
      </svg>

      <div className="float-icon float-icon-1"><Instagram size={20} /></div>
      <div className="float-icon float-icon-2"><Play size={18} /></div>
      <div className="float-icon float-icon-3"><MessageCircle size={20} /></div>
      <div className="float-icon float-icon-4"><CalendarCheck size={20} /></div>

      <div className="float-card float-card-left">
        <span className="float-card-icon"><Sparkles size={15} /></span>
        <span><strong>Carousel published</strong><small>Clear offer, one next step</small></span>
      </div>
      <div className="float-card float-card-right">
        <span className="float-card-icon float-card-icon-ink"><MessageCircle size={15} /></span>
        <span><strong>New WhatsApp enquiry</strong><small>&ldquo;Hi, can I book for Saturday?&rdquo;</small></span>
      </div>

      <div className="phone-halo" />
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-screen">
          <div className="phone-profile">
            <span className="phone-avatar"><BrandMark size={16} /></span>
            <span className="phone-handle">nxtte<small>Kuala Lumpur</small></span>
            <span className="phone-dots">•••</span>
          </div>
          <div className="phone-post">
            <span className="phone-post-kicker">Slide 1 / 5</span>
            <span className="phone-post-title">Likes don&rsquo;t pay rent.<br /><em>Bookings do.</em></span>
            <span className="phone-post-foot">nxtte</span>
          </div>
          <div className="phone-actions">
            <Heart size={18} /><MessageCircle size={18} /><Send size={18} /><Bookmark size={18} className="phone-save" />
          </div>
          <div className="phone-caption"><i /><i /></div>
          <div className="phone-cta"><MessageCircle size={14} /> Message on WhatsApp</div>
        </div>
      </div>
    </div>
  );
}

// Staggered fade-and-rise helper: each .art-step reads its delay from --d.
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

// Adds "is-in" once the card is 35% visible. Without IntersectionObserver the
// card simply renders in its final state.
function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState<"static" | "waiting" | "in">("static");
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    setState("waiting");
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setState("in");
        io.disconnect();
      }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, state] as const;
}


// Service-tile illustrations: what each service produces. The row builds left to
// right once when it scrolls into view (same fade-and-rise steps as the problem cards).
function ServiceArtContent({ base }: { base: number }) {
  return (
    <div className="svc-art svc-art-content" aria-hidden="true">
      <span className="svc-post svc-post-back art-step" style={delay(base)}><i /><b /></span>
      <span className="svc-post svc-post-mid art-step" style={delay(base + 90)}><i /><b /></span>
      <span className="svc-post svc-post-front art-step" style={delay(base + 180)}><Play size={14} fill="currentColor" /></span>
    </div>
  );
}

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];
const POSTED_DAYS = new Set([0, 2, 4, 5]);

function ServiceArtManage({ base }: { base: number }) {
  return (
    <div className="svc-art svc-art-week" aria-hidden="true">
      {WEEK.map((day, i) => (
        <span key={i} className="svc-day art-step" style={delay(base + i * 45)}>
          <small>{day}</small>
          <i className={POSTED_DAYS.has(i) ? "svc-day-done" : ""}>{POSTED_DAYS.has(i) && <Check size={11} strokeWidth={3} />}</i>
        </span>
      ))}
    </div>
  );
}

const BAR_HEIGHTS = [28, 38, 34, 54, 66, 84];

function ServiceArtAds({ base }: { base: number }) {
  return (
    <div className="svc-art svc-art-bars" aria-hidden="true">
      {BAR_HEIGHTS.map((h, i) => <i key={i} className={`art-step ${i === BAR_HEIGHTS.length - 1 ? "svc-bar-top" : ""}`} style={{ ...delay(base + i * 60), height: `${h}%` }} />)}
      <TrendingUp className="svc-trend art-step" size={18} style={delay(base + 420)} />
    </div>
  );
}

function ServiceArtBrand({ base }: { base: number }) {
  return (
    <div className="svc-art svc-art-page" aria-hidden="true">
      <div className="svc-browser art-step" style={delay(base)}>
        <div className="svc-browser-bar"><i /><i /><i /></div>
        <b className="svc-line-lg" /><b className="svc-line-sm" />
        <span className="svc-cta art-step" style={delay(base + 260)}>Book now</span>
      </div>
    </div>
  );
}

const serviceArt = [ServiceArtContent, ServiceArtManage, ServiceArtAds, ServiceArtBrand];

// Colourful platform logos drifting down on a loop, confined to the right half of
// the heading row. Decorative; stills for reduced-motion users; hidden on phones.
const RAIN_LOGOS = [siInstagram, siTiktok, siWhatsapp, siFacebook, siYoutube, siX, siThreads, siPinterest];
const RAIN_COLUMNS = [
  { speed: 80, delay: -10, offset: 0 },
  { speed: 96, delay: -44, offset: 3 },
  { speed: 72, delay: -22, offset: 6 },
  { speed: 90, delay: -5, offset: 2 },
  { speed: 76, delay: -58, offset: 5 },
  { speed: 100, delay: -30, offset: 1 },
];
const LOGOS_PER_COLUMN = 12;

function SocialRain() {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`social-rain ${inView ? "" : "loop-paused"}`} aria-hidden="true">
      {RAIN_COLUMNS.map((col, c) => {
        const logos = Array.from({ length: LOGOS_PER_COLUMN }, (_, k) => RAIN_LOGOS[(k + col.offset) % RAIN_LOGOS.length]);
        return (
          <div className="rain-col" key={c}>
            <div className="rain-track" style={{ animationDuration: `${col.speed}s`, animationDelay: `${col.delay}s` }}>
              {[...logos, ...logos].map((logo, k) => (
                <svg key={k} className="rain-logo" viewBox="0 0 24 24" style={{ fill: `#${logo.hex}` }}><path d={logo.path} /></svg>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// "Why nxtte": the spec's differentiator drawn as a path. Most agencies stop at
// content; nxtte + Aurexis cover the whole route from post to booking.
const PATH_STATIONS = [
  { icon: Sparkles, label: "Content", note: "Posts and reels" },
  { icon: LayoutTemplate, label: "Website", note: "Landing page" },
  { icon: Workflow, label: "Lead capture", note: "WhatsApp + follow-up" },
  { icon: CalendarCheck, label: "Booking", note: "The number that matters" },
];

const WHY_PROOFS = [
  { icon: Zap, title: "Fast turnaround", body: "First calendar in 5 working days." },
  { icon: BarChart3, title: "Published pricing", body: "Costs known before the call." },
  { icon: Clock3, title: "Flexible terms", body: "3-month minimum, then month to month." },
];

function WhySection() {
  const [ref, inView] = useInView<HTMLElement>();
  const [gridRef, gridState] = useRevealOnce<HTMLDivElement>();
  const motion = gridState === "static" ? "" : gridState === "in" ? "anim-ready is-in" : "anim-ready";
  return (
    <section ref={ref} className={`why-section why3 ${inView ? "" : "loop-paused"}`}>
      <div className="why3-bg" aria-hidden="true"><div className="aurora aurora-1" /><div className="aurora aurora-2" /><div className="aurora aurora-3" /><div className="aurora aurora-4" /><div className="why3-grid-lines" /></div>
      <div className="site-shell">
        <div className="why3-head">
          <SectionHeading eyebrow="Why nxtte" title={<>One team from<br /><em>story to sale.</em></>} />
          <div className="why3-head-right">
            <p>nxtte is attached to Aurexis Solution. So the website, the funnel, the lead capture and the content come from one team.</p>
            <Link className="arrow-link" href="/about">See how we work <ArrowUpRight size={17} /></Link>
          </div>
        </div>
        <div ref={gridRef} className={`why3-bento ${motion}`}>
          <div className="why3-relay art-step" style={delay(0)} role="img" aria-label="Most agencies stop after content and the lead is lost. nxtte and Aurexis carry it from content to website to lead capture to a booking.">
            <div className="relay relay-others">
              <div className="relay-head"><span className="relay-label">Most agencies</span><span className="relay-note">Content, then a hand-off</span></div>
              <div className="relay-track">
                <span className="relay-line relay-line-solid" /><span className="relay-line relay-line-dashed" />
                <span className="relay-runner relay-runner-a"><i className="relay-orb relay-orb-a" /></span>
                <span className="relay-lost">Lead lost</span>
                <ol className="relay-nodes">
                  {PATH_STATIONS.map(({ icon: Icon, label }, i) => (
                    <li key={label} className={i > 0 ? "is-dim" : ""}><span className="relay-dot"><Icon size={19} strokeWidth={1.8} /></span><strong>{label}</strong></li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="relay relay-us">
              <div className="relay-head"><span className="relay-label relay-label-us">nxtte + Aurexis</span><span className="relay-note">One team, the whole path</span></div>
              <div className="relay-track">
                <span className="relay-line relay-line-full" />
                <span className="relay-runner relay-runner-b"><i className="relay-orb relay-orb-b" /></span>
                <span className="relay-booked"><Check size={13} strokeWidth={3} /> Booked</span>
                <ol className="relay-nodes">
                  {PATH_STATIONS.map(({ icon: Icon, label, note }, i) => (
                    <li key={label} className={`relay-pass relay-pass-${i} ${i === PATH_STATIONS.length - 1 ? "relay-end" : ""}`}><span className="relay-dot"><Icon size={19} strokeWidth={1.8} /></span><strong>{label}</strong><small>{note}</small></li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
          <div className="why3-tile art-step" style={delay(120)}>
            <span className="why3-tile-icon"><Timer size={17} /></span>
            <div className="why3-big">5<span> days</span></div>
            <strong>To your first content calendar</strong>
            <small>Working days from the day you start.</small>
          </div>
          <div className="why3-tile art-step" style={delay(200)}>
            <span className="why3-tile-icon"><Receipt size={17} /></span>
            <div className="why3-big">3</div>
            <strong>Published price tiers</strong>
            <small>RM 1,199 · RM 2,299 · RM 3,399</small>
          </div>
          <div className="why3-tile art-step" style={delay(280)}>
            <span className="why3-tile-icon"><Tag size={17} /></span>
            <div className="why3-big">15<span>%</span></div>
            <strong>Off the whole menu</strong>
            <small>For every package client.</small>
          </div>
          <div className="why3-tile why3-tile-team art-step" style={delay(360)}>
            <div className="why3-lockup"><span className="why3-mark"><BrandMark size={18} /></span><Plus size={14} /><span className="why3-aurexis">Aurexis Solution</span></div>
            <strong>Site, funnel and content from one team</strong>
            <div className="why3-chips">{["Content", "Website", "Lead capture", "Automation"].map((c) => <span key={c}>{c}</span>)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Replaces the case-study preview until real cases with results exist (spec:
// never publish a tile without a result). Steps mirror the site's own FAQ answer
// to "What actually happens in the first month?".
const FIRST_MONTH = [
  { icon: Handshake, when: "Day 1", title: "Onboarding call", body: "We learn your business, customers, offers and brand." },
  { icon: CalendarRange, when: "Days 2 to 5", title: "First content calendar", body: "The month planned around local festivals, payday and sale days, for you to approve." },
  { icon: Send, when: "Week 2", title: "First posts go live", body: "We schedule and publish everything you approve." },
  { icon: FileBarChart, when: "End of month", title: "Report and next moves", body: "What brought enquiries and what changes. Growth and Pro also get a strategy call." },
]

// Days of the first month each step lands on, and an example posting rhythm
// (Growth: 12 posts). Shown as an example, not a fixed schedule.
const FM_DAYS = [1, 5, 8, 30];
const FM_POST_DAYS = new Set([8, 10, 12, 15, 17, 19, 22, 24, 26, 29]);
const FM_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function FirstMonth() {
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  const [active, setActive] = useState<number | null>(null);
  const milestoneAt = (day: number) => FM_DAYS.indexOf(day);
  return (
    <section className="first-month fm2">
      <div className="fm2-bg" aria-hidden="true"><div className="fm2-glow fm2-glow-a" /><div className="fm2-glow fm2-glow-b" /></div>
      <div ref={ref} className={`site-shell fm2-grid ${motion}`}>
        <div className="fm2-copy">
          <SectionHeading eyebrow="Your first month" title={<>What happens<br /><em>after you say yes.</em></>} body="No black box. Here is the first 30 days, step by step." />
          <ol className="fm2-steps">
            {FIRST_MONTH.map(({ icon: Icon, when, title, body }, i) => (
              <li key={title} className={`fm2-step art-step ${active === i ? "is-active" : ""}`} style={delay(120 + i * 90)} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} tabIndex={0}>
                <span className="fm2-step-icon"><Icon size={18} strokeWidth={1.8} /></span>
                <span className="fm2-step-text"><span className="fm2-when">{when}</span><strong>{title}</strong><small>{body}</small></span>
              </li>
            ))}
          </ol>
          <SecondaryButton href="/audit">Start with the RM 199 audit</SecondaryButton>
        </div>
        <div className="fm2-cal art-step" style={delay(60)} aria-label="First month calendar: kickoff on day 1, content calendar by day 3, publishing from day 5, report on day 30.">
          <div className="fm2-cal-head"><span className="fm2-cal-title">Month 1</span><span className="fm2-cal-sub">with nxtte</span></div>
          <div className="fm2-week">{FM_WEEKDAYS.map((d) => <span key={d}>{d}</span>)}</div>
          <div className="fm2-days">
            {Array.from({ length: 35 }, (_, k) => {
              const day = k + 1;
              if (day > 30) return <span key={k} className="fm2-day fm2-day-empty" />;
              const m = milestoneAt(day);
              const isPost = FM_POST_DAYS.has(day);
              const Icon = m >= 0 ? FIRST_MONTH[m].icon : null;
              return (
                <span key={k} className={`fm2-day ${m >= 0 ? `fm2-day-m fm2-day-m${m}` : ""} ${isPost ? "fm2-day-post" : ""} ${m >= 0 && active === m ? "is-active" : ""}`} style={delay(200 + k * 28)}>
                  <b>{day}</b>
                  {Icon ? <Icon size={15} strokeWidth={2} /> : isPost ? <i /> : null}
                </span>
              );
            })}
          </div>
          <div className="fm2-legend"><span><i className="fm2-key-m" />Milestone</span><span><i className="fm2-key-post" />Post goes live (example rhythm)</span></div>
        </div>
      </div>
    </section>
  );
}

// Final CTA: black full-bleed (spec). An "audit scanner" sweeps a feed strip and
// flags example gaps. Labels are illustrative, not client data.
const SCAN_TILES = [
  { kind: "profile", tone: "", flag: "Bio unclear" },
  { kind: "post", tone: "pb-pink", flag: "" },
  { kind: "post", tone: "pb-lilac", flag: "No clear offer" },
  { kind: "post", tone: "pb-ink", flag: "" },
  { kind: "post", tone: "pb-blush", flag: "No next step" },
  { kind: "post", tone: "pb-pink", flag: "" },
];

function FinalCTA() {
  const [ref, inView] = useInView<HTMLElement>();
  let flagN = 0;
  return (
    <section ref={ref} className={`cta-section cta2 dark-band ${inView ? "" : "loop-paused"}`}>
      <div className="cta2-bg" aria-hidden="true"><div className="cta2-spot" /><div className="cta2-rays" /></div>
      <div className="site-shell cta2-inner">
        <Eyebrow light>One useful next step</Eyebrow>
        <h2>Find the gap <em>before you fill it.</em></h2>
        <p>Get a clear view of what is stopping your content from converting, and what to do about it next.</p>
        <div className="cta2-scan" aria-hidden="true">
          <div className="cta2-tiles">
            {SCAN_TILES.map((t, i) => {
              const n = t.flag ? ++flagN : 0;
              return (
                <div key={i} className={`cta2-tile ${t.flag ? `is-flag cta2-flag-${n}` : ""}`}>
                  {t.kind === "profile" ? (
                    <div className="cta2-profile"><i /><b /><b /><b /></div>
                  ) : (
                    <div className={`cta2-img ${t.tone}`} />
                  )}
                  {t.flag && <span className="cta2-label">{t.flag}</span>}
                </div>
              );
            })}
          </div>
          <div className="cta2-runner"><span className="cta2-beam" /></div>
          <span className="cta2-found"><ScanSearch size={13} /> 3 gaps found</span>
        </div>
        <div className="cta2-actions">
          <Link className="cta-btn cta-btn-primary" href="/audit">Book the RM 199 audit <ArrowUpRight size={17} /></Link>
          <a className="cta-btn cta-btn-ghost" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click")}><MessageCircle size={16} /> WhatsApp us</a>
        </div>
        <ul className="cta2-facts">
          <li><Ticket size={14} /> RM 199, credited to month one if you sign within 14 days</li>
          <li><Clock3 size={14} /> Delivered in five working days</li>
          <li><MapIcon size={14} /> 90-day roadmap, week by week</li>
        </ul>
      </div>
    </section>
  );
}

function ServicesGrid() {
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  return (
    <div ref={ref} className={`service-preview-grid ${motion}`}>
      {services.map(({ index, icon: Icon, title, body, price }, i) => {
        const Art = serviceArt[i];
        const base = i * 260;
        return (
          <Link href="/services" className="service-tile" key={title}>
            <div className="service-tile-top"><span>{index}</span><Icon size={22} strokeWidth={1.7} /></div>
            <Art base={base} />
            {i < services.length - 1 && <span className="svc-link art-step" style={delay(base + 240)} aria-hidden="true"><ArrowRight size={13} /></span>}
            <h3>{title}</h3><p>{body}</p>
            <div className="service-tile-bottom"><span>{price}</span><ArrowUpRight size={17} /></div>
          </Link>
        );
      })}
    </div>
  );
}

// "The problem": a live busy feed on a phone, torn down by three callouts, each
// wired to the spot on screen where the problem shows up. Decorative loops pause
// off-screen and stop for reduced-motion users.
const VANITY_WORDS = ["likes", "views", "saves", "shares", "reach", "followers", "impressions"];
const PB_POSTS = ["pink", "lilac", "ink", "blush", "pink", "lilac"] as const;
const PB_CALLOUTS = [
  { n: "01", icon: CalendarX, title: "Posting with no plan", body: "Every week starts from a blank page and a hope that something lands." },
  { n: "02", icon: TrendingDown, title: "Content that does not convert", body: "The posts get attention. Nothing gives people a next step." },
  { n: "03", icon: Ghost, title: "An agency that went quiet", body: "Busy in month one. By month two, no plan and no report." },
];

const PB_TOASTS = [
  { icon: UserPlus, text: "New follower", sub: "just now", cls: "pb-toast-a" },
  { icon: Bookmark, text: "Post saved", sub: "2m ago", cls: "pb-toast-b" },
  { icon: Play, text: "Your reel is getting views", sub: "5m ago", cls: "pb-toast-c" },
];

function ProblemPhone() {
  return (
    <div className="pb-phone">
      <div className="pb-notch" />
      <div className="pb-screen">
        <div className="pb-topbar">
          <span className="pb-icon pb-icon-plan"><CalendarX size={15} /><span className="pb-hot" data-n="1" /></span>
          <span className="pb-handle">your.brand</span>
          <span className="pb-icon"><Send size={15} /></span>
        </div>
        <div className="pb-feed">
          <div className="pb-feed-track">
            {[...PB_POSTS, ...PB_POSTS].map((tone, k) => (
              <div key={k} className="pb-post">
                <div className="pb-post-head"><i /><b /></div>
                <div className={`pb-post-img pb-${tone}`} />
                <div className="pb-post-actions"><Heart size={13} fill="currentColor" /><MessageCircle size={13} /><Send size={13} /><Bookmark size={13} /></div>
              </div>
            ))}
          </div>
          <div className="pb-hearts">{[0, 1, 2, 3].map((k) => <Heart key={k} size={16} fill="currentColor" />)}</div>
        </div>
        <div className="pb-chip"><Inbox size={14} /><span><strong>0 enquiries</strong> this week</span><span className="pb-hot" data-n="2" /></div>
        <div className="pb-sheet">
          <span className="pb-hot" data-n="3" />
          <strong>Will send the report soon</strong>
          <small>Agency · seen 3 weeks ago</small>
        </div>
      </div>
    </div>
  );
}

function ProblemSection() {
  const [ref, inView] = useInView<HTMLElement>();
  const [gapRef, gapState] = useRevealOnce<HTMLDivElement>();
  const gapMotion = gapState === "static" ? "" : gapState === "in" ? "anim-ready is-in" : "anim-ready";
  return (
    <section ref={ref} className={`problem-section pb-section ${inView ? "" : "loop-paused"}`}>
      <div className="pb-bg" aria-hidden="true">
        <div className="pb-blob pb-blob-a" />
        <div className="pb-blob pb-blob-b" />
        {[0, 1].map((row) => (
          <div key={row} className={`pb-marquee pb-marquee-${row}`}>
            <div className="pb-marquee-track">
              {[...VANITY_WORDS, ...VANITY_WORDS].map((w, k) => <span key={k}>{w}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="site-shell pb-grid">
        <div className="pb-copy">
          <SectionHeading eyebrow="The problem" title={<>A busy feed is not<br /><em>a business system.</em></>} body="If your content is not connected to the next step, it is only keeping the algorithm warm." />
          <div ref={gapRef} className={`pb-gap ${gapMotion}`} aria-label="Attention is high, enquiries are close to none">
            <div className="pb-gap-row"><span className="pb-gap-label">Attention</span><div className="pb-bar"><i className="pb-bar-full" /></div></div>
            <div className="pb-gap-row"><span className="pb-gap-label">Enquiries</span><div className="pb-bar"><i className="pb-bar-thin" /></div></div>
            <p>That gap is the whole job. <strong>We close it.</strong></p>
          </div>
          <div className="pb-cta-row">
            <a className="pb-cta" href="#what-we-do">See how we close it <ArrowDown size={16} /></a>
            <span>Most agencies stop at the post.</span>
          </div>
        </div>
        <div className="pb-stage">
          <div className="pb-stage-inner">
            <svg className="pb-lines" viewBox="0 0 680 560" aria-hidden="true">
              <path d="M190 88 H239" /><circle cx="190" cy="88" r="3.5" />
              <path d="M425 285 H490" /><circle cx="490" cy="285" r="3.5" />
              <path d="M190 475 H239" /><circle cx="190" cy="475" r="3.5" />
            </svg>
            <ProblemPhone />
            {PB_TOASTS.map(({ icon: Icon, text, sub, cls }) => (
              <div key={text} className={`pb-toast ${cls}`} aria-hidden="true">
                <span className="pb-toast-icon"><Icon size={14} /></span>
                <span><strong>{text}</strong><small>{sub}</small></span>
              </div>
            ))}
            {PB_CALLOUTS.map(({ n, icon: Icon, title, body }, i) => (
              <article key={n} className={`pb-callout pb-callout-${i + 1}`}>
                <div className="pb-callout-top"><span className="pb-callout-icon"><Icon size={16} /></span><span className="pb-callout-n">{n}</span></div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Runs a decorative loop only while it is on screen.
// AGENTS.md section 9: package_view fires once per page view, when at least
// a third of the pricing section is on screen.
function useTrackView<T extends HTMLElement>(source: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      trackEvent("package_view", { source });
      io.disconnect();
    }, { threshold: 0.33 });
    io.observe(el);
    return () => io.disconnect();
  }, [source]);
  return ref;
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}


// /services hero: one full screen. A tilted 3D wall of mini mock-ups of what
// nxtte makes, each tagged with its menu price; columns glide in opposite
// directions. Paused off-screen, still for reduced-motion users.
type Deliverable = "carousel" | "reel" | "ads" | "landing" | "chat" | "calendar" | "profile" | "namecard";
const DELIVERABLES: { kind: Deliverable; label: string; price: string }[] = [
  { kind: "carousel", label: "Carousel", price: "RM 89" },
  { kind: "reel", label: "Reel editing", price: "RM 99" },
  { kind: "landing", label: "Landing page", price: "RM 1,399" },
  { kind: "chat", label: "WhatsApp setup", price: "RM 299" },
  { kind: "ads", label: "Meta ads", price: "RM 1,200/mo" },
  { kind: "calendar", label: "Content calendar", price: "RM 299" },
  { kind: "namecard", label: "Name card", price: "RM 19" },
  { kind: "profile", label: "Company profile", price: "RM 699" },
];
const WALL_COLUMNS = [
  { offset: 0, dur: 46, up: true },
  { offset: 3, dur: 58, up: false },
  { offset: 5, dur: 50, up: true },
];

function DeliverableArt({ kind }: { kind: Deliverable }) {
  switch (kind) {
    case "carousel":
      return <div className="dv dv-carousel"><small>Slide 1 / 5</small><b>5 reasons your post is not booking</b><span className="dv-dots"><i /><i /><i /><i /><i /></span></div>;
    case "reel":
      return <div className="dv dv-reel"><span className="dv-play"><Play size={18} fill="currentColor" /></span><span className="dv-reel-bar"><i /></span><small>0:15</small></div>;
    case "landing":
      return <div className="dv dv-landing"><span className="dv-browser"><i /><i /><i /></span><b className="dv-l1" /><b className="dv-l2" /><span className="dv-btn">Book now</span><span className="dv-thumbs"><i /><i /><i /></span></div>;
    case "chat":
      return <div className="dv dv-chat"><span className="dv-them">Hi, can I book for Saturday?</span><span className="dv-me">Yes, 3pm is free. Shall I lock it in?</span><span className="dv-them">Yes please</span></div>;
    case "ads":
      return <div className="dv dv-ads"><small><TrendingUp size={12} /> Enquiries</small><span className="dv-bars">{[30, 42, 38, 56, 64, 82].map((h, k) => <i key={k} style={{ height: `${h}%` }} />)}</span></div>;
    case "calendar":
      return <div className="dv dv-cal">{Array.from({ length: 21 }, (_, k) => <i key={k} className={[1, 3, 6, 9, 11, 14, 17, 19].includes(k) ? "on" : ""} />)}</div>;
    case "namecard":
      return <div className="dv dv-card"><span className="dv-mark"><BrandMark size={12} /></span><b /><b /></div>;
    case "profile":
      return <div className="dv dv-profile"><small>Company profile</small><b>Your brand, on one page.</b><span /></div>;
  }
}

function ServicesHero() {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <section ref={ref} className={`sh shw ${inView ? "" : "loop-paused"}`}>
      <div className="shw-bg" aria-hidden="true">
        <div className="shw-plane">
          {WALL_COLUMNS.map((col, c) => {
            const items = Array.from({ length: DELIVERABLES.length }, (_, k) => DELIVERABLES[(k + col.offset) % DELIVERABLES.length]);
            return (
              <div key={c} className="shw-col">
                <div className={`shw-track ${col.up ? "shw-up" : "shw-down"}`} style={{ animationDuration: `${col.dur}s` }}>
                  {[...items, ...items].map((d, k) => (
                    <div key={k} className="shw-card">
                      <DeliverableArt kind={d.kind} />
                      <span className="shw-tag"><b>{d.label}</b>{d.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="shw-veil" />
      </div>
      <div className="site-shell sh-grid">
        <div className="sh-copy">
          <div className="rise"><Eyebrow>Services and pricing</Eyebrow></div>
          <h1 className="rise" style={{ animationDelay: "60ms" }}>Fixed prices <em>for everything.</em></h1>
          <p className="rise" style={{ animationDelay: "120ms" }}>Three monthly packages, or pick exactly what you need from the menu. What you see is what you pay.</p>
          <div className="sh-actions rise" style={{ animationDelay: "180ms" }}>
            <a className="sh-btn sh-btn-dark" href="#packages">See the packages <ArrowDownRight size={16} /></a>
            <a className="sh-btn" href="#menu">Browse the menu</a>
          </div>
          <ul className="sh-trust rise" style={{ animationDelay: "240ms" }}>
            <li><Check size={14} /> Every price is published</li>
            <li><Tag size={14} /> 15% off the menu with any package</li>
            <li><Clock3 size={14} /> Month to month after 3 months</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

// /services: "Built for Malaysia" (from Services & Pricing 2026, "How we're
// different" + "Who we work best with"). A year of a client's feed on a phone:
// one post a month, festival months in their own colours. Months are a typical
// year; festival dates move, which the note says plainly. Loops pause off-screen
// and everything is still for reduced-motion users.
type YearPostKind = "cny" | "raya" | "merdeka" | "deepavali" | "sale" | "payday";

// lucide has no lantern; same 24px grid and stroke as the other icons.
function Lantern({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 2h6" /><path d="M12 2v2" /><rect x="6" y="4" width="12" height="15" rx="6" /><path d="M12 19v3" /><path d="M6 11.5h12" />
    </svg>
  );
}

const YEAR_POST_ICON: Record<YearPostKind, React.ComponentType<{ size?: number }>> = {
  cny: Lantern, raya: Moon, merdeka: Flag, deepavali: Flame, sale: Tag, payday: Wallet,
};
const YEAR_POSTS: { m: string; kind: YearPostKind; title: string; extra?: string }[] = [
  { m: "Jan", kind: "payday", title: "Payday picks" },
  { m: "Feb", kind: "cny", title: "Gong Xi Fa Cai" },
  { m: "Mar", kind: "raya", title: "Selamat Hari Raya" },
  { m: "Apr", kind: "payday", title: "Payday picks" },
  { m: "May", kind: "payday", title: "Payday picks" },
  { m: "Jun", kind: "payday", title: "Payday picks" },
  { m: "Jul", kind: "payday", title: "Payday picks" },
  { m: "Aug", kind: "merdeka", title: "Selamat Hari Merdeka" },
  { m: "Sep", kind: "sale", title: "9.9" },
  { m: "Oct", kind: "sale", title: "10.10" },
  { m: "Nov", kind: "deepavali", title: "Happy Deepavali", extra: "+ 11.11" },
  { m: "Dec", kind: "sale", title: "12.12" },
];
const YEAR_KEYS: { kind: YearPostKind; label: string }[] = [
  { kind: "cny", label: "CNY" },
  { kind: "raya", label: "Raya" },
  { kind: "merdeka", label: "Merdeka" },
  { kind: "deepavali", label: "Deepavali" },
  { kind: "sale", label: "9.9 to 12.12 sales" },
  { kind: "payday", label: "Payday, every month" },
];
const YEAR_BADGES = [
  { kind: "raya" as const, title: "Raya post", sub: "Scheduled" },
  { kind: "sale" as const, title: "11.11 sale", sub: "Scheduled" },
  { kind: "payday" as const, title: "Payday picks", sub: "Every month" },
];
const BEST_WITH = [
  { icon: Coffee, label: "Cafés and F&B" },
  { icon: Scissors, label: "Salons and beauty" },
  { icon: Wrench, label: "Home services" },
  { icon: GraduationCap, label: "Tuition centres" },
  { icon: ShoppingBag, label: "Retail and online sellers" },
];

function YearOfPostsSection() {
  const [secRef, inView] = useInView<HTMLElement>();
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  let payday = 0;
  return (
    <section ref={secRef} className={`yp ${inView ? "" : "loop-paused"}`}>
      <div className="yp-blobs" aria-hidden="true"><i className="yp-blob yp-b1" /><i className="yp-blob yp-b2" /><i className="yp-blob yp-b3" /><i className="yp-blob yp-b4" /></div>
      <div ref={ref} className={`site-shell yp-shell ${motion}`}>
        <div className="yp-grid">
          <div className="yp-copy">
            <div className="art-step" style={delay(0)}>
              <SectionHeading eyebrow="Built for Malaysia" title={<>Planned around your<br /><em>customers&rsquo; calendar.</em></>} body="Your content runs on the local calendar, planned weeks ahead, so you are ready before your customers are." />
            </div>
            <ul className="yp-keys" aria-label="What the colours mean">
              {YEAR_KEYS.map(({ kind, label }, i) => <li key={kind} data-k={kind} className="art-step" style={delay(160 + i * 50)}><i className={`yp-sw yp-sw-${kind}`} />{label}</li>)}
            </ul>
            <span className="yp-lang art-step" style={delay(480)}><Languages size={16} /> In English, BM or both</span>
            <p className="yp-note art-step" style={delay(540)}>A typical year of posts. Festival dates move every year, and we plan to the actual dates.</p>
            <div className="yp-best art-step" style={delay(620)}>
              <span className="footer-label yp-best-label">Who we work best with</span>
              <ul>{BEST_WITH.map(({ icon: Icon, label }) => <li key={label}><Icon size={15} strokeWidth={1.9} />{label}</li>)}</ul>
            </div>
          </div>
          <div className="yp-stage">
            <div className="yp-phone art-step" style={delay(200)} role="img" aria-label="A year of posts on a phone: Payday posts every month, CNY in February, Raya in March, Merdeka in August, the 9.9, 10.10, 11.11 and 12.12 sales, and Deepavali in November.">
              <div className="yp-screen" aria-hidden="true">
                <div className="yp-profile">
                  <span className="yp-avatar"><b>YB</b></span>
                  <span><strong>your.business</strong><small>12 months of posts, planned</small></span>
                </div>
                <div className="yp-tabs"><span>Posts</span><span>Reels</span><span>Tagged</span></div>
                <div className="yp-feed">
                  {YEAR_POSTS.map(({ m, kind, title, extra }, i) => {
                    const Icon = YEAR_POST_ICON[kind];
                    const tone = kind === "payday" ? ` yp-q${(payday++ % 4) + 1}` : "";
                    return (
                      <div key={m} className={`yp-post yp-${kind}${tone} art-step`} style={delay(420 + i * 70)}>
                        <span className="yp-post-bg"><Icon size={64} /></span>
                        <span className="yp-m">{m}</span>
                        {extra && <span className="yp-extra">{extra}</span>}
                        <span className="yp-t">{title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {YEAR_BADGES.map(({ kind, title, sub }, i) => {
              const Icon = YEAR_POST_ICON[kind];
              return (
                <span key={title} className={`yp-badge yp-badge-${i + 1} art-step`} style={delay(1350 + i * 180)} aria-hidden="true">
                  <span className="yp-badge-in"><i className={`yp-badge-ic yp-${kind}`}><Icon size={14} /></i><span>{title}<small>{sub}</small></span></span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// /services closing section: what happens after someone gets in touch, from
// the first message to the first posts (timings from the FAQ and first-month
// plan). The line fills and the steps rise once on scroll.
const NEXT_STEPS = [
  { icon: MessageCircle, title: "You message us", body: "Tell us your business and which package or menu items you have in mind.", when: "Today" },
  { icon: Phone, title: "Onboarding call", body: "We learn your customers, your offer and your goals for the next three months.", when: "Day 1" },
  { icon: CalendarCheck, title: "Your content calendar", body: "A month of posts planned around your customers and local dates.", when: "Within 5 working days" },
  { icon: Send, title: "First posts go live", body: "Then a plain-language report at the end of the month.", when: "Week 2" },
];

function NextStepsCTA() {
  const [secRef, inView] = useInView<HTMLElement>();
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  return (
    <section ref={secRef} className={`nx dark-band ${inView ? "" : "loop-paused"}`}>
      <div className="nx-blobs" aria-hidden="true"><i className="nx-b1" /><i className="nx-b2" /></div>
      <div ref={ref} className={`site-shell nx-grid ${motion}`}>
        <div className="nx-copy">
          <div className="art-step" style={delay(0)}>
            <Eyebrow light>What happens next</Eyebrow>
            <h2>From one message <em>to your first posts.</em></h2>
            <p>No long forms and no pitch deck. Here is exactly what happens after you get in touch.</p>
          </div>
          <div className="nx-actions art-step" style={delay(140)}>
            <a className="nx-btn nx-btn-primary" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "services_cta" })}>WhatsApp us <MessageCircle size={16} /></a>
            <Link className="nx-btn nx-btn-ghost" href="/audit">Book the RM 199 audit <ArrowUpRight size={16} /></Link>
          </div>
          <p className="nx-note art-step" style={delay(200)}>Minimum 3 months, then month to month.</p>
        </div>
        <ol className="nx-steps">
          <span className="nx-line" aria-hidden="true" />
          {NEXT_STEPS.map(({ icon: Icon, title, body, when }, i) => (
            <li key={title} className={`nx-step art-step ${i === 0 ? "is-first" : ""}`} style={delay(220 + i * 140)}>
              <span className="nx-dot" aria-hidden="true"><Icon size={20} /></span>
              <div><strong>{title}</strong><p>{body}</p></div>
              <span className="nx-when">{when}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// /about hero: the founders as staff ID badges on nxtte lanyards, over a slow
// brand-pink aurora. Founder photos live in public/team (originals in assets/team).
const FOUNDERS = [
  { name: "Ms. Nemila", role: "CEO, co-founder", photo: "/team/nemila-portrait.jpg" },
  { name: "Mr. Jay", role: "CTO, co-founder", photo: "/team/jay-portrait.jpg" },
];

function AboutHero() {
  const [secRef, inView] = useInView<HTMLElement>();
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  return (
    <section ref={secRef} className={`ab-hero ${inView ? "" : "loop-paused"}`}>
      <div className="ab-aurora" aria-hidden="true"><div className="ab-aurora-light"><i className="ab-c1" /><i className="ab-c2" /></div></div>
      <div ref={ref} className={`site-shell ab-grid ${motion}`}>
        <div className="ab-copy">
          <div className="art-step" style={delay(0)}><Eyebrow>About nxtte</Eyebrow></div>
          <h1 className="art-step" style={delay(80)}>Meet the team <em>on your account.</em></h1>
          <p className="art-step" style={delay(180)}>nxtte is run by Ms. Nemila and Mr. Jay. Behind them, the Aurexis Solution team builds the sites and funnels your content feeds. You always know who is doing the work.</p>
          <div className="ab-actions art-step" style={delay(260)}>
            <a className="ab-btn ab-btn-primary" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "about_hero" })}>WhatsApp us <MessageCircle size={16} /></a>
            <a className="ab-btn ab-btn-ghost" href="#why-we-started">Why we started <ArrowDown size={16} /></a>
          </div>
        </div>
        <ul className="ab-badges" aria-label="Founders">
          {FOUNDERS.map(({ name, role, photo }, i) => (
            <li key={name} className={`ab-badge ab-badge-${i + 1}`}>
              <span className="ab-strap" aria-hidden="true" />
              <span className="ab-clip" aria-hidden="true" />
              <div className="ab-card">
                <span className="ab-hole" aria-hidden="true" />
                <div className="ab-photo">
                  <Image src={photo} alt={`${name}, ${role}`} fill sizes="(max-width: 900px) 162px, 250px" className="ab-photo-img" priority />
                </div>
                <strong>{name}</strong>
                <small>{role}</small>
                <span className="ab-card-foot" aria-hidden="true"><span>nxtte</span><b>Aurexis</b></span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// /about: Why we started. Copy supplied by the founders (do not rewrite
// without them). Each paragraph gets a small scene; no proof row until real
// numbers exist. The report figures are deliberately not numbers.
function WhyWeStartedSection() {
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  return (
    <section id="why-we-started" className="ws">
      <div className="ws-blob" aria-hidden="true" />
      <div ref={ref} className={`site-shell ${motion}`}>
        <div className="ws-head art-step" style={delay(0)}>
          <SectionHeading align="center" eyebrow="Why we started" title={<>A website with <em>nobody sent to it.</em></>} />
        </div>
        <ol className="ws-scenes">
          <li className="ws-scene art-step" style={delay(120)}>
            <div className="ws-art ws-art-1" aria-hidden="true">
              <div className="ws-browser"><span className="ws-dots"><i /><i /><i /></span><div><strong>Your new website</strong><i className="ws-ln" /><i className="ws-ln ws-ln-70" /><i className="ws-ln ws-ln-50" /></div></div>
              <span className="ws-count">Visitors today: <b>0</b></span>
            </div>
            <div className="ws-text">
              <span className="ws-num"><b>01</b>The problem</span>
              <p>We didn&rsquo;t start nxtte to make pretty posts. We started it because of a problem we kept seeing at Aurexis: a business would launch a new website, and then nothing happened. The site was ready, but nobody was sending people to it.</p>
            </div>
          </li>
          <li className="ws-scene art-step" style={delay(240)}>
            <div className="ws-art ws-art-2" aria-hidden="true">
              <div className="ws-report"><small>Monthly report</small><span><em>Likes</em><b>Lots</b></span><span><em>Reach</em><b>Lots</b></span><span className="ws-q"><em>Customers</em><b>?</b></span></div>
              <span className="ws-stamp">Month 2: no reply</span>
            </div>
            <div className="ws-text">
              <span className="ws-num"><b>02</b>What we saw</span>
              <p>When we looked at what they&rsquo;d tried before, the story was always the same. An agency that sent nice designs and a report full of likes, or a freelancer who went quiet after month two. Nobody could tell the owner whether any of it brought in a single customer.</p>
            </div>
          </li>
          <li className="ws-scene art-step" style={delay(360)}>
            <div className="ws-art ws-art-3" aria-hidden="true">
              <div className="ws-chat"><span className="ws-msg ws-out">Hi, saw your post. Is Saturday free?</span><span className="ws-msg ws-in">Yes, booked for 3pm.</span></div>
              <span className="ws-team">One team</span>
            </div>
            <div className="ws-text">
              <span className="ws-num"><b>03</b>What we do instead</span>
              <p>So nxtte works differently. Every post is planned around the Malaysian calendar and one question: <mark>will this bring someone to your WhatsApp, your counter or your booking page?</mark> Nemila leads the content and strategy. Jay builds the systems behind it through Aurexis. One team, from the first post to the first booking.</p>
            </div>
          </li>
        </ol>
        <ul className="ws-roles art-step" style={delay(520)}>
          <li><b>Nemila</b> leads nxtte: content, strategy and clients</li>
          <li><b>Jay</b> leads the tech through Aurexis: websites, landing pages and WhatsApp systems</li>
        </ul>
      </div>
    </section>
  );
}

// /about: How we work. Four promises (AGENTS.md section 4), each shown with a
// small visual that plays once on scroll. Commitment wording follows the
// 2026 pricing: 3-month minimum, then month to month with 30 days' notice.
const WORK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const MONTHS_12 = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function HowWeWorkSection() {
  const [secRef, inView] = useInView<HTMLElement>();
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  return (
    <section ref={secRef} className={`hw dark-band ${inView ? "" : "loop-paused"}`}>
      <div className="hw-glow" aria-hidden="true"><i className="hw-g1" /><i className="hw-g2" /><i className="hw-g3" /></div>
      <div ref={ref} className={`site-shell ${motion}`}>
        <div className="hw-head art-step" style={delay(0)}>
          <SectionHeading eyebrow="How we work" title={<>Four promises we keep<br /><em>every month.</em></>} />
          <p>The same rules for every client, on every package. No fine print to find later.</p>
        </div>
        <ol className="hw-grid">
          <li className="hw-card hw-fast art-step" style={delay(120)}>
            <span className="hw-num">01</span>
            <div className="hw-vis" aria-hidden="true">
              <div className="hw-days">{WORK_DAYS.map((d, i) => <span key={d} style={{ "--i": i } as React.CSSProperties}>{d}</span>)}</div>
              <span className="hw-ready"><Check size={14} strokeWidth={3} /> Calendar ready</span>
            </div>
            <h3>Fast turnaround</h3>
            <p>Your first content calendar arrives within 5 working days of onboarding.</p>
          </li>
          <li className="hw-card hw-price art-step" style={delay(200)}>
            <span className="hw-num">02</span>
            <div className="hw-vis" aria-hidden="true">
              <div className="hw-list">
                {packages.map((pk, i) => <span key={pk.name} className={pk.featured ? "is-feat" : ""} style={{ "--i": i } as React.CSSProperties}><b>{pk.name}</b><i>{pk.price}</i></span>)}
              </div>
              <span className="hw-url">/services</span>
            </div>
            <h3>Published pricing</h3>
            <p>Every package and menu price is on this site. You know the cost before you message.</p>
          </li>
          <li className="hw-card hw-report art-step" style={delay(280)}>
            <span className="hw-num">03</span>
            <div className="hw-vis" aria-hidden="true">
              <div className="hw-doc">
                <span className="hw-doc-top"><FileBarChart size={14} /> Monthly report</span>
                <div className="hw-bars">{[46, 62, 54, 78, 90].map((h, i) => <i key={i} style={{ "--h": `${h}%`, "--i": i } as React.CSSProperties} />)}</div>
                <span className="hw-doc-line" /><span className="hw-doc-line hw-doc-line-short" />
              </div>
            </div>
            <h3>Monthly reporting</h3>
            <p>A plain-language report every month: what worked, what did not, and what we change next.</p>
          </li>
          <li className="hw-card hw-commit art-step" style={delay(360)}>
            <span className="hw-num">04</span>
            <div className="hw-vis" aria-hidden="true">
              <div className="hw-months">{MONTHS_12.map((m, i) => <span key={i} className={i < 3 ? "is-min" : ""} style={{ "--i": i } as React.CSSProperties}>{m}</span>)}</div>
              <div className="hw-legend"><span><i className="is-min" /> 3-month minimum</span><span><i /> Month to month</span></div>
            </div>
            <h3>Short commitment</h3>
            <p>3 months, then month to month. After that, stop any time with 30 days&rsquo; notice.</p>
          </li>
        </ol>
      </div>
    </section>
  );
}

// /about: the Aurexis connection (AGENTS.md: "the strongest block on the
// page"). The client's post at the centre, wired to everything Aurexis
// Solution builds around it. Pulses run along the wires; paused off-screen.
const ENGINE_TILES = [
  { icon: Globe, title: "Website", body: "Where people check you are real", side: "left" },
  { icon: Inbox, title: "WhatsApp capture", body: "Every enquiry lands in one place", side: "left" },
  { icon: LayoutTemplate, title: "Landing page", body: "One offer, one button", side: "right" },
  { icon: Workflow, title: "Automation", body: "Replies and follow-ups that do not forget", side: "right" },
] as const;

function EngineTile({ tile, i }: { tile: (typeof ENGINE_TILES)[number]; i: number }) {
  const Icon = tile.icon;
  return (
    <li className={`ax-tile ax-tile-${tile.side} art-step`} style={delay(260 + i * 110)}>
      <span className="ax-wire" aria-hidden="true"><i /></span>
      <span className="ax-tile-ic" aria-hidden="true"><Icon size={20} /></span>
      <strong>{tile.title}</strong>
      <small>{tile.body}</small>
      <span className="ax-who">Aurexis</span>
    </li>
  );
}

function AurexisSection() {
  const [secRef, inView] = useInView<HTMLElement>();
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  const left = ENGINE_TILES.filter((t) => t.side === "left");
  const right = ENGINE_TILES.filter((t) => t.side === "right");
  return (
    <section ref={secRef} className={`ax ${inView ? "" : "loop-paused"}`}>
      <div className="ax-glow" aria-hidden="true"><i /></div>
      <div ref={ref} className={`site-shell ${motion}`}>
        <div className="ax-head art-step" style={delay(0)}>
          <SectionHeading align="center" eyebrow="The Aurexis connection" title={<>Most agencies stop at the post.<br /><em>We build what comes after.</em></>} body="nxtte is part of Aurexis Solution. Your post sits at the centre, and the same team builds everything it connects to." />
        </div>
        <div className="ax-engine">
          <ul className="ax-col">{left.map((t, i) => <EngineTile key={t.title} tile={t} i={i * 2} />)}</ul>
          <div className="ax-core art-step" style={delay(160)}>
            <div className="ax-post">
              <span className="ax-post-tag">Your post</span>
              <strong>Made to get the right people to stop.</strong>
            </div>
            <div className="ax-core-row">
              <span><Heart size={15} /> Liked, saved, shared</span>
              <span className="ax-who ax-who-nxtte">nxtte</span>
            </div>
          </div>
          <ul className="ax-col">{right.map((t, i) => <EngineTile key={t.title} tile={t} i={i * 2 + 1} />)}</ul>
        </div>
        <div className="ax-result art-step" style={delay(800)}>
          <span>All connected, one team <ArrowRight size={16} /> more bookings</span>
          <Link className="ax-link" href="/services#menu">Need a landing page? See the menu <ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}

// /about closing CTA: pick a starter message, it drops into the chat, and the
// WhatsApp button opens with that exact text. Black band per the spec's
// final-CTA rule; the glow and typing dots pause off-screen.
const ABOUT_STARTERS = [
  "Hi nxtte, I want more bookings from my social media.",
  "Hi nxtte, which package fits my business?",
  "Hi nxtte, can you build my landing page as well as the content?",
  "Hi nxtte, tell me about the RM 199 audit.",
];
const ABOUT_CHIPS = ["I want more bookings", "Which package fits me?", "I need a landing page too", "Tell me about the RM 199 audit"];

function AboutCTA() {
  const [secRef, inView] = useInView<HTMLElement>();
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  const [pick, setPick] = useState(0);
  const message = ABOUT_STARTERS[pick];
  return (
    <section ref={secRef} className={`ac dark-band ${inView ? "" : "loop-paused"}`}>
      <div className="ac-glow" aria-hidden="true"><i className="ac-g1" /><i className="ac-g2" /></div>
      <div ref={ref} className={`site-shell ac-grid ${motion}`}>
        <div className="ac-copy art-step" style={delay(0)}>
          <Eyebrow light>Say hello</Eyebrow>
          <h2>Talk to the people <em>who will do the work.</em></h2>
          <p>No sales team and no pitch deck. Pick a question or write your own, and it goes straight to us on WhatsApp.</p>
          <div className="ac-chips" role="group" aria-label="Choose a message to start with">
            {ABOUT_CHIPS.map((chip, i) => (
              <button key={chip} type="button" aria-pressed={pick === i} className={`ac-chip ${pick === i ? "is-on" : ""}`} onClick={() => setPick(i)}>{chip}</button>
            ))}
          </div>
          <Link className="ac-alt" href="/audit">Not ready to talk yet? Book the RM 199 audit <ArrowUpRight size={15} /></Link>
        </div>
        <div className="ac-phone art-step" style={delay(160)}>
          <div className="ac-bar">
            <span className="ac-av" aria-hidden="true"><BrandMark size={20} /></span>
            <span><strong>nxtte</strong><small>Ms. Nemila and Mr. Jay</small></span>
          </div>
          <div className="ac-thread" aria-live="polite">
            <div className="ac-msg ac-in">Hi, this is nxtte. Ask us anything about your business and your content.</div>
            <div className="ac-msg ac-out" key={pick}>{message}</div>
            <div className="ac-typing" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <a className="ac-send" href={buildWhatsAppLink(message)} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click", { source: "about_cta" })}>
            <MessageCircle size={18} /> Send on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

// /about: built section by section. Next up: why we started, how we work,
// the Aurexis connection, WhatsApp CTA (AGENTS.md section 4).
export function AboutPageContent() {
  return (
    <PageShell>
      <main>
        <AboutHero />
        <HowWeWorkSection />
        <WhyWeStartedSection />
        <AurexisSection />
        <AboutCTA />
      </main>
    </PageShell>
  );
}

// /services: what each service is, the three packages, and THE MENU.
export function ServicesPageContent() {
  return (
    <PageShell>
      <main>
        <ServicesHero />
        <YearOfPostsSection />
        <PricingTableSection />
        <MenuSection />
        <NextStepsCTA />
      </main>
    </PageShell>
  );
}

export default function HomePage() {
  return (
    <PageShell>
      <main>
        <section className="hero-section">
          <HeroBackground />
          <div className="site-shell hero-center">
            <div className="hero-badge rise"><span className="hero-badge-mark"><BrandMark size={17} /></span>Content, funnel and site from one team</div>
            <h1 className="rise" style={{ animationDelay: "60ms" }}>Your content should bring in <em>bookings</em>, not just likes.</h1>
            <p className="hero-sub rise" style={{ animationDelay: "120ms" }}>We build the content, landing page and follow-up system that turns attention into a reason to get in touch.</p>
            <div className="hero-actions rise" style={{ animationDelay: "180ms" }}><PrimaryButton>Start a conversation</PrimaryButton><a className="text-link" href="#packages">See packages <ArrowDownRight size={16} /></a></div>
            <div className="rise hero-stage-wrap" style={{ animationDelay: "240ms" }}><HeroStage /></div>
          </div>
          <div className="site-shell hero-promises">
            <span className="hero-promises-label">How we work</span>
            <ul>{heroPromises.map(({ icon: Icon, label }) => <li key={label}><Icon size={16} /> {label}</li>)}</ul>
          </div>
        </section>

        <ProblemSection />

        <section id="what-we-do" className="services-preview section-padding"><div className="site-shell"><div className="split-heading"><SocialRain /><div className="svc-head-left"><SectionHeading eyebrow="What we do" title={<>The pieces work<br /><em>better together.</em></>} body="You do not need another content vendor. You need the next step to make sense." /></div><div className="svc-head-btn"><SecondaryButton href="/services">See all services</SecondaryButton></div></div><ServicesGrid /></div></section>

        <WhySection />

        <PackagesSection />

        <FirstMonth />

        {/* Proof strip removed until real, dated account numbers exist (AGENTS.md content gaps). Restore with real figures only. */}

        <FAQSection />

        <FinalCTA />
      </main>
    </PageShell>
  );
}

function PackagesSection({ compact = false }: { compact?: boolean }) {
  const viewRef = useTrackView<HTMLElement>("home");
  return (
    <section ref={viewRef} id="packages" className={`packages-section dark-band ${compact ? "packages-section-compact" : ""}`}>
      <div className="pk-bg" aria-hidden="true"><div className="pk-aurora" /><div className="pk-grid" /></div>
      <div className="site-shell">
        <div className="pk-head">
          <div><Eyebrow light>Published pricing</Eyebrow><h2>Pick the pace <em>that fits now.</em></h2></div>
        </div>
        <div className="package-grid">
          {packages.map((item, i) => <PackageCard key={item.name} item={item} index={i} />)}
          <div className="pk-includes">
            <span className="pk-includes-label">Every package includes</span>
            <ul>{PACKAGE_INCLUDES.map(({ icon: Icon, label }) => <li key={label}><span className="pk-includes-icon"><Icon size={15} /></span>{label}</li>)}</ul>
          </div>
          <div className="pk-side">
            <p className="ad-note"><span>+</span>Ad spend is paid by you directly to Meta or TikTok. Pro manages up to RM 3,000 a month on one platform. Minimum 3 months, then month to month.</p>
            <Link className="pk-audit-link" href="/audit">Not sure which? Start with the RM 199 audit <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// /services pricing: every package side by side as a real table, Growth lit.
// Rows rise in once on scroll; a cursor glow follows the pointer over the table.
const PLAN_ROWS: { label: string; values: (string | boolean)[] }[] = [
  { label: "Platforms", values: ["1", "2", "3"] },
  { label: "Posts a month", values: ["12", "12", "16"] },
  { label: "Reels or TikToks a month", values: [false, "4", "6"] },
  { label: "Captions and hashtags", values: [true, true, true] },
  { label: "Monthly content calendar", values: [true, true, true] },
  { label: "Monthly report", values: [true, true, true] },
  { label: "Monthly strategy call", values: [false, true, true] },
  { label: "Ads management", values: [false, false, "1 platform"] },
  { label: "Half-day weekend shoot", values: [false, false, "Every quarter"] },
];

function PlanCell({ value }: { value: string | boolean }) {
  if (value === true) return <span className="pt-yes"><Check size={17} strokeWidth={2.4} aria-hidden="true" /><span className="pt-sr">Included</span></span>;
  if (value === false) return <span className="pt-no"><Minus size={16} aria-hidden="true" /><span className="pt-sr">Not included</span></span>;
  return <span className="pt-val">{value}</span>;
}

function PricingTableSection() {
  const [secRef, inView] = useInView<HTMLElement>();
  const viewRef = useTrackView<HTMLDivElement>("services");
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  const onMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };
  const cta = (name: string, featured?: boolean) => (
    <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click")} className={`pt-cta ${featured ? "pt-cta-featured" : ""}`}>Talk about {name} <ArrowUpRight size={15} /></a>
  );
  return (
    <section id="packages" ref={secRef} className={`pt dark-band ${inView ? "" : "loop-paused"}`}>
      <div className="pt-glow" aria-hidden="true" />
      <div ref={ref} className={`site-shell pt-shell ${motion}`}>
        <div className="pt-head art-step" style={delay(0)}>
          <div><Eyebrow light>Published pricing</Eyebrow><h2>Pick the pace <em>that fits now.</em></h2></div>
          <p>Same team, same standards on every package. The difference is how much we make and where it goes.</p>
        </div>
        <div ref={viewRef} className="pt-wrap art-step" style={delay(120)} onMouseMove={onMove}>
          <table className="pt-table">
            <caption className="pt-sr">Compare the Starter, Growth and Pro packages</caption>
            <thead>
              <tr>
                <td className="pt-corner"><span>Compare</span></td>
                {packages.map((item) => (
                  <th key={item.name} scope="col" className={`pt-plan ${item.featured ? "pt-feat" : ""}`}>
                    <span className="pt-name">{item.name}{item.featured && <span className="pt-pop"><Sparkles size={12} /> Most popular</span>}</span>
                    <span className="pt-price">{item.price}<small>/mo</small></span>
                    <span className="pt-detail">{item.detail}</span>
                    <span className="pt-head-cta">{cta(item.name, item.featured)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_ROWS.map(({ label, values }, r) => (
                <tr key={label} className="art-step" style={delay(260 + r * 60)}>
                  <th scope="row">{label}</th>
                  {values.map((value, c) => <td key={c} className={`${packages[c].featured ? "pt-feat" : ""} ${r === PLAN_ROWS.length - 1 ? "pt-last" : ""}`}><PlanCell value={value} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pt-mobile-ctas">{packages.map((item) => <span key={item.name}>{cta(item.name, item.featured)}</span>)}</div>
        <div className="pt-includes art-step" style={delay(900)}>
          <span className="pt-includes-label">Every package includes</span>
          <ul>{PACKAGE_INCLUDES.map(({ icon: Icon, label }) => <li key={label}><Icon size={15} />{label}</li>)}</ul>
        </div>
        <div className="pt-foot art-step" style={delay(980)}>
          <p><span>+</span>Ad spend is paid by you directly to Meta or TikTok. Pro manages up to RM 3,000 a month on one platform. Minimum 3 months, then month to month.</p>
          <Link className="pt-audit" href="/audit">Not sure which? Start with the RM 199 audit <ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}

// THE MENU: fixed prices for single pieces of work, from Services & Pricing 2026.
// `amount` is set only for one-off fixed prices, so the order total never guesses.
type MenuItem = { name: string; note?: string; price: string; time: string; amount?: number };
const MENU: { key: string; label: string; items: MenuItem[] }[] = [
  { key: "start", label: "Start here", items: [
    { name: "Social media audit", note: "Full review of your accounts, content and competitors, with a 90-day plan. Credited to your first month if you sign a package within 14 days.", price: "RM 199", time: "5 working days", amount: 199 },
    { name: "Profile makeover", note: "New bio, highlight covers, post templates and a clean grid.", price: "RM 399", time: "5 working days", amount: 399 },
    { name: "WhatsApp Business setup", note: "Catalogue, quick replies, greeting and away messages, and labels to track enquiries.", price: "RM 299", time: "3 working days", amount: 299 },
  ] },
  { key: "content", label: "Content", items: [
    { name: "Static post design", note: "Feed post or story", price: "RM 39", time: "3 working days", amount: 39 },
    { name: "Carousel design", note: "Minimum 3 slides", price: "RM 89", time: "3 to 5 working days", amount: 89 },
    { name: "Reel or TikTok scriptwriting", note: "Scene by scene", price: "RM 59", time: "3 working days", amount: 59 },
    { name: "Reel or TikTok editing", price: "RM 99", time: "5 working days", amount: 99 },
    { name: "Captions and hashtags", note: "Search and AI-search optimised", price: "RM 29 per post", time: "2 working days" },
    { name: "Monthly content calendar", price: "RM 299", time: "5 working days", amount: 299 },
    { name: "Content strategy", price: "RM 499", time: "7 working days", amount: 499 },
    { name: "Videography", note: "Weekends only, plus RM 100 transport", price: "Quoted per shoot", time: "Booked in advance" },
  ] },
  { key: "growth", label: "Marketing & growth", items: [
    { name: "Meta Ads management", note: "Facebook and Instagram. Or 15% of ad spend if higher", price: "RM 1,200/month", time: "Monthly" },
    { name: "TikTok Ads management", note: "Or 15% of ad spend if higher", price: "RM 1,200/month", time: "Monthly" },
    { name: "Monthly performance report", note: "Included free in every package", price: "RM 250/month", time: "Monthly" },
    { name: "Meta Ads campaign setup", note: "One-off, per campaign", price: "RM 499", time: "One-off", amount: 499 },
    { name: "TikTok Ads campaign setup", note: "One-off, per campaign", price: "RM 499", time: "One-off", amount: 499 },
    { name: "Basic landing page", note: "One page with your offer, WhatsApp button and enquiry form", price: "RM 1,399", time: "10 to 14 working days", amount: 1399 },
  ] },
  { key: "brand", label: "Brand & business", items: [
    { name: "Company profile design", note: "Booklet or presentation, in portrait and landscape", price: "RM 699", time: "7 to 10 working days", amount: 699 },
    { name: "Digital name card", price: "RM 19", time: "2 working days", amount: 19 },
  ] },
];

// THE MENU as an order builder: tap items onto a receipt, toggle the package
// discount, send the list on WhatsApp. Only one-off fixed prices are summed;
// monthly, per-post and quoted items are listed and confirmed on the call.
const MENU_ITEMS = MENU.flatMap((group) => group.items);
const PACKAGE_DISCOUNT = 0.15;
const formatRM = (value: number) => `RM ${value.toLocaleString("en-MY")}`;

function menuOrderMessage(items: MenuItem[], total: number, onPackage: boolean) {
  if (items.length === 0) return "Hi nxtte, I have a question about the menu.";
  const lines = items.map((it) => `- ${it.name} (${it.price})`).join("\n");
  const discount = onPackage ? " with the 15% package discount" : "";
  return `Hi nxtte, I'd like to order from the menu:\n${lines}\nEstimated total${discount}: ${formatRM(total)}`;
}

function MenuSection() {
  const [secRef, inView] = useInView<HTMLElement>();
  const [ref, state] = useRevealOnce<HTMLDivElement>();
  const motion = state === "static" ? "" : state === "in" ? "anim-ready is-in" : "anim-ready";
  const [tab, setTab] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [onPackage, setOnPackage] = useState(false);
  const active = MENU[tab];
  const toggle = (name: string) => setPicked((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  const order = MENU_ITEMS.filter((it) => picked.includes(it.name));
  const subtotal = order.reduce((sum, it) => sum + (it.amount ?? 0), 0);
  const total = onPackage ? Math.round(subtotal * (1 - PACKAGE_DISCOUNT)) : subtotal;
  const hasUnpriced = order.some((it) => it.amount === undefined);
  const orderHref = buildWhatsAppLink(menuOrderMessage(order, total, onPackage));
  const send = () => trackEvent("whatsapp_click", { source: "menu", items: String(order.length) });
  return (
    <section id="menu" ref={secRef} className={`mn ${inView ? "" : "loop-paused"}`}>
      <div className="mn-blobs" aria-hidden="true"><i className="mn-b1" /><i className="mn-b2" /><i className="mn-b3" /></div>
      <div ref={ref} className={`site-shell ${motion}`}>
        <div className="mn-head art-step" style={delay(0)}>
          <SectionHeading eyebrow="The menu" title={<>Need one <em>specific thing?</em></>} body="Fixed prices for single pieces of work. Tap what you need and send the list on WhatsApp." />
        </div>
        <div className="mn-grid">
          <div>
            <div className="mn-tabs art-step" style={delay(120)} role="tablist" aria-label="Menu categories">
              {MENU.map((m, i) => (
                <button key={m.key} type="button" role="tab" id={`menu-tab-${m.key}`} aria-selected={tab === i} aria-controls="menu-panel" className={`mn-tab ${tab === i ? "is-active" : ""}`} onClick={() => setTab(i)}>
                  {m.label}<span>{m.items.length}</span>
                </button>
              ))}
            </div>
            <div id="menu-panel" role="tabpanel" aria-labelledby={`menu-tab-${active.key}`} className="mn-list art-step" style={delay(200)} key={active.key}>
              {active.items.map((it, i) => {
                const on = picked.includes(it.name);
                return (
                  <button key={it.name} type="button" aria-pressed={on} className={`mn-item ${on ? "is-on" : ""}`} style={{ "--i": i } as React.CSSProperties} onClick={() => toggle(it.name)}>
                    <span className="mn-add" aria-hidden="true">{on ? <Check size={15} strokeWidth={2.6} /> : <Plus size={15} strokeWidth={2.6} />}</span>
                    <strong>{it.name}</strong>
                    {it.note && <small>{it.note}</small>}
                    <span className="mn-meta"><b>{it.price}</b><span>{it.time}</span></span>
                  </button>
                );
              })}
            </div>
          </div>
          <aside id="menu-order" className="mn-receipt art-step" style={delay(280)} aria-label="Your order">
            <h3>Your order</h3>
            <p className="mn-sub">nxtte, the menu</p>
            <div className="mn-lines">
              {order.length === 0
                ? <p className="mn-empty">Nothing yet. Tap an item to add it.</p>
                : order.map((it) => (
                  <div key={it.name} className="mn-line">
                    <span>{it.name}</span><b>{it.price}</b>
                    <button type="button" className="mn-remove" onClick={() => toggle(it.name)} aria-label={`Remove ${it.name}`}><X size={14} /></button>
                  </div>
                ))}
            </div>
            <label className="mn-toggle"><input type="checkbox" checked={onPackage} onChange={(e) => setOnPackage(e.target.checked)} /> I am on a package (15% off)</label>
            <div className="mn-total" aria-live="polite">
              <span>Estimated total{hasUnpriced ? ", fixed items" : ""}</span>
              <b key={total}>{formatRM(total)}</b>
            </div>
            <a className="mn-send" href={orderHref} target="_blank" rel="noreferrer" onClick={send}>
              <MessageCircle size={17} /> {order.length ? `Send ${order.length} item${order.length > 1 ? "s" : ""} on WhatsApp` : "Ask on WhatsApp"}
            </a>
            {order.length > 0 && <button type="button" className="mn-clear" onClick={() => setPicked([])}>Clear order</button>}
            <p className="mn-fine">Monthly, per-post and quoted items are confirmed on the call. Ad spend is paid by you directly to the platform.</p>
          </aside>
        </div>
      </div>
      {order.length > 0 && (
        <a className="mn-bar" href="#menu-order"><span>{order.length} item{order.length > 1 ? "s" : ""} &middot; {formatRM(total)}</span><b>View order</b></a>
      )}
    </section>
  );
}

// Shared inclusions, taken from the spec and the site's own FAQ answers.
const PACKAGE_INCLUDES = [
  { icon: Clock3, label: "First calendar in 5 working days" },
  { icon: BarChart3, label: "Plain-language monthly report" },
  { icon: Tag, label: "15% off everything on the menu" },
  { icon: ShieldCheck, label: "You own all the content" },
]

// Cursor-following glow on hover (a hover state, not a looping animation).
function PackageCard({ item, index }: { item: (typeof packages)[number]; index: number }) {
  const onMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };
  return (
    <article onMouseMove={onMove} className={`package-card ${item.featured ? "package-card-featured" : ""}`}>
      <div className="package-card-top">
        <span className="package-name">{item.name}</span>
        {item.featured ? <span className="popular-ribbon"><Sparkles size={12} /> Most popular</span> : <span className="package-index">0{index + 1}</span>}
      </div>
      <div className="package-price">{item.price}<small>/mo</small></div>
      <p className="package-detail">{item.detail}</p>
      <ul>{item.included.map((line) => <li key={line}><span className="pk-check"><Check size={12} strokeWidth={3} /></span>{line}</li>)}</ul>
      <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click")} className={`pk-cta ${item.featured ? "pk-cta-featured" : ""}`}>Talk about {item.name} <ArrowUpRight size={16} /></a>
    </article>
  );
}

const FAQ_ITEMS = [
    ["How long is the contract, and can I stop?", "Packages have a 3-month minimum, then run month to month. After that you can stop with 30 days' notice."],
    ["What actually happens in the first month?", "Day 1 is an onboarding call. Your first content calendar arrives within 5 working days, first posts go live in week 2, and the month ends with a report (plus a strategy call on Growth and Pro)."],
    ["Who owns the content you produce?", "You do. Everything we create for you belongs to your business once paid."],
    ["Is ad spend included in the management fee?", "No. Ad spend goes directly from you to Meta or TikTok, so you keep full control. Pro includes managing up to RM 3,000 a month on one platform. On its own, ads management is RM 1,200/month, or 15% of ad spend if higher."],
    ["How fast is turnaround once I sign?", "Your first content calendar arrives within 5 working days. Timelines count from when we have your approvals, files and account access."],
  ]

const FAQ_BUBBLES = [
  { left: "43%", text: "Can I stop anytime?", size: "fb-md", dur: 24, delay: -3, side: "fb-left" },
  { left: "49%", text: "Who owns the content?", size: "fb-sm", dur: 30, delay: -17, side: "fb-right" },
  { left: "88%", text: "Is ad spend extra?", size: "fb-sm", dur: 27, delay: -9, side: "fb-left" },
  { left: "91%", text: "How fast do we start?", size: "fb-md", dur: 33, delay: -22, side: "fb-right" },
];

// FAQ as a WhatsApp-style chat: pick a question, nxtte "types" the answer.
// One answer shown at a time; replies are announced via aria-live.
function FAQSection() {
  const [open, setOpen] = useState(0);
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const ask = (i: number) => {
    if (i === open && !typing) return;
    setOpen(i);
    if (timer.current) clearTimeout(timer.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setTyping(false); return; }
    setTyping(true);
    timer.current = setTimeout(() => setTyping(false), 900);
  };
  const [question, answer] = FAQ_ITEMS[open];
  const [secRef, inView] = useInView<HTMLElement>();
  return (
    <section ref={secRef} className={`faq-section faq2 ${inView ? "" : "loop-paused"}`}>
      <div className="faq2-bg" aria-hidden="true">
        <div className="faq2-pattern" />
        {FAQ_BUBBLES.map((b) => <span key={b.text} className={`faq2-float ${b.size} ${b.side}`} style={{ left: b.left, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}>{b.text}</span>)}
      </div>
      <div className="site-shell faq2-grid">
        <div className="faq2-intro">
          <Eyebrow>Before you ask</Eyebrow>
          <h2>Straight answers<br /><em>to the usual questions.</em></h2>
          <p>The five things people ask us privately before they commit. Tap one.</p>
          <div className="faq2-chips" role="group" aria-label="Frequently asked questions">
            {FAQ_ITEMS.map(([q], i) => (
              <button key={q} type="button" className={`faq2-chip ${open === i ? "is-active" : ""}`} aria-pressed={open === i} aria-controls="faq2-log" onClick={() => ask(i)}>
                <span className="faq2-chip-n">0{i + 1}</span>{q}
              </button>
            ))}
          </div>
        </div>
        <div className="faq2-chat">
          <div className="faq2-chat-head">
            <span className="faq2-avatar"><BrandMark size={18} /></span>
            <span><strong>nxtte</strong><small><i className="faq2-online" /> online · replies within 24 hours</small></span>
          </div>
          <div id="faq2-log" className="faq2-log" aria-live="polite">
            <span className="faq2-date">Today</span>
            <div className="faq2-bubble faq2-them">Hi. Tap any question and we will answer it here.<span className="faq2-time">09:00</span></div>
            <div key={`q-${open}`} className="faq2-bubble faq2-me faq2-pop">{question}<span className="faq2-time">09:01 <CheckCheck size={13} /></span></div>
            {typing ? (
              <div className="faq2-bubble faq2-them faq2-typing" aria-label="nxtte is typing"><i /><i /><i /></div>
            ) : (
              <div key={`a-${open}`} className="faq2-bubble faq2-them faq2-pop">{answer}<span className="faq2-time">09:01</span></div>
            )}
          </div>
          <a className="faq2-input" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent("whatsapp_click")}>
            <span>Message nxtte on WhatsApp…</span>
            <span className="faq2-send"><SendHorizontal size={17} /></span>
          </a>
        </div>
      </div>
    </section>
  );
}

// Shared with the Insights views (client components only).
export { PageShell, StrippedShell, Eyebrow, delay, useRevealOnce, useInView, whatsappHref, FAQ_ITEMS };
