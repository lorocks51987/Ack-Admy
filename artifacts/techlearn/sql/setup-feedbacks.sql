CREATE TABLE IF NOT EXISTS public.feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text,
  user_email text,

  course text,
  term text,
  room text,
  class_name text,

  rating_usability integer CHECK (rating_usability BETWEEN 1 AND 5),
  rating_clarity integer CHECK (rating_clarity BETWEEN 1 AND 5),
  rating_exercises integer CHECK (rating_exercises BETWEEN 1 AND 5),
  rating_feedback integer CHECK (rating_feedback BETWEEN 1 AND 5),
  rating_return integer CHECK (rating_return BETWEEN 1 AND 5),

  recommendation text CHECK (recommendation IN ('Sim', 'Talvez', 'Não')),

  liked_most text,
  confused_most text,
  improvement_suggestion text,

  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can insert own feedback" ON public.feedbacks;
CREATE POLICY "Students can insert own feedback"
ON public.feedbacks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can view own feedback" ON public.feedbacks;
CREATE POLICY "Students can view own feedback"
ON public.feedbacks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can view all feedbacks"
ON public.feedbacks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  )
);
