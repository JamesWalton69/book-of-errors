
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function executePythonCode(code: string): Promise<string> {
  const prompt = `
You are a Python interpreter. Execute the following Python code and return ONLY the standard output.
Do not add any explanation, commentary, or markdown formatting like \`\`\`python.
If the code produces an error, return ONLY the standard error traceback.

Code:
---
${code}
---
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0,
        // Disable thinking for faster, more direct execution simulation
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error executing code with Gemini API:", error);
    if (error instanceof Error) {
        return `API Error: ${error.message}`;
    }
    return "An unknown API error occurred.";
  }
}
