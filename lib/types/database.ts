import {Database} from '@/lib/supabase/types';

export type {Json} from '@/lib/supabase/types';

export type Tables = Database['public']['Tables'];

// Forms
export type Form = Tables['forms']['Row'];
export type NewForm = Tables['forms']['Insert'];
export type UpdateForm = Tables['forms']['Update'];

// Sections
export type Section = Tables['sections']['Row'];
export type NewSection = Tables['sections']['Insert'];
export type UpdateSection = Tables['sections']['Update'];

// Questions
export type Question = Tables['questions']['Row'];
export type NewQuestion = Tables['questions']['Insert'];
export type UpdateQuestion = Tables['questions']['Update'];

// Extended types for local state
export type LocalSection = Section & {
  questions: Question[];
};

export type FormWithSections = Form & {
  sections: LocalSection[];
};
