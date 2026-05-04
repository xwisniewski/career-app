import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { auth } from "@/auth";
import { extractProfileImport } from "@/lib/profile-import/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 8 * 1024 * 1024;

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Dynamic import + disable worker — avoids @napi-rs/canvas crash in serverless
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
      .join(" ");
    pages.push(pageText);
    page.cleanup();
  }

  await pdf.destroy();
  return pages.join("\n\n");
}

async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File is too large. Upload an 8MB file or smaller.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.includes("pdf") || name.endsWith(".pdf")) {
    return extractPdfText(buffer);
  }

  if (
    type.includes("wordprocessingml") ||
    type.includes("msword") ||
    name.endsWith(".docx") ||
    name.endsWith(".doc")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) {
    return buffer.toString("utf8");
  }

  throw new Error("Unsupported file type. Upload a PDF, DOCX, TXT, or paste text.");
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const pastedText = formData.get("text");
    const file = formData.get("file");

    const fileText = file instanceof File && file.size > 0 ? await extractTextFromFile(file) : "";
    const text =
      (typeof pastedText === "string" ? pastedText : "")
        .trim()
        .concat(fileText ? `\n\n${fileText}` : "")
        .trim();

    if (!text) {
      return NextResponse.json({ error: "Upload a file or paste profile text." }, { status: 400 });
    }

    const draft = await extractProfileImport(text);
    return NextResponse.json({ ok: true, draft });
  } catch (error) {
    console.error("[profile/import]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import profile." },
      { status: 500 }
    );
  }
}
