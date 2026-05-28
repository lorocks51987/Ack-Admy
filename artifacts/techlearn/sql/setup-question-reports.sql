-- Setup Table for Question Reports (Contestations)
CREATE TABLE IF NOT EXISTS question_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  module_id integer,
  question_id text,
  question_title text,
  selected_answer text,
  reason text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts ONLY by authenticated users
CREATE POLICY "Allow insert for authenticated users only" 
  ON question_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow SELECT (read) only for users with role = 'admin' in profiles table
CREATE POLICY "Allow read for admin" 
  ON question_reports 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
