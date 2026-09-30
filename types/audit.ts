export type PaymentStatus = 'unpaid' | 'claimed' | 'paid'

// What the customer's dashboard may see (no admin notes).
export type Audit = {
  id: string
  reference: string | null
  name: string
  business: string
  instagram: string
  whatsapp: string
  email: string | null
  goals: string
  ideal_customer: string
  best_sellers: string
  competitors: string
  other_platforms: string
  notes: string
  details_submitted_at: string | null
  payment_status: PaymentStatus
  payment_claimed_at: string | null
  payment_proof_path: string | null
  paid_at: string | null
  amount: number
  work_started_at: string | null
  report_path: string | null
  report_ready_at: string | null
  created_at: string
}

export type AdminAudit = Audit & { admin_notes: string; updated_at: string }

export type AuditMessage = {
  id: string
  sender: 'customer' | 'nxtte'
  body: string
  read_at: string | null
  created_at: string
}

export type PaymentSettings = {
  bank_name: string
  account_name: string
  account_number: string
  duitnow_id: string
  note: string
}

export const EMPTY_PAYMENT: PaymentSettings = { bank_name: '', account_name: '', account_number: '', duitnow_id: '', note: '' }

// Published terms: report in 5 working days; RM 199 credited within 14 days.
export const DELIVERY_WORKING_DAYS = 5
export const CREDIT_DAYS = 14

export type StepState = 'done' | 'current' | 'waiting' | 'todo'
export type AuditStep = { key: 'booked' | 'details' | 'payment' | 'audit' | 'report'; label: string; state: StepState; hint: string }

export function auditSteps(a: Audit): AuditStep[] {
  const details = Boolean(a.details_submitted_at)
  const paid = a.payment_status === 'paid'
  const ready = Boolean(a.report_ready_at)
  return [
    { key: 'booked', label: 'Booked', state: 'done', hint: 'We have your request' },
    { key: 'details', label: 'Your details', state: details ? 'done' : 'current', hint: details ? 'Received' : 'Tell us about your business' },
    {
      key: 'payment', label: 'Payment',
      state: paid ? 'done' : a.payment_status === 'claimed' ? 'waiting' : details ? 'current' : 'todo',
      hint: paid ? 'Paid' : a.payment_status === 'claimed' ? 'We are confirming it' : `RM ${a.amount}`,
    },
    {
      key: 'audit', label: 'Audit',
      state: ready ? 'done' : a.work_started_at ? 'current' : 'todo',
      hint: ready ? 'Complete' : a.work_started_at ? 'In progress' : 'Starts once we have both',
    },
    { key: 'report', label: 'Report', state: ready ? 'done' : 'todo', hint: ready ? 'Ready to download' : 'With your 90-day roadmap' },
  ]
}

function addWorkingDays(from: Date, days: number) {
  const d = new Date(from)
  let left = days
  while (left > 0) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) left -= 1
  }
  return d
}

// Counted from when we have both the details and the payment.
export function expectedDelivery(a: Audit): Date | null {
  if (!a.details_submitted_at || !a.paid_at) return null
  const start = new Date(Math.max(new Date(a.details_submitted_at).getTime(), new Date(a.paid_at).getTime()))
  return addWorkingDays(start, DELIVERY_WORKING_DAYS)
}

// The RM 199 credit runs for 14 days from the day the report is delivered.
export function creditDeadline(a: Audit): Date | null {
  if (!a.report_ready_at) return null
  const d = new Date(a.report_ready_at)
  d.setDate(d.getDate() + CREDIT_DAYS)
  return d
}

export const formatDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
