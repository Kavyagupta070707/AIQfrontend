const escapeHtml = (value: string) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const highlightedHtml = (value: string) =>
  escapeHtml(value)
    .replace(/==(.+?)==/g, "<mark>$1</mark>")
    .replace(/!\[([^\]]*?)\]\((https?:\/\/[^)\s]+?)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+?)\]\((https?:\/\/[^)\s]+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/&lt;u&gt;(.+?)&lt;\/u&gt;/g, "<u>$1</u>")
    .replace(/`([^`]+?)`/g, "<code>$1</code>");

const closeList = (html: string, inList: boolean) => ({
  html: inList ? `${html}</ul>` : html,
  inList: false,
});

const markdownToHtml = (value: string) => {
  const lines = String(value || "").split(/\r?\n/);
  let html = "";
  let inList = false;
  let inCode = false;
  let code = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        html += `<pre><code>${escapeHtml(code.trimEnd())}</code></pre>`;
        code = "";
        inCode = false;
      } else {
        const closed = closeList(html, inList);
        html = closed.html;
        inList = closed.inList;
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      code += `${line}\n`;
      continue;
    }

    if (!trimmed) {
      const closed = closeList(html, inList);
      html = `${closed.html}<div class="spacer"></div>`;
      inList = closed.inList;
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const closed = closeList(html, inList);
      html = `${closed.html}<h${Math.min(heading[1].length + 1, 4)}>${highlightedHtml(heading[2])}</h${Math.min(heading[1].length + 1, 4)}>`;
      inList = closed.inList;
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${highlightedHtml(bullet[1])}</li>`;
      continue;
    }

    const closed = closeList(html, inList);
    html = `${closed.html}<p>${highlightedHtml(trimmed)}</p>`;
    inList = closed.inList;
  }

  if (inCode && code) html += `<pre><code>${escapeHtml(code.trimEnd())}</code></pre>`;
  return closeList(html, inList).html;
};

const plainTitle = (value: string) =>
  String(value || "Study Notes").replace(/[\\/:*?"<>|]+/g, "").trim() || "Study Notes";

const openPrintWindow = (title: string, body: string) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;

  printWindow.document.write(`
    <html>
      <head>
        <title>${escapeHtml(plainTitle(title))}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; line-height: 1.65; padding: 32px; }
          h1 { font-size: 26px; margin: 0 0 4px; }
          h2 { color: #0f766e; font-size: 18px; margin: 24px 0 8px; }
          h3, h4 { color: #1e293b; font-size: 15px; margin: 18px 0 8px; }
          p, li { font-size: 13px; }
          .meta { color: #475569; margin-bottom: 24px; }
          .content { white-space: normal; }
          mark { background: #fef08a; border-radius: 3px; padding: 0 3px; }
          ul { padding-left: 22px; }
          pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; white-space: pre-wrap; }
          code { color: #0f766e; font-family: Consolas, monospace; }
          .spacer { height: 8px; }
        </style>
      </head>
      <body>${body}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  return true;
};

export const renderHighlightedText = (value: string) => {
  const parts = String(value || "").split(/(==.+?==|!\[[^\]]*?\]\(https?:\/\/[^)\s]+?\)|\[[^\]]+?\]\(https?:\/\/[^)\s]+?\)|\*\*.+?\*\*|\*.+?\*|<u>.+?<\/u>|`[^`]+?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("==") && part.endsWith("==")) {
      return (
        <mark key={`${part}-${index}`} className="rounded bg-yellow-200 px-1 text-slate-950">
          {part.slice(2, -2)}
        </mark>
      );
    }

    const image = part.match(/^!\[([^\]]*?)\]\((https?:\/\/[^)\s]+?)\)$/);
    if (image) {
      return (
        <img
          key={`${part}-${index}`}
          src={image[2]}
          alt={image[1]}
          className="my-3 max-h-56 max-w-full rounded-lg border border-[var(--theme-border)] object-contain"
        />
      );
    }

    const link = part.match(/^\[([^\]]+?)\]\((https?:\/\/[^)\s]+?)\)$/);
    if (link) {
      return (
        <a key={`${part}-${index}`} href={link[2]} target="_blank" rel="noreferrer" className="text-[var(--theme-accent)] underline underline-offset-4">
          {link[1]}
        </a>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("<u>") && part.endsWith("</u>")) {
      return <u key={`${part}-${index}`}>{part.slice(3, -4)}</u>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${part}-${index}`} className="rounded bg-[var(--theme-subcard)] px-1.5 py-0.5 font-mono text-xs text-[var(--theme-accent)]">
          {part.slice(1, -1)}
        </code>
      );
    }

    return part.split("\n").map((line, lineIndex, lines) => (
      <span key={`${part}-${index}-${lineIndex}`}>
        {line}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </span>
    ));
  });
};

export const renderFormattedNoteContent = (value: string) => {
  const lines = String(value || "").split(/\r?\n/);
  const nodes = [];
  let listItems: string[] = [];
  let codeLines: string[] = [];
  let inCode = false;

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`list-${nodes.length}`} className="list-disc space-y-2 pl-5">
        {listItems.map((item, index) => <li key={`${item}-${index}`}>{renderHighlightedText(item)}</li>)}
      </ul>
    );
    listItems = [];
  };

  const flushCode = () => {
    if (!codeLines.length) return;
    nodes.push(
      <pre key={`code-${nodes.length}`} className="notes-book-code overflow-x-auto rounded-md border p-3 text-xs">
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
    codeLines = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (!trimmed) {
      flushList();
      nodes.push(<div key={`space-${nodes.length}`} className="h-2" />);
      return;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const className = level <= 2 ? "text-base font-semibold text-[var(--theme-accent)]" : "text-sm font-semibold text-[var(--theme-text)]";
      nodes.push(<p key={`heading-${nodes.length}`} className={className}>{renderHighlightedText(heading[2])}</p>);
      return;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      listItems.push(bullet[1]);
      return;
    }

    flushList();
    nodes.push(<p key={`p-${nodes.length}`}>{renderHighlightedText(trimmed)}</p>);
  });

  flushList();
  flushCode();
  return nodes;
};

export const downloadNotePdf = (note: any) =>
  openPrintWindow(
    note.title,
    `
      <h1>${escapeHtml(note.title || "Study Notes")}</h1>
      <p class="meta">${escapeHtml(note.subject || "General")}</p>
      <div class="content">${markdownToHtml(note.content || "")}</div>
    `
  );

export const downloadShortNotePdf = (note: any) =>
  openPrintWindow(
    note.title,
    `
      <h1>${escapeHtml(note.title || "Short Notes")}</h1>
      <p class="meta">${escapeHtml(note.subject || "General")}</p>
      <ul>
        ${(note.bullets || []).map((bullet: string) => `<li>${highlightedHtml(bullet)}</li>`).join("")}
      </ul>
    `
  );
