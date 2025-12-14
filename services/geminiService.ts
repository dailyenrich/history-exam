import { GoogleGenAI, Type, Schema } from "@google/genai";
import { HistoryQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING, description: "The historical event, person, or period." },
    description: { type: Type.STRING, description: "A brief prompt for the player." },
    correctItems: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 5 correct associated terms, people, or events.",
      minItems: 5,
      maxItems: 5
    },
    distractorItems: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 5 incorrect/unrelated terms from other historical periods.",
      minItems: 5,
      maxItems: 5
    }
  },
  required: ["topic", "correctItems", "distractorItems"]
};

const batchSchema: Schema = {
  type: Type.ARRAY,
  items: questionSchema
};

export const generateQuestions = async (count: number = 3, startLevel: number = 1): Promise<HistoryQuestion[]> => {
  try {
    // Determine difficulty and language based on level
    let systemInstruction = "";
    let userPrompt = "";

    if (startLevel <= 30) {
      // Levels 1-30: Strict Chinese History, Simplified Chinese Only
      systemInstruction = `You are an expert Chinese History teacher for Junior High School students. 
      Create ${count} distinct history puzzles about **Chinese History** (Ancient to Modern).
      
      CRITICAL RULE: All output (topics, descriptions, items) MUST be in **SIMPLIFIED CHINESE**. Do NOT use English.
      
      For each puzzle:
      1. Focus on one specific topic (e.g., "贞观之治", "辛亥革命", "孔子").
      2. Provide exactly 5 correct keywords directly related to it.
      3. Provide exactly 5 plausible but incorrect keywords (distractors) from other periods.
      4. Ensure the difficulty is suitable for a middle school student.
      
      Return strictly JSON.`;
      
      userPrompt = `Generate ${count} unique Chinese history quiz questions in Simplified Chinese.`;
    } else {
      // Levels 31+: Advanced/Global History, English Allowed
      systemInstruction = `You are an expert History Professor. 
      Create ${count} challenging history puzzles.
      
      Since the player has reached level ${startLevel}, you may now include:
      1. **World History** topics (e.g., French Revolution, Industrial Revolution).
      2. **English Language** content (topics and items can be in English to test bilingual history knowledge).
      
      For each topic, provide exactly 5 correct keywords and 5 distractors.
      Return strictly JSON.`;

      userPrompt = `Generate ${count} challenging history quiz questions (Chinese or World history, English allowed).`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: batchSchema,
        systemInstruction: systemInstruction,
      },
      contents: [
        { text: userPrompt }
      ]
    });

    const rawData = response.text;
    if (!rawData) return [];

    const parsedData = JSON.parse(rawData);
    
    // Add IDs
    return parsedData.map((q: any, index: number) => ({
      ...q,
      id: `gen-${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Failed to generate questions:", error);
    return [];
  }
};
