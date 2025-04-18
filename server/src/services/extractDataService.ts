import Mercury from "@postlight/mercury-parser";

export const extractData = async (inputData: string, type: string) => {
  try {
    if (!type) {
      throw new Error("Type is required");
    }

    switch (type) {
      case "link": {
        const data = await Mercury.parse(inputData, { contentType: "text" });
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
    }
  } catch (err) {
    console.error("Error extracting article:", err);
    throw new Error("Failed to extract article content");
  }
};
