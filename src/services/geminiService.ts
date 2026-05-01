import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeFabric(base64Image: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: "Analyze this dress fabric material. Describe its pattern, color palette, and suggest 3 traditional Indian attire styles (e.g., Anarkali, Lehenga Choli, Salwar Suit) that would look elegant with this fabric. Provide the output in JSON format with fields: description, suggestedStyles (array), and dominantColors (array).",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini fabric analysis error:", error);
    throw error;
  }
}

// Simulated Virtual Try-on: In a real production app, we would use a specialized Image-to-Image model.
// Here we generate a high-fidelity description and return a 'mock' rendered image URL for the demo.
export async function simulateVirtualTryOn(fabricBase64: string, attireType: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: fabricBase64,
            },
          },
          {
            text: `Imagine this fabric being worn by an Indian model in a ${attireType} style. Describe the final high-fashion look in detail, focusing on how the drape and pattern complement the model's silhouette. Return a JSON with: detailedDescription, and stylingTips.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini try-on simulation error:", error);
    throw error;
  }
}
