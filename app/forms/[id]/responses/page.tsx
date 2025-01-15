import {createClient} from '@/lib/supabase/server';
import {FormResponses} from '@/components/forms/form-responses';
import {redirect} from 'next/navigation';
import type {Question, QuestionType} from '@/types';

export default async function FormResponsesPage({params}: {params: {id: string}}) {
  const supabase = createClient();

  // Fetch form with questions
  const {data: form, error: formError} = await supabase
    .from('forms')
    .select(
      `
      id,
      title,
      sections (
        questions (
          id,
          title,
          type,
          required
        )
      )
    `
    )
    .eq('id', params.id)
    .single();

  if (formError || !form) {
    redirect('/forms'); // Redirect to forms list if form not found
  }

  // Helper function to check if a type is a valid QuestionType
  const isValidQuestionType = (type: string): type is QuestionType => {
    return ['short_text', 'long_text', 'single_choice', 'multiple_choice', 'email', 'number', 'date', 'time'].includes(type);
  };

  // Flatten questions from all sections and map to Question type
  const questions: Question[] = form.sections.flatMap((section) =>
    section.questions
      .filter((q) => isValidQuestionType(q.type))
      .map((q) => ({
        id: q.id,
        text: q.title,
        type: q.type as QuestionType,
        required: q.required,
      }))
  );

  return (
    <div className='container py-8'>
      <FormResponses
        formId={params.id}
        questions={questions}
      />
    </div>
  );
}
