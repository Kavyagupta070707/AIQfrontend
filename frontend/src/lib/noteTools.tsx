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

type PdfLine = {
  text: string;
  size?: number;
  font?: "regular" | "bold" | "mono";
  indent?: number;
  gapBefore?: number;
};

const cleanPdfText = (value: string) =>
  String(value || "")
    .replace(/==(.+?)==/g, "$1")
    .replace(/!\[([^\]]*?)\]\((https?:\/\/[^)\s]+?)\)/g, "$1 $2")
    .replace(/\[([^\]]+?)\]\((https?:\/\/[^)\s]+?)\)/g, "$1 ($2)")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+?)`/g, "$1")
    .replace(/<u>(.+?)<\/u>/g, "$1")
    .replace(/[•–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");

const parseMarkdownLines = (value: string): PdfLine[] => {
  const lines = String(value || "").split(/\r?\n/);
  const output: PdfLine[] = [];
  let inCode = false;

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inCode = !inCode;
      if (!inCode) output.push({ text: "", gapBefore: 6 });
      return;
    }

    if (inCode) {
      output.push({ text: line || " ", size: 10, font: "mono", indent: 10 });
      return;
    }

    if (!trimmed) {
      output.push({ text: "", gapBefore: 8 });
      return;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      output.push({
        text: cleanPdfText(heading[2]),
        size: heading[1].length <= 2 ? 15 : 12,
        font: "bold",
        gapBefore: 12,
      });
      return;
    }

    const bullet = trimmed.match(/^(\s*)[-*]\s+(.+)$/);
    if (bullet) {
      const depth = Math.floor((bullet[1]?.length || 0) / 2);
      const text = cleanPdfText(bullet[2]).replace(/^[-*]\s+/, "");
      output.push({
        text: `- ${text}`,
        size: 11,
        indent: 12 + depth * 12,
        font: /:$/.test(text) ? "bold" : "regular",
      });
      return;
    }

    const text = cleanPdfText(trimmed).replace(/^[-*]\s+/, "");
    output.push({
      text,
      size: 11,
      font: /:$/.test(text) ? "bold" : "regular",
      gapBefore: /:$/.test(text) ? 6 : undefined,
    });
  });

  return output;
};

const parseShortNoteBullets = (bullets: string[]): PdfLine[] =>
  bullets.flatMap((bullet) => {
    const parsed = parseMarkdownLines(bullet);
    if (parsed.length) {
      return parsed.map((line) => {
        const text = cleanPdfText(line.text).trim();
        const normalized = text.replace(/^[-*]\s+/, "");
        const looksLikeSection = /:$/.test(normalized);
        const isAlreadyBullet = /^- /.test(text);

        return {
          ...line,
          text: looksLikeSection ? normalized : isAlreadyBullet ? text : `- ${normalized}`,
          indent: looksLikeSection ? 0 : line.indent || 12,
          font: looksLikeSection ? "bold" as const : line.font || "regular" as const,
          gapBefore: looksLikeSection ? 8 : line.gapBefore,
        };
      });
    }

    return [];
  });

const pdfEscape = (value: string) =>
  cleanPdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const wrapPdfText = (text: string, size: number, font: PdfLine["font"], maxWidth: number) => {
  if (!text.trim()) return [""];
  const avgCharWidth = size * (font === "mono" ? 0.6 : 0.52);
  const maxChars = Math.max(18, Math.floor(maxWidth / avgCharWidth));
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    if (word.length > maxChars) {
      if (current) lines.push(current);
      for (let index = 0; index < word.length; index += maxChars) {
        lines.push(word.slice(index, index + maxChars));
      }
      current = "";
      return;
    }

    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines;
};

const createPdfBlob = (title: string, lines: PdfLine[]) => {
  const width = 595.28;
  const height = 841.89;
  const margin = 54;
  const bottom = 54;
  const maxWidth = width - margin * 2;
  const pages: string[] = [];
  let y = height - margin;
  let stream = "";

  const addPage = () => {
    if (stream) pages.push(stream);
    stream = "";
    y = height - margin;
  };

  const addLine = (line: PdfLine) => {
    const size = line.size || 11;
    const font = line.font || "regular";
    const lineHeight = size * 1.45;
    const indent = line.indent || 0;
    const wrapped = wrapPdfText(line.text, size, font, maxWidth - indent);
    y -= line.gapBefore || 0;

    wrapped.forEach((text) => {
      if (y < bottom) addPage();
      const fontRef = font === "bold" ? "F2" : font === "mono" ? "F3" : "F1";
      stream += `BT /${fontRef} ${size} Tf 0.06 0.09 0.14 rg 1 0 0 1 ${margin + indent} ${y.toFixed(2)} Tm (${pdfEscape(text)}) Tj ET\n`;
      y -= lineHeight;
    });
  };

  addLine({ text: title, size: 22, font: "bold" });
  addLine({ text: new Date().toLocaleDateString(), size: 9, gapBefore: 2 });
  y -= 14;
  lines.forEach(addLine);
  if (stream) pages.push(stream);

  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
  objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";

  const pageRefs: string[] = [];
  pages.forEach((page, index) => {
    const pageId = 6 + index * 2;
    const contentId = pageId + 1;
    pageRefs.push(`${pageId} 0 R`);
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${page.length} >>\nstream\n${page}endstream`;
  });
  objects[2] = `<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pages.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    if (!objects[id]) continue;
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id] || 0).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

const downloadPdfFile = (title: string, lines: PdfLine[]) => {
  const url = URL.createObjectURL(createPdfBlob(title, lines));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${plainTitle(title)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
  downloadPdfFile(note.title || "Study Notes", [
    { text: note.subject || "General", size: 11, font: "bold", gapBefore: 4 },
    ...parseMarkdownLines(note.content || ""),
  ]);

export const downloadShortNotePdf = (note: any) =>
  downloadPdfFile(note.title || "Short Notes", [
    { text: note.subject || "General", size: 11, font: "bold", gapBefore: 4 },
    ...parseShortNoteBullets(note.bullets || []),
  ]);

export const downloadRoadmapStepPdf = (roadmap: any, step: any, index: number) =>
  downloadPdfFile(`${roadmap.title || "Roadmap"} - Day ${index + 1}`, [
    { text: `Day ${index + 1}: ${step.title || "Study Section"}`, size: 13, font: "bold", gapBefore: 4 },
    { text: "Study Material", size: 15, font: "bold", gapBefore: 14 },
    ...parseMarkdownLines(step.studyMaterial || step.description || "No study material added yet."),
    { text: "Key Points", size: 15, font: "bold", gapBefore: 14 },
    ...((step.keyPoints || []).length ? step.keyPoints : [step.description || ""]).map((item: string) => ({ text: `- ${cleanPdfText(item)}`, size: 11, indent: 12 })),
    { text: "Examples", size: 15, font: "bold", gapBefore: 14 },
    ...(step.examples || []).map((item: string) => ({ text: `- ${cleanPdfText(item)}`, size: 11, indent: 12 })),
    { text: "Practice Questions", size: 15, font: "bold", gapBefore: 14 },
    ...(step.practiceQuestions || []).map((item: string) => ({ text: `- ${cleanPdfText(item)}`, size: 11, indent: 12 })),
    { text: "Resources", size: 15, font: "bold", gapBefore: 14 },
    ...(step.resources || []).map((resource: any) => {
      const normalized = typeof resource === "string" ? { title: resource, url: "", description: "" } : resource;
      return {
        text: `- ${cleanPdfText([normalized.title, normalized.url, normalized.description].filter(Boolean).join(": "))}`,
        size: 11,
        indent: 12,
      };
    }),
  ]);
