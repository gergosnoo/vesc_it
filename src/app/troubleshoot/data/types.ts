export type StepType = 'question' | 'action' | 'solution' | 'escalate';

export interface ChecklistItem {
  text: string;
  hint?: string;
}

export interface StepOption {
  label: string;
  nextStep: string;
}

export interface StepLink {
  label: string;
  url: string;
}

export interface TroubleshootingStep {
  id: string;
  type: StepType;
  title: string;
  description: string;
  animation?: string;
  diagram?: string;
  options?: StepOption[];
  checklist?: ChecklistItem[];
  links?: StepLink[];
}

export interface TroubleshootingFlow {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  steps: Record<string, TroubleshootingStep>;
  startStep: string;
}
