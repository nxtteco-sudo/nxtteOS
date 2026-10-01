// Receipts for the RM 199 audit: issued automatically when an admin marks an
// audit as paid, voided if that is undone, and downloadable by the customer.
// Never fatal: a failure here is logged and the payment still counts.
import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { nextSequence, receiptNumber, todayMY, type ReceiptData } from './model'
import { checkReceipt } from './validate'

type AuditForReceipt = { id: string; reference: string | null; name: string; business: string; whatsapp: string; amount: number }

async function findReceipt(auditId: string) {
  const { data } = await supabaseAdmin().from('documents').select('id, status').eq('kind', 'receipt').eq('audit_id', auditId).maybeSingle()
  return data
}

function receiptData(a: AuditForReceipt, number: string): ReceiptData | null {
  const checked = checkReceipt({
    number,
    date: todayMY(),
    invoiceNumber: '',
    billTo: { name: a.business, attn: a.name, address: '', phone: a.whatsapp },
    items: [{ description: 'Social media audit', note: a.reference ? `Reference ${a.reference}` : '', price: a.amount, qty: 1 }],
    method: 'Online transfer',
    reference: a.reference ?? '',
    notes: 'Thank you. This receipt confirms payment for your social media audit. Sign a monthly package within 14 days of receiving your report and the full amount is credited to your first month.',
  })
  return checked.ok ? checked.data : null
}

export async function issueAuditReceipt(auditId: string): Promise<void> {
  try {
    const db = supabaseAdmin()
    const existing = await findReceipt(auditId)
    if (existing) {
      if (existing.status === 'void') await db.from('documents').update({ status: 'issued', updated_at: new Date().toISOString() }).eq('id', existing.id)
      return
    }
    const { data: audit } = await db.from('audit_requests').select('id, reference, name, business, whatsapp, amount').eq('id', auditId).maybeSingle()
    if (!audit) return
    // Two tries in case another receipt takes the same number at the same moment.
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data: rows } = await db.from('documents').select('number').eq('kind', 'receipt').limit(10000)
      const number = receiptNumber(nextSequence('REC-', (rows ?? []).map((r) => r.number as string)))
      const data = receiptData(audit as AuditForReceipt, number)
      if (!data) return
      const { error } = await db.from('documents').insert({
        kind: 'receipt', number, title: data.billTo.name, status: 'issued', data, total_myr: audit.amount, doc_date: data.date, audit_id: auditId,
      })
      if (!error) return
      if (error.code !== '23505') throw new Error(error.message)
    }
  } catch (e) {
    console.error('[documents] could not issue the audit receipt', e instanceof Error ? e.message : e)
  }
}

export async function voidAuditReceipt(auditId: string): Promise<void> {
  const { error } = await supabaseAdmin().from('documents').update({ status: 'void', updated_at: new Date().toISOString() }).eq('kind', 'receipt').eq('audit_id', auditId)
  if (error) console.error('[documents] could not void the audit receipt', error.message)
}

/** The customer's receipt data, or null when there is none to show. */
export async function auditReceiptFor(auditId: string): Promise<{ kind: string; data: unknown } | null> {
  const { data } = await supabaseAdmin().from('documents').select('kind, data').eq('kind', 'receipt').eq('audit_id', auditId).eq('status', 'issued').maybeSingle()
  return data
}
