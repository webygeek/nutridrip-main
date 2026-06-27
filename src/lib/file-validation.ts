// File upload validation for lab reports and other uploads
// Enforces type, size, and basic security checks

export const ALLOWED_FILE_TYPES = {
  pdf: "application/pdf",
  png: "image/png",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
} as const;

export const ALLOWED_MIME_TYPES = Object.values(ALLOWED_FILE_TYPES);

export const MAX_FILE_SIZES = {
  labReport: 5 * 1024 * 1024, // 5MB
  profileImage: 2 * 1024 * 1024, // 2MB
  contentImage: 1 * 1024 * 1024, // 1MB
} as const;

export type FileType = keyof typeof ALLOWED_FILE_TYPES;
export type UploadCategory = keyof typeof MAX_FILE_SIZES;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: FileType;
  mimeType?: string;
  size?: number;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

/**
 * Detect file type from extension
 */
export function detectFileType(filename: string): FileType | null {
  const ext = getFileExtension(filename);
  const typeMap: Record<string, FileType> = {
    pdf: "pdf",
    png: "png",
    jpg: "jpeg",
    jpeg: "jpeg",
  };
  return typeMap[ext] || null;
}

/**
 * Validate a file for upload
 */
export function validateFile(
  file: { name: string; size: number; type: string },
  category: UploadCategory = "labReport"
): FileValidationResult {
  // Check file extension
  const fileType = detectFileType(file.name);
  if (!fileType) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${Object.keys(ALLOWED_FILE_TYPES).join(", ")}`,
    };
  }

  // Check MIME type matches extension
  const expectedMimeType = ALLOWED_FILE_TYPES[fileType];
  if (file.type && file.type !== expectedMimeType) {
    return {
      valid: false,
      error: "File content doesn't match its extension",
    };
  }

  // Check file size
  const maxSize = MAX_FILE_SIZES[category];
  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxMB}MB`,
    };
  }

  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return {
    valid: true,
    fileType,
    mimeType: expectedMimeType,
    size: file.size,
  };
}

/**
 * Validate lab report upload
 */
export function validateLabUpload(file: {
  name: string;
  size: number;
  type: string;
}): FileValidationResult {
  return validateFile(file, "labReport");
}

/**
 * Validate profile image upload
 */
export function validateProfileImage(file: {
  name: string;
  size: number;
  type: string;
}): FileValidationResult {
  return validateFile(file, "profileImage");
}

/**
 * Generate a safe filename for storage
 * Preserves extension, randomizes the name to prevent overwrites and path traversal
 */
export function generateSafeFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const ext = getFileExtension(originalName);
  const baseName = `upload_${timestamp}_${random}`;

  return ext ? `${baseName}.${ext}` : baseName;
}

/**
 * Validate filename doesn't contain path traversal attempts
 */
export function isFilenameSafe(filename: string): boolean {
  // Disallow path separators and parent directory references
  const dangerousPatterns = [
    /\\/g,           // Backslash (Windows path)
    /\.\./g,         // Parent directory
    /^\./g,          // Hidden file
    /\/$/g,          // Trailing slash
    /[<>:"'|?*]/g,   // Invalid Windows characters
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(filename));
}

/**
 * Sanitize filename for display (not storage)
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components, keep only the basename
  return filename.split(/[\\/]/).pop() || filename;
}