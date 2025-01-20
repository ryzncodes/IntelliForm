import {notFound} from 'next/navigation';
import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';
import {ResponseDetail} from '@/components/responses/response-detail';
import type {FormResponse} from '@/lib/types/response';

interface PageProps {
  params: {
    formId: string;
    responseId: string;
  };
}

async function getFormResponse(
  formId: string,
  responseId: string
): Promise<{
  response: FormResponse;
  formTitle: string;
}> {
  const supabase = createServerComponentClient({cookies});

  // Get form title
  const {data: form} = await supabase.from('forms').select('title').eq('id', formId).single();

  if (!form) {
    notFound();
  }

  // Get response data
  const {data: response} = await supabase.from('form_responses').select('*').eq('id', responseId).eq('form_id', formId).single();

  if (!response) {
    notFound();
  }

  return {
    response,
    formTitle: form.title,
  };
}

export default async function ResponsePage({params}: PageProps) {
  const {response, formTitle} = await getFormResponse(params.formId, params.responseId);

  return (
    <div className='container mx-auto py-8'>
      <ResponseDetail response={response} formTitle={formTitle} />
    </div>
  );
}
