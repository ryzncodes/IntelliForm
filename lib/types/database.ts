export type FormStatus = 'draft' | 'published' | 'archived'
export type FieldType = 'text' | 'number' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date'

export interface User {
  id: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface Form {
  id: string
  user_id: string
  title: string
  description: string | null
  status: FormStatus
  created_at: string
  updated_at: string
}

export interface FieldOptions {
  choices?: string[]
  min?: number
  max?: number
  pattern?: string
  placeholder?: string
}

export interface FormField {
  id: string
  form_id: string
  label: string
  type: FieldType
  required: boolean
  order: number
  options: FieldOptions | null
  created_at: string
  updated_at: string
}

export interface FormSubmission {
  id: string
  form_id: string
  submitted_at: string
  data: Record<string, string | number | boolean | string[]>
} 