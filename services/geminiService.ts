const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

interface GeminiInlineData {
  mimeType?: string;
  data?: string;
}

interface GeminiPartResponse {
  text?: string;
  inlineData?: GeminiInlineData;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPartResponse[];
    };
  }>;
  error?: {
    message?: string;
  };
}

export class GeminiService {
  private static getApiKey(): string {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
      throw new Error('Missing VITE_GEMINI_API_KEY. Add it in .env.local (local) or Vercel project env vars.');
    }
    return key;
  }

  private static async generate(parts: GeminiPart[]): Promise<string | null> {
    const apiKey = this.getApiKey();

    const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    const result = (await response.json()) as GeminiResponse;

    if (!response.ok) {
      throw new Error(result.error?.message || 'Gemini request failed');
    }

    const responseParts = result.candidates?.[0]?.content?.parts || [];
    for (const part of responseParts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    return null;
  }

  static async generateLogo(prompt: string): Promise<string | null> {
    return this.generate([{ text: prompt }]);
  }

  static async editLogo(base64Image: string, instruction: string): Promise<string | null> {
    const match = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid image format.');
    }

    const mimeType = match[1];
    const data = match[2];

    return this.generate([
      { text: `Edit this logo image. Instruction: ${instruction}. Keep it clean, logo-like, and high contrast.` },
      { inline_data: { mime_type: mimeType, data } },
    ]);
  }
}
