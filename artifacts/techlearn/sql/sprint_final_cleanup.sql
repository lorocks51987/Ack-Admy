-- =========================================================================
-- PARTE 1 - LIMPEZA DE CLASSES E PROFILES
-- =========================================================================

-- 1. Garantir que as colunas existam
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS course text;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS term text;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS room text;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS course text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS term text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS room text;

-- 2. Limpar turmas não correspondentes ao piloto (mantém os 4 cursos de TI do 1º Termo, Salas A-D)
DELETE FROM public.classes
WHERE course NOT IN (
    'Análise e Desenvolvimento de Sistemas', 
    'Ciência da Computação', 
    'Inteligência Artificial', 
    'Cibersegurança e Infraestrutura de Redes'
)
OR term != '1º Termo'
OR room NOT IN ('A', 'B', 'C', 'D');

-- Inserir as turmas do piloto caso não existam
DO $$
DECLARE
    courses text[] := ARRAY['Análise e Desenvolvimento de Sistemas', 'Ciência da Computação', 'Inteligência Artificial', 'Cibersegurança e Infraestrutura de Redes'];
    terms text[] := ARRAY['1º Termo'];
    rooms text[] := ARRAY['A', 'B', 'C', 'D'];
    c text;
    t text;
    r text;
    cname text;
BEGIN
    FOREACH c IN ARRAY courses
    LOOP
        FOREACH t IN ARRAY terms
        LOOP
            FOREACH r IN ARRAY rooms
            LOOP
                cname := c || ' - ' || t || ' ' || r;
                -- Usa INSERT ... ON CONFLICT se houvesse unique, mas como não temos certeza:
                IF NOT EXISTS (SELECT 1 FROM public.classes WHERE name = cname) THEN
                    INSERT INTO public.classes (name, course, term, room)
                    VALUES (cname, c, t, r);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- 3. Limpar usuários admin (não devem ter turma, curso, termo ou sala)
UPDATE public.profiles
SET class_name = NULL, course = NULL, term = NULL, room = NULL
WHERE role = 'admin' OR email IN ('admin@gmail.com', 'lorocks57321@gmail.com');

-- 4. Ajustar alunos com turmas legadas ou vazias para uma turma default do piloto
UPDATE public.profiles
SET 
    course = 'Análise e Desenvolvimento de Sistemas',
    term = '1º Termo',
    room = 'A',
    class_name = 'Análise e Desenvolvimento de Sistemas - 1º Termo A'
WHERE role = 'student' AND (
    course IS NULL OR 
    term IS NULL OR 
    room IS NULL OR 
    course NOT IN (
        'Análise e Desenvolvimento de Sistemas', 
        'Ciência da Computação', 
        'Inteligência Artificial', 
        'Cibersegurança e Infraestrutura de Redes'
    )
);

-- =========================================================================
-- PARTE 2 - CRIAÇÃO DA TABELA FEEDBACKS (CASO NÃO EXISTA) E RLS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.feedbacks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name text,
    user_email text,
    class_name text,
    course text,
    term text,
    room text,
    usability_rating integer NOT NULL CHECK (usability_rating BETWEEN 1 AND 5),
    clarity_rating integer NOT NULL CHECK (clarity_rating BETWEEN 1 AND 5),
    exercises_rating integer NOT NULL CHECK (exercises_rating BETWEEN 1 AND 5),
    feedback_rating integer NOT NULL CHECK (feedback_rating BETWEEN 1 AND 5),
    return_intention_rating integer NOT NULL CHECK (return_intention_rating BETWEEN 1 AND 5),
    recommendation text NOT NULL CHECK (recommendation IN ('Sim', 'Não')),
    liked_most text,
    improvement_suggestion text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id) -- Impede que o mesmo aluno envie múltiplos feedbacks
);

-- =========================================================================
-- PARTE 3 - POLICIES E SEGURANÇA (RLS)
-- =========================================================================

-- Classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.classes;
CREATE POLICY "Enable read access for all users" ON public.classes FOR SELECT USING (true);

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
-- Autenticados podem ler para gerar o ranking, e users podem ler a si mesmos
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT TO authenticated USING (true);
-- Não vamos quebrar a inserção original, mas manter o select
-- (A inserção pode ser via trigger do auth.users, ou manual para admins)

-- Feedbacks
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Alunos inserem seus próprios feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Alunos podem ler seus feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Admins podem ler todos os feedbacks" ON public.feedbacks;

-- Política 1: Aluno insere feedback em seu próprio user_id
CREATE POLICY "Alunos inserem seus próprios feedbacks"
ON public.feedbacks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política 2: Aluno lê seu próprio feedback
CREATE POLICY "Alunos podem ler seus feedbacks"
ON public.feedbacks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política 3: Admin lê todos (checa a tabela profiles)
CREATE POLICY "Admins podem ler todos os feedbacks"
ON public.feedbacks
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- User Progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read user_progress" ON public.user_progress;
CREATE POLICY "Authenticated read user_progress" ON public.user_progress FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- PARTE 4 - CONFERÊNCIA FINAL
-- =========================================================================
-- SELECT * FROM public.classes;
-- SELECT role, class_name, count(*) FROM public.profiles GROUP BY role, class_name;
-- SELECT * FROM public.feedbacks;
