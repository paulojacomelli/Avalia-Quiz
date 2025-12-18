
export enum Difficulty {
  EASY = 'Fácil',
  MEDIUM = 'Médio',
  HARD = 'Difícil'
}

export enum TopicMode {
  ACADEMIC = 'Acadêmico',
  ENTERTAINMENT = 'Entretenimento',
  ARTS_CULTURE = 'Arte & Cultura',
  GEOPOLITICS = 'Geopolítica',
  ANIMALS = 'Mundo Animal',
  OTHER = 'Outro Assunto'
}

export enum QuizFormat {
  MULTIPLE_CHOICE = 'Múltipla Escolha',
  TRUE_FALSE = 'Verdadeiro ou Falso',
  OPEN_ENDED = 'Resposta Livre (IA)'
}

export enum HintType {
  STANDARD = 'Dica Padrão',
  ASK_AI = 'Pergunte ao Chat'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // 4 options for Multiple Choice, 2 for True/False, empty for Open Ended
  correctAnswerIndex: number; // 0-3 or 0-1 (ignored for Open Ended)
  correctAnswerText?: string; // Canonical answer for Open Ended mode
  reference: string; 
  hint: string; // Friendly clue
  explanation: string; // Brief justification for the answer
  audioBase64?: string; // Pre-generated TTS audio data
}

export interface Team {
  id: string;
  name: string;
  color: string; // Hex code for team UI elements
  score: number;
  correctCount: number;
  wrongCount: number;
  hintsUsed: number;
}

export interface TTSConfig {
  enabled: boolean;
  autoRead: boolean;
  engine: 'browser' | 'gemini'; 
  gender: 'female' | 'male'; 
  rate: number; // 0.5 to 2
  volume: number; // 0 to 1
}

export interface QuizConfig {
  mode: TopicMode;
  subTopic?: string;
  specificTopic?: string; // For TopicMode.OTHER
  difficulty: Difficulty;
  temperature: number; 
  quizFormat: QuizFormat;
  count: number;
  timeLimit: number; 
  maxHints: number; 
  hintTypes: HintType[]; 
  enableTimer: boolean; 
  enableTimerSound: boolean; 
  
  isTeamMode: boolean;
  teams: string[]; 
  questionsPerRound: number; 

  tts: TTSConfig;
  usedTopics?: string[];
}

export interface GeneratedQuiz {
  title: string;
  questions: QuizQuestion[];
  focalTheme?: string; 
}

export interface EvaluationResult {
  score: number; // 0.0 to 1.0
  feedback: string;
  isCorrect: boolean;
}
