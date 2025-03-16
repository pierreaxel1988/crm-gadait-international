
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ExtractedData {
  [key: string]: any;
}

export interface TeamMember {
  id: string;
  name: string;
}
