-- analytics_events.sql
CREATE TABLE public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  event_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  device_id text NOT NULL,
  is_guest boolean DEFAULT true NOT NULL,
  module_id text,
  lesson_id text,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for all users" ON public.analytics_events FOR INSERT WITH CHECK (true);
