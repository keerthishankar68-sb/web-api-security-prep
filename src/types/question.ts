export type StepStatus = 'normal' | 'attack' | 'defense';
export type ViewTab = 'visual' | 'spoken' | 'deepdive' | 'quiz';

export interface StepTerm {
  term: string;
  definition: string;
}

export interface TechnicalTelemetry {
  protocol: string;
  method?: string;
  headers?: string[];
  payloadPreview?: string;
  securityAction: string;
  statusBadge?: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  sub?: string;
  iconType?: 'key' | 'phone' | 'shield' | 'blocked' | 'browser' | 'attacker' | 'server' | 'api' | 'database' | 'auth' | 'gateway';
}

export interface DiagramStep {
  id: number;
  label: string;
  from: string;
  to: string;
  packet: string;
  caption: string;
  status: StepStatus;
  isInterviewLine?: boolean;
  whatIsHappeningTitle?: string;
  whatIsHappeningText?: string;
  deepExplanation?: string;
  whyItMatters?: string;
  securityVerdict?: string;
  telemetry?: TechnicalTelemetry;
  terms?: StepTerm[];
}

export interface QuestionData {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tier?: 'Core' | 'Intermediate' | 'Advanced';
  nodes: DiagramNode[];
  steps: DiagramStep[];
  interviewTakeaway?: string;
  sayIt: {
    prompt: string;
    speechScript: string;
    keyPhrases: string[];
  };
  nailIt: {
    whatIsHappening: string;
    interviewTakeaway: string;
    commonTraps: string[];
    seniorPoints: string[];
  };
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  keywords: string[];
}
