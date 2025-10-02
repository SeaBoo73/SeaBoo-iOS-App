import OpenAI from "openai";
import type { Boat } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export class AIService {
  async getBoatRecommendations(
    userId: number,
    context: any,
    boats: Boat[]
  ): Promise<{ explanation: string }> {
    if (!openai) {
      return {
        explanation: "Servizio di raccomandazioni AI non configurato. Controlla la configurazione OpenAI."
      };
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Sei un esperto consulente nautico per SeaBoo. Analizza le barche disponibili e fornisci raccomandazioni personalizzate basate su: budget, tipo di esperienza, numero di persone, durata del noleggio, e preferenze specifiche. Rispondi sempre in italiano in modo amichevole e professionale.`
          },
          {
            role: "user",
            content: `Contesto utente: ${JSON.stringify(context)}. Barche disponibili: ${JSON.stringify(boats.slice(0, 10))}. Fornisci 3 raccomandazioni specifiche con motivazioni.`
          }
        ],
        max_tokens: 500
      });

      return {
        explanation: response.choices[0].message.content || "Spiacenti, non riesco a fornire raccomandazioni al momento."
      };
    } catch (error) {
      console.error("AI recommendations error:", error);
      return {
        explanation: "Servizio di raccomandazioni temporaneamente non disponibile."
      };
    }
  }

  async analyzePricing(boat: Boat, similarBoats: Boat[]): Promise<string> {
    if (!openai) {
      return "Servizio di analisi prezzi AI non configurato. Controlla la configurazione OpenAI.";
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Sei un analista di mercato nautico. Analizza i prezzi delle imbarcazioni e fornisci insight su competitività, tendenze di mercato e suggerimenti di pricing. Rispondi in italiano.`
          },
          {
            role: "user",
            content: `Barca target: ${JSON.stringify(boat)}. Barche simili: ${JSON.stringify(similarBoats.slice(0, 5))}. Fornisci analisi completa del pricing.`
          }
        ],
        max_tokens: 400
      });

      return response.choices[0].message.content || "Analisi pricing non disponibile.";
    } catch (error) {
      console.error("AI pricing analysis error:", error);
      return "Servizio di analisi prezzi temporaneamente non disponibile.";
    }
  }

  async getWeatherAdvice(location: string, dates: string[]): Promise<string> {
    if (!openai) {
      return "Servizio consigli meteo AI non configurato. Controlla la configurazione OpenAI.";
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Sei un esperto meteorologo marino. Fornisci consigli meteo per la navigazione considerando location e date. Rispondi in italiano con consigli pratici.`
          },
          {
            role: "user",
            content: `Location: ${location}, Date: ${dates.join(', ')}. Fornisci consigli meteo per la navigazione.`
          }
        ],
        max_tokens: 300
      });

      return response.choices[0].message.content || "Consigli meteo non disponibili.";
    } catch (error) {
      console.error("AI weather advice error:", error);
      return "Servizio consigli meteo temporaneamente non disponibile.";
    }
  }

  async planItinerary(context: any): Promise<string> {
    if (!openai) {
      return "Servizio pianificazione itinerari AI non configurato. Controlla la configurazione OpenAI.";
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Sei una guida esperta di itinerari nautici italiani. Crea itinerari dettagliati basati su durata, tipo di barca, interesse e esperienza. Rispondi in italiano con tappe specifiche.`
          },
          {
            role: "user",
            content: `Contesto viaggio: ${JSON.stringify(context)}. Crea un itinerario dettagliato con tappe, tempi e consigli.`
          }
        ],
        max_tokens: 600
      });

      return response.choices[0].message.content || "Pianificazione itinerario non disponibile.";
    } catch (error) {
      console.error("AI itinerary planning error:", error);
      return "Servizio pianificazione itinerari temporaneamente non disponibile.";
    }
  }
}

export const aiService = new AIService();