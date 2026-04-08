import { execFile } from "child_process";
import { promisify } from "util";
import Tesseract from "tesseract.js";

const execFileAsync = promisify(execFile);

// ── Parser limits ─────────────────────────────────────────────────────────────
const MAX_LINE_ITEMS             = 25;
const MAX_PAYMENT_TERMS          = 10;
const MAX_EXCLUSIONS             = 10;
const MAX_WARRANTY_TERMS         = 10;
const MAX_MATERIALS              = 10;
const MAX_TIMELINE_MENTIONS      = 10;
const CONTRACTOR_NAME_SCAN_LINES = 20;
const CONTRACTOR_NAME_FALLBACK_LINES = 12;
const MIN_DESCRIPTION_LENGTH     = 4;
const MIN_ITEMIZATION_COUNT      = 3;
const QUOTE_AMOUNT_MIN           = 500;
const QUOTE_AMOUNT_MAX           = 2_000_000;
const PDF_MAX_BUFFER_BYTES       = 20 * 1024 * 1024;
const PDF_TIMEOUT_MS             = 30_000;
const MATERIAL_KEYWORDS  = /laminate|vinyl|tile|quartz|granite|plywood|glass|aluminium|paint/i;
const TIMELINE_KEYWORDS  = /week|weeks|month|months|working days|timeline|completion/i;
const EXCLUSION_KEYWORDS = /exclude|excluding|not included|excludes/i;
const PAYMENT_KEYWORDS   = /deposit|payment|progress payment|final payment|upon completion|installment/i;
const WARRANTY_KEYWORDS  = /warranty|defect liability|guarantee/i;
const LINE_ITEM_HEADER_PATTERN = /^(item|description|qty|quantity|unit|subtotal|total|grand total)/i;
// Recognised legal entity and trade suffixes for company name detection
const COMPANY_SUFFIX_PATTERN   = /Pte Ltd|LLP|LLC|Construction|Renovation|Interiors|Design/i;

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
    hasItemization: lineItems.length >= MIN_ITEMIZATION_COUNT,
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

async function checkPythonDeps(): Promise<boolean> {
  try {
    await execFileAsync("python3", ["-c", "import pypdf; import sys; sys.exit(0)"]);
    return true;
  } catch {
    return false;
  }
}

async function extractPdfTextViaPython(filePath: string): Promise<string> {
  const hasDeps = await checkPythonDeps();
  if (!hasDeps) {
    console.warn("python3/pypdf not available — falling back to OCR for PDF");
    // Fall back to Tesseract OCR on the PDF (requires pdftoppm or similar, best-effort)
    try {
      const result = await Tesseract.recognize(filePath, "eng", { logger: () => {} });
      return result.data.text || "";
    } catch (ocrErr) {
      throw new Error("PDF extraction failed: python3/pypdf not installed and OCR fallback also failed.");
    }
  }

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
      maxBuffer: PDF_MAX_BUFFER_BYTES,
      timeout: PDF_TIMEOUT_MS,
    });
    if (stderr && stderr.trim()) {
      console.warn("PDF python parser stderr:", stderr);
    }
    const text = stdout?.trim() || "";
    if (!text) {
      // PDF may be image-based — fall back to Tesseract
      console.warn("pypdf returned empty text — falling back to OCR");
      const result = await Tesseract.recognize(filePath, "eng", { logger: () => {} });
      return result.data.text || "";
    }
    return text;
  } catch (error: any) {
    // On failure, try OCR as last resort
    console.warn("pypdf extraction failed, trying OCR fallback:", error?.message);
    try {
      const result = await Tesseract.recognize(filePath, "eng", { logger: () => {} });
      return result.data.text || "";
    } catch {
      throw new Error(`PDF text extraction failed: ${error?.stderr || error?.message || "Unknown error"}`);
    }
  }
}

function normalizeText(text: string): string {
  return text.replace(/\r/g, "\n").replace(/\t/g, " ").replace(/[ ]{2,}/g, " ");
}
function detectContractorName(text: string): string | undefined {
  // First, look for explicit "prepared by", "contact", "from" labels near the top
  const explicit = text.match(/(?:prepared by|submitted by|from|contact|sales rep)[:\s]+([A-Za-z][A-Za-z\s]{2,40}?)(?:\n|\r|,|\.|$)/i);
  if (explicit?.[1]?.trim()) return explicit[1].trim();

  // Look for a line near a phone/email which is likely the contact name
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const nearby = lines.slice(Math.max(0, i - 2), i + 3).join(" ");
    if (/\b[689]\d{7}\b|@[a-zA-Z]/.test(nearby)) {
      const candidate = lines[i];
      if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(candidate) && candidate.length < 50) {
        return candidate;
      }
    }
  }

  // Fall back: first non-header, non-title line in top 12 lines
  return lines.slice(0, 12).find(
    line =>
      /[A-Za-z]/.test(line) &&
      !/quote|invoice|page\s+\d+|quotation|proposal|renovation|to whom|attn|date:|ref:/i.test(line) &&
      line.length < 60
  );
}
function detectCompanyName(text: string): string | undefined {
  // COMPANY_SUFFIX_PATTERN lists recognised legal entity and trade suffixes
  const match = text.match(new RegExp(
    '([A-Z][A-Za-z&.,\'\\-\\s]+(' + COMPANY_SUFFIX_PATTERN.source + '))', 'i'
  ));
  return match?.[1]?.trim();
}
function detectTotalAmount(text: string): number | undefined {
  const patterns = [
    /grand\s+total[^\d$S]*(SGD|S\$|\$)?\s?([\d,]+(?:\.\d{2})?)/i,
    /total(?:\s+amount)?[^\d$S]*(SGD|S\$|\$)?\s?([\d,]+(?:\.\d{2})?)/i,
    /net\s+total[^\d$S]*(SGD|S\$|\$)?\s?([\d,]+(?:\.\d{2})?)/i,
    /amount\s+due[^\d$S]*(SGD|S\$|\$)?\s?([\d,]+(?:\.\d{2})?)/i,
    /payable[^\d$S]*(SGD|S\$|\$)?\s?([\d,]+(?:\.\d{2})?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    const raw = m?.[2];
    if (raw) {
      const value = parseCurrency(raw);
      // Sanity check: renovation quotes in SGD are typically between $500 and $2,000,000
      if (value && value >= QUOTE_AMOUNT_MIN && value <= QUOTE_AMOUNT_MAX) return value;
    }
  }
  return undefined;
}
function detectLineItems(text: string): ParsedQuoteLineItem[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const items: ParsedQuoteLineItem[] = [];
  for (const line of lines) {
    if (LINE_ITEM_HEADER_PATTERN.test(line)) continue;
    const moneyMatch = line.match(/([$S]?\s?[\d,]+(?:\.\d{2})?)(?!.*[$S]?\s?[\d,]+(?:\.\d{2})?)/);
    if (moneyMatch && /[A-Za-z]{3,}/.test(line)) {
      const description = line.replace(moneyMatch[0], "").trim().replace(/^[-•\d.\s]+/, "");
      if (description.length >= MIN_DESCRIPTION_LENGTH) items.push({ description, amount: parseCurrency(moneyMatch[0]) });
    }
  }
  return items.slice(0, MAX_LINE_ITEMS);
}
function detectPaymentTerms(text: string): string[] {
  return text.split("\n").map(l => l.trim()).filter(line => PAYMENT_KEYWORDS.test(line)).slice(0, MAX_PAYMENT_TERMS);
}
function detectExclusions(text: string): string[] {
  return text.split("\n").map(l => l.trim()).filter(line => EXCLUSION_KEYWORDS.test(line)).slice(0, MAX_EXCLUSIONS);
}
function detectWarrantyTerms(text: string): string[] {
  return text.split("\n").map(l => l.trim()).filter(line => WARRANTY_KEYWORDS.test(line)).slice(0, MAX_WARRANTY_TERMS);
}
function detectMaterials(text: string): string[] {
  return text.split("\n").map(l => l.trim()).filter(line => MATERIAL_KEYWORDS.test(line)).slice(0, MAX_MATERIALS);
}
function detectTimeline(text: string): string[] {
  return text.split("\n").map(l => l.trim()).filter(line => TIMELINE_KEYWORDS.test(line)).slice(0, MAX_TIMELINE_MENTIONS);
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
  // Strip SGD prefix, S$, $, spaces, and commas
  const cleaned = raw.replace(/SGD/gi, "").replace(/[S$\s,]/g, "").trim();
  const value = Number(cleaned);
  return Number.isFinite(value) && value > 0 ? value : null;
}
