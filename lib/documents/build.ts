// One place that validates a document and turns it into PDF bytes plus the
// facts we store about it. Used by the preview route, the download routes and
// the save action, so they can never disagree.
import 'server-only'
import { createElement, type ReactElement } from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { totals } from './model'
import { proposalTotal } from './proposal'
import { checkInvoice, checkProposal, checkReceipt } from './validate'
import { registerFonts } from './pdf/fonts'
import { InvoiceDocument, ReceiptDocument } from './pdf/InvoicePdf'
import { ProposalDocument } from './pdf/ProposalPdf'

export type DocKindInput = 'invoice' | 'receipt' | 'proposal'

export type Built = {
  ok: true
  data: unknown
  number: string
  date: string
  title: string
  total: number
  filename: string
  pdf: () => Promise<Buffer>
}

const safe = (v: string) => v.replace(/[^\w.-]+/g, '_')

function render(el: ReactElement): Promise<Buffer> {
  registerFonts()
  return renderToBuffer(el as ReactElement<DocumentProps>)
}

export function buildDocument(kind: string, raw: unknown): Built | { ok: false; error: string } {
  if (kind === 'invoice') {
    const c = checkInvoice(raw)
    if (!c.ok) return c
    const d = c.data
    return { ok: true, data: d, number: d.number, date: d.date, title: d.billTo.name, total: totals(d.items).total, filename: `Invoice ${safe(d.number)}.pdf`, pdf: () => render(createElement(InvoiceDocument, { data: d })) }
  }
  if (kind === 'receipt') {
    const c = checkReceipt(raw)
    if (!c.ok) return c
    const d = c.data
    return { ok: true, data: d, number: d.number, date: d.date, title: d.billTo.name, total: totals(d.items).total, filename: `Receipt ${safe(d.number)}.pdf`, pdf: () => render(createElement(ReceiptDocument, { data: d })) }
  }
  if (kind === 'proposal') {
    const c = checkProposal(raw)
    if (!c.ok) return c
    const d = c.data
    return { ok: true, data: d, number: d.ref, date: d.date, title: d.clientName, total: proposalTotal(d), filename: `Proposal ${safe(d.ref)}.pdf`, pdf: () => render(createElement(ProposalDocument, { data: d })) }
  }
  return { ok: false, error: 'Unknown document type.' }
}

/** The PDF as a download response. */
export async function pdfResponse(built: Built, disposition: 'inline' | 'attachment' = 'inline'): Promise<Response> {
  return new Response(new Uint8Array(await built.pdf()), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${disposition}; filename="${built.filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
