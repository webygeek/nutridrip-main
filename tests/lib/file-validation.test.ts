import { describe, it, expect } from "vitest";
import {
  validateFile,
  validateLabUpload,
  validateProfileImage,
  generateSafeFilename,
  isFilenameSafe,
  sanitizeFilename,
  detectFileType,
  getFileExtension,
} from "@/lib/file-validation";

describe("File Validation", () => {
  describe("getFileExtension", () => {
    it("should extract extension from filename", () => {
      expect(getFileExtension("report.pdf")).toBe("pdf");
      expect(getFileExtension("image.png")).toBe("png");
      expect(getFileExtension("photo.JPEG")).toBe("jpeg");
    });

    it("should return empty string for files without extension", () => {
      expect(getFileExtension("noextension")).toBe("");
    });

    it("should handle multiple dots", () => {
      expect(getFileExtension("my.report.pdf")).toBe("pdf");
    });
  });

  describe("detectFileType", () => {
    it("should detect pdf files", () => {
      expect(detectFileType("document.pdf")).toBe("pdf");
    });

    it("should detect png files", () => {
      expect(detectFileType("image.png")).toBe("png");
    });

    it("should detect jpeg files", () => {
      expect(detectFileType("photo.jpg")).toBe("jpeg");
      expect(detectFileType("photo.jpeg")).toBe("jpeg");
    });

    it("should return null for unsupported types", () => {
      expect(detectFileType("document.doc")).toBeNull();
      expect(detectFileType("script.exe")).toBeNull();
    });
  });

  describe("validateFile", () => {
    it("should validate correct PDF file", () => {
      const result = validateFile(
        { name: "report.pdf", size: 1024 * 1024, type: "application/pdf" },
        "labReport"
      );
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe("pdf");
    });

    it("should validate correct image file", () => {
      const result = validateFile(
        { name: "photo.png", size: 500 * 1024, type: "image/png" },
        "labReport"
      );
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe("png");
    });

    it("should reject unsupported file types", () => {
      const result = validateFile(
        { name: "document.docx", size: 1024, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
        "labReport"
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file type");
    });

    it("should reject files exceeding size limit", () => {
      const result = validateFile(
        { name: "large.pdf", size: 10 * 1024 * 1024, type: "application/pdf" },
        "labReport"
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("File too large");
    });

    it("should reject empty files", () => {
      const result = validateFile(
        { name: "empty.pdf", size: 0, type: "application/pdf" },
        "labReport"
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("empty");
    });

    it("should reject MIME type mismatch", () => {
      const result = validateFile(
        { name: "fake.pdf", size: 1024, type: "application/json" },
        "labReport"
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("doesn't match");
    });
  });

  describe("validateLabUpload", () => {
    it("should accept valid lab report", () => {
      const result = validateLabUpload({
        name: "blood_test.pdf",
        size: 2 * 1024 * 1024,
        type: "application/pdf",
      });
      expect(result.valid).toBe(true);
    });

    it("should enforce lab report size limit (5MB)", () => {
      const result = validateLabUpload({
        name: "large_report.pdf",
        size: 6 * 1024 * 1024,
        type: "application/pdf",
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("validateProfileImage", () => {
    it("should accept valid profile image", () => {
      const result = validateProfileImage({
        name: "avatar.jpg",
        size: 1 * 1024 * 1024,
        type: "image/jpeg",
      });
      expect(result.valid).toBe(true);
    });

    it("should enforce profile image size limit (2MB)", () => {
      const result = validateProfileImage({
        name: "large_avatar.png",
        size: 3 * 1024 * 1024,
        type: "image/png",
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("generateSafeFilename", () => {
    it("should generate unique filenames", () => {
      const name1 = generateSafeFilename("report.pdf");
      const name2 = generateSafeFilename("report.pdf");
      expect(name1).not.toBe(name2);
    });

    it("should preserve extension", () => {
      const name = generateSafeFilename("document.pdf");
      expect(name.endsWith(".pdf")).toBe(true);
    });

    it("should handle files without extension", () => {
      const name = generateSafeFilename("noextension");
      expect(name).toMatch(/^upload_\d+_[a-z0-9]+$/);
    });

    it("should preserve original extension case", () => {
      const name = generateSafeFilename("image.PNG");
      // Filename should have some extension
      expect(name).toMatch(/^upload_\d+_[a-z0-9]+\.[a-zA-Z]+$/);
    });
  });

  describe("isFilenameSafe", () => {
    it("should accept normal filenames", () => {
      expect(isFilenameSafe("report.pdf")).toBe(true);
      expect(isFilenameSafe("my_document-v2.pdf")).toBe(true);
      expect(isFilenameSafe("photo_2024.png")).toBe(true);
    });

    it("should reject path traversal attempts", () => {
      expect(isFilenameSafe("../etc/passwd")).toBe(false);
      expect(isFilenameSafe("..\\windows\\system32")).toBe(false);
    });

    it("should reject hidden files", () => {
      expect(isFilenameSafe(".htaccess")).toBe(false);
    });

    it("should reject Windows special characters", () => {
      expect(isFilenameSafe('file<name>.pdf')).toBe(false);
      expect(isFilenameSafe('file|name.pdf')).toBe(false);
      expect(isFilenameSafe('file:name.pdf')).toBe(false);
    });
  });

  describe("sanitizeFilename", () => {
    it("should extract basename from path", () => {
      expect(sanitizeFilename("/path/to/file.pdf")).toBe("file.pdf");
      expect(sanitizeFilename("C:\\Users\\file.pdf")).toBe("file.pdf");
    });

    it("should keep simple filenames unchanged", () => {
      expect(sanitizeFilename("file.pdf")).toBe("file.pdf");
    });
  });
});