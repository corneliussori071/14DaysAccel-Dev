import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize a plain-text user input string.
 * Strips all HTML tags and attributes, returning only safe text content.
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/**
 * Validate and sanitize an email address.
 * Returns the cleaned lowercase email or null if invalid.
 */
export function sanitizeEmail(input: string): string | null {
  if (!input) return null;
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
    .trim()
    .toLowerCase()
    .slice(0, 320);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return EMAIL_REGEX.test(cleaned) ? cleaned : null;
}

/**
 * Validate a display name.
 * Returns the cleaned name or null if invalid (empty or too short).
 */
export function sanitizeName(input: string): string | null {
  if (!input) return null;
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
    .trim()
    .slice(0, 200);

  return cleaned.length >= 1 ? cleaned : null;
}

/** Allowed MIME types for public media uploads. */
export const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/** Allowed MIME types for source code archives. */
export const ALLOWED_SOURCE_CODE_TYPES = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/gzip",
  "application/x-gzip",
  "application/x-tar",
  "application/x-compressed-tar",
]);

/** Allowed MIME types for supplementary files. */
export const ALLOWED_SUPPLEMENTARY_TYPES = new Set([
  ...ALLOWED_SOURCE_CODE_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file before upload.
 * Checks MIME type against the allowed set and enforces max size.
 * Also rejects files with suspicious double extensions.
 */
export function validateFile(
  file: File,
  allowedTypes: Set<string>,
  maxSizeBytes: number
): FileValidationResult {
  if (!file || !file.name) {
    return { valid: false, error: "Invalid file" };
  }

  // Reject suspicious double extensions (e.g., file.jpg.exe)
  const nameParts = file.name.split(".");
  const suspiciousExtensions = new Set([
    "exe", "bat", "cmd", "com", "msi", "scr", "pif", "vbs", "vbe",
    "js", "jse", "ws", "wsf", "wsc", "wsh", "ps1", "ps2", "psc1",
    "psc2", "reg", "inf", "lnk", "cpl", "hta",
  ]);
  if (nameParts.length > 2) {
    const secondToLast = nameParts[nameParts.length - 2].toLowerCase();
    if (suspiciousExtensions.has(secondToLast)) {
      return { valid: false, error: "File has a suspicious double extension" };
    }
  }
  const lastExt = nameParts[nameParts.length - 1].toLowerCase();
  if (suspiciousExtensions.has(lastExt)) {
    return { valid: false, error: `File type .${lastExt} is not allowed` };
  }

  if (!allowedTypes.has(file.type)) {
    return { valid: false, error: `File type ${file.type || "unknown"} is not allowed` };
  }

  if (file.size > maxSizeBytes) {
    const maxMB = Math.round(maxSizeBytes / (1024 * 1024));
    return { valid: false, error: `File exceeds maximum size of ${maxMB}MB` };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  return { valid: true };
}
