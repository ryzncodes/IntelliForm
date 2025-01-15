-- Drop existing tables with CASCADE to handle dependencies
drop table if exists response_items cascade;
drop table if exists answers cascade;
drop table if exists responses cascade;

-- Create responses table
create table responses (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid references forms(id) on delete cascade,
  submitted_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create response items table
create table response_items (
  id uuid primary key default uuid_generate_v4(),
  response_id uuid references responses(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  value jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table responses enable row level security;
alter table response_items enable row level security;

-- Policies for responses
create policy "Anyone can create responses"
  on responses for insert
  to authenticated, anon
  with check (true);

create policy "Form owners can view responses"
  on responses for select
  using (
    form_id in (
      select id from forms
      where user_id = auth.uid()
    )
  );

-- Policies for response items
create policy "Anyone can create response items"
  on response_items for insert
  to authenticated, anon
  with check (
    response_id in (
      select id from responses
    )
  );

create policy "Form owners can view response items"
  on response_items for select
  using (
    response_id in (
      select r.id from responses r
      join forms f on r.form_id = f.id
      where f.user_id = auth.uid()
    )
  );

-- Add indexes for better query performance
create index responses_form_id_idx on responses(form_id);
create index response_items_response_id_idx on response_items(response_id);
create index response_items_question_id_idx on response_items(question_id); 