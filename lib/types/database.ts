import {Database} from '@/lib/supabase/types';

export type Tables = Database['public']['Tables'];
export type {Json} from '@/lib/supabase/types';

// Forms
export type Form = Tables['forms']['Row'];
export type NewForm = Tables['forms']['Insert'];
export type UpdateForm = Tables['forms']['Update'];

// Sections
export type Section = Tables['sections']['Row'] & {
  questions?: Question[];
};
export type NewSection = Tables['sections']['Insert'];
export type UpdateSection = Tables['sections']['Update'];

// Questions
export type Question = Tables['questions']['Row'];
export type NewQuestion = Tables['questions']['Insert'];
export type UpdateQuestion = Tables['questions']['Update'];

// Responses
export type Response = Tables['responses']['Row'];
export type NewResponse = Tables['responses']['Insert'];
export type UpdateResponse = Tables['responses']['Update'];

// Answers
export type Answer = Tables['answers']['Row'];
export type NewAnswer = Tables['answers']['Insert'];
export type UpdateAnswer = Tables['answers']['Update'];

// Enums
export type QuestionType = Database['public']['Enums']['question_type'];

// Form Settings
export interface FormSettings {
  allowAnonymous: boolean;
  collectEmail: boolean;
  submitOnce: boolean;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
}

// Question Validation
export interface QuestionValidation {
  type: 'required' | 'email' | 'phone' | 'min' | 'max' | 'regex' | 'custom';
  value?: string | number;
  message: string;
}

// Question Logic
export interface LogicCondition {
  questionId: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than';
  value: string | number | boolean;
}

export interface LogicAction {
  type: 'show' | 'hide' | 'require' | 'skip';
  target: string; // Question ID or Section ID
}

export interface QuestionLogic {
  conditions: LogicCondition[];
  action: LogicAction;
}

// Question Options
export interface QuestionChoice {
  id: string;
  label: string;
  value: string;
}

export interface QuestionOptions {
  choices?: QuestionChoice[];
  allowOther?: boolean;
  min?: number;
  max?: number;
  step?: number;
  format?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean;
}
