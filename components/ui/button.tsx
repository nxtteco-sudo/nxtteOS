import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

type CommonProps = {
  variant?: 'primary' | 'secondary'
  className?: string
  children: React.ReactNode
}

// Rules encoded here (AGENTS.md §6 / CLAUDE.md rules 4 & 9):
// - Primary: solid pink fill, ink text (never white — the spec is explicit the
//   fill is pink with near-black text, not the other way round), 12px radius, no shadow.
// - Secondary: 1px ink-bordered outline, ink text, transparent fill. Never pink
//   text on a light background — reads as disabled, not a call to action.
// - Min 44x44 touch target, visible focus ring (global :focus-visible in globals.css
//   already covers this, kept unstyled here rather than removed).
const base =
  'inline-flex min-h-[44px] items-center justify-center rounded-button px-6 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50'

const variants = {
  primary: 'bg-pink text-ink hover:bg-pink/90',
  secondary: 'border border-ink bg-transparent text-ink hover:bg-ink/5',
}

type ButtonProps = CommonProps &
  (
    | ({ href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'className'>)
    | ({ href?: undefined } & Omit<ComponentPropsWithoutRef<'button'>, 'className'>)
  )

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`.trim()

  if ('href' in props && props.href) {
    const { href, ...rest } = props
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...(props as ComponentPropsWithoutRef<'button'>)}>
      {children}
    </button>
  )
}

// Secondary CTA styled as a plain underlined text link (Hero's "See packages",
// Services preview's "See all services →", etc.) — deliberately weaker than
// both button variants above, per Hero rules in AGENTS.md §3.
export function TextLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[44px] items-center text-sm font-medium text-ink underline decoration-border underline-offset-4 hover:decoration-ink ${className}`.trim()}
    >
      {children}
    </Link>
  )
}
