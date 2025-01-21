'use client';

import {Card} from '@/components/ui/card';
import {useState} from 'react';

interface GeneratedQuestion {
  type: string;
  text: string;
  options?: string[];
  required?: boolean;
  validation?: Record<string, unknown>;
}

export default function AIFormPage() {
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
                Topic
              </label>
              <input type='text' id='topic' value={formData.topic} onChange={handleChange} className='w-full p-2 border rounded-md' placeholder='e.g., Customer Satisfaction' />
            </div>
            <div>
              <label htmlFor='purpose' className='block text-sm font-medium mb-1'>
                Purpose
              </label>
              <textarea
                id='purpose'
                value={formData.purpose}
                onChange={handleChange}
                className='w-full p-2 border rounded-md'
                rows={3}
                placeholder='e.g., To gather feedback about our new product launch'
              />
            </div>
            <div>
              <label htmlFor='targetAudience' className='block text-sm font-medium mb-1'>
                Target Audience (Optional)
              </label>
              <input
                type='text'
                id='targetAudience'
                value={formData.targetAudience}
                onChange={handleChange}
                className='w-full p-2 border rounded-md'
                placeholder='e.g., Recent customers who purchased in the last 30 days'
              />
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
                placeholder='e.g., Focus on ease of use and product quality'
              />
            </div>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={loading || !formData.topic || !formData.purpose}
              className='bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'>
              {loading ? 'Generating...' : 'Generate Form'}
            </button>
          </div>

          {/* Results Section */}
          <div className='mt-8'>
            <h2 className='text-xl font-semibold mb-4'>Generated Questions</h2>
            {error && <div className='text-red-500 mb-4'>{error}</div>}
            {result && <pre className='bg-muted p-4 rounded-md overflow-auto max-h-96'>{JSON.stringify(result, null, 2)}</pre>}
          </div>
        </div>
      </Card>
    </div>
  );
}
