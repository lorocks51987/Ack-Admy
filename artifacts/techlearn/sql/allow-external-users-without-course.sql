-- =========================================================================
-- MIGRATION: ALLOW EXTERNAL USERS WITHOUT COURSE
-- =========================================================================
-- Adiciona suporte explícito para "Visitantes Externos" sem curso obrigatório.

-- 1. Adicionar nova coluna profile_type (padrão 'student')
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_type text DEFAULT 'student'
CHECK (profile_type IN ('student', 'external'));

-- 2. Atualizar usuários legados para 'student'
UPDATE public.profiles
SET profile_type = 'student'
WHERE profile_type IS NULL;

-- 3. Garantir que as colunas de dados acadêmicos aceitam NULL explicitamente (já devem aceitar por padrão em PostgreSQL a menos que NOT NULL fosse especificado, mas por garantia formatamos o comando ALTER)
ALTER TABLE public.profiles ALTER COLUMN course DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN term DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN room DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN class_name DROP NOT NULL;
