import Mercury from "@postlight/mercury-parser";
import { PDFExtract } from "pdf.js-extract";

export const extractData = async (
  inputData: string | Buffer,
  type: string,
  file?: Buffer
) => {
  try {
    if (!type) {
      throw new Error("Type is required");
    }

    switch (type) {
      case "link": {
        const data = await Mercury.parse(inputData as string, {
          contentType: "text",
        });
        if (!data || !data.content) {
          throw new Error("No content extracted");
        }
        return {
          content: data.content
            .replace(/[\n\t]+/g, " ") // Remove newlines and tabs
            .replace(/\s+/g, " ") // Replace multiple spaces with a single space
            .trim(),
          url: inputData,
        };
      }
      case "pdf": {
        if (!inputData || !(inputData instanceof Buffer)) {
          throw new Error("PDF buffer is missing or invalid");
        }

        const pdfExtract = new PDFExtract();
        const result = await pdfExtract.extractBuffer(inputData); // ✅ no base64 here
        const content = result.pages
          .map((p) => p.content.map((item) => item.str).join(" "))
          .join("\n");

        return content;
      }
      case "text": {
        if (typeof inputData !== "string") {
          throw new Error("Text input must be a string");
        }
        return inputData;
      }

      default:
        throw new Error("Unsupported material type");
    }
  } catch (err) {
    console.error("Error extracting article:", err);
    throw new Error("Failed to extract article content");
  }
};
