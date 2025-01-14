import {FormBuilder} from '@/components/forms/form-builder';

interface FormBuilderPageProps {
  params: {
    id: string;
  };
}

export default function FormBuilderPage({params}: FormBuilderPageProps) {
  return (
    <div className='container py-8'>
      <FormBuilder formId={params.id} />
    </div>
  );
}
