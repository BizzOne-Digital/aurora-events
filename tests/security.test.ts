import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sniffImageType } from "../src/lib/image-sniff";
import { renderMarkdown } from "../src/lib/sanitize";

describe("renderMarkdown (blog sanitiser)", () => {
  it("removes scripts, iframes, event handlers and javascript: links", () => {
    const html = renderMarkdown(
      [
        "Hello <script>alert(1)</script> world",
        "[bad](javascript:alert(1))",
        '<img src="x" onerror="alert(1)">',
        '<iframe src="https://evil.test"></iframe>',
        '<a href="https://ok.test" onclick="alert(1)">ok</a>',
      ].join("\n\n"),
    );
    assert.doesNotMatch(html, /<script|<iframe|onerror|onclick|javascript:/i);
  });
  it("keeps headings, lists and internal links", () => {
    const html = renderMarkdown("## Title\n\n- one\n- two\n\n[book](/booking)");
    assert.match(html, /<h2>Title<\/h2>/);
    assert.match(html, /<li>one<\/li>/);
    assert.match(html, /href="\/booking"/);
  });
  it("opens external links safely and drops images from untrusted hosts", () => {
    const html = renderMarkdown("[x](https://example.com)\n\n![a](https://evil.test/a.png)\n\n![b](/api/uploads/pages/1700000000000-abc.png)");
    assert.match(html, /rel="noopener noreferrer"/);
    assert.doesNotMatch(html, /evil\.test/);
    assert.match(html, /\/api\/uploads\/pages\/1700000000000-abc\.png/);
  });
});

describe("sniffImageType (upload validation)", () => {
  const pad = (b: number[]) => Buffer.concat([Buffer.from(b), Buffer.alloc(32)]);
  it("detects JPEG, PNG, WebP and GIF by their bytes", () => {
    assert.equal(sniffImageType(pad([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
    assert.equal(sniffImageType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "image/png");
    const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.alloc(8)]);
    assert.equal(sniffImageType(webp), "image/webp");
    assert.equal(sniffImageType(Buffer.from("GIF89a".padEnd(40))), "image/gif");
  });
  it("rejects scripts, SVG and tiny files regardless of name or declared type", () => {
    assert.equal(sniffImageType(Buffer.from("<script>alert(1)</script>".padEnd(40))), null);
    assert.equal(sniffImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'.padEnd(60))), null);
    assert.equal(sniffImageType(Buffer.from([0xff, 0xd8])), null);
  });
});
