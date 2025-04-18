import fs from "fs";
import path from "path";

export const genImage = async (
  prompt: string,
  style: string,
  aspect_ratio: string,
  seed: string
) => {
  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("style", style);
    formData.append("aspect_ratio", aspect_ratio);
    formData.append("seed", seed);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${process.env.IMAGINE_API_KEY}`);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formData,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://api.vyro.ai/v2/image/generations",
        requestOptions
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response failed:", response.status, errorText);
        throw new Error(`Error: ${errorText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const folderPath = path.join(process.cwd(), "assets", "images");

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const filename = `image_${Date.now()}.png`;
      const filePath = path.join(folderPath, filename);

      await fs.promises.writeFile(filePath, buffer);
      console.log(`Image saved at: ${filePath}`);

      return { message: "Image saved successfully", filename, filePath };
    } catch (error) {
      console.error("Error generating image:", error);
      throw new Error("Error generating image");
    }
  } catch (err) {
    console.error("Error generating image:", err);
    throw new Error("Failed to generate image");
  }
};
