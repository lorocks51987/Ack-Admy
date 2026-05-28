-- Add new columns if they do not exist
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS course text;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS term text;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS room text;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS course text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS term text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS room text;

-- Clear old classes
DELETE FROM public.classes;

-- Insert pilot classes
DO $$
DECLARE
    courses text[] := ARRAY['Análise e Desenvolvimento de Sistemas', 'Ciência da Computação', 'Inteligência Artificial', 'Cibersegurança e Infraestrutura de Redes'];
    terms text[] := ARRAY['1º Termo'];
    rooms text[] := ARRAY['A', 'B', 'C', 'D'];
    c text;
    t text;
    r text;
    class_name text;
BEGIN
    FOREACH c IN ARRAY courses
    LOOP
        FOREACH t IN ARRAY terms
        LOOP
            FOREACH r IN ARRAY rooms
            LOOP
                class_name := c || ' - ' || t || ' ' || r;
                INSERT INTO public.classes (name, course, term, room)
                VALUES (class_name, c, t, r);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Update profiles with old Marketing class to the new one
UPDATE public.profiles
SET class_name = 'Cibersegurança e Infraestrutura de Redes - 1º Termo A'
WHERE class_name LIKE '%Marketing%';
