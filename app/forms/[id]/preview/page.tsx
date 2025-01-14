import {FormPreviewClient} from './form-preview-client';

interface PreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PreviewPage({params}: PreviewPageProps) {
  const {id} = await params;
  return <FormPreviewClient id={id} />;
}
