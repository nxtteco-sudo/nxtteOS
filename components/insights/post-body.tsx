import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

// One renderer for the live post and the admin preview, so what the editor
// shows is exactly what readers get. Headings start at h2 (the title is h1);
// external links open in a new tab, internal ones do not.
const components: Components = {
  h1: ({ children }) => <h2>{children}</h2>,
  a: ({ href = '', children }) => {
    const external = /^https?:\/\//.test(href)
    return external
      ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
      : <a href={href}>{children}</a>
  },
  // eslint-disable-next-line @next/next/no-img-element -- in-post images come from the CMS with unknown sizes
  img: ({ src, alt }) => <img src={typeof src === 'string' ? src : ''} alt={alt ?? ''} loading="lazy" decoding="async" />,
}

export function PostBody({ markdown }: { markdown: string }) {
  return (
    <div className="ip-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{markdown}</ReactMarkdown>
    </div>
  )
}
