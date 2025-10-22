
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = "${API_KEY}";

if (!API_KEY || API_KEY.startsWith('$')) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const translateText = async (text, sourceLang) => {
  if (!API_KEY || API_KEY.startsWith('$')) {
    // Return mock data if API key is not available
    console.log("Gemini API key not found, returning mock translation.");
    return {
      ru: sourceLang === 'ru' ? text : `[RU] ${text}`,
      en: sourceLang === 'en' ? text : `[EN] ${text}`,
      sr: sourceLang === 'sr' ? text : `[SR] ${text}`,
    };
  }

  const prompt = `Translate the following text from Serbian into Russian and English.
Text: "${text}"
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ru: {
              type: Type.STRING,
              description: "The Russian translation."
            },
            en: {
              type: Type.STRING,
              description: "The English translation."
            }
          },
          required: ["ru", "en"]
        },
      },
    });

    const jsonString = response.text.trim();
    const translated = JSON.parse(jsonString);
    
    return {
      ru: translated.ru,
      en: translated.en,
      sr: text, // Keep original serbian text
    };

  } catch (error) {
    console.error("Error translating text with Gemini API:", error);
    // Fallback to mock translation on error
    return {
      ru: `[RU-ERR] ${text}`,
      en: `[EN-ERR] ${text}`,
      sr: text,
    };
  }
};
