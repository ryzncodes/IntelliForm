-- Create custom types
CREATE TYPE form_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE field_type AS ENUM (
    'text',
    'number',
    'email',
    'textarea',
    'select',
    'radio',
    'checkbox',
    'date'
);

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status form_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create form_fields table
CREATE TABLE IF NOT EXISTS form_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    type field_type NOT NULL,
    required BOOLEAN DEFAULT false,
    "order" INTEGER NOT NULL,
    options JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    data JSONB NOT NULL
);

-- Create indexes
CREATE INDEX idx_forms_user_id ON forms(user_id);
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_order ON form_fields("order");
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_fields_updated_at
    BEFORE UPDATE ON form_fields
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Forms policies
CREATE POLICY "Users can view own forms"
    ON forms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create forms"
    ON forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms"
    ON forms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms"
    ON forms FOR DELETE
    USING (auth.uid() = user_id);

-- Form fields policies
CREATE POLICY "Users can view form fields"
    ON form_fields FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM forms
        WHERE forms.id = form_fields.form_id
        AND forms.user_id = auth.uid()
    ));

CREATE POLICY "Users can create form fields"
    ON form_fields FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM forms
        WHERE forms.id = form_fields.form_id
        AND forms.user_id = auth.uid()
    ));

CREATE POLICY "Users can update form fields"
    ON form_fields FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM forms
        WHERE forms.id = form_fields.form_id
        AND forms.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete form fields"
    ON form_fields FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM forms
        WHERE forms.id = form_fields.form_id
        AND forms.user_id = auth.uid()
    ));

-- Form submissions policies
CREATE POLICY "Users can view form submissions"
    ON form_submissions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM forms
        WHERE forms.id = form_submissions.form_id
        AND forms.user_id = auth.uid()
    ));

CREATE POLICY "Anyone can submit to published forms"
    ON form_submissions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM forms
        WHERE forms.id = form_submissions.form_id
        AND forms.status = 'published'
    )); 