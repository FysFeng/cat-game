import { GoogleGenAI, Type } from "@google/genai";
import { Biome, Dish, RandomEvent, GameState } from "../types";

// Safe API Key access that works in browser environments without strict process polyfills
const getApiKey = () => {
  try {
    // Check if process is defined (Node/Vite/Webpack)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

// Model to use for text generation
const MODEL_NAME = "gemini-3-flash-preview";

export const generateSpecialMenu = async (biome: Biome): Promise<Dish> => {
  if (!apiKey) {
    console.warn("No API Key found. Using fallback menu.");
    return {
      id: `special_fallback_${Date.now()}`,
      name: "Local Special",
      icon: "🥘",
      basePrice: 20,
      description: "A delicious local dish (AI Offline).",
      prepTime: 3000,
      isSpecial: true,
    };
  }

  try {
    const prompt = `Create a special dish for a cat snack bar located in the ${biome.type} (${biome.name}). 
    Return a JSON object with: name (string), icon (single emoji), description (short string), basePrice (number 20-50).`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            icon: { type: Type.STRING },
            description: { type: Type.STRING },
            basePrice: { type: Type.NUMBER },
          },
          required: ["name", "icon", "description", "basePrice"],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    
    return {
      id: `special_${Date.now()}`,
      name: data.name || "Mystery Dish",
      icon: data.icon || "🥘",
      basePrice: data.basePrice || 25,
      description: data.description || "A special local delicacy.",
      prepTime: 4000,
      isSpecial: true,
    };
  } catch (error) {
    console.error("Gemini Menu Error:", error);
    return {
      id: `special_fallback`,
      name: "Traveler's Stew",
      icon: "🥘",
      basePrice: 20,
      description: "Hearty stew for travelers.",
      prepTime: 3000,
      isSpecial: true,
    };
  }
};

export const generateRandomEvent = async (biome: Biome): Promise<RandomEvent> => {
  if (!apiKey) {
    return {
      title: "Quiet Day",
      description: "It's a peaceful day. No special events (AI Offline).",
      choices: [
        {
          text: "Relax",
          outcomeText: "You rested well. (+10 Stamina)",
          apply: (s) => ({ stamina: Math.min(s.maxStamina, s.stamina + 10) })
        },
        {
          text: "Clean Up",
          outcomeText: "The truck sparkles! (+5 Reputation)",
          apply: (s) => ({ reputation: Math.min(100, s.reputation + 5) })
        }
      ]
    };
  }

  try {
    const prompt = `Generate a random event for a traveling cat snack bar in the ${biome.type}.
    The event should be whimsical or slightly dangerous (like a dragon wanting a drink).
    Return JSON with: title, description, and 2 choices. Each choice has text and an outcome description (what happens).
    Format: { title, description, choice1: { text, outcome }, choice2: { text, outcome } }`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            choice1: {
              type: Type.OBJECT,
              properties: { text: { type: Type.STRING }, outcome: { type: Type.STRING } }
            },
            choice2: {
              type: Type.OBJECT,
              properties: { text: { type: Type.STRING }, outcome: { type: Type.STRING } }
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text || '{}');

    // Map Gemini text to game mechanics
    return {
      title: data.title || "Unexpected Visitor",
      description: data.description || "Someone approaches your stall.",
      choices: [
        {
          text: data.choice1?.text || "Greet warmly",
          outcomeText: data.choice1?.outcome || "They left a tip! (+50 Gold)",
          apply: (s) => ({ gold: s.gold + 50, stamina: Math.max(0, s.stamina - 10) }),
        },
        {
          text: data.choice2?.text || "Ignore them",
          outcomeText: data.choice2?.outcome || "They left angry. (-10 Reputation)",
          apply: (s) => ({ reputation: Math.max(0, s.reputation - 10) }),
        },
      ]
    };

  } catch (error) {
    console.error("Gemini Event Error:", error);
    return {
      title: "Sudden Rain",
      description: "It starts raining heavily. Customers might leave.",
      choices: [
        {
          text: "Secure the tent",
          outcomeText: "You saved the stall but got tired. (-20 Stamina)",
          apply: (s) => ({ stamina: Math.max(0, s.stamina - 20) })
        },
        {
          text: "Keep cooking",
          outcomeText: "Some food got ruined. (-30 Gold)",
          apply: (s) => ({ gold: Math.max(0, s.gold - 30) })
        }
      ]
    };
  }
};
