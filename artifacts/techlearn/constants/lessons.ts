export type ExerciseType =
  | "multiple_choice"
  | "association"
  | "text_input"
  | "ordering"
  | "fill_blank"
  | "briefing";

export interface PhaseInfo {
  scenario: string;
  phase: number;
  total: number;
}

export interface MultipleChoiceExercise {
  type: "multiple_choice";
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  phaseInfo?: PhaseInfo;
}

export interface AssociationExercise {
  type: "association";
  instruction: string;
  pairs: { left: string; right: string }[];
  phaseInfo?: PhaseInfo;
}

export interface TextInputExercise {
  type: "text_input";
  question: string;
  answer: string;
  hint: string;
  phaseInfo?: PhaseInfo;
}

export interface OrderingExercise {
  type: "ordering";
  instruction: string;
  items: string[];
  correctOrder: number[];
  phaseInfo?: PhaseInfo;
}

export interface FillBlankExercise {
  type: "fill_blank";
  instruction: string;
  sentence: string;
  blanks: string[];
  words: string[];
  phaseInfo?: PhaseInfo;
}

export interface BriefingExercise {
  type: "briefing";
  scenarioTitle: string;
  category: "blue_team" | "red_team";
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
  narrative: string;
  evidence: string;
  totalPhases: number;
}

export type Exercise =
  | MultipleChoiceExercise
  | AssociationExercise
  | TextInputExercise
  | OrderingExercise
  | FillBlankExercise
  | BriefingExercise;

export const LESSONS: Exercise[] = [
  // ─────────────────────────────────────────────────────────────
  // CENÁRIO 1 — Blue Team | Iniciante
  // Credential Stuffing em FinTech
  // ─────────────────────────────────────────────────────────────
  {
    type: "briefing",
    scenarioTitle: "Ataque à FinTech Pague+",
    category: "blue_team",
    difficulty: "Iniciante",
    narrative:
      "Você é analista de segurança da FinTech Pague+. São 02h14 quando o sistema de alertas dispara:\n\n47 tentativas de login no painel admin em 3 minutos, todas de IPs diferentes.\n\nOs logs abaixo foram capturados automaticamente. Sua missão: identificar o ataque, ordenar a resposta e configurar a defesa.",
    evidence:
      "[02:14:01] POST /login  IP: 189.45.12.3   user: admin  → 401\n[02:14:02] POST /login  IP: 201.17.88.1   user: admin  → 401\n[02:14:03] POST /login  IP: 177.32.45.9   user: admin  → 401\n[02:14:04] POST /login  IP: 190.22.11.5   user: admin  → 200 ✓\n[02:14:05] POST /login  IP: 203.55.71.2   user: admin  → 401\n[02:14:06] POST /login  IP: 198.18.44.7   user: admin  → 401",
    totalPhases: 3,
  },
  {
    type: "multiple_choice",
    question: "Com base nos logs, qual tipo de ataque está sendo executado?",
    options: [
      "Credential Stuffing",
      "Brute Force simples",
      "SQL Injection",
      "DDoS volumétrico",
    ],
    correct: 0,
    explanation:
      "Credential Stuffing usa listas de credenciais vazadas de outros serviços. O indicador clássico é múltiplos IPs diferentes tentando o mesmo usuário — diferente do Brute Force, que normalmente vem de um único IP.",
    phaseInfo: { scenario: "Ataque à FinTech Pague+", phase: 1, total: 3 },
  },
  {
    type: "ordering",
    instruction: "Ordene as ações de resposta imediata ao incidente:",
    items: [
      "Resetar senha do admin",
      "Bloquear IPs maliciosos",
      "Analisar a sessão autenticada",
      "Ativar MFA obrigatório",
      "Notificar equipe de segurança",
    ],
    correctOrder: [4, 1, 2, 0, 3],
    phaseInfo: { scenario: "Ataque à FinTech Pague+", phase: 2, total: 3 },
  },
  {
    type: "fill_blank",
    instruction: "Complete a regra de rate limiting para o endpoint de login:",
    sentence:
      "Bloquear IP após ___ tentativas falhas em ___ segundos. Retornar HTTP ___.",
    blanks: ["5", "60", "429"],
    words: ["5", "10", "60", "300", "200", "401", "429", "503"],
    phaseInfo: { scenario: "Ataque à FinTech Pague+", phase: 3, total: 3 },
  },

  // ─────────────────────────────────────────────────────────────
  // CENÁRIO 2 — Red Team | Avançado
  // SQL Injection em API REST
  // ─────────────────────────────────────────────────────────────
  {
    type: "briefing",
    scenarioTitle: "Pentest: API Vulnerável",
    category: "red_team",
    difficulty: "Avançado",
    narrative:
      "Você é pentester contratado para avaliar a segurança da API da empresa TechCorp. Durante a fase de reconhecimento, você encontrou um endpoint que parece retornar dados de usuários.\n\nAnalise as respostas abaixo e determine se o endpoint é vulnerável.",
    evidence:
      "GET /api/user?id=1\n→ {\"id\":1, \"name\":\"Ana\", \"email\":\"ana@corp.com\"}\n\nGET /api/user?id=1 OR 1=1--\n→ {\"id\":1, \"name\":\"Ana\", \"email\":\"ana@corp.com\"}\n\nGET /api/user?id=0 UNION SELECT 1,table_name,3 FROM information_schema.tables--\n→ {\"id\":1, \"name\":\"users\", \"email\":\"3\"}",
    totalPhases: 3,
  },
  {
    type: "multiple_choice",
    question:
      "Com base nas respostas da API, o endpoint é vulnerável a qual tipo de ataque?",
    options: [
      "SQL Injection (SQLi)",
      "Cross-Site Scripting (XSS)",
      "Command Injection",
      "Path Traversal",
    ],
    correct: 0,
    explanation:
      "A terceira requisição confirmou SQLi: o parâmetro `id` foi injetado com um UNION SELECT que retornou dados do schema do banco. A resposta vazou `users` como nome de tabela — prova de execução de SQL arbitrário.",
    phaseInfo: { scenario: "Pentest: API Vulnerável", phase: 1, total: 3 },
  },
  {
    type: "text_input",
    question:
      "Qual payload você usaria para extrair todos os emails da tabela `users` via UNION SELECT?",
    answer: "0 UNION SELECT 1,email,3 FROM users--",
    hint: "0 UNION ___ 1,email,3 ___ users--",
    phaseInfo: { scenario: "Pentest: API Vulnerável", phase: 2, total: 3 },
  },
  {
    type: "association",
    instruction: "Associe cada vulnerabilidade à sua causa raiz:",
    pairs: [
      { left: "SQL Injection", right: "Falta de prepared statements" },
      { left: "XSS", right: "Falta de sanitização de HTML" },
      { left: "IDOR", right: "Sem verificação de autorização" },
      { left: "Path Traversal", right: "Sem validação de caminhos" },
    ],
    phaseInfo: { scenario: "Pentest: API Vulnerável", phase: 3, total: 3 },
  },

  // ─────────────────────────────────────────────────────────────
  // EXERCÍCIOS AVULSOS — Fundamentos
  // ─────────────────────────────────────────────────────────────
  {
    type: "multiple_choice",
    question: "O que é o protocolo HTTPS?",
    options: [
      "HTTP com criptografia TLS/SSL",
      "Uma versão mais rápida do HTTP",
      "Um protocolo exclusivo para APIs",
      "HTTP sem estado",
    ],
    correct: 0,
    explanation:
      "HTTPS adiciona a camada TLS (anteriormente SSL) sobre o HTTP, garantindo confidencialidade, integridade e autenticação do servidor.",
  },
  {
    type: "ordering",
    instruction: "Ordene as camadas do modelo OSI da mais baixa para a mais alta:",
    items: ["Aplicação", "Física", "Transporte", "Rede", "Enlace"],
    correctOrder: [1, 4, 3, 2, 0],
  },
  {
    type: "fill_blank",
    instruction: "Complete o conceito de autenticação multifator:",
    sentence:
      "MFA combina algo que você ___, algo que você ___, e algo que você ___.",
    blanks: ["sabe", "tem", "é"],
    words: ["sabe", "tem", "é", "faz", "vê", "quer"],
  },
];
