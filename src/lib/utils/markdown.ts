import { Marked } from "marked";
import hljs from "highlight.js";
import DOMPurify from "dompurify";

const langLabels: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  py: "Python",
  python: "Python",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  sql: "SQL",
  java: "Java",
  cpp: "C++",
  c: "C",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  yaml: "YAML",
  yml: "YAML",
  xml: "XML",
  markdown: "Markdown",
  md: "Markdown",
  plaintext: "Text",
  text: "Text",
  txt: "Text",
  svelte: "Svelte",
  jsx: "JSX",
  tsx: "TSX",
  scss: "SCSS",
  dockerfile: "Dockerfile",
  graphql: "GraphQL",
  csharp: "C#",
  cs: "C#",
};

const marked = new Marked({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;
      const label = langLabels[language] ?? language;
      return `<div class="code-block-wrapper"><div class="code-block-header"><span>${label}</span></div><pre><code class="hljs language-${language}">${highlighted}</code></pre></div>`;
    },
  },
  gfm: true,
  breaks: true,
});

export function renderMarkdown(content: string): string {
  const html = marked.parse(content) as string;
  return DOMPurify.sanitize(html, {
    ADD_TAGS: [
      "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
    ],
    ADD_ATTR: ["class"],
  });
}
