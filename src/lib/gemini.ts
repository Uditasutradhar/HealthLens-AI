import { GoogleGenAI } from "@google/genai";

// Prefer VITE_ prefixed env var for local Vite development, 
// fallback to process.env for the AI Studio environment.
const apiKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) ||
  "";

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. Please check your .env file or AI Studio secrets.");
}

export const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export const ANALYZER_MODEL = "gemini-3.7-flash";
export const CHAT_MODEL = "gemini-3.7-flash";

export async function fileToGenerativePart(file: File) {
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result) {
        const base64 = result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type || "image/jpeg",
    },
  };
}
