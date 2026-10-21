import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const IMG_HOSTS = ["images.unsplash.com"];
const OWN_IMAGE = /^\/(api\/uploads\/(products|gallery|pages|misc)\/[\w.-]+|images\/[\w./-]+)$/;

/** Markdown -> HTML, then strict allow-list sanitising. Safe to inject with dangerouslySetInnerHTML. */
export function renderMarkdown(markdown: string): string {
  const raw = marked.parse(markdown, { async: false, gfm: true, breaks: false }) as string;
  return sanitizeHtml(raw, {
    allowedTags: ["h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "a", "blockquote", "hr", "br", "img", "code", "pre"],
    allowedAttributes: {
      a: ["href", "title", "rel", "target"],
      img: ["src", "alt", "title", "width", "height", "loading"],
    },
    allowedSchemes: ["https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tag, attribs) => {
        const external = /^https?:/i.test(attribs.href ?? "");
        return {
          tagName: "a",
          attribs: { ...attribs, ...(external ? { rel: "noopener noreferrer", target: "_blank" } : {}) },
        };
      },
      img: (tag, attribs) => ({ tagName: "img", attribs: { ...attribs, loading: "lazy" } }),
    },
    exclusiveFilter: (frame) => {
      if (frame.tag !== "img") return false;
      if (OWN_IMAGE.test(frame.attribs.src ?? "")) return false;
      try {
        return !IMG_HOSTS.includes(new URL(frame.attribs.src ?? "").hostname);
      } catch {
        return true;
      }
    },
  });
}

/** Relative links such as (/booking) are allowed in Markdown; sanitize-html keeps them (no scheme). */
