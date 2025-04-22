import { v4 as uuidv4 } from 'uuid';
import { format, parse, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TaskType } from '@/types/actionHistory';

export interface ActionSuggestion {
  actionType: TaskType;
  scheduledDate: Date;
  notes?: string;
  confidence: number; // 0-100
  matchedText: string;
}

/**
 * Analyze note text to find potential action dates and types
 */
export const analyzeNoteText = (text: string): ActionSuggestion[] => {
  if (!text || text.trim() === '') return [];
  
  const suggestions: ActionSuggestion[] = [];
  const lowercaseText = text.toLowerCase();
  
  // Date patterns (FR)
  const datePatterns = [
    // Format: le [day] [month] (en fin de matinée/en après-midi/etc.)
    { 
      regex: /le\s+(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)(?:\s+(\d{4}))?(?:\s+(?:en|à|vers)\s+(?:fin\s+de\s+)?(matinée|après-midi|soir))?/gi,
      handler: (matches: RegExpExecArray) => {
        const day = parseInt(matches[1]);
        const month = matches[2].toLowerCase();
        const year = matches[3] ? parseInt(matches[3]) : new Date().getFullYear();
        const timeOfDay = matches[4] ? matches[4].toLowerCase() : null;
        
        const monthMap: {[key: string]: number} = {
          'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5, 
          'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
        };
        
        const date = new Date(year, monthMap[month], day);
        
        if (timeOfDay) {
          switch (timeOfDay) {
            case 'matinée':
              date.setHours(10, 0);
              break;
            case 'après-midi':
              date.setHours(14, 0);
              break;
            case 'soir':
              date.setHours(18, 0);
              break;
            case 'fin de matinée':
              date.setHours(11, 30);
              break;
          }
        }
        
        return isValid(date) ? date : null;
      }
    },
    // Simple numeric format: DD/MM/YYYY or DD-MM-YYYY
    {
      regex: /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/g,
      handler: (matches: RegExpExecArray) => {
        const day = parseInt(matches[1]);
        const month = parseInt(matches[2]) - 1; // 0-based month
        const yearStr = matches[3] || new Date().getFullYear().toString();
        const year = parseInt(yearStr.length === 2 ? `20${yearStr}` : yearStr);
        
        const date = new Date(year, month, day);
        return isValid(date) ? date : null;
      }
    },
    // Format: day of week (e.g., lundi prochain, mardi)
    {
      regex: /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)(?:\s+(prochain|suivant))?/gi,
      handler: (matches: RegExpExecArray) => {
        const dayOfWeek = matches[1].toLowerCase();
        const isNextWeek = matches[2] && (matches[2].toLowerCase() === 'prochain' || matches[2].toLowerCase() === 'suivant');
        
        const dayMap: {[key: string]: number} = {
          'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4, 
          'vendredi': 5, 'samedi': 6, 'dimanche': 0
        };
        
        const today = new Date();
        const currentDay = today.getDay();
        const targetDay = dayMap[dayOfWeek];
        
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0 || isNextWeek) {
          daysToAdd += 7;
        }
        
        const date = new Date(today);
        date.setDate(today.getDate() + daysToAdd);
        date.setHours(10, 0, 0, 0); // Default to morning
        
        return isValid(date) ? date : null;
      }
    }
  ];
  
  // Action type patterns
  const actionTypePatterns = [
    { regex: /appel(?:er|ez|le|s)?|t[ée]l[ée]phon(?:er|ez|e)|contact(?:er|ez)/i, actionType: 'Call' as TaskType, confidence: 90 },
    { regex: /rappel(?:er|ez|le|s)?/i, actionType: 'Call' as TaskType, confidence: 90 },
    { regex: /entretien|r[ée]union/i, actionType: 'Call' as TaskType, confidence: 80 },
    { regex: /rendez-?vous|rdv/i, actionType: 'Call' as TaskType, confidence: 75 },
    { regex: /visit(?:e|er|ez)/i, actionType: 'Visites' as TaskType, confidence: 85 },
    { regex: /propos(?:er|ition)s?/i, actionType: 'Propositions' as TaskType, confidence: 80 },
    { regex: /estim(?:er|ation)/i, actionType: 'Estimation' as TaskType, confidence: 85 },
    { regex: /suivi|suivre|follow(?:\s+|-)?up/i, actionType: 'Follow up' as TaskType, confidence: 85 }
  ];
  
  // Extract dates and surrounding context
  for (const pattern of datePatterns) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(pattern.regex);
    
    while ((match = regex.exec(text)) !== null) {
      const date = pattern.handler(match);
      if (date) {
        // Get surrounding context (50 chars before and after the match)
        const startIdx = Math.max(0, match.index - 50);
        const endIdx = Math.min(text.length, match.index + match[0].length + 50);
        const context = text.substring(startIdx, endIdx);
        
        // Determine action type from context
        let actionType: TaskType = 'Call'; // Default
        let maxConfidence = 0;
        
        for (const actionPattern of actionTypePatterns) {
          if (actionPattern.regex.test(context)) {
            if (actionPattern.confidence > maxConfidence) {
              actionType = actionPattern.actionType;
              maxConfidence = actionPattern.confidence;
            }
          }
        }
        
        // Ensure date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date >= today) {
          suggestions.push({
            actionType,
            scheduledDate: date,
            notes: `Action suggérée à partir de: "${match[0]}"`,
            confidence: maxConfidence,
            matchedText: match[0]
          });
        }
      }
    }
  }
  
  // Return unique suggestions sorted by date
  return suggestions
    .filter((suggestion, index, self) => 
      index === self.findIndex(s => 
        s.scheduledDate.getTime() === suggestion.scheduledDate.getTime() &&
        s.actionType === suggestion.actionType
      )
    )
    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
};

// Helper function to format a suggestion for display
export const formatActionSuggestion = (suggestion: ActionSuggestion): string => {
  const dateStr = format(suggestion.scheduledDate, 'dd MMMM yyyy', { locale: fr });
  const timeStr = format(suggestion.scheduledDate, 'HH:mm');
  
  return `${suggestion.actionType} le ${dateStr} à ${timeStr}`;
};
