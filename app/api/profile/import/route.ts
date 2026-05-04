import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { auth } from "@/auth";
import { extractProfileImport } from "@/lib/profile-import/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 8 * 1024 * 1024;

async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File is too large. Upload an 8MB file or smaller.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.includes("pdf") || name.endsWith(".pdf")) {
    // Import lib path directly — the index.js reads a test file at load time causing ENOENT
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js" as any);
    const data = await (pdfParse as (buf: Buffer) => Promise<{ text: string }>)(buffer);
    return data.text;
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
