import {notFound} from 'next/navigation';
import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';
import {ResponseList} from '@/components/responses/response-list';
import {ResponseListItem} from '@/lib/types/response';

interface PageProps {
  params: {
    formId: string;
  };
}

async function getFormResponses(formId: string): Promise<ResponseListItem[]> {
  const supabase = createServerComponentClient({cookies});

  const {data: form} = await supabase.from('forms').select('title').eq('id', formId).single();

  if (!form) {
    notFound();
  }

  const {data: responses} = await supabase.from('form_responses').select('id, status, submitted_at, respondent_info').eq('form_id', formId).order('submitted_at', {ascending: false});

  return (responses || []).map((response) => ({
    ...response,
    form_title: form.title,
  }));
}

export default async function ResponsesPage({params}: PageProps) {
  const responses = await getFormResponses(params.formId);

  return (
    <div className='container mx-auto py-8'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold'>Form Responses</h1>
      </div>

      <ResponseList formId={params.formId} initialResponses={responses} />
    </div>
  );
}
