export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'rating'
  | 'scale'
  | 'date'
  | 'time'
  | 'email'
  | 'phone'
  | 'number'
  | 'file_upload';

export interface FormSettings {
  allowAnonymous: boolean;
  collectEmail: boolean;
  submitOnce: boolean;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
}

export interface Validation {
  type: 'min' | 'max' | 'regex' | 'custom';
  value: string | number;
  message: string;
}

export interface LogicCondition {
  if: {
    questionId: string;
    operator:
      | 'equals'
      | 'not_equals'
      | 'contains'
      | 'greater_than'
      | 'less_than';
    value: string | number | boolean;
  };
  then: {
    action: 'show' | 'hide' | 'require' | 'skip_to';
    target: string;
  };
}

export interface QuestionChoice {
  id: string;
  text: string;
  order: number;
}

export interface QuestionOptions {
  choices?: QuestionChoice[];
  min?: number;
  max?: number;
  labels?: {
    min: string;
    max: string;
  };
  allowedTypes?: string[];
  maxSize?: number;
  placeholder?: string;
  maxLength?: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  validation?: Validation;
  logic?: LogicCondition[];
  options?: QuestionOptions;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

export interface Form {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  settings: FormSettings;
  sections: Section[];
}

// Database types (for Supabase)
export type DbForm = Omit<Form, 'sections'> & {
  sections?: never;
};

export type DbSection = Omit<Section, 'questions'> & {
  formId: string;
  questions?: never;
};

export type DbQuestion = Omit<Question, 'logic' | 'options' | 'validation'> & {
  sectionId: string;
  logic: LogicCondition[] | null;
  options: QuestionOptions | null;
  validation: Validation | null;
};
