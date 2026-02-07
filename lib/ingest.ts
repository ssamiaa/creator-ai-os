type PdfParseResult = {
  text?: string;
};

type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>;

export async function extractText(file: File): Promise<string> {
  const ab = await file.arrayBuffer();
  const buf = Buffer.from(ab);

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const mod = await import("pdf-parse");
    const pdfParse: PdfParseFn =
      "default" in mod ? (mod.default as PdfParseFn) : (mod as unknown as PdfParseFn);

    const data = await pdfParse(buf);
    return (data.text || "").trim();
  }

  const text = buf.toString("utf8");
  return text.trim();
}


export function chunkText(
  text: string,
  chunkSize = 1200,
  overlap = 200
): string[] {
  const clean = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  if (!clean) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    const end = Math.min(clean.length, start + chunkSize);
    const slice = clean.slice(start, end);

    chunks.push(slice);

    if (end === clean.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}
