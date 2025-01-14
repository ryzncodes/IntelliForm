-- Create enum types
CREATE TYPE question_type AS ENUM (
  'short_text',
  'long_text',
  'single_choice',
  'multiple_choice',
  'rating',
  'scale',
  'date',
  'time',
  'email',
  'phone',
  'number',
  'file_upload'
);

-- Create forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  is_published BOOLEAN DEFAULT FALSE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{
    "allowAnonymous": false,
    "collectEmail": true,
    "submitOnce": true,
    "showProgressBar": true,
    "showQuestionNumbers": true
  }'::jsonb,
  
  -- Add RLS policies
  CONSTRAINT valid_settings CHECK (
    jsonb_typeof(settings) = 'object' AND
    settings ? 'allowAnonymous' AND
    settings ? 'collectEmail' AND
    settings ? 'submitOnce' AND
    settings ? 'showProgressBar' AND
    settings ? 'showQuestionNumbers'
  )
);

-- Create sections table
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  type question_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT FALSE NOT NULL,
  "order" INTEGER NOT NULL,
  validation JSONB,
  logic JSONB,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  -- Add constraints for JSON validation
  CONSTRAINT valid_validation CHECK (
    validation IS NULL OR (
      jsonb_typeof(validation) = 'object' AND
      validation ? 'type' AND
      validation ? 'value' AND
      validation ? 'message'
    )
  ),
  CONSTRAINT valid_options CHECK (
    options IS NULL OR jsonb_typeof(options) = 'object'
  ),
  CONSTRAINT valid_logic CHECK (
    logic IS NULL OR jsonb_typeof(logic) = 'array'
  )
);

-- Create responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Add indexes
CREATE INDEX idx_forms_user_id ON forms(user_id);
CREATE INDEX idx_sections_form_id ON sections(form_id);
CREATE INDEX idx_questions_section_id ON questions(section_id);
CREATE INDEX idx_responses_form_id ON responses(form_id);
CREATE INDEX idx_responses_user_id ON responses(user_id);
CREATE INDEX idx_answers_response_id ON answers(response_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Add RLS policies
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Forms policies
CREATE POLICY "Users can view their own forms"
  ON forms FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own forms"
  ON forms FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own forms"
  ON forms FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own forms"
  ON forms FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Sections policies (inherit from forms)
CREATE POLICY "Users can view sections of their forms"
  ON sections FOR SELECT
  TO authenticated
  USING (form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create sections in their forms"
  ON sections FOR INSERT
  TO authenticated
  WITH CHECK (form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update sections in their forms"
  ON sections FOR UPDATE
  TO authenticated
  USING (form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete sections in their forms"
  ON sections FOR DELETE
  TO authenticated
  USING (form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  ));

-- Questions policies (inherit from sections)
CREATE POLICY "Users can view questions in their forms"
  ON questions FOR SELECT
  TO authenticated
  USING (section_id IN (
    SELECT s.id FROM sections s
    JOIN forms f ON s.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

CREATE POLICY "Users can create questions in their forms"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (section_id IN (
    SELECT s.id FROM sections s
    JOIN forms f ON s.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

CREATE POLICY "Users can update questions in their forms"
  ON questions FOR UPDATE
  TO authenticated
  USING (section_id IN (
    SELECT s.id FROM sections s
    JOIN forms f ON s.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete questions in their forms"
  ON questions FOR DELETE
  TO authenticated
  USING (section_id IN (
    SELECT s.id FROM sections s
    JOIN forms f ON s.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

-- Responses policies
CREATE POLICY "Form owners can view all responses"
  ON responses FOR SELECT
  TO authenticated
  USING (form_id IN (
    SELECT id FROM forms WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own responses"
  ON responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can create responses to published forms"
  ON responses FOR INSERT
  TO authenticated
  WITH CHECK (form_id IN (
    SELECT id FROM forms WHERE is_published = true
  ));

-- Answers policies (inherit from responses)
CREATE POLICY "Form owners can view all answers"
  ON answers FOR SELECT
  TO authenticated
  USING (response_id IN (
    SELECT r.id FROM responses r
    JOIN forms f ON r.form_id = f.id
    WHERE f.user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own answers"
  ON answers FOR SELECT
  TO authenticated
  USING (response_id IN (
    SELECT id FROM responses WHERE user_id = auth.uid()
  ));

CREATE POLICY "Anyone can create answers for their responses"
  ON answers FOR INSERT
  TO authenticated
  WITH CHECK (response_id IN (
    SELECT id FROM responses WHERE user_id = auth.uid()
  )); 