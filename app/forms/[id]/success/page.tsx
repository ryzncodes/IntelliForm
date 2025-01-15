import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {CheckCircle2} from 'lucide-react';

export default function FormSuccessPage({params}: {params: {id: string}}) {
  return (
    <div className='container max-w-lg py-12'>
      <Card className='text-center'>
        <CardHeader>
          <div className='flex justify-center mb-4'>
            <CheckCircle2 className='h-12 w-12 text-green-500' />
          </div>
          <CardTitle className='text-2xl'>Thank You!</CardTitle>
          <CardDescription>Your response has been submitted successfully.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>Thank you for taking the time to complete this form. Your response has been recorded.</p>
        </CardContent>
        <CardFooter className='flex justify-center gap-4'>
          <Button
            asChild
            variant='outline'
          >
            <Link href={`/forms/${params.id}`}>Submit Another Response</Link>
          </Button>
          <Button asChild>
            <Link href='/'>Return Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
