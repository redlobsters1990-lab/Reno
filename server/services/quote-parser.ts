import { execFile } from "child_process";
import { promisify } from "util";
import Tesseract from "tesseract.js";

const execFileAsync = promisify(execFile);

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
  warrantyTerms: string[];
  materialsMentions: string[];
  timelineMentions: string[];
  warnings: string[];
  documentQuality: {
    hasTotalAmount: boolean;
    hasItemization: boolean;
    hasPaymentTerms: boolean;
    hasWarranty: boolean;
    hasExclusions: boolean;
  };
}

export async function extractQuoteDocument(filePath: string, fileType: string): Promise<ParsedQuoteDocument> {
  let text = "";

  if (fileType === "application/pdf") {
    text = await extractPdfTextViaPython(filePath);
  } else if (["image/jpeg", "image/jpg", "image/png"].includes(fileType)) {
    const result = await Tesseract.recognize(filePath, "eng", { logger: () => {} });
    text = result.data.text || "";
  } else {
    throw new Error("Unsupported quote file type for parsing.");
  }

  if (!text.trim()) {
    throw new Error("Could not extract readable text from the uploaded quote.");
  }

  const normalized = normalizeText(text);
  const totalAmount = detectTotalAmount(normalized);
  const lineItems = detectLineItems(normalized);
  const paymentTerms = detectPaymentTerms(normalized);
  const exclusions = detectExclusions(normalized);
  const warrantyTerms = detectWarrantyTerms(normalized);
  const materialsMentions = detectMaterials(normalized);
  const timelineMentions = detectTimeline(normalized);

  const documentQuality = {
    hasTotalAmount: !!totalAmount,
    hasItemization: lineItems.length >= 3,
    hasPaymentTerms: paymentTerms.length > 0,
    hasWarranty: warrantyTerms.length > 0,
    hasExclusions: exclusions.length > 0,
  };

  return {
    text,
    contractorName: detectContractorName(normalized),
    companyName: detectCompanyName(normalized),
    totalAmount,
    lineItems,
    paymentTerms,
    exclusions,
    warrantyTerms,
    materialsMentions,
    timelineMentions,
    warnings: detectWarnings(normalized, documentQuality),
    documentQuality,
  };
}

async function extractPdfTextViaPython(filePath: string): Promise<string> {
  const pythonCode = [
    "from pypdf import PdfReader",
    "import sys",
    "path = sys.argv[1]",
    "reader = PdfReader(path)",
    "texts = []",
    "for page in reader.pages:",
    "    texts.append(page.extract_text() or '')",
    "print(chr(10).join(texts))",
  ].join("\n");
  try {
    const { stdout, stderr } = await execFileAsync("python3", ["-c", pythonCode, filePath], {
      maxBuffer: 20 * 1024 * 1024,
    });
    if (stderr && stderr.trim()) {
      console.warn("PDF python parser stderr:", stderr);
    }
    return stdout || "";
  } catch (error: any) {
    throw new Error(`PDF text extraction failed: ${error?.stderr || error?.message || "Unknown error"}`);
  }
}

function normalizeText(text: string): string {
  return text.replace(/\r/g, "\n").replace(/\t/g, " ").replace(/[ ]{2,}/g, " ");
}
function detectContractorName(text: string): string | undefined {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  return lines.slice(0, 12).find(line => /[A-Za-z]/.test(line) && !/quote|invoice|page\s+\d+/i.test(line));
}
function detectCompanyName(text: string): string | undefined {
  const match = text.match(/([A-Z][A-Za-z&.,'\- ]+(Pte Ltd|LLP|LLC|Construction|Renovation|Interiors|Design))/i);
  return match?.[1]?.trim();
}
function detectTotalAmount(text: string): number | undefined {
  const patterns = [
    /grand\s+total[^\d$S]*([$S]?\s?[\d,]+(?:\.\d{2})?)/i,
    /total(?:\s+amount)?[^\d$S]*([$S]?\s?[\d,]+(?:\.\d{2})?)/i,
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
      const description = line.replace(moneyMatch[0], "").trim().replace(/^[-•\d.\s]+/, "");
      if (description.length >= 4) items.push({ description, amount: parseCurrency(moneyMatch[0]) });
    }
  }
  return items.slice(0, 25);
}
function detectPaymentTerms(text: string): string[] {
  return text.split("\n").map(l => l.trim()).filter(line => /deposit|payment|progress payment|final payment|upon completion|installment/i.test(line)).slice(0, 10);
}
function detectExclusions(text: string): string[] {
  return text.split("\n").map(l => l.trim()).filter(line => /exclude|excluding|not included|excludes/i.test(line)).slice(0, 10);
}
function detectWarrantyTerms(text: string): string[] {
  return text.split("\n").map(l => l.trim()).filter(line => /warranty|defect liability|guarantee/i.test(line)).slice(0, 10);
}
function detectMaterials(text: string): string[] {
  return text.split("\n").map(l => l.trim()).filter(line => /laminate|vinyl|tile|quartz|granite|plywood|glass|aluminium|paint/i.test(line)).slice(0, 10);
}
function detectTimeline(text: string): string[] {
  return text.split("\n").map(l => l.trim()).filter(line => /week|weeks|month|months|working days|timeline|completion/i.test(line)).slice(0, 10);
}
function detectWarnings(text: string, quality: ParsedQuoteDocument["documentQuality"]): string[] {
  const warnings: string[] = [];
  if (!quality.hasWarranty) warnings.push("No clear warranty term found in the uploaded quote.");
  if (!quality.hasPaymentTerms) warnings.push("No clear payment schedule found in the uploaded quote.");
  if (!quality.hasItemization) warnings.push("Scope of work looks weakly itemized.");
  if (!quality.hasTotalAmount) warnings.push("No clear total amount detected from the uploaded file.");
  return warnings;
}
function parseCurrency(raw: string): number | null {
  const cleaned = raw.replace(/[S$\s,]/g, "").trim();
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
