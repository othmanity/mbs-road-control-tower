import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface MarkdownMessageProps {
  text: string;
  /** show a blinking cursor at the end (for the streaming bubble) */
  streaming?: boolean;
}

marked.setOptions({ gfm: true, breaks: false });

export default function MarkdownMessage({ text, streaming }: MarkdownMessageProps) {
  const html = useMemo(() => {
    // marked.parse may return Promise when async:true; we don't use async
    const raw = marked.parse(text || "", { async: false }) as string;
    return DOMPurify.sanitize(raw, {
      ALLOWED_ATTR: ["href", "target", "rel", "class", "title", "lang", "dir"],
    });
  }, [text]);

  return (
    <div className="md-msg">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {streaming && <span className="md-cursor" />}
    </div>
  );
}
