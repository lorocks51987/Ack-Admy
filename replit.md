# ACK-ADMY — B2B Security Awareness + LGPD Compliance App

## Architecture
- **Monorepo**: pnpm workspaces
- **Mobile**: `artifacts/techlearn` — Expo + React Native (Expo Go, Android-first)
- **API**: `artifacts/api-server` — Express server (future backend)
- **DB Schema**: `lib/db/src/schema/index.ts` — Drizzle ORM (4-table multi-tenant schema)

## Tech Stack
- **Expo Router** (file-based navigation)
- **React Native / react-native-web** (cross-platform)
- **lucide-react-native** — ALL icons (never Feather, expo-symbols, or NativeTabs)
- **react-native-svg 15.12.1** — SVG support for Lucide
- **@expo-google-fonts/inter** — Inter 400/500/600/700
- **expo-haptics** — haptic feedback on interactions
- **@tanstack/react-query** — API state management
- **Drizzle ORM** — database schema

## Color Palette (Ultra Modern Dark)
All defined in `artifacts/techlearn/constants/colors.ts`:
- `background`: `#09090B`
- `card`: `#18181B`
- `primary` (Indigo): `#6366F1`
- `foreground`: `#FAFAFA`
- `mutedForeground`: `#A1A1AA`
- `border`: `#3F3F46`
- `muted` / `input`: `#18181B` / `#27272A`
- `success`: `#22C55E`, `error`: `#EF4444`, `warning`: `#F59E0B`

## App Structure (artifacts/techlearn)
```
app/
  _layout.tsx           Root layout (fonts, providers)
  (tabs)/
    _layout.tsx         Tab bar (Início, Ranking)
    index.tsx           Home — 3 compliance modules trail
    ranking.tsx         Department ranking with status
  lesson.tsx            Lesson flow (all 6 exercise types)
  complete.tsx          Completion screen with XP
screens/
  MultipleChoiceScreen.tsx
  AssociationScreen.tsx
  TextInputScreen.tsx
  OrderingScreen.tsx
  FillBlankScreen.tsx
  BriefingScreen.tsx    ISE intro with evidence terminal
  PhishingSimulatorScreen.tsx  Fake email client
components/
  ExerciseHeader.tsx    Progress + lives + phase indicator
  FeedbackModal.tsx     Correct/incorrect modal
  ProgressBar.tsx
  ErrorBoundary.tsx + ErrorFallback.tsx (Lucide icons only)
constants/
  lessons.ts            All exercise types + 12 lessons for 3 modules
  colors.ts             Unified dark theme
hooks/
  useColors.ts          Theme hook
lib/db/src/schema/
  index.ts              Drizzle: companies, departments, users, compliance_records
```

## Modules (12 lessons total)
1. **LGPD Fundamentals** — Briefing + MC + Association + FillBlank
2. **Social Engineering & Phishing** — Briefing + PhishingSimulator + Ordering + MC
3. **Password Hygiene & Clean Desk** — Briefing + MC + FillBlank + Ordering

## Exercise Types
| Type | Description |
|------|-------------|
| `multiple_choice` | 4 options, single correct |
| `association` | Left/right pair matching |
| `text_input` | Free text answer with hint |
| `ordering` | Drag-sort to correct sequence |
| `fill_blank` | Word bank drag-into-sentence |
| `briefing` | ISE scenario intro with terminal evidence |
| `phishing_email` | Fake email client — flag suspicious elements |

## Key Rules
- **ONLY** use `lucide-react-native` for icons
- `useColors()` hook for all colors — never hardcode
- Footer bars: `backgroundColor: colors.background`, `borderTopColor: colors.border`, `borderTopWidth: 1`
- Web: skip font-loading gate (`Platform.OS !== "web"`)
- Haptics on all interactions (selectionAsync / impactAsync)
