import {createClient} from '@/lib/supabase/server';
import {
  Form,
  NewForm,
  Section,
  Question,
  Response,
  Answer,
  Json,
} from '@/lib/types/database';

export async function getForms() {
  const supabase = createClient();

  const {data: forms, error} = await supabase
    .from('forms')
    .select('*')
    .order('created_at', {ascending: false});

  if (error) throw error;
  return forms as Form[];
}

export async function getForm(id: string) {
  const supabase = createClient();

  const {data: form, error: formError} = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (formError) throw formError;

  const {data: sections, error: sectionsError} = await supabase
    .from('sections')
    .select(
      `
      *,
      questions:questions(*)
    `
    )
    .eq('form_id', id)
    .order('order', {ascending: true});

  if (sectionsError) throw sectionsError;

  return {
    ...form,
    sections: sections || [],
  } as Form & {sections: (Section & {questions: Question[]})[]};
}

export async function createForm(form: NewForm) {
  const supabase = createClient();

  const {data, error} = await supabase
    .from('forms')
    .insert(form)
    .select()
    .single();

  if (error) throw error;
  return data as Form;
}

export async function updateForm(id: string, form: Partial<Form>) {
  const supabase = createClient();

  const {data, error} = await supabase
    .from('forms')
    .update(form)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Form;
}

export async function deleteForm(id: string) {
  const supabase = createClient();

  const {error} = await supabase.from('forms').delete().eq('id', id);

  if (error) throw error;
}

export async function getFormResponses(formId: string) {
  const supabase = createClient();

  const {data: responses, error: responsesError} = await supabase
    .from('responses')
    .select(
      `
      *,
      answers:answers(
        *,
        question:questions(*)
      )
    `
    )
    .eq('form_id', formId)
    .order('created_at', {ascending: false});

  if (responsesError) throw responsesError;

  return responses as (Response & {
    answers: (Answer & {question: Question})[];
  })[];
}

export async function submitFormResponse(
  formId: string,
  answers: {questionId: string; value: Json}[]
) {
  const supabase = createClient();

  // Start a transaction
  const {
    data: {user},
  } = await supabase.auth.getUser();

  const {data: response, error: responseError} = await supabase
    .from('responses')
    .insert({
      form_id: formId,
      user_id: user?.id,
    })
    .select()
    .single();

  if (responseError) throw responseError;

  // Insert all answers
  const {error: answersError} = await supabase.from('answers').insert(
    answers.map((answer) => ({
      response_id: response.id,
      question_id: answer.questionId,
      value: answer.value,
    }))
  );

  if (answersError) throw answersError;

  return response as Response;
}
