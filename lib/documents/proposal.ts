// Proposal data, the small writing syntax used in each section, and nxtte's
// starting template. No framework imports, so it can load anywhere.
import { formatRM } from './model'

export interface ProposalSection {
  title: string
  /** Written in the syntax below. */
  body: string
  /** Start this section on a new page. */
  pageBreak: boolean
}

export interface ProposalData {
  ref: string
  /** YYYY-MM-DD */
  date: string
  validUntil: string
  /** Cover title; a line break makes a second line. {{client}} becomes the client name. */
  title: string
  clientName: string
  sections: ProposalSection[]
}

export type Block =
  | { t: 'para'; text: string }
  | { t: 'sub'; text: string }
  | { t: 'bullets'; items: string[] }
  | { t: 'num'; n: number; title: string; text: string }
  | { t: 'callout'; text: string }
  | { t: 'note'; text: string }
  | { t: 'table'; rows: string[][] }
  | { t: 'invest'; label: string; amount: string }
  | { t: 'sign' }

export const SYNTAX_HELP = `## Sub-heading
- bullet point
> highlighted line
1. Title | short description    (numbered step)
| Column A | Column B          (table, first row is the header)
~ small print
@invest Label | RM 2,299        (big price box)
@sign                           (signature lines)
{{client}} becomes the client name.
A blank line starts a new paragraph.`

/** Turns a section body into blocks, one item per line. */
export function parseBody(body: string): Block[] {
  const out: Block[] = []
  let para: string[] = []
  const flush = () => {
    if (para.length) out.push({ t: 'para', text: para.join(' ') })
    para = []
  }
  for (const raw of body.replace(/\r/g, '').split('\n')) {
    const line = raw.trim()
    if (!line) {
      flush()
      continue
    }
    let m: RegExpExecArray | null
    if (line.startsWith('## ')) {
      flush()
      out.push({ t: 'sub', text: line.slice(3).trim() })
    } else if (/^[-•]\s+/.test(line)) {
      flush()
      const text = line.replace(/^[-•]\s+/, '')
      const last = out[out.length - 1]
      if (last?.t === 'bullets') last.items.push(text)
      else out.push({ t: 'bullets', items: [text] })
    } else if (line.startsWith('> ')) {
      flush()
      out.push({ t: 'callout', text: line.slice(2).trim() })
    } else if (line.startsWith('~ ')) {
      flush()
      out.push({ t: 'note', text: line.slice(2).trim() })
    } else if (line.startsWith('|')) {
      flush()
      const row = line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
      const last = out[out.length - 1]
      if (last?.t === 'table') last.rows.push(row)
      else out.push({ t: 'table', rows: [row] })
    } else if ((m = /^(\d{1,2})\.\s+(.*)$/.exec(line))) {
      flush()
      const [title, ...rest] = m[2].split('|')
      out.push({ t: 'num', n: Number(m[1]), title: title.trim(), text: rest.join('|').trim() })
    } else if ((m = /^@invest\s+(.*)$/.exec(line))) {
      flush()
      const [label, amount] = m[1].split('|')
      out.push({ t: 'invest', label: (label ?? '').trim(), amount: (amount ?? '').trim() })
    } else if (line === '@sign') {
      flush()
      out.push({ t: 'sign' })
    } else {
      para.push(line)
    }
  }
  flush()
  return out
}

export const twoDigits = (n: number) => String(n).padStart(2, '0')

export const CLIENT_TOKEN = '{{client}}'
export function fillClient(text: string, clientName: string): string {
  return text.split(CLIENT_TOKEN).join(clientName.trim() || 'your business')
}

/** First amount in an @invest line, used as the proposal's value. */
export function proposalTotal(p: ProposalData): number {
  for (const s of p.sections) {
    for (const b of parseBody(s.body)) {
      if (b.t === 'invest') {
        const n = Number(b.amount.replace(/[^\d.]/g, ''))
        if (Number.isFinite(n)) return n
      }
    }
  }
  return 0
}

// ---- Starting template -----------------------------------------------------------

export const DEFAULT_TITLE = `A social media plan\nfor ${CLIENT_TOKEN}.`

export type TemplatePackage = { name: string; price: number; detail: string; included: string[] }

/** Standard sections for a package. Everything stays editable. */
export function defaultSections(pkg: TemplatePackage, auditCredit: number): ProposalSection[] {
  const c = CLIENT_TOKEN
  const sec = (title: string, body: string, pageBreak = false): ProposalSection => ({ title, body, pageBreak })
  const credit = auditCredit > 0 ? `\n| Audit credit | First month, if signed within 14 days of your report | ${formatRM(-auditCredit)}` : ''
  return [
    sec(
      'What we found',
      `From our audit of ${c}'s accounts:
- Finding one
- Finding two
- Finding three

> One sentence on the biggest opportunity.`,
    ),
    sec(
      'What we recommend',
      `We recommend the ${pkg.name} package for ${c}. ${pkg.detail}

## What is included
${pkg.included.map((i) => `- ${i}`).join('\n')}`,
    ),
    sec(
      'How the first month works',
      `| Step | When
| First content calendar, for your approval | Within 5 working days of your first payment
| Posting starts | Once you approve the calendar
| Monthly report | End of each month`,
    ),
    sec(
      'Investment',
      `@invest ${pkg.name} package, per month | ${formatRM(pkg.price)}

| Item | Terms | Amount
| ${pkg.name} package | Per month, 3-month minimum | ${formatRM(pkg.price)}${credit}

~ No tax is charged. Monthly fees are due between the 1st and 7th of each month. After the 3-month minimum, you can stop with 30 days' notice.`,
    ),
    sec(
      'Next steps',
      `1. Accept | Reply on WhatsApp, or sign below.
2. First invoice | We send it to you.
3. First calendar | Ready within 5 working days of your first payment.`,
    ),
    sec(
      'Acceptance',
      `By signing below, ${c} accepts this proposal and our terms at nxtte.com/terms.

@sign`,
    ),
  ]
}

const LEFTOVERS: [RegExp, string][] = [
  [/^\s*[-•]\s*Finding (one|two|three)\s*$/im, 'The audit findings are still "Finding one", "Finding two"... Write the real ones.'],
  [/One sentence on the biggest opportunity/, 'The highlighted line still says "One sentence on the biggest opportunity".'],
  [/RM\s?0(\.00)?(?![\d,])/, 'A price is RM 0. Check the Investment section.'],
]

/** Plain-language list of things to fix before sending; empty when it looks finished. */
export function proposalIssues(sections: ProposalSection[], clientName: string): string[] {
  const text = sections.map((s) => s.body).join('\n')
  const out = LEFTOVERS.filter(([re]) => re.test(text)).map(([, msg]) => msg)
  if (!clientName.trim()) out.push('Fill in who the proposal is for.')
  return out
}
