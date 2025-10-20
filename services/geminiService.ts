
import { GoogleGenAI, Type } from '@google/genai';
import { type FoodEntry } from '../types';

const JSON_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      foodItem: {
        type: Type.STRING,
        description: 'Name of the food item.',
      },
      quantity: {
        type: Type.STRING,
        description: 'Quantity of the food item (e.g., "1 slice", "100g").',
      },
      calories: {
        type: Type.INTEGER,
        description: 'Estimated calories for the item.',
      },
      protein: {
        type: Type.INTEGER,
        description: 'Estimated protein in grams.',
      },
      carbs: {
        type: Type.INTEGER,
        description: 'Estimated carbohydrates in grams.',
      },
      fats: {
        type: Type.INTEGER,
        description: 'Estimated fat in grams.',
      },
      healthRating: {
        type: Type.INTEGER,
        description: 'A health rating from 1 (unhealthy) to 10 (very healthy), considering processing, sugar, and nutrients.'
      },
    },
    required: ['foodItem', 'quantity', 'calories', 'protein', 'carbs', 'fats', 'healthRating'],
  },
};

const SYSTEM_INSTRUCTION = `You are a nutritional expert AI. Your task is to analyze a user's description or image of a meal and return a structured JSON object containing a list of food items with their nutritional information. Be as accurate as possible. If a quantity isn't specified, make a reasonable estimate based on common portion sizes. Your response MUST conform to the provided JSON schema.`;

const getClient = (apiKey: string) => new GoogleGenAI({ apiKey });

export const analyzeText = async (text: string, apiKey: string) => {
  if (!apiKey) throw new Error("API Key is not configured.");
  const ai = getClient(apiKey);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [{ text }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: JSON_SCHEMA,
    },
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Could not analyze the food entry. The model returned an invalid format.");
  }
};

export const analyzeImage = async (base64Image: string, mimeType: string, apiKey: string, prompt: string = "Analyze this meal.") => {
  if (!apiKey) throw new Error("API Key is not configured.");
  const ai = getClient(apiKey);

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  const textPart = {
    text: prompt,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [imagePart, textPart] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: JSON_SCHEMA,
    },
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse Gemini response from image:", response.text);
    throw new Error("Could not analyze the image. The model returned an invalid format.");
  }
};

export const getNutritionalFeedback = async (entries: FoodEntry[], apiKey: string) => {
    if (!apiKey) throw new Error("API Key is not configured.");
    const ai = getClient(apiKey);
    
    const mealDetails = entries.map(e => `${e.quantity} of ${e.foodItem} (${e.calories} kcal)`).join(', ');
    const prompt = `I just ate the following meal: ${mealDetails}. Give me one brief, actionable, and encouraging piece of nutritional feedback in a single sentence. For example, mention if it's a good source of protein, high in sugar, or suggest a simple improvement for next time.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text.trim();
};
