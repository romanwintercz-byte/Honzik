
import { GoogleGenAI } from "@google/genai";
import { LoanDetails, AmortizationSchedule } from "../types";
import { formatCurrency } from "../utils/calculations";

export const getLoanAdvice = async (details: LoanDetails, schedule: AmortizationSchedule) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Jako finanční poradce analyzuj následující parametry půjčky v českých korunách (CZK):
    - Jistina: ${formatCurrency(details.principal)}
    - Úroková sazba: ${details.interestRate}%
    - Doba splácení: ${details.years} let
    - Měsíční splátka: ${formatCurrency(schedule.monthlyPayment)}
    - Celkem zaplacené úroky: ${formatCurrency(schedule.totalInterest)}

    Poskytni stručné rady v češtině (3-4 body):
    1. Zhodnocení výhodnosti úrokové sazby vzhledem k současnému trhu.
    2. Doporučení pro mimořádné splátky (kdy se vyplatí).
    3. Potenciální rizika nebo tipy na refinancování.
    4. Jaký dopad by mělo navýšení měsíční splátky o 10%.
    
    Odpověz v čistém textu, nepoužívej formátování Markdownu jako jsou hvězdičky pro nadpisy, ale klidně použij odrážky.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Omlouváme se, ale analýzu se nepodařilo vygenerovat. Zkuste to prosím později.";
  }
};
