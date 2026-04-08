import { readFile } from "fs/promises";
import pdfParse from "pdf-parse";

export interface ParsedQuoteLineItem {
  description: string;
  amount: number | null;
}

export interface ParsedQuoteDocument {
  text: string;
  contractorName?: string;
  companyName?: string;
  totalAmount?: number;
  lineItems: ParsedQuoteLineItem[];
  paymentTerms: string[];
  exclusions: string[];
  warnings: string[];
}

export async function extractQuoteDocument(filePath: string, fileType: string): Promise<ParsedQuoteDocument> {
  let text = "";

  if (fileType === "application/pdf") {
    const buffer = await readFile(filePath);
    const parsed = await pdfParse(buffer);
    text = parsed.text || "";
  } else if (["image/jpeg", "image/jpg", "image/png"].includes(fileType)) {
    // OCR not installed yet, so surface this explicitly instead of pretending analysis came from the file.
    throw new Error("Image quote OCR is not configured yet. Please upload a PDF quote for document-based analysis.");
  } else {
    throw new Error("Unsupported quote file type for parsing.");
  }

  if (!text.trim()) {
    throw new Error("Could not extract readable text from the uploaded quote.");
  }

  const normalized = normalizeText(text);
  return {
    text,
    contractorName: detectContractorName(normalized),
    companyName: detectCompanyName(normalized),
    totalAmount: detectTotalAmount(normalized),
    lineItems: detectLineItems(normalized),
    paymentTerms: detectPaymentTerms(normalized),
    exclusions: detectExclusions(normalized),
    warnings: detectWarnings(normalized),
  };
}

function normalizeText(text: string): string {
  return text.replace(/\r/g, "\n").replace(/\t/g, " ").replace(/[ ]{2,}/g, " ");
}

function detectContractorName(text: string): string | undefined {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const candidates = lines.slice(0, 12).filter(line => /[A-Za-z]/.test(line));
  return candidates.find(line => !/quote|invoice|renovation works|page\s+\d+/i.test(line));
}

function detectCompanyName(text: string): string | undefined {
  const match = text.match(/([A-Z][A-Za-z&.,'\- ]+(Pte Ltd|LLP|LLC|Construction|Renovation|Interiors|Design))/i);
  return match?.[1]?.trim();
}

function detectTotalAmount(text: string): number | undefined {
  const patterns = [
    /total(?:\s+amount)?[^\d$S]*([$S]?\s?[\d,]+(?:\.\d{2})?)/i,
    /grand\s+total[^\d$S]*([$S]?\s?[\d,]+(?:\.\d{2})?)/i,
    /net\s+total[^\d$S]*([$S]?\s?[\d,]+(?:\.\d{2})?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const value = parseCurrency(m[1]);
      if (value) return value;
    }
  }
  return undefined;
}

function detectLineItems(text: string): ParsedQuoteLineItem[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const items: ParsedQuoteLineItem[] = [];
  for (const line of lines) {
    if (/^(item|description|qty|quantity|unit|subtotal|total|grand total)/i.test(line)) continue;
    const moneyMatch = line.match(/([$S]?\s?[\d,]+(?:\.\d{2})?)(?!.*[$S]?\s?[\d,]+(?:\.\d{2})?)/);
    if (moneyMatch && /[A-Za-z]{3,}/.test(line)) {
      items.push({
        description: line.replace(moneyMatch[0], "").trim().replace(/^[-•\d.\s]+/, ""),
        amount: parseCurrency(moneyMatch[0]),
      });
    }
  }
  return items.slice(0, 20);
}

function detectPaymentTerms(text: string): string[] {
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(line => /deposit|payment|progress payment|final payment|upon completion/i.test(line))
    .slice(0, 10);
}

function detectExclusions(text: string): string[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const results = lines.filter(line => /exclude|excluding|not included|excludes/i.test(line));
  return results.slice(0, 10);
}

function detectWarnings(text: string): string[] {
  const warnings: string[] = [];
  if (!/warranty/i.test(text)) warnings.push("No clear warranty term found in the uploaded quote.");
  if (!/payment/i.test(text)) warnings.push("No clear payment schedule found in the uploaded quote.");
  if (!/scope|works|description/i.test(text)) warnings.push("Scope of work looks unclear or weakly specified.");
  return warnings;
}

function parseCurrency(raw: string): number | null {
  const cleaned = raw.replace(/[S$\s,]/g, "").trim();
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
