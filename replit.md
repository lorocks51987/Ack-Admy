# ACK-ADMY — B2B Security Awareness + LGPD Compliance App

## Visão Geral
Plataforma Duolingo-style para treinamento de conscientização em segurança da informação e conformidade LGPD. Voltada para empresas B2B com múltiplos departamentos. Gamificada com XP, lives, streak e ranking corporativo.

## Arquitetura
- **Monorepo**: pnpm workspaces
- **Mobile**: `artifacts/techlearn` — Expo + React Native (Expo Go, Android-first)
- **API**: `artifacts/api-server` — Express server (estrutura preparada para PostgreSQL)
- **DB Schema**: `lib/db/src/schema/index.ts` — Drizzle ORM (schema multi-tenant: companies, departments, users, compliance_records)

## Como Rodar

### App Mobile (Expo Go)
```bash
pnpm --filter @workspace/techlearn run dev
```
Escaneie o QR Code no Expo Go (Android) ou acesse via preview.

### API Server
```bash
pnpm --filter @workspace/api-server run dev
```
Servidor sobe na porta definida por `$PORT`. Rotas disponíveis:
- `GET  /api/healthz` — Health check
- `GET  /api/progress/:deviceId` — Busca progresso salvo
- `POST /api/progress/:deviceId` — Salva progresso

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Navegação | Expo Router (file-based) |
| UI | React Native + react-native-web |
| Ícones | lucide-react-native (APENAS este) |
| SVG | react-native-svg 15.12.1 |
| Fontes | @expo-google-fonts/inter (400/500/600/700) |
| Haptics | expo-haptics |
| Estado global | ProgressContext (React Context + AsyncStorage) |
| API client | @tanstack/react-query |
| Backend | Express + pino (logger) |
| DB Schema | Drizzle ORM |

## Paleta de Cores
Definida em `artifacts/techlearn/constants/colors.ts`, acessada via `useColors()`:

| Token | Hex |
|-------|-----|
| `background` | `#09090B` |
| `card` | `#18181B` |
| `primary` | `#6366F1` |
| `foreground` | `#FAFAFA` |
| `mutedForeground` | `#A1A1AA` |
| `border` | `#3F3F46` |
| `muted` / `input` | `#18181B` / `#27272A` |
| `success` | `#22C55E` |
| `error` | `#EF4444` |
| `warning` | `#F59E0B` |

## Estrutura do App (`artifacts/techlearn`)

```
app/
  _layout.tsx              Root layout (fontes, providers, SafeArea)
  (tabs)/
    _layout.tsx            Tab bar (Início, Ranking, Perfil)
    index.tsx              Home — trilha com 5 módulos + stats
    ranking.tsx            Ranking corporativo por departamento
    profile.tsx            Perfil do usuário com XP, badges e histórico
  lesson.tsx               Fluxo de lição com animação + sistema de lives
  complete.tsx             Tela de conclusão com XP e próximo módulo
screens/
  MultipleChoiceScreen.tsx
  AssociationScreen.tsx
  TextInputScreen.tsx
  OrderingScreen.tsx
  FillBlankScreen.tsx
  BriefingScreen.tsx       Intro do cenário com terminal de evidências
  PhishingSimulatorScreen.tsx  Cliente de e-mail fake interativo
components/
  ExerciseHeader.tsx       Barra de progresso + lives + fase
  FeedbackModal.tsx        Modal correto/incorreto (React Native Modal)
  ProgressBar.tsx
  ErrorBoundary.tsx + ErrorFallback.tsx
constants/
  lessons.ts               25 exercícios para 5 módulos + MODULE_DEFINITIONS
  colors.ts                Tema dark unificado
contexts/
  ProgressContext.tsx      Estado global persistido via AsyncStorage
services/
  progressService.ts       Camada de acesso a dados (AsyncStorage + API futura)
hooks/
  useColors.ts             Hook de tema
lib/db/src/schema/
  index.ts                 Drizzle: companies, departments, users, compliance_records
```

## Módulos de Conteúdo (25 lições, 5 módulos)

| # | Título | Dificuldade | Exercícios |
|---|--------|------------|-----------|
| 1 | Tríade CID | Iniciante | Briefing + Association + MC + FillBlank + MC |
| 2 | IAM e Controle de Acesso | Intermediário | Briefing + Ordering + Association + MC + MC |
| 3 | Ameaças e Malware | Intermediário | Briefing + Association + Association + FillBlank + MC |
| 4 | LGPD e Privacidade | Intermediário | Briefing + MC + Association + FillBlank + MC |
| 5 | Phishing Avançado | Avançado | Briefing + MC + PhishingEmail + Ordering + Association |

## Tipos de Exercício

| Tipo | Descrição |
|------|-----------|
| `multiple_choice` | 4 opções, 1 correta |
| `association` | Pareamento esquerda/direita |
| `text_input` | Resposta livre com hint |
| `ordering` | Arrastar para ordenar sequência correta |
| `fill_blank` | Banco de palavras drag-into-sentence |
| `briefing` | Intro do cenário com terminal de evidências |
| `phishing_email` | Cliente de e-mail fake — identificar fraudes |

## Sistema de Progresso

- **XP**: 10 XP por resposta correta. Adicionado apenas uma vez por módulo concluído.
- **Lives**: 3 vidas por módulo. Ao zerar, tela de "Game Over" com botão de restart.
- **Streak**: Inicia em 0. Sobe +1 por dia consecutivo de atividade. Reseta se pular um dia.
- **Nível**: Calculado como `floor(xp / 50) + 1`.
- **Persistência**: AsyncStorage local via `services/progressService.ts`.

## Regras de Desenvolvimento

- **SEMPRE** usar `lucide-react-native` para ícones — nunca Feather, expo-symbols ou similares
- **SEMPRE** usar `useColors()` para cores — nunca hardcode (exceto cores de acento não-semânticas como pódio)
- Footer/tab bar: `backgroundColor: colors.background`, `borderTopColor: colors.border`, `borderTopWidth: 1`
- Haptics em todas as interações do usuário (`selectionAsync` ou `impactAsync`)
- Logs no servidor: usar `req.log` nas rotas, `logger` fora de rotas — nunca `console.log`

## O que ainda é Mock / Local

| Componente | Status |
|-----------|--------|
| Progresso do usuário | AsyncStorage local — sem sync com servidor |
| Ranking de departamentos | Dados estáticos hardcoded em `ranking.tsx` |
| Identidade do usuário | Sem autenticação real — "Colaborador ACK-ADMY" fixo |
| Store de progresso da API | In-memory Map — perde dados ao reiniciar |
| Múltiplos usuários / multi-tenant | Schema definido, não implementado |

## Melhorias Futuras Recomendadas

1. **Autenticação**: Integrar Replit Auth ou Clerk para identidade real
2. **Banco de dados**: Trocar `Map` in-memory do backend por Drizzle + PostgreSQL (schema já existe em `lib/db`)
3. **Sync de progresso**: `progressService.syncProgressWithApi()` está preparado — basta implementar o deviceId/auth
4. **Ranking real**: Substituir dados estáticos por query ao banco por departamento
5. **Multi-tenant**: Usar schema `companies` + `departments` para separar dados por empresa
6. **Push notifications**: Alertas de streak e lembretes de treinamento pendente
7. **Novos módulos**: Estrutura de `MODULE_DEFINITIONS` + `LESSONS` facilita adição de conteúdo
