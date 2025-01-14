'use client';

import {useState} from 'react';
import {useForm} from '@/lib/hooks/use-form';
import {createClient} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Switch} from '@/components/ui/switch';

export default function NewFormPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [settings, setSettings] = useState({
    allowAnonymous: false,
    collectEmail: true,
    submitOnce: true,
    showProgressBar: true,
    showQuestionNumbers: true,
  });
  const {createForm, isLoading, error} = useForm();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: {user},
    } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    await createForm({
      title,
      description,
      settings,
      is_published: false,
      user_id: user.id,
    });
  };

  return (
    <div className='container max-w-2xl py-8'>
      <Card>
        <CardHeader>
          <CardTitle>Create New Form</CardTitle>
          <CardDescription>
            Start by giving your form a title and description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600'>
                {error.message}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='title'>Form Title</Label>
              <Input
                id='title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter form title'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Enter form description (optional)'
                rows={3}
              />
            </div>

            <div className='space-y-4'>
              <h3 className='font-medium'>Form Settings</h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>Allow Anonymous Responses</Label>
                    <p className='text-sm text-muted-foreground'>
                      Let users submit responses without signing in
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowAnonymous}
                    onCheckedChange={(checked) =>
                      setSettings({...settings, allowAnonymous: checked})
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>Collect Email</Label>
                    <p className='text-sm text-muted-foreground'>
                      Require email address from respondents
                    </p>
                  </div>
                  <Switch
                    checked={settings.collectEmail}
                    onCheckedChange={(checked) =>
                      setSettings({...settings, collectEmail: checked})
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>Submit Once</Label>
                    <p className='text-sm text-muted-foreground'>
                      Limit to one response per user
                    </p>
                  </div>
                  <Switch
                    checked={settings.submitOnce}
                    onCheckedChange={(checked) =>
                      setSettings({...settings, submitOnce: checked})
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>Show Progress Bar</Label>
                    <p className='text-sm text-muted-foreground'>
                      Display progress through form sections
                    </p>
                  </div>
                  <Switch
                    checked={settings.showProgressBar}
                    onCheckedChange={(checked) =>
                      setSettings({...settings, showProgressBar: checked})
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>Show Question Numbers</Label>
                    <p className='text-sm text-muted-foreground'>
                      Display numbers for each question
                    </p>
                  </div>
                  <Switch
                    checked={settings.showQuestionNumbers}
                    onCheckedChange={(checked) =>
                      setSettings({...settings, showQuestionNumbers: checked})
                    }
                  />
                </div>
              </div>
            </div>

            <Button
              type='submit'
              className='w-full'
              size='lg'
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Form'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
