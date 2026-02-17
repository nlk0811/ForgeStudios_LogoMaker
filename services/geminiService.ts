
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private static ai: GoogleGenAI;

  private static getClient(): GoogleGenAI {
    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
    }
    return this.ai;
  }

  /**
   * Generates a new image from a text prompt.
   */
  static async generateImage(prompt: string): Promise<string | null> {
    const ai = this.getClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  }

  /**
   * Edits an image based on a text prompt.
   */
  static async editImage(base64Image: string, prompt: string): Promise<string | null> {
    const ai = this.getClient();
    
    const match = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image format");
    
    const mimeType = match[1];
    const data = match[2];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data, mimeType } },
            { text: `Instruction: ${prompt}. Apply this edit and return the image.` },
          ],
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Gemini Edit Error:", error);
      throw error;
    }
  }
}
