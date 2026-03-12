import { Marked } from "marked";
import hljs from "highlight.js";
import DOMPurify from "dompurify";

const marked = new Marked({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },
  },
  gfm: true,
  breaks: true,
});

export function renderMarkdown(content: string): string {
  const html = marked.parse(content) as string;
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["pre", "code"],
    ADD_ATTR: ["class"],
  });
}
