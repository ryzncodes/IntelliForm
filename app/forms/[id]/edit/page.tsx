import {FormBuilder} from '@/components/forms/form-builder';

interface FormBuilderPageProps {
  params: {
    id: string;
  };
}

export default async function FormBuilderPage({params}: FormBuilderPageProps) {
  const {id} = await params;

  return (
    <div className='container py-8'>
      <FormBuilder formId={id} />
    </div>
  );
}
