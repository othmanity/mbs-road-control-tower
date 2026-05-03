// Renders Rashid's assistant replies as styled markdown.
// Supports GFM (tables, task lists, autolinks) and applies inline styles
// that match the rest of the app's design system.
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  text: string;
}

export default function RashidMarkdown({ text }: Props) {
  return (
    <div className="rashid-md" style={{ fontSize: 13.5, lineHeight: 1.6, color: "#160F3E" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F2A24", margin: "12px 0 6px", borderBottom: "1px solid #C5DAD2", paddingBottom: 4 }}>
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F2A24", margin: "10px 0 5px" }}>
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#26634B", margin: "8px 0 4px", textTransform: "uppercase", letterSpacing: 0.4 }}>
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p style={{ margin: "6px 0" }}>{children}</p>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: "6px 0", paddingLeft: 20 }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ margin: "6px 0", paddingLeft: 22 }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ margin: "2px 0" }}>{children}</li>
          ),
          strong: ({ children }) => (
            <strong style={{ color: "#0F2A24", fontWeight: 700 }}>{children}</strong>
          ),
          em: ({ children }) => (
            <em style={{ color: "#26634B" }}>{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#26634B", textDecoration: "underline", fontWeight: 600 }}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{
                margin: "8px 0",
                padding: "6px 12px",
                borderLeft: "3px solid #26634B",
                background: "#F8FAF9",
                color: "#323232",
                fontStyle: "italic",
                borderRadius: 4,
              }}
            >
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre
                  style={{
                    margin: "8px 0",
                    padding: "10px 12px",
                    background: "#0F2A24",
                    color: "#E8F4F0",
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    overflowX: "auto",
                    lineHeight: 1.4,
                  }}
                >
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code
                style={{
                  background: "#E8F4F0",
                  color: "#0F2A24",
                  padding: "1px 6px",
                  borderRadius: 3,
                  fontSize: 12,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {children}
              </code>
            );
          },
          hr: () => (
            <hr style={{ border: "none", borderTop: "1px solid #C5DAD2", margin: "10px 0" }} />
          ),
          table: ({ children }) => (
            <div style={{ overflowX: "auto", margin: "8px 0", borderRadius: 6, border: "1px solid #C5DAD2" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead style={{ background: "#E8F4F0" }}>{children}</thead>
          ),
          th: ({ children }) => (
            <th
              style={{
                padding: "8px 10px",
                textAlign: "left",
                fontWeight: 700,
                color: "#0F2A24",
                borderBottom: "1px solid #C5DAD2",
                fontSize: 11.5,
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              style={{
                padding: "7px 10px",
                borderBottom: "1px solid #F1F5F4",
                color: "#323232",
                verticalAlign: "top",
              }}
            >
              {children}
            </td>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
