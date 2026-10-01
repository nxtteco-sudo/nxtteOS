/* eslint-disable jsx-a11y/alt-text -- react-pdf's Image is a PDF primitive, not an <img> */
// Proposal, "Night glow" design: a black cover with the pink aurora from the
// customer dashboard, then white pages with a dark band, numbered sections and
// a black price box. Content flows across pages and stays clear of the footer.
import { Circle, Defs, Document, Ellipse, Image, Page, RadialGradient, Stop, Svg, Text, View } from '@react-pdf/renderer'
import { formatLongDate } from '../model'
import { fillClient, parseBody, twoDigits, type Block, type ProposalData } from '../proposal'
import { LOGO_PATH } from './fonts'

const W = 595.28
const H = 841.89
const INK = '#0A0A0A'
const PINK = '#C9507B'
const PINK_SOFT = '#F2779F'
const MUTED = '#6B6B72'
const LINE = '#E6E4E1'
const PAD = 51

const body = { fontFamily: 'DMSans', fontSize: 10.5, color: INK, lineHeight: 1.5 } as const
const label = { fontFamily: 'DMSans', fontWeight: 700, fontSize: 7.5, letterSpacing: 1.2, textTransform: 'uppercase' as const }
const display = { fontFamily: 'SpaceGrotesk', fontWeight: 700 } as const

type Spot = { cx: number; cy: number; rx: number; ry: number; color: string; o: number }
const LAYERS = 60

/** The pink and violet glow. PDFs cannot blur, so each glow is a stack of
 *  shrinking, faint ellipses: strongest in the middle, fading to nothing. */
function Glow({ width, height, spots, style }: { width: number; height: number; spots: Spot[]; style?: Record<string, number | string> }) {
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0, ...style }}>
      {spots.flatMap((s, i) =>
        Array.from({ length: LAYERS }, (_, k) => {
          const f = 1 - k / LAYERS
          return <Ellipse key={`${i}-${k}`} cx={s.cx} cy={s.cy} rx={s.rx * f} ry={s.ry * f} fill={s.color} fillOpacity={(s.o * 1.4) / LAYERS} />
        }),
      )}
    </Svg>
  )
}

function Dots() {
  const dots: { x: number; y: number }[] = []
  for (let y = 10; y < H; y += 19.5) for (let x = 10; x < W; x += 19.5) dots.push({ x, y })
  return (
    <Svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      {dots.map((d, i) => <Circle key={i} cx={d.x} cy={d.y} r={0.7} fill="#FFFFFF" fillOpacity={0.1} />)}
    </Svg>
  )
}

function LogoPill({ height = 40 }: { height?: number }) {
  return (
    <View style={{ backgroundColor: '#000000', borderRadius: height / 2, borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.22)', height, paddingHorizontal: height * 0.38, justifyContent: 'center', alignSelf: 'flex-start' }}>
      <Image src={LOGO_PATH} style={{ height: height * 0.7, width: height * 0.7 * (480 / 204) }} />
    </View>
  )
}

/** Cover title with the client's name picked out in pink. */
function CoverTitle({ title, client }: { title: string; client: string }) {
  const filled = fillClient(title, client)
  const name = client.trim()
  const at = name ? filled.lastIndexOf(name) : -1
  const style = { ...display, fontSize: 52, lineHeight: 0.98, letterSpacing: -2.4, color: '#FFFFFF' }
  if (at < 0) return <Text style={style}>{filled}</Text>
  return (
    <Text style={style}>
      {filled.slice(0, at)}
      <Text style={{ color: PINK_SOFT }}>{filled.slice(at, at + name.length)}</Text>
      {filled.slice(at + name.length)}
    </Text>
  )
}

function Cover({ data }: { data: ProposalData }) {
  const meta: [string, string][] = [['Reference', data.ref], ['Date', formatLongDate(data.date)], ['Valid until', formatLongDate(data.validUntil)], ['Prepared by', 'nxtte']]
  return (
    <Page size="A4" style={{ backgroundColor: INK, padding: PAD, paddingTop: 48 }}>
      {/* Pinned behind the page so the background never pushes content onto a new page. */}
      <View fixed style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>
        <Glow width={W} height={H} spots={[
          { cx: W - 40, cy: 30, rx: 360, ry: 320, color: PINK, o: 0.9 },
          { cx: 40, cy: H - 260, rx: 300, ry: 250, color: '#B86FC4', o: 0.55 },
          { cx: W - 100, cy: H + 30, rx: 280, ry: 230, color: PINK_SOFT, o: 0.4 },
        ]} />
        <Dots />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <LogoPill />
        <Text style={{ ...label, fontSize: 9, letterSpacing: 2.2, color: '#FFFFFF' }}>Proposal</Text>
      </View>
      <View style={{ marginTop: 'auto' }}>
        <Text style={{ ...label, fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>Prepared for {data.clientName}</Text>
        <CoverTitle title={data.title} client={data.clientName} />
        <Text style={{ ...body, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 16, maxWidth: 330 }}>Content that produces bookings, not just likes.</Text>
        <View style={{ flexDirection: 'row', marginTop: 40, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 0.75, borderColor: 'rgba(255,255,255,0.16)' }}>
          {meta.map(([k, v]) => (
            <View key={k} style={{ flex: 1 }}>
              <Text style={{ ...label, color: 'rgba(255,255,255,0.65)' }}>{k}</Text>
              <Text style={{ ...body, fontSize: 10, fontWeight: 700, color: '#FFFFFF', marginTop: 3 }}>{v}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  )
}

function Band({ data }: { data: ProposalData }) {
  return (
    <View fixed style={{ position: 'absolute', left: 0, top: 0, width: W, height: 52, backgroundColor: INK, paddingHorizontal: PAD, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Glow width={W} height={52} spots={[{ cx: W - 60, cy: 0, rx: 240, ry: 52, color: PINK, o: 0.65 }]} />
      <LogoPill height={28} />
      <Text style={{ ...body, fontSize: 9, fontWeight: 500, color: '#C9C9CF' }}>{data.ref} · {data.clientName}</Text>
    </View>
  )
}

function Footer() {
  const small = { ...body, fontSize: 8.5, color: MUTED, lineHeight: 1 }
  return (
    <>
      <View fixed style={{ position: 'absolute', left: PAD, right: PAD, bottom: 44, height: 0.75, backgroundColor: LINE }} />
      <Text fixed style={{ ...small, position: 'absolute', left: PAD, bottom: 28 }}>nxtte is a brand of Aurexis Solution (SSM NS0315281-P) · contact@nxtte.com · +60 11-7472 1429</Text>
      <Text fixed style={{ ...small, position: 'absolute', left: W - PAD - 80, width: 80, textAlign: 'right', top: H - 37 }} render={({ pageNumber }) => `Page ${pageNumber}`} />
    </>
  )
}

function renderBlock(b: Block, key: number, client: string): React.ReactNode {
  switch (b.t) {
    case 'para':
      return <Text key={key} style={{ ...body, marginBottom: 7 }}>{b.text}</Text>
    case 'sub':
      return <Text key={key} minPresenceAhead={60} style={{ ...display, fontSize: 12.5, marginTop: 6, marginBottom: 5 }}>{b.text}</Text>
    case 'bullets':
      return (
        <View key={key} style={{ marginBottom: 7 }}>
          {b.items.map((it, n) => (
            <View key={n} wrap={false} style={{ flexDirection: 'row', marginBottom: 3 }}>
              <View style={{ width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: PINK, marginTop: 5.5, marginRight: 9 }} />
              <Text style={{ ...body, flex: 1 }}>{it}</Text>
            </View>
          ))}
        </View>
      )
    case 'num':
      return (
        <View key={key} wrap={false} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 7 }}>
          <View style={{ width: 21, height: 21, borderRadius: 6.5, backgroundColor: PINK, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
            <Text style={{ ...body, fontSize: 9.5, fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>{String(b.n)}</Text>
          </View>
          <Text style={{ ...body, flex: 1, marginTop: 2 }}>
            <Text style={{ fontWeight: 700 }}>{b.title}</Text>
            {b.text ? <Text style={{ color: MUTED }}>{`  ${b.text}`}</Text> : null}
          </Text>
        </View>
      )
    case 'callout':
      return (
        <View key={key} wrap={false} style={{ flexDirection: 'row', marginVertical: 6 }}>
          <View style={{ width: 3, backgroundColor: PINK, borderRadius: 1.5, marginRight: 10 }} />
          <Text style={{ ...body, flex: 1, fontSize: 12, fontWeight: 500 }}>{b.text}</Text>
        </View>
      )
    case 'note':
      return <Text key={key} style={{ ...body, fontSize: 8.5, color: MUTED, marginTop: 4, marginBottom: 6 }}>{b.text}</Text>
    case 'table': {
      const cols = Math.max(...b.rows.map((r) => r.length))
      return (
        <View key={key} style={{ marginBottom: 9 }}>
          {b.rows.map((r, n) => (
            <View key={n} wrap={false} style={{ flexDirection: 'row', backgroundColor: n === 0 ? INK : undefined, borderBottomWidth: n === 0 ? 0 : 0.75, borderBottomColor: LINE }}>
              {Array.from({ length: cols }, (_, k) => (
                <Text key={k} style={n === 0
                  ? { ...label, color: '#FFFFFF', flex: k === 0 ? 1.3 : 1, paddingVertical: 7, paddingHorizontal: 8, textAlign: k === cols - 1 && cols > 2 ? 'right' : 'left' }
                  : { ...body, fontSize: 10, flex: k === 0 ? 1.3 : 1, paddingVertical: 7, paddingHorizontal: 8, textAlign: k === cols - 1 && cols > 2 ? 'right' : 'left' }}>
                  {r[k] ?? ''}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )
    }
    case 'invest':
      return (
        <View key={key} wrap={false} style={{ position: 'relative', overflow: 'hidden', backgroundColor: INK, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Glow width={260} height={50} style={{ left: 'auto', right: 0 }} spots={[{ cx: 260, cy: 0, rx: 170, ry: 50, color: PINK, o: 0.6 }]} />
          <Text style={{ ...label, fontSize: 8.5, color: 'rgba(255,255,255,0.8)', flex: 1, paddingRight: 10 }}>{b.label}</Text>
          <Text style={{ ...display, fontSize: 26, letterSpacing: -1, color: PINK_SOFT }}>{b.amount}</Text>
        </View>
      )
    case 'sign':
      return (
        <View key={key} wrap={false} style={{ flexDirection: 'row', gap: 30, marginTop: 26 }}>
          {[`Accepted for ${client}`, 'For nxtte'].map((who) => (
            <View key={who} style={{ flex: 1 }}>
              <View style={{ height: 40, borderBottomWidth: 0.75, borderBottomColor: '#9A9AA0' }} />
              <Text style={{ ...body, fontSize: 9, color: MUTED, marginTop: 5 }}>{who}</Text>
              <Text style={{ ...body, fontSize: 9, color: MUTED, marginTop: 12 }}>Name and date:</Text>
            </View>
          ))}
        </View>
      )
  }
}

/** Sections grouped so that every "start on a new page" section begins a new page. */
function pageRuns(sections: ProposalData['sections']) {
  const runs: { n: number; s: ProposalData['sections'][number] }[][] = []
  sections.forEach((s, i) => {
    if (i === 0 || s.pageBreak) runs.push([{ n: i + 1, s }])
    else runs[runs.length - 1].push({ n: i + 1, s })
  })
  return runs
}

export function ProposalDocument({ data }: { data: ProposalData }) {
  return (
    <Document title={`Proposal ${data.ref}`} author="nxtte" creator="nxtte" producer="nxtte">
      <Cover data={data} />
      {pageRuns(data.sections).map((run, p) => (
        <Page key={p} size="A4" style={{ backgroundColor: '#FFFFFF', paddingTop: 80, paddingBottom: 64, paddingHorizontal: PAD }}>
          <Band data={data} />
          <Footer />
          {run.map(({ n, s }, i) => {
            const blocks = parseBody(fillClient(s.body, data.clientName))
            return (
              <View key={i} style={{ flexDirection: 'row', paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 0.75, borderTopColor: LINE }}>
                <Text style={{ ...display, fontSize: 25, letterSpacing: -1, color: PINK, width: 46 }}>{twoDigits(n)}</Text>
                <View style={{ flex: 1 }}>
                  <Text minPresenceAhead={70} style={{ ...display, fontSize: 16.5, letterSpacing: -0.5, marginTop: 3, marginBottom: 8 }}>{fillClient(s.title, data.clientName)}</Text>
                  {blocks.map((b, k) => renderBlock(b, k, data.clientName))}
                </View>
              </View>
            )
          })}
        </Page>
      ))}
    </Document>
  )
}
