import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';
import {successResponse, errorResponse} from '@/lib/utils/api-response';

interface FormQuestion {
  type: string;
  text: string;
  options?: string[];
  required?: boolean;
  validation?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({cookies});
    const body = await request.json();
    const {title, description, questions} = body;

    // Validate required fields
    if (!title || !questions?.length) {
      return errorResponse('Title and questions are required', 400);
    }

    // Create form
    const {data: form, error: formError} = await supabase
      .from('forms')
      .insert({
        title,
        description,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        status: 'draft',
      })
      .select()
      .single();

    if (formError) {
      console.error('Error creating form:', formError);
      return errorResponse('Failed to create form', 500);
    }

    // Create form questions
    const formQuestions = questions.map((question: FormQuestion, index: number) => ({
      form_id: form.id,
      order: index,
      type: question.type,
      text: question.text,
      options: question.options || [],
      required: question.required || false,
      validation: question.validation || {},
    }));

    const {error: questionsError} = await supabase.from('form_questions').insert(formQuestions);

    if (questionsError) {
      console.error('Error creating questions:', questionsError);
      // Delete the form if questions creation fails
      await supabase.from('forms').delete().eq('id', form.id);
      return errorResponse('Failed to create form questions', 500);
    }

    return successResponse({
      id: form.id,
      message: 'Form created successfully',
    });
  } catch (error) {
    console.error('Error in forms POST route:', error);
    return errorResponse('Failed to create form', 500);
  }
}
