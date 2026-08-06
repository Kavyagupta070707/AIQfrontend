const escapeHtml = (value: string) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const normalizeNoteMarkdown = (value: string) => {
  let text = String(value || "").trim();

  for (let pass = 0; pass < 3; pass += 1) {
    const before = text;

    if (text.includes('"content"') || text.includes('\\"content\\"')) {
      const decodedWrapper = text
        .replace(/\\"/g, '"')
        .replace(/\\n/g, "\n")
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      const contentMatch = decodedWrapper.match(/"content"\s*:\s*"([\s\S]*?)"\s*,\s*"tags"/);
      if (contentMatch?.[1]) text = contentMatch[1];
    }

    text = text
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "  ")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\//g, "/")
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/^\s*{\s*"title"[\s\S]*?"content"\s*:\s*"/, "")
      .replace(/"\s*,\s*"tags"\s*:\s*\[[\s\S]*$/, "")
      .replace(/}\s*}\s*$/g, "")
      .trim();

    if (text === before) break;
  }

  return text;
};

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
  const lines = normalizeNoteMarkdown(value).split(/\r?\n/);
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
  type?: "text" | "heading" | "table" | "code";
  headingLevel?: number;
  cells?: string[];
  header?: boolean;
  columnWidths?: number[];
};

const isMarkdownTableLine = (line: string) => /^\|.+\|$/.test(line.trim());
const parseMarkdownTableLine = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
const isMarkdownTableSeparator = (cells: string[]) => cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));

const cleanPdfText = (value: string) =>
  normalizeNoteMarkdown(value)
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
  const lines = normalizeNoteMarkdown(value).split(/\r?\n/);
  const output: PdfLine[] = [];
  let inCode = false;
  let tableRows: string[][] = [];
  let codeRows: string[] = [];

  const flushTable = () => {
    const rows = tableRows.filter((row) => !isMarkdownTableSeparator(row));
    if (!rows.length) {
      tableRows = [];
      return;
    }

    const columnCount = Math.max(...rows.map((row) => row.length));
    const baseWidth = 1 / Math.max(columnCount, 1);
    const columnWidths = Array.from({ length: columnCount }, () => baseWidth);

    rows.forEach((row, rowIndex) => {
      output.push({
        text: "",
        type: "table",
        cells: Array.from({ length: columnCount }, (_, index) => cleanPdfText(row[index] || "")),
        header: rowIndex === 0,
        columnWidths,
        gapBefore: rowIndex === 0 ? 5 : 0,
      });
    });
    output.push({ text: "", gapBefore: 5 });
    tableRows = [];
  };

  const flushCode = () => {
    if (!codeRows.length) return;
    output.push({
      text: codeRows.join("\n"),
      type: "code",
      size: 9.5,
      font: "mono",
      gapBefore: 5,
    });
    output.push({ text: "", gapBefore: 5 });
    codeRows = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushTable();
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeRows.push(line || " ");
      return;
    }

    if (!trimmed) {
      flushTable();
      output.push({ text: "", gapBefore: 4 });
      return;
    }

    if (!inCode && isMarkdownTableLine(trimmed)) {
      tableRows.push(parseMarkdownTableLine(trimmed));
      return;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushTable();
      const level = heading[1].length;
      output.push({
        text: cleanPdfText(heading[2]),
        type: "heading",
        headingLevel: level,
        size: level === 1 ? 19 : level === 2 ? 14 : 12,
        font: "bold",
        gapBefore: level <= 2 ? 8 : 5,
      });
      return;
    }

    const boldOnlyHeading = trimmed.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (boldOnlyHeading) {
      flushTable();
      output.push({
        text: cleanPdfText(boldOnlyHeading[1]),
        type: "heading",
        headingLevel: 3,
        size: 12,
        font: "bold",
        gapBefore: 5,
      });
      return;
    }

    const bullet = trimmed.match(/^(\s*)[-*]\s+(.+)$/);
    if (bullet) {
      flushTable();
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
    flushTable();
    const looksLikeSection = /:$/.test(text) && text.length <= 70;
    output.push({
      text,
      type: looksLikeSection ? "heading" : "text",
      headingLevel: looksLikeSection ? 4 : undefined,
      size: looksLikeSection ? 11.5 : 11,
      font: looksLikeSection ? "bold" : "regular",
      gapBefore: looksLikeSection ? 5 : undefined,
    });
  });

  flushTable();
  flushCode();
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
      type: looksLikeSection ? "heading" as const : line.type,
      headingLevel: looksLikeSection ? 4 : line.headingLevel,
      indent: looksLikeSection ? 0 : line.indent || 12,
      font: looksLikeSection ? "bold" as const : line.font || "regular" as const,
      gapBefore: looksLikeSection ? 5 : line.gapBefore,
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
    if (!line.text && line.type !== "table") {
      y -= line.gapBefore || 3;
      return;
    }

    if (line.type === "heading") {
      const level = line.headingLevel || 2;
      const size = line.size || (level <= 1 ? 20 : level === 2 ? 15 : 12.5);
      const lineHeight = size * 1.25;
      const wrapped = wrapPdfText(line.text, size, "bold", maxWidth - (level <= 2 ? 0 : 10));
      const blockHeight = wrapped.length * lineHeight + (level <= 2 ? 6 : 2);

      y -= line.gapBefore || 0;
      if (y - blockHeight < bottom) addPage();

      if (level <= 2) {
        stream += `q 0.94 0.98 0.96 rg ${margin.toFixed(2)} ${(y - blockHeight + 1).toFixed(2)} ${maxWidth.toFixed(2)} ${blockHeight.toFixed(2)} re f Q\n`;
        stream += `q 0.05 0.48 0.38 rg ${margin.toFixed(2)} ${(y - blockHeight + 1).toFixed(2)} 3 ${blockHeight.toFixed(2)} re f Q\n`;
      }

      const textX = margin + (level <= 2 ? 12 : 0);
      let textY = y - size + (level <= 2 ? -1 : 0);
      wrapped.forEach((text) => {
        const color = level <= 2 ? "0.03 0.38 0.30 rg" : "0.06 0.09 0.14 rg";
        stream += `BT /F2 ${size} Tf ${color} 1 0 0 1 ${textX.toFixed(2)} ${textY.toFixed(2)} Tm (${pdfEscape(text)}) Tj ET\n`;
        textY -= lineHeight;
      });

      y -= blockHeight + (level <= 2 ? 10 : 8);
      return;
    }

    if (line.type === "code") {
      const size = line.size || 9.5;
      const lineHeight = size * 1.35;
      const codeLines = String(line.text || "").split("\n");
      const boxPadding = 7;
      const wrappedCode = codeLines.flatMap((item) => wrapPdfText(item || " ", size, "mono", maxWidth - boxPadding * 2));
      const boxHeight = wrappedCode.length * lineHeight + boxPadding * 2;

      y -= line.gapBefore || 0;
      if (y - boxHeight < bottom) addPage();
      stream += `q 0.95 0.97 0.96 rg ${margin.toFixed(2)} ${(y - boxHeight).toFixed(2)} ${maxWidth.toFixed(2)} ${boxHeight.toFixed(2)} re f Q\n`;
      stream += `q 0.70 0.76 0.72 RG 0.5 w ${margin.toFixed(2)} ${(y - boxHeight).toFixed(2)} ${maxWidth.toFixed(2)} ${boxHeight.toFixed(2)} re S Q\n`;
      let textY = y - boxPadding - size;
      wrappedCode.forEach((text) => {
        stream += `BT /F3 ${size} Tf 0.10 0.14 0.18 rg 1 0 0 1 ${(margin + boxPadding).toFixed(2)} ${textY.toFixed(2)} Tm (${pdfEscape(text)}) Tj ET\n`;
        textY -= lineHeight;
      });
      y -= boxHeight;
      return;
    }

    if (line.type === "table" && line.cells?.length) {
      const columnWidths = line.columnWidths || line.cells.map(() => 1 / line.cells!.length);
      const xStart = margin;
      const tableWidth = maxWidth;
      const font = line.header ? "bold" : "regular";
      const size = line.header ? 10 : 9.5;
      const lineHeight = size * 1.35;
      const cellPadding = 5;
      const cellWidths = columnWidths.map((ratio) => tableWidth * ratio);
      const wrappedCells = line.cells.map((cell, index) => wrapPdfText(cell, size, font, cellWidths[index] - cellPadding * 2));
      const rowLines = Math.max(...wrappedCells.map((cell) => cell.length), 1);
      const rowHeight = rowLines * lineHeight + cellPadding * 2;

      y -= line.gapBefore || 0;
      if (y - rowHeight < bottom) addPage();

      let x = xStart;
      line.cells.forEach((_, index) => {
        const width = cellWidths[index];
        const shade = line.header ? "0.88 0.94 0.91 rg" : "0.99 0.97 0.90 rg";
        stream += `q ${shade} ${x.toFixed(2)} ${(y - rowHeight).toFixed(2)} ${width.toFixed(2)} ${rowHeight.toFixed(2)} re f Q\n`;
        stream += `q 0.62 0.68 0.60 RG 0.5 w ${x.toFixed(2)} ${(y - rowHeight).toFixed(2)} ${width.toFixed(2)} ${rowHeight.toFixed(2)} re S Q\n`;
        x += width;
      });

      x = xStart;
      wrappedCells.forEach((cellLines, cellIndex) => {
        const fontRef = line.header ? "F2" : "F1";
        const textX = x + cellPadding;
        let textY = y - cellPadding - size;
        cellLines.forEach((text) => {
          stream += `BT /${fontRef} ${size} Tf 0.06 0.09 0.14 rg 1 0 0 1 ${textX.toFixed(2)} ${textY.toFixed(2)} Tm (${pdfEscape(text)}) Tj ET\n`;
          textY -= lineHeight;
        });
        x += cellWidths[cellIndex];
      });

      y -= rowHeight;
      return;
    }

    const size = line.size || 11;
    const font = line.font || "regular";
    const lineHeight = size * 1.32;
    const indent = line.indent || 0;
    const isBullet = line.text.startsWith("- ");
    const text = isBullet ? line.text.slice(2).trim() : line.text;
    const bulletGap = isBullet ? 12 : 0;
    const wrapped = wrapPdfText(text, size, font, maxWidth - indent - bulletGap);
    y -= line.gapBefore || 0;

    wrapped.forEach((text, index) => {
      if (y < bottom) addPage();
      const fontRef = font === "bold" ? "F2" : font === "mono" ? "F3" : "F1";
      if (isBullet && index === 0) {
        stream += `q 0.05 0.48 0.38 rg ${(margin + indent + 2).toFixed(2)} ${(y + 3).toFixed(2)} 3 3 re f Q\n`;
      }
      const x = margin + indent + bulletGap;
      stream += `BT /${fontRef} ${size} Tf 0.06 0.09 0.14 rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfEscape(text)}) Tj ET\n`;
      y -= lineHeight;
    });
  };

  addLine({ text: title, type: "heading", headingLevel: 1, size: 22, font: "bold" });
  addLine({ text: new Date().toLocaleDateString(), size: 9, gapBefore: 1 });
  y -= 8;
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
  const lines = normalizeNoteMarkdown(value).split(/\r?\n/);
  const nodes = [];
  let listItems: string[] = [];
  let codeLines: string[] = [];
  let tableRows: string[][] = [];
  let inCode = false;

  const isTableLine = (line: string) => /^\|.+\|$/.test(line.trim());
  const isTableSeparator = (cells: string[]) => cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
  const parseTableLine = (line: string) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`list-${nodes.length}`} className="list-disc space-y-2 pl-5">
        {listItems.map((item, index) => <li key={`${item}-${index}`}>{renderHighlightedText(item)}</li>)}
      </ul>
    );
    listItems = [];
  };

  const flushTable = () => {
    const rows = tableRows.filter((row) => !isTableSeparator(row));
    if (!rows.length) {
      tableRows = [];
      return;
    }

    const [header, ...body] = rows;
    nodes.push(
      <div key={`table-${nodes.length}`} className="notes-book-table-wrap overflow-x-auto">
        <table className="notes-book-table">
          <thead>
            <tr>
              {header.map((cell, index) => (
                <th key={`${cell}-${index}`}>{renderHighlightedText(cell)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`}>{renderHighlightedText(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
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
        flushTable();
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
      flushTable();
      nodes.push(<div key={`space-${nodes.length}`} className="h-2" />);
      return;
    }

    if (isTableLine(trimmed)) {
      flushList();
      tableRows.push(parseTableLine(trimmed));
      return;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushList();
      flushTable();
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
    flushTable();
    nodes.push(<p key={`p-${nodes.length}`}>{renderHighlightedText(trimmed)}</p>);
  });

  flushList();
  flushTable();
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
