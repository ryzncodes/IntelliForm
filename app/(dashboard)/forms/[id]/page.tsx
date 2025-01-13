export default function FormDetailPage({params}: {params: {id: string}}) {
  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold'>Form Details</h1>
      <div className='mt-8'>
        {/* Form details and builder will go here */}
        <p>Form ID: {params.id}</p>
      </div>
    </div>
  );
}
