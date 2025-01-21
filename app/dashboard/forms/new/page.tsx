'use client';

import {useState, useEffect} from 'react';
import {createClient} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Switch} from '@/components/ui/switch';
import {useRouter} from 'next/navigation';

interface AIQuestion {
  type: 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'rating' | 'scale' | 'date' | 'time' | 'email' | 'phone' | 'number' | 'file_upload';
  text: string;
  options?: string[];
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
  };
}

interface AIGeneratedForm {
  title: string;
  description: string;
  questions: AIQuestion[];
}

export default function NewFormPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[] | null>(null);
  const [settings, setSettings] = useState({
    allowAnonymous: false,
    collectEmail: true,
    submitOnce: true,
    showProgressBar: true,
    showQuestionNumbers: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Load AI-generated form data if available
  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('ai-form-data');
      if (storedData) {
        const data: AIGeneratedForm = JSON.parse(storedData);
        setTitle(data.title);
        setDescription(data.description);
        setAiQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error loading AI form data:', error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      const {
        data: {user},
      } = await supabase.auth.getUser();
      if (!user) {
        setError(new Error('No user found'));
        return;
      }

      // Create the form first
      const {data: form, error: formError} = await supabase
        .from('forms')
        .insert({
          title,
          description,
          settings,
          is_published: false,
          user_id: user.id,
        })
        .select()
        .single();

      if (formError || !form) throw formError || new Error('Failed to create form');

      // Create a default section
      const {data: section, error: sectionError} = await supabase
        .from('sections')
        .insert({
          form_id: form.id,
          title: 'Default Section',
          order: 0,
        })
        .select()
        .single();

      if (sectionError || !section) throw sectionError || new Error('Failed to create section');

      // Create questions if we have any
      if (aiQuestions && aiQuestions.length > 0) {
        const questionsToCreate = aiQuestions.map((q, index) => {
          // Format validation object according to database constraints
          let validation = null;
          if (q.validation) {
            if (q.type === 'scale') {
              validation = {
                type: 'range',
                value: {min: q.validation.min, max: q.validation.max},
                message: `Value must be between ${q.validation.min} and ${q.validation.max}`,
              };
            }
          }

          // Set default options based on question type
          let options = null;
          switch (q.type) {
            case 'single_choice':
            case 'multiple_choice':
              options = {choices: q.options};
              break;
            case 'scale':
              options = {
                scaleMin: q.validation?.min || 1,
                scaleMax: q.validation?.max || 10,
                scaleStep: 1,
                scaleLabels: {
                  start: '',
                  end: '',
                },
              };
              break;
            case 'rating':
              options = {maxRating: 5};
              break;
          }

          return {
            section_id: section.id,
            title: q.text,
            type: q.type,
            description: null,
            required: q.required,
            order: index,
            options,
            validation,
            logic: null,
          };
        });

        const {error: questionsError} = await supabase.from('questions').insert(questionsToCreate);

        if (questionsError) throw questionsError;
      }

      // Redirect to the form edit page with the correct path
      router.push(`/forms/${form.id}/edit`);
      router.refresh();
    } catch (error) {
      console.error('Error creating form:', error);
      setError(error instanceof Error ? error : new Error('Failed to create form'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container max-w-2xl py-8'>
      <Card>
        <CardHeader>
          <CardTitle>Create New Form</CardTitle>
          <CardDescription>{aiQuestions ? 'Review and customize your AI-generated form' : 'Start by giving your form a title and description'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600'>{error.message}</div>}

            <div className='space-y-2'>
              <Label htmlFor='title'>Form Title</Label>
              <Input id='title' value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Enter form title' required />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea id='description' value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Enter form description (optional)' rows={3} />
            </div>

            {aiQuestions && (
              <div className='rounded-lg border bg-muted p-4'>
                <p className='text-sm text-muted-foreground mb-2'>{aiQuestions.length} questions have been generated and will be added to your form.</p>
                <p className='text-sm text-muted-foreground'>You can edit them after creating the form.</p>
              </div>
            )}

            <div className='space-y-4'>
              <h3 className='font-medium'>Form Settings</h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>Allow Anonymous Responses</Label>
                    <p className='text-sm text-muted-foreground'>Let users submit responses without signing in</p>
                  </div>
                  <Switch checked={settings.allowAnonymous} onCheckedChange={(checked) => setSettings({...settings, allowAnonymous: checked})} />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>Collect Email</Label>
                    <p className='text-sm text-muted-foreground'>Require email address from respondents</p>
                  </div>
                  <Switch checked={settings.collectEmail} onCheckedChange={(checked) => setSettings({...settings, collectEmail: checked})} />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>Submit Once</Label>
                    <p className='text-sm text-muted-foreground'>Limit to one response per user</p>
                  </div>
                  <Switch checked={settings.submitOnce} onCheckedChange={(checked) => setSettings({...settings, submitOnce: checked})} />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>Show Progress Bar</Label>
                    <p className='text-sm text-muted-foreground'>Display progress through form sections</p>
                  </div>
                  <Switch checked={settings.showProgressBar} onCheckedChange={(checked) => setSettings({...settings, showProgressBar: checked})} />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>Show Question Numbers</Label>
                    <p className='text-sm text-muted-foreground'>Display numbers for each question</p>
                  </div>
                  <Switch checked={settings.showQuestionNumbers} onCheckedChange={(checked) => setSettings({...settings, showQuestionNumbers: checked})} />
                </div>
              </div>
            </div>

            <Button type='submit' className='w-full' size='lg' disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Form'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
