/* eslint-disable jsx-a11y/alt-text -- react-pdf's Image is a PDF primitive, not an <img> */
// Invoice and receipt, "Clean ink" design: white paper, black header band with a
// pink rule, hairline tables, a black amount box. A4, flowing layout with a
// fixed footer, so long line items wrap onto a second page cleanly.
import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import { formatDocDate, formatRM, lineTotal, totals, type BillTo, type InvoiceData, type LineItem, type ReceiptData } from '../model'
import { LOGO_PATH } from './fonts'

const INK = '#0A0A0A'
const PINK = '#C9507B'
const PINK_SOFT = '#F2779F'
const MUTED = '#6B6B72'
const BODY = '#3D3D43'
const LINE = '#E6E4E1'
const PAD = 51

const FROM = {
  brand: 'nxtte',
  legal: 'Aurexis Solution (SSM NS0315281-P)',
  city: 'Kuala Lumpur, Malaysia',
  email: 'contact@nxtte.com',
  phone: '+60 11-7472 1429',
}

const text = { fontFamily: 'DMSans', fontSize: 10, color: INK, lineHeight: 1.45 } as const
const label = { fontFamily: 'DMSans', fontWeight: 700, fontSize: 7.5, letterSpacing: 1.1, textTransform: 'uppercase' as const, color: MUTED }

function Header({ title, number }: { title: string; number: string }) {
  return (
    <View style={{ backgroundColor: '#000000', borderBottomWidth: 4.5, borderBottomColor: PINK, paddingHorizontal: PAD, paddingVertical: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Image src={LOGO_PATH} style={{ width: 96, height: 41 }} />
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontFamily: 'SpaceGrotesk', fontWeight: 700, fontSize: 38, letterSpacing: -1.6, color: '#FFFFFF', textTransform: 'uppercase', lineHeight: 1 }}>{title}</Text>
        <Text style={{ ...label, fontSize: 9, color: PINK_SOFT, marginTop: 5 }}>{number}</Text>
      </View>
    </View>
  )
}

function Parties({ billTo, meta }: { billTo: BillTo; meta: [string, string][] }) {
  const address = billTo.address.split('\n').map((l) => l.trim()).filter(Boolean)
  return (
    <View style={{ flexDirection: 'row', gap: 18, marginTop: 24, marginBottom: 22 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ ...label, marginBottom: 4 }}>From</Text>
        <Text style={{ ...text, fontWeight: 700, fontSize: 11 }}>{FROM.brand}</Text>
        {[FROM.legal, FROM.city, FROM.email].map((l) => <Text key={l} style={{ ...text, fontSize: 9.5, color: BODY }}>{l}</Text>)}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...label, marginBottom: 4 }}>Bill to</Text>
        <Text style={{ ...text, fontWeight: 700, fontSize: 11 }}>{billTo.name}</Text>
        {billTo.attn ? <Text style={{ ...text, fontSize: 9.5, color: BODY }}>Attn: {billTo.attn}</Text> : null}
        {address.map((l, i) => <Text key={i} style={{ ...text, fontSize: 9.5, color: BODY }}>{l}</Text>)}
        {billTo.phone ? <Text style={{ ...text, fontSize: 9.5, color: BODY }}>{billTo.phone}</Text> : null}
      </View>
      <View style={{ width: 150, gap: 6 }}>
        {meta.filter(([, v]) => v).map(([k, v]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ ...text, fontSize: 9.5, color: MUTED }}>{k}</Text>
            <Text style={{ ...text, fontSize: 9.5, fontWeight: 700 }}>{v}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function Items({ items, withNotes }: { items: LineItem[]; withNotes: boolean }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: INK, paddingVertical: 7, paddingHorizontal: 8 }}>
        <Text style={{ ...label, color: INK, flex: 1 }}>Description</Text>
        <Text style={{ ...label, color: INK, width: 40, textAlign: 'center' }}>Qty</Text>
        <Text style={{ ...label, color: INK, width: 90, textAlign: 'right' }}>Amount</Text>
      </View>
      {items.map((it, i) => (
        <View key={i} wrap={false} style={{ flexDirection: 'row', borderBottomWidth: 0.75, borderBottomColor: LINE, paddingVertical: 9, paddingHorizontal: 8 }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ ...text, fontWeight: 700 }}>{it.description}</Text>
            {withNotes && it.note ? <Text style={{ ...text, fontSize: 8.5, color: MUTED, marginTop: 2 }}>{it.note}</Text> : null}
          </View>
          <Text style={{ ...text, width: 40, textAlign: 'center' }}>{String(it.qty)}</Text>
          <Text style={{ ...text, width: 90, textAlign: 'right' }}>{formatRM(lineTotal(it))}</Text>
        </View>
      ))}
    </View>
  )
}

function AmountBox({ caption, amount }: { caption: string; amount: number }) {
  return (
    <View style={{ marginTop: 4, backgroundColor: INK, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ ...text, color: '#FFFFFF', fontWeight: 700 }}>{caption}</Text>
      <Text style={{ fontFamily: 'SpaceGrotesk', fontWeight: 700, fontSize: 19, letterSpacing: -0.6, color: '#FFFFFF' }}>{formatRM(amount)}</Text>
    </View>
  )
}

function Footer() {
  return (
    <View fixed style={{ position: 'absolute', left: PAD, right: PAD, bottom: 28 }}>
      <Text style={{ ...text, fontSize: 8, color: MUTED, marginBottom: 6 }}>This is a computer-generated document. No signature is required.</Text>
      <View style={{ borderTopWidth: 0.75, borderTopColor: LINE, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ ...text, fontSize: 8.5, color: MUTED }}>{FROM.brand} is a brand of {FROM.legal}</Text>
        <Text style={{ ...text, fontSize: 8.5, color: MUTED }}>{FROM.email} · {FROM.phone}</Text>
      </View>
    </View>
  )
}

const pageStyle = { paddingBottom: 90, backgroundColor: '#FFFFFF' } as const

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const t = totals(data.items)
  const bank = [['Bank', data.bank.bank], ['Account name', data.bank.accountName], ['Account number', data.bank.accountNo], ['DuitNow', data.bank.duitnow]].filter(([, v]) => v)
  return (
    <Document title={`Invoice ${data.number}`} author="nxtte" creator="nxtte" producer="nxtte">
      <Page size="A4" style={pageStyle}>
        <Header title="Invoice" number={data.number} />
        <View style={{ paddingHorizontal: PAD }}>
          <Parties billTo={data.billTo} meta={[['Invoice date', formatDocDate(data.date)], ['Due', data.dueDate ? formatDocDate(data.dueDate) : ''], ['Reference', data.number]]} />
          <Items items={data.items} withNotes />
          <View wrap={false} style={{ width: 250, marginLeft: 'auto', marginTop: 14, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={text}>Subtotal</Text><Text style={text}>{formatRM(t.subtotal)}</Text></View>
            {t.credits > 0 ? <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={text}>Credits</Text><Text style={text}>{formatRM(-t.credits)}</Text></View> : null}
            <AmountBox caption="Amount due" amount={t.total} />
          </View>
          <View wrap={false} style={{ flexDirection: 'row', gap: 14, marginTop: 24 }}>
            <View style={{ flex: 1.1, borderWidth: 0.75, borderColor: LINE, borderRadius: 12, padding: 14 }}>
              <Text style={{ ...label, color: '#A83963', marginBottom: 8 }}>How to pay</Text>
              {bank.length ? bank.map(([k, v]) => (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ ...text, fontSize: 9.5, color: MUTED }}>{k}</Text>
                  <Text style={{ ...text, fontSize: 9.5, fontWeight: 700, maxWidth: 150, textAlign: 'right' }}>{v}</Text>
                </View>
              )) : <Text style={{ ...text, fontSize: 9.5, color: MUTED }}>We will send you the payment details.</Text>}
            </View>
            <View style={{ flex: 1, borderWidth: 0.75, borderColor: LINE, borderRadius: 12, padding: 14 }}>
              <Text style={{ ...label, color: '#A83963', marginBottom: 8 }}>Good to know</Text>
              <Text style={{ ...text, fontSize: 9.5 }}>{data.notes || `Use ${data.number} as your payment reference.`}</Text>
            </View>
          </View>
        </View>
        <Footer />
      </Page>
    </Document>
  )
}

export function ReceiptDocument({ data }: { data: ReceiptData }) {
  const t = totals(data.items)
  const paidOn = formatDocDate(data.date)
  return (
    <Document title={`Receipt ${data.number}`} author="nxtte" creator="nxtte" producer="nxtte">
      <Page size="A4" style={pageStyle}>
        <Header title="Receipt" number={data.number} />
        <View style={{ paddingHorizontal: PAD }}>
          <Parties billTo={data.billTo} meta={[['Receipt date', paidOn], ['For invoice', data.invoiceNumber], ['Method', data.method]]} />
          <View wrap={false} style={{ borderWidth: 1.5, borderColor: INK, borderRadius: 13, paddingVertical: 16, paddingHorizontal: 18, marginBottom: 20 }}>
            <Text style={{ ...label, color: '#A83963' }}>Amount received</Text>
            <Text style={{ fontFamily: 'SpaceGrotesk', fontWeight: 700, fontSize: 36, letterSpacing: -1.6, color: INK, lineHeight: 1.1 }}>{formatRM(t.total)}</Text>
            <Text style={{ ...text, fontSize: 9.5, color: BODY }}>Paid on {paidOn}{data.reference ? ` · Reference ${data.reference}` : ''}</Text>
            <View style={{ position: 'absolute', right: 20, top: 24, borderWidth: 3, borderColor: PINK, borderRadius: 9, paddingVertical: 4, paddingHorizontal: 14, transform: 'rotate(-12deg)' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk', fontWeight: 700, fontSize: 24, letterSpacing: 3, color: PINK }}>PAID</Text>
            </View>
          </View>
          <Items items={data.items} withNotes={false} />
          <View wrap={false} style={{ width: 250, marginLeft: 'auto', marginTop: 14 }}>
            <AmountBox caption="Total paid" amount={t.total} />
          </View>
          <Text style={{ ...text, marginTop: 22 }}>{data.notes || 'Thank you. This receipt confirms your payment. Keep it for your records.'}</Text>
        </View>
        <Footer />
      </Page>
    </Document>
  )
}
