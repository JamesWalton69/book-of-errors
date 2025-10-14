
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function runPythonCode(code: string): Promise<string> {
  const prompt = `
    You are a Python interpreter. Execute the following Python code and return ONLY the raw standard output (stdout).
    If there is any error (stderr), return ONLY the raw error message.
    Do not add any explanation, commentary, markdown formatting, or any extra text like "stdout:" or "stderr:".
    Just return the direct output as if it were run in a real terminal.

    Code to execute:
    \`\`\`python
    ${code}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0,
        // Disable thinking to get faster, more direct interpreter-like behavior
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error executing code with Gemini:", error);
    if (error instanceof Error) {
        return `An API error occurred: ${error.message}`;
    }
    return "An unknown API error occurred.";
  }
}
