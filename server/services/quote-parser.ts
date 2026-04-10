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
    try {
      text = await extractPdfTextViaPython(filePath);
    } catch (error: any) {
      throw new Error(
        `Failed to extract text from PDF. ` +
        `This may be due to: (1) PDF is scanned/image-based (not searchable text), ` +
        `(2) PDF is password-protected, (3) PDF is corrupted, or (4) handwriting. ` +
        `\n\n**ADVICE**: Please provide a searchable PDF or clear photo. ` +
        `For scanned PDFs, use OCR software first or upload as clear JPG/PNG.`
      );
    }
  } else if (["image/jpeg", "image/jpg", "image/png"].includes(fileType)) {
    try {
      const result = await Tesseract.recognize(filePath, "eng", { logger: () => {} });
      text = result.data.text || "";
    } catch (error: any) {
      throw new Error(
        `Failed to read text from image. ` +
        `This may be due to: (1) Poor image quality, (2) Handwriting, (3) Complex layout, ` +
        `(4) Low contrast text. ` +
        `\n\n**ADVICE**: Upload a clearer photo with good lighting, flat surface, ` +
        `and readable text. Avoid handwritten quotes.`
      );
    }
  } else {
    throw new Error(
      `Unsupported file type: ${fileType}. ` +
      `\n\n**ADVICE**: Supported formats: PDF, JPG, PNG. ` +
      `For Word/Excel files, save as PDF first.`
    );
  }

  if (!text.trim()) {
    throw new Error(
      `Extracted text is empty or unreadable. ` +
      `\n\n**ADVICE**: This usually means the document is: ` +
      `(1) Scanned PDF without OCR, (2) Image with poor OCR results, ` +
      `(3) Password-protected PDF, (4) Corrupted file. ` +
      `\n\n**NEXT STEPS**: ` +
      `1. Convert scanned PDF to searchable PDF using Adobe Acrobat or online OCR. ` +
      `2. Upload a clearer photo of the quote. ` +
      `3. If PDF is password-protected, remove password before uploading. ` +
      `4. Ask contractor for a digital copy (not scanned).`
    );
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
  
  // Helper to check if an amount looks like a valid line item amount
  function isValidLineItemAmount(amountStr: string, parsedValue: number): boolean {
    // 1. Check if amount has currency symbol or is a reasonable line item amount
    const hasCurrencySymbol = /[S$]/.test(amountStr);
    const hasDecimal = /\.\d{2}/.test(amountStr);
    
    // 2. Exclude 6-digit numbers without currency symbols (likely postal codes)
    const isSixDigits = /^\d{6}$/.test(amountStr.replace(/[,$]/g, ''));
    if (isSixDigits && !hasCurrencySymbol && !hasDecimal) {
      return false; // Likely postal code, not amount
    }
    
    // 3. Amount must be within reasonable bounds for a line item
    //    Too small: < $10 (could be quantity or unit price)
    //    Too large: > $500,000 (unlikely for single line item in residential renovation)
    if (parsedValue < 10 || parsedValue > 500000) {
      return false;
    }
    
    // 4. If no currency symbol and no decimal, require additional validation
    if (!hasCurrencySymbol && !hasDecimal) {
      // Amounts without $/SGD and without .XX need extra scrutiny
      // Check if amount is followed by common price terms
      const amountPattern = amountStr.replace(/[,$]/g, '');
      const afterAmount = text.substring(text.indexOf(amountPattern) + amountPattern.length);
      const hasPriceContext = /\s*(?:SGD|\$|dollars|only|\+gst|incl gst)/i.test(afterAmount);
      if (!hasPriceContext) {
        return false;
      }
    }
    
    return true;
  }
  
  for (const line of lines) {
    if (LINE_ITEM_HEADER_PATTERN.test(line)) continue;
    
    // Improved regex: capture amount with better context
    // Looks for: $1,234.56 or SGD 1,234.56 or 1,234.56 (with decimal) or $1,234 (no decimal but has $)
    const moneyMatch = line.match(/(?:SGD\s*)?(?:\$\s*)?([\d,]+(?:\.\d{2})?)(?!.*(?:SGD\s*)?(?:\$\s*)?[\d,]+(?:\.\d{2})?)/i);
    
    if (moneyMatch && /[A-Za-z]{3,}/.test(line)) {
      const fullMatch = moneyMatch[0]; // Includes currency symbol if present
      const amountStr = moneyMatch[1]; // Just the numeric part
      const parsedAmount = parseCurrency(fullMatch);
      
      if (parsedAmount && isValidLineItemAmount(fullMatch, parsedAmount)) {
        const description = line.replace(fullMatch, "").trim().replace(/^[-•\d.\s]+/, "");
        if (description.length >= MIN_DESCRIPTION_LENGTH) {
          items.push({ description, amount: parsedAmount });
        }
      }
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
