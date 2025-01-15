export type QuestionType = 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'email' | 'number' | 'date' | 'time';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  choices?: string[];
}

export interface Response {
  id: string;
  formId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseItem {
  id: string;
  responseId: string;
  questionId: string;
  value: string | string[];
}
