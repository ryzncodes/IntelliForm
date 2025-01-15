import {createClient} from '@/lib/supabase/server';
import {FormResponse} from '@/components/forms/form-response';
import {redirect} from 'next/navigation';
import type {FormWithSections, LocalSection} from '@/lib/types/database';

export default async function FormPage({params}: {params: {id: string}}) {
  const supabase = createClient();

  // Fetch form with sections and questions
  const {data: formData, error: formError} = await supabase
    .from('forms')
    .select(
      `
      id,
      title,
      description,
      created_at,
      updated_at,
      user_id,
      is_published,
      settings,
      sections (
        id,
        title,
        description,
        order,
        created_at,
        updated_at,
        form_id,
        questions (
          id,
          title,
          description,
          type,
          required,
          options,
          order
        )
      )
    `
    )
    .eq('id', params.id)
    .single();

  if (formError || !formData) {
    redirect('/forms'); // Redirect to forms list if form not found
  }

  // Sort sections and questions by order
  const form: FormWithSections = {
    ...formData,
    sections: formData.sections
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        ...section,
        form_id: params.id, // Add form_id from params
        questions: section.questions.sort((a, b) => a.order - b.order),
      })) as LocalSection[],
  };

  return (
    <div className='container max-w-3xl py-8'>
      <FormResponse form={form} />
    </div>
  );
}
