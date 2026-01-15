import { GoogleGenAI } from "@google/genai";
import { Report } from "@prisma/client";

const genAI = new GoogleGenAI({}) // Picks up GEMINI_API_KEY or GOOGLE_API_KEY from env

export async function generateIncidentSummary(reports: Report[]) {
    
  const prompt = `
  You are an emergency response analyst.
  
  Based on the following citizen reports, generate a concise and professional incident summary
  highlighting the potential risk and recommended urgency.(use human like understanding and tone)
  
  Reports:
  ${reports.map((r) => `- ${r.description}`).join("\n")}
  `
  const result = await genAI.models.generateContent({ 
    model: "gemini-2.5-flash", 
    contents: prompt
  })

  return result.text
}
