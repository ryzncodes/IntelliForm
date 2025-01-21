'use client';

import {Card} from '@/components/ui/card';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import type {Question} from '@/lib/types/database';

interface GeneratedQuestion {
  type: string;
  text: string;
  options?: string[];
  required?: boolean;
  validation?: Record<string, unknown>;
}

// Map AI-generated question types to database enum values
const mapQuestionType = (type: string): Question['type'] => {
  // First normalize the type by removing spaces and converting to lowercase
  const normalizedType = type.toLowerCase().replace(/\s+/g, '');

  switch (normalizedType) {
    case 'multiplechoice':
    case 'multiple_choice':
      return 'multiple_choice';
    case 'singlechoice':
    case 'single_choice':
      return 'single_choice';
    case 'shorttext':
    case 'short_text':
      return 'short_text';
    case 'longtext':
    case 'long_text':
      return 'long_text';
    case 'rating':
      return 'rating';
    case 'scale':
      return 'scale';
    case 'date':
      return 'date';
    case 'time':
      return 'time';
    case 'email':
      return 'email';
    case 'phone':
      return 'phone';
    case 'number':
      return 'number';
    case 'fileupload':
    case 'file_upload':
      return 'file_upload';
    default:
      console.warn(`Unknown question type: ${type}, defaulting to short_text`);
      return 'short_text';
  }
};

export default function AIFormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    topic: '',
    purpose: '',
    targetAudience: '',
    additionalContext: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate form');
      }

      setResult(data.data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUseInBuilder = async () => {
    if (!result) return;

    // Map the questions to the correct format
    const mappedQuestions = result.map((q) => ({
      ...q,
      type: mapQuestionType(q.type),
    }));

    // Store in session storage for the form creation page
    sessionStorage.setItem(
      'ai-form-data',
      JSON.stringify({
        title: formData.topic,
        description: formData.purpose,
        questions: mappedQuestions,
      })
    );

    router.push('/dashboard/forms/new');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {id, value} = e.target;
    setFormData((prev) => ({...prev, [id]: value}));
  };

  return (
    <div className='container mx-auto py-8'>
      <Card>
        <div className='p-6'>
          <h1 className='text-2xl font-bold mb-6'>AI Form Generator</h1>
          <div className='space-y-4'>
            <div>
              <label htmlFor='topic' className='block text-sm font-medium mb-1'>
                Topic (Form Title)
              </label>
              <input type='text' id='topic' value={formData.topic} onChange={handleChange} className='w-full p-2 border rounded-md' placeholder='e.g., Employee Work-Life Balance Survey' />
            </div>
            <div>
              <label htmlFor='purpose' className='block text-sm font-medium mb-1'>
                Purpose (Form Description)
              </label>
              <textarea
                id='purpose'
                value={formData.purpose}
                onChange={handleChange}
                className='w-full p-2 border rounded-md'
                rows={3}
                placeholder='e.g., To assess and improve employee work-life balance and well-being'
              />
            </div>
            <div>
              <label htmlFor='targetAudience' className='block text-sm font-medium mb-1'>
                Target Audience (Optional)
              </label>
              <input type='text' id='targetAudience' value={formData.targetAudience} onChange={handleChange} className='w-full p-2 border rounded-md' placeholder='e.g., All full-time employees' />
            </div>
            <div>
              <label htmlFor='additionalContext' className='block text-sm font-medium mb-1'>
                Additional Context (Optional)
              </label>
              <textarea
                id='additionalContext'
                value={formData.additionalContext}
                onChange={handleChange}
                className='w-full p-2 border rounded-md'
                rows={3}
                placeholder='e.g., Focus on mental health and work environment'
              />
            </div>
            <div className='flex gap-4'>
              <Button type='button' onClick={handleSubmit} disabled={loading || !formData.topic || !formData.purpose} className='flex-1'>
                {loading ? 'Generating...' : 'Generate Form'}
              </Button>
              {result && (
                <Button type='button' onClick={handleUseInBuilder} variant='secondary' className='flex-1'>
                  Continue to Form Builder
                </Button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className='mt-8'>
            <h2 className='text-xl font-semibold mb-4'>Generated Questions</h2>
            {error && <div className='text-red-500 mb-4'>{error}</div>}
            {result && (
              <div className='space-y-4'>
                <pre className='bg-muted p-4 rounded-md overflow-auto max-h-96'>{JSON.stringify(result, null, 2)}</pre>
                <p className='text-sm text-muted-foreground'>Click &quot;Continue to Form Builder&quot; to customize your form further.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
