export type ExerciseType =
  | "multiple_choice"
  | "association"
  | "text_input"
  | "ordering"
  | "fill_blank"
  | "briefing"
  | "phishing_email";

export interface PhaseInfo {
  scenario: string;
  phase: number;
  total: number;
}

// ── Shared educational fields (optional, used by hint/feedback panel) ─────────
export interface EducationalFields {
  hint?: string;
  feedbackCorrect?: string;
  feedbackWrong?: string;
  learnMore?: string;
}

export interface MultipleChoiceExercise extends EducationalFields {
  type: "multiple_choice";
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  phaseInfo?: PhaseInfo;
}

export interface AssociationExercise extends EducationalFields {
  type: "association";
  instruction: string;
  pairs: { left: string; right: string }[];
  phaseInfo?: PhaseInfo;
}

export interface TextInputExercise extends EducationalFields {
  type: "text_input";
  question: string;
  answer: string;
  hint: string;
  phaseInfo?: PhaseInfo;
}

export interface OrderingExercise extends EducationalFields {
  type: "ordering";
  instruction: string;
  items: string[];
  correctOrder: number[];
  phaseInfo?: PhaseInfo;
}

export interface FillBlankExercise extends EducationalFields {
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
  category: "blue_team" | "red_team" | "lgpd" | "awareness";
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
  narrative: string;
  evidence: string;
  totalPhases: number;
}

export type FraudIndicator = "sender" | "link" | "attachment";

export type PhishingElementCategory = "suspicious" | "neutral" | "trap";

export interface PhishingElementDef {
  id: string;
  label: string;
  category: PhishingElementCategory;
  feedback: string;
}

export interface PhishingEmailExercise extends EducationalFields {
  type: "phishing_email";
  fromDisplay?: string;
  fromEmail?: string;
  to?: string;
  subject?: string;
  greeting?: string;
  body?: string;
  urgencyText?: string;
  buttonText?: string;
  linkText?: string;
  linkRealUrl?: string;
  attachmentName?: string;
  footerText?: string;
  fraudIndicators?: FraudIndicator[]; // Legacy
  phishingElements?: PhishingElementDef[]; // New model
  correctElementIds?: string[]; // New model
  explanation: string;
  phaseInfo?: PhaseInfo;
}

export type Exercise =
  | MultipleChoiceExercise
  | AssociationExercise
  | TextInputExercise
  | OrderingExercise
  | FillBlankExercise
  | BriefingExercise
  | PhishingEmailExercise;

// ── Module definitions ────────────────────────────────────────────────────────
// Nota: O campo `id` é LEGADO e usado pelo backend (Supabase) e ProgressContext 
// para salvar o progresso do usuário. A renderização da trilha no frontend
// DEVE obedecer a ordem sequencial deste array, e não a ordem numérica dos IDs.
export interface ModuleDefinition {
  id: number;
  title: string;
  subtitle: string;
  iconName: "Shield" | "Key" | "AlertTriangle" | "FileText" | "Mail";
  startIdx: number;
  length: number;
  accentColor: string;
  category: BriefingExercise["category"];
  difficulty: BriefingExercise["difficulty"];
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: 1, // ID Antigo
    title: "Segurança da Informação na prática",
    subtitle: "Princípios essenciais da informação",
    iconName: "Shield",
    startIdx: 0,
    length: 6,
    accentColor: "#6366F1",
    category: "awareness",
    difficulty: "Iniciante",
  },
  {
    id: 7,
    title: "Tríade CID (Aprofundamento)",
    subtitle: "Confidencialidade, Integridade e Disponibilidade",
    iconName: "Shield",
    startIdx: 26,
    length: 4,
    accentColor: "#4F46E5",
    category: "awareness",
    difficulty: "Iniciante",
  },
  {
    id: 8,
    title: "Ativos de Informação",
    subtitle: "Reconhecimento e valor",
    iconName: "FileText",
    startIdx: 30,
    length: 4,
    accentColor: "#3B82F6",
    category: "awareness",
    difficulty: "Iniciante",
  },
  {
    id: 9,
    title: "Classificação da Informação",
    subtitle: "Proteção conforme o valor",
    iconName: "FileText",
    startIdx: 34,
    length: 4,
    accentColor: "#2563EB",
    category: "awareness",
    difficulty: "Iniciante",
  },
  {
    id: 3, // ID Antigo
    title: "Identidade e Acesso",
    subtitle: "Gestão de identidade e acessos",
    iconName: "Key",
    startIdx: 6,
    length: 5,
    accentColor: "#3B82F6",
    category: "blue_team",
    difficulty: "Intermediário",
  },
  {
    id: 10,
    title: "Autenticação e MFA",
    subtitle: "Múltiplos Fatores de Segurança",
    iconName: "Key",
    startIdx: 38,
    length: 4,
    accentColor: "#059669",
    category: "blue_team",
    difficulty: "Intermediário",
  },
  {
    id: 5, // ID Antigo
    title: "Privacidade e Accountability",
    subtitle: "Proteção e responsabilidade",
    iconName: "FileText",
    startIdx: 16,
    length: 5,
    accentColor: "#8B5CF6",
    category: "lgpd",
    difficulty: "Intermediário",
  },
  {
    id: 2, // ID Antigo
    title: "Ameaças, Vulnerabilidades e Riscos",
    subtitle: "Compreendendo o perigo",
    iconName: "AlertTriangle",
    startIdx: 11,
    length: 5,
    accentColor: "#EF4444",
    category: "red_team",
    difficulty: "Intermediário",
  },
  {
    id: 11,
    title: "Malware e Vetores de Infecção",
    subtitle: "Software malicioso e disfarces",
    iconName: "AlertTriangle",
    startIdx: 42,
    length: 5,
    accentColor: "#DC2626",
    category: "red_team",
    difficulty: "Intermediário",
  },
  {
    id: 12,
    title: "Controles de Segurança",
    subtitle: "Prevenção e mitigação de danos",
    iconName: "Shield",
    startIdx: 47,
    length: 4,
    accentColor: "#0D9488",
    category: "blue_team",
    difficulty: "Avançado",
  },
  {
    id: 13,
    title: "Tipos de Controles",
    subtitle: "Físico, Lógico e Administrativo",
    iconName: "Shield",
    startIdx: 51,
    length: 4,
    accentColor: "#0F766E",
    category: "blue_team",
    difficulty: "Avançado",
  },
  {
    id: 14,
    title: "Fator Humano",
    subtitle: "O elo mais vulnerável da cadeia",
    iconName: "Shield",
    startIdx: 55,
    length: 5,
    accentColor: "#D97706",
    category: "awareness",
    difficulty: "Avançado",
  },
  {
    id: 4, // ID Antigo
    title: "Engenharia Social e Phishing",
    subtitle: "Prevenção contra ataques modernos",
    iconName: "Mail",
    startIdx: 21,
    length: 5,
    accentColor: "#F59E0B",
    category: "awareness",
    difficulty: "Avançado",
  },
  {
    id: 15,
    title: "Cultura e Boas Práticas",
    subtitle: "Segurança no dia a dia corporativo",
    iconName: "Shield",
    startIdx: 60,
    length: 4,
    accentColor: "#EAB308",
    category: "awareness",
    difficulty: "Avançado",
  },
  {
    id: 6, // ID Antigo
    title: "Simulado Final",
    subtitle: "Teste definitivo de conhecimentos",
    iconName: "Shield",
    startIdx: 64,
    length: 5,
    accentColor: "#10B981",
    category: "awareness",
    difficulty: "Avançado",
  },
];

// ── All lessons ───────────────────────────────────────────────────────────────
export const LESSONS: Exercise[] = [
  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 1 — Tríade CID (indices 0–5)  ★ MÓDULO DEMO (VISITANTE) ★
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Fundamentos de Segurança de Aplicações",
    category: "awareness",
    difficulty: "Iniciante",
    narrative:
      "A Segurança da Informação é sustentada por três pilares fundamentais da ISO 27000: Confidencialidade, Integridade e Disponibilidade — a Tríade CID.\n\nMas segurança vai além da tecnologia. Ela exige equilíbrio entre Tecnologia, Pessoas e Processos. O elo mais fraco de um sistema quase sempre é o humano.",
    evidence:
      "ISO/IEC 27000 — Pilares da Segurança:\n\n  Confidencialidade → Acesso somente por autorizados\n  Integridade       → Dados não alterados sem permissão\n  Disponibilidade   → Sistemas acessíveis quando necessário\n\nFato: 95% dos incidentes têm causa raiz humana (IBM, 2023).",
    totalPhases: 5,
  },
  {
    type: "association",
    instruction: "Associe cada incidente ao pilar da Tríade CID que foi violado:",
    pairs: [
      { left: "Hacker visualiza dados médicos sem autorização", right: "Confidencialidade" },
      { left: "Vírus altera os valores de uma planilha financeira", right: "Integridade" },
      { left: "Ataque DDoS deixa site de banco fora do ar", right: "Disponibilidade" },
    ],
    phaseInfo: { scenario: "Tríade CID", phase: 1, total: 5 },
    hint: "Pense em qual pilar cada incidente afeta: quem pode ver (C), se foi alterado (I) ou se está acessível (D).",
    feedbackCorrect: "Perfeito! Você entendeu como cada pilar protege um aspecto diferente da informação.",
    feedbackWrong: "Quase lá! Relembre: Confidencialidade = quem acessa, Integridade = se foi alterado, Disponibilidade = se está acessível.",
    learnMore: "Confidencialidade protege contra acesso não autorizado. Integridade protege contra alterações indevidas. Disponibilidade garante que o sistema esteja no ar quando preciso.",
  },
  {
    type: "multiple_choice",
    question: "No ataque de Ransomware ao Grupo Fleury, os sistemas ficaram paralisados por vários dias. Qual pilar da Tríade CID foi mais severamente impactado?",
    options: ["Integridade", "Confidencialidade", "Disponibilidade", "Autenticidade"],
    correct: 2,
    explanation: "A paralisação operacional total é uma violação direta da Disponibilidade — impede o acesso oportuno às informações quando necessário.",
    phaseInfo: { scenario: "Tríade CID", phase: 2, total: 5 },
    hint: "Pense: o que acontece quando os sistemas ficam completamente indisponíveis? Qual pilar garante que os sistemas estejam acessíveis?",
    feedbackCorrect: "Exato! Quando sistemas ficam paralisados e indisponíveis, o pilar da Disponibilidade foi violado.",
    feedbackWrong: "Pense em qual pilar garante que os sistemas estejam acessíveis quando necessário. O ransomware bloqueou o acesso — isso é um problema de disponibilidade, não de integridade ou confidencialidade.",
    learnMore: "Disponibilidade significa que os sistemas e dados devem estar acessíveis aos usuários autorizados quando precisarem. Um ataque que paralisa sistemas viola diretamente esse pilar.",
  },
  {
    type: "fill_blank",
    instruction: "Complete os três pilares da Tríade CID conforme a ISO 27000:",
    sentence:
      "A ___ garante que a informação não seja vista por pessoas não autorizadas. A ___ assegura que o dado não foi modificado. A ___ garante que o sistema esteja acessível.",
    blanks: ["Confidencialidade", "Integridade", "Disponibilidade"],
    words: ["Confidencialidade", "Integridade", "Disponibilidade", "Autenticidade", "Privacidade", "Não Repúdio"],
    phaseInfo: { scenario: "Tríade CID", phase: 3, total: 5 },
    hint: "Os três pilares formam a sigla CID: Confidencialidade, Integridade, Disponibilidade — nessa ordem lógica.",
    feedbackCorrect: "Ótimo! Você memorizou os três pilares da Tríade CID e seus significados.",
    feedbackWrong: "Lembre-se da sigla CID: Confidencialidade (controle de acesso), Integridade (dados sem alteração) e Disponibilidade (sistema acessível). Tente novamente na ordem correta!",
    learnMore: "A Tríade CID é a base da ISO/IEC 27000. Confidencialidade: só autorizados acessam. Integridade: dados não são alterados sem permissão. Disponibilidade: sistemas ficam no ar quando necessário.",
  },
  {
    type: "multiple_choice",
    question: "Sua empresa comprou os firewalls mais caros do mercado, mas não treinou os funcionários para identificar e-mails falsos. Por que essa estratégia de defesa vai falhar?",
    options: [
      "Porque a segurança depende apenas de software atualizado",
      "Porque segurança exige equilíbrio entre Tecnologia, Pessoas e Processos",
      "Porque processos são irrelevantes se a tecnologia for de ponta",
      "Porque firewalls não protegem redes corporativas modernas",
    ],
    correct: 1,
    explanation: "Segurança não é só tecnologia. Depende de pessoas treinadas e processos definidos. O fator humano é o elo mais crítico.",
    phaseInfo: { scenario: "Tríade CID", phase: 4, total: 5 },
    hint: "A segurança depende de um tripé:\n1. Tecnologia (o firewall)\n2. Processos (regras)\n3. Pessoas (funcionários)\n\nSe um falhar, o ataque acontece.",
    feedbackCorrect: "Exato! Nenhum sistema é seguro se as pessoas não souberem usá-lo ou se não houver regras claras.",
    feedbackWrong: "Lembre-se: o firewall (Tecnologia) não impede um funcionário (Pessoa) de clicar num link malicioso. A segurança exige equilíbrio entre os três.",
    learnMore: "Pesquisas da IBM mostram que 95% dos incidentes de segurança têm causa raiz humana: um clique errado, uma senha fraca, falta de procedimento. Por isso pessoas e processos são tão críticos quanto a tecnologia.",
  },
  {
    type: "text_input",
    question: "Em uma aplicação web, qual é o nome do controle que impede um usuário de acessar dados de outro usuário?",
    answer: "autorização|controle de autorização|validação de autorização",
    hint: "Pense na diferença:\n- Autenticação: provar quem você é.\n- ________: verificar se você tem permissão.",
    phaseInfo: { scenario: "Tríade CID", phase: 5, total: 5 },
    feedbackCorrect: "Boa! É a autorização que garante que você só veja o que é seu.",
    feedbackWrong: "Você não precisa apenas saber quem é o usuário, mas verificar o que ele pode acessar. É o controle de...",
    learnMore: "Autenticação confirma identidade. Autorização define permissões.",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 3 — IAM (indices 6–10)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Controle de acesso e autenticação",
    category: "blue_team",
    difficulty: "Intermediário",
    narrative:
      "A Gestão de Identidade e Acesso (IAM) controla quem pode acessar o quê. O fluxo obrigatório tem três etapas em sequência: Identificação, Autenticação e Autorização.\n\nAutenticar com múltiplos fatores (MFA) é a medida mais eficaz para proteger identidades digitais.",
    evidence:
      "Fluxo IAM obrigatório:\n\n  1. Identificação  → Quem é você? (usuário/login)\n  2. Autenticação   → Prove que é você (senha + token)\n  3. Autorização    → O que você pode fazer? (permissões)\n\nFatores MFA:\n  Saber → Senha, PIN\n  Ter   → Token, smart card, celular\n  Ser   → Biometria, face ID, íris",
    totalPhases: 4,
  },
  {
    type: "ordering",
    instruction: "Ordene as etapas do fluxo de acesso seguindo a lógica correta do IAM:",
    items: [
      "Verificar se o usuário tem permissão para acessar o arquivo (Autorização)",
      "Informar o nome de usuário ao sistema (Identificação)",
      "Inserir senha e token para validar a identidade (Autenticação)",
    ],
    correctOrder: [1, 2, 0],
    phaseInfo: { scenario: "IAM", phase: 1, total: 4 },
    hint: "Pense na ordem lógica: primeiro você diz quem é, depois prova quem é, e só então o sistema decide o que você pode fazer.",
    feedbackCorrect: "Perfeito! Identificação → Autenticação → Autorização é a sequência correta do IAM.",
    feedbackWrong: "A ordem correta é: 1) Identificação (dizer quem é), 2) Autenticação (provar quem é), 3) Autorização (o que pode fazer).",
    learnMore: "No IAM, você sempre começa se identificando (login/usuário), depois se autentica (senha/token/biometria) e só então o sistema autoriza suas ações com base nas suas permissões.",
  },
  {
    type: "association",
    instruction: "Classifique cada método de autenticação no tipo de fator correto:",
    pairs: [
      { left: "Impressão digital ou reconhecimento facial", right: "Algo que você É" },
      { left: "Senha numérica (PIN) ou frase secreta", right: "Algo que você SABE" },
      { left: "Token físico, smart card ou celular", right: "Algo que você TEM" },
    ],
    phaseInfo: { scenario: "IAM", phase: 2, total: 4 },
    hint: "MFA usa 3 categories: o que você SABE (memória), o que você TEM (objeto físico) e o que você É (característica biológica).",
    feedbackCorrect: "Excelente! Você domina os três fatores de autenticação do MFA.",
    feedbackWrong: "Lembre: SABER = algo memorizado (senha/PIN). TER = algo físico (token/celular). SER = característica biológica única (digital/rosto).",
    learnMore: "MFA é mais seguro porque combina fatores de categorias diferentes. Se sua senha vazar, um atacante ainda precisaria do seu token físico ou da sua biometria para acessar.",
  },
  {
    type: "multiple_choice",
    question: "Você ativou a Autenticação de Múltiplos Fatores (MFA) para proteger sua conta corporativa. Qual das combinações abaixo é a única que realmente aumenta a segurança usando categorias diferentes?",
    options: [
      "Senha e PIN — dois fatores do mesmo tipo 'saber'",
      "Senha (saber) e Token no celular (ter) — fatores independentes",
      "Cartão de acesso (ter) e chave física da sala (ter)",
      "Reconhecimento facial e leitura de íris — ambos 'ser'",
    ],
    correct: 1,
    explanation: "A segurança aumenta com fatores de categorias DIFERENTES: algo que você sabe (senha) + algo que você tem (token) garante proteção mesmo com senha vazada.",
    phaseInfo: { scenario: "IAM", phase: 3, total: 4 },
    hint: "Pense em categorias diferentes:\n1. Algo que você SABE (senha)\n2. Algo que você TEM (celular)\n\nUsar duas coisas da mesma categoria não resolve.",
    feedbackCorrect: "Correto! Senha (SABER) + Token (TER) combinam categorias distintas, tornando o acesso muito mais seguro.",
    feedbackWrong: "Atenção: para o MFA ser eficaz, os fatores precisam ser de categorias DIFERENTES. Duas senhas ou dois cartões não oferecem proteção extra real.",
    learnMore: "MFA só é eficaz quando combina categorias distintas. Se um atacante obtém sua senha, ele ainda precisaria de algo físico (celular/token) para entrar. Por isso o MFA reduz drasticamente o risco de invasão.",
  },
  {
    type: "multiple_choice",
    question: "Em um hospital, médicos editam prontuários, mas a recepção só visualiza a agenda. Se a recepcionista tentar alterar um prontuário, qual etapa do fluxo de acesso vai bloqueá-la?",
    options: [
      "Identificação — o sistema não reconhece o usuário",
      "Autenticação — a senha da recepcionista é inválida",
      "Autorização — ela não tem permissão para essa ação",
      "Criptografia — o arquivo está protegido por chave",
    ],
    correct: 2,
    explanation: "A Autorização define quais ações um usuário autenticado pode executar. A recepcionista foi identificada e autenticada, mas não tem permissão de Update sobre prontuários.",
    phaseInfo: { scenario: "IAM", phase: 4, total: 4 },
    hint: "A recepcionista já fez login (está identificada e autenticada). O bloqueio acontece quando o sistema decide O QUE ela pode fazer.",
    feedbackCorrect: "Certo! A Autorização é o que controla as permissões (quem pode fazer o quê).",
    feedbackWrong: "Ela já fez o login com sucesso (Identificação e Autenticação). O bloqueio ocorre na etapa que define o nível de permissão dela (Autorização).",
    learnMore: "Autorização é o controle de acesso baseado em papéis (RBAC). Mesmo usuários autenticados só podem realizar ações que seu perfil permite. Isso é o princípio do menor privilégio em ação.",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 2 — Ameaças e Malware (indices 11–15)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Riscos comuns em aplicações",
    category: "red_team",
    difficulty: "Intermediário",
    narrative:
      "Ameaças são agentes externos que exploram Vulnerabilidades — fraquezas internas dos sistemas. A combinação gera o Risco.\n\nMalwares são os principais vetores: Vírus, Worms, Trojans, Ransomware e Botnets têm comportamentos distintos e exigem respostas específicas.",
    evidence:
      "Tipos de Malware:\n\n  Vírus      → Depende do usuário para se espalhar\n  Worm       → Propaga-se sozinho pela rede\n  Trojan     → Disfarça-se como software legítimo\n  Ransomware → Criptografa dados e exige resgate\n  Botnet     → Rede de zumbis para ataques em escala\n\nFórmula: Risco = Ameaça × Vulnerabilidade × Impacto",
    totalPhases: 4,
  },
  {
    type: "multiple_choice",
    question: "Qual situação representa o maior risco de segurança para uma aplicação web corporativa?",
    options: [
      "Validar permissões e dados apenas no frontend",
      "Utilizar HTTPS em todas as páginas",
      "Sanitizar e validar todas as entradas do usuário",
      "Registrar logs de acesso detalhados",
    ],
    correct: 0,
    explanation: "Validar dados apenas no frontend é extremamente perigoso, pois um atacante pode facilmente burlar a interface e enviar requisições maliciosas diretamente ao servidor.",
    phaseInfo: { scenario: "Ameaças", phase: 1, total: 4 },
    hint: "Frontend (navegador) nunca é confiável, pois o usuário tem controle total sobre o que envia.",
    feedbackCorrect: "Exato! O frontend pode ser manipulado. A validação de segurança e permissões DEVE acontecer no backend (servidor).",
    feedbackWrong: "Pense em onde o atacante tem controle. Ele pode manipular tudo que acontece no navegador dele. Confiar apenas no navegador (frontend) é o maior risco.",
    learnMore: "A Regra de Ouro em AppSec é: 'Nunca confie na entrada do usuário'. Se você validar apenas no frontend, basta o atacante usar ferramentas como o Burp Suite para enviar comandos destrutivos direto para o seu servidor.",
  },
  {
    type: "ordering",
    instruction: "Organize a sequência ideal de resposta inicial a um incidente (ex: detecção de malware):",
    items: [
      "Isolar a ameaça suspeita",
      "Avaliar o impacto gerado",
      "Corrigir a vulnerabilidade",
      "Documentar o aprendizado",
    ],
    correctOrder: [0, 1, 2, 3],
    phaseInfo: { scenario: "Ameaças", phase: 2, total: 4 },
    hint: "Você não pode corrigir antes de isolar, e não pode considerar resolvido sem validar e documentar.",
    feedbackCorrect: "Excelente! Essa é a sequência clássica de resposta a incidentes: Isolar > Avaliar > Corrigir > Validar > Aprender.",
    feedbackWrong: "Você não pode corrigir uma falha antes de isolar a ameaça e avaliar o impacto. E o último passo é sempre registrar o aprendizado.",
    learnMore: "Em cibersegurança, a contenção (isolar) vem antes da erradicação (corrigir). Se você tentar corrigir enquanto o malware ainda se espalha, perderá o controle da situação. O registro final (Post-Mortem) previne que o erro se repita.",
  },
  {
    type: "association",
    instruction: "Associe o comportamento ao tipo correto de malware:",
    pairs: [
      { left: "Infecta arquivos, precisa de execução humana", right: "Vírus" },
      { left: "Propaga-se sozinho por falhas de rede", right: "Worm" },
      { left: "Disfarçado de programa legítimo", right: "Trojan" },
    ],
    phaseInfo: { scenario: "Ameaças", phase: 3, total: 4 },
    hint: "A diferença chave: Vírus precisa de ação humana, Worm é autônomo, Trojan engana fingindo ser legítimo.",
    feedbackCorrect: "Perfeito! Cada tipo de malware tem comportamento distinto e requer resposta diferente.",
    feedbackWrong: "Lembre: Vírus = precisa de execução humana. Worm = se propaga sozinho. Trojan = disfarçado de software legítimo.",
    learnMore: "Entender o comportamento de cada malware ajuda na defesa: Vírus = não execute arquivos suspeitos. Worm = mantenha sistemas atualizados. Trojan = só instale software de fontes confiáveis.",
  },
  {
    type: "text_input",
    question: "Um atacante infectou milhares de dispositivos para realizar um ataque DDoS. Qual o nome dado a essa rede de dispositivos controlados remotamente?",
    answer: "botnet|rede zumbi|rede de bots",
    phaseInfo: { scenario: "Ameaças", phase: 4, total: 4 },
    hint: "A palavra é a junção de 'robot' e 'network'.",
    feedbackCorrect: "Exato! Uma Botnet é usada para ataques em massa, como derrubar sites (DDoS) ou minerar criptomoedas.",
    feedbackWrong: "Lembre-se da junção das palavras robot (robô) e network (rede): Botnet.",
    learnMore: "Botnets modernas infectam roteadores, câmeras e lâmpadas inteligentes. Mudar a senha padrão dos seus dispositivos IoT é a melhor forma de não virar um 'zumbi'.",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 5 — LGPD e Privacidade (indices 16–20)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Proteção de dados",
    category: "lgpd",
    difficulty: "Intermediário",
    narrative:
      "A Lei nº 13.709/2018 (LGPD) entrou em vigor em setembro de 2020 e regulamenta o tratamento de dados pessoais de brasileiros por qualquer organização.\n\nA lei cria direitos para os titulares, obrigações para as empresas e estabelece a ANPD como autoridade fiscalizadora. Descumpri-la pode gerar multas de até 2% do faturamento.",
    evidence:
      "LGPD — Pontos-chave:\n\n  Dado pessoal   → Qualquer info que identifique uma pessoa\n  Titular        → A pessoa natural a quem os dados se referem\n  Controlador    → Quem decide como tratar os dados\n  Operador       → Quem trata os dados em nome do controlador\n  DPO/ENCARREGADO→ Responsável pela conformidade na empresa\n  ANPD           → Autoridade Nacional de Proteção de Dados\n\nPenalidades: até 2% do faturamento ou R$ 50M por infração.",
    totalPhases: 4,
  },
  {
    type: "multiple_choice",
    question: "A LGPD protege os dados pessoais dos cidadãos. Quais das alternativas abaixo contêm APENAS informações consideradas dados pessoais pela lei?",
    options: [
      "Apenas o CPF, pois é um documento oficial",
      "CPF e nome completo (e-mail não entra na regra)",
      "CPF, nome, e-mail e endereço IP",
      "Nenhum, pois dados publicados em redes sociais perdem a proteção",
    ],
    correct: 2,
    explanation: "A LGPD define dado pessoal como qualquer informação que identifique ou possa identificar uma pessoa natural, incluindo nome, CPF, e-mail, endereço IP e muito mais.",
    phaseInfo: { scenario: "LGPD", phase: 1, total: 4 },
    hint: "Lembre-se:\n- Dado direto: Nome, CPF.\n- Dado indireto: E-mail, IP do computador.\nTudo que ajuda a descobrir quem é a pessoa é um dado pessoal.",
    feedbackCorrect: "Correto! A lei é ampla: se a informação permite identificar você (direta ou indiretamente), é um dado pessoal.",
    feedbackWrong: "Atenção: não é só documento oficial. O endereço IP do seu computador ou o seu e-mail de trabalho também identificam você, logo, são dados pessoais.",
    learnMore: "Dados pessoais sensíveis têm proteção ainda maior: origem racial, convicção religiosa, dado genético, biométrico, saúde, vida sexual e dados de crianças/adolescentes exigem tratamento especial.",
  },
  {
    type: "association",
    instruction: "Associe cada direito do titular ao que ele permite fazer:",
    pairs: [
      { left: "Direito de Acesso", right: "Saber quais dados a empresa possui sobre você" },
      { left: "Direito de Exclusão", right: "Solicitar a remoção dos seus dados pessoais" },
      { left: "Direito de Portabilidade", right: "Transferir seus dados para outro fornecedor" },
    ],
    phaseInfo: { scenario: "LGPD", phase: 2, total: 4 },
    hint: "Acesso = ver, Exclusão = apagar, Portabilidade = mover. Cada direito dá controle sobre uma ação diferente.",
    feedbackCorrect: "Perfeito! Você conhece os direitos do titular garantidos pela LGPD.",
    feedbackWrong: "Lembre: Acesso = conhecer seus dados. Exclusão = apagar seus dados. Portabilidade = levar seus dados para outro serviço.",
    learnMore: "A LGPD garante 9 direitos ao titular: acesso, correção, exclusão, portabilidade, informação, revogação do consentimento, oposição, revisão de decisões automatizadas e confirmação de existência dos dados.",
  },
  {
    type: "fill_blank",
    instruction: "Complete as bases legais para tratamento de dados pessoais:",
    sentence:
      "O tratamento de dados é permitido com o ___ do titular, para cumprir uma ___ legal, ou para proteger a ___ ou incolumidade física do titular.",
    blanks: ["consentimento", "obrigação", "vida"],
    words: ["consentimento", "obrigação", "vida", "interesse", "contrato", "lucro", "aprovação", "notificação"],
    phaseInfo: { scenario: "LGPD", phase: 3, total: 4 },
    hint: "A LGPD lista 10 bases legais. As mais comuns: consentimento explícito, obrigação legal e proteção da vida.",
    feedbackCorrect: "Correto! Consentimento, obrigação legal e proteção da vida são três das 10 bases legais da LGPD.",
    feedbackWrong: "A LGPD permite o tratamento de dados com: consentimento do titular, para cumprir obrigação legal, ou para proteger a vida do titular.",
    learnMore: "A LGPD tem 10 bases legais para tratamento de dados. Consentimento é a mais conhecida, mas não a única. Contratos, obrigações legais e legítimo interesse também justificam o tratamento sem consentimento.",
  },
  {
    type: "multiple_choice",
    question: "Qual órgão é responsável por fiscalizar e aplicar sanções relacionadas à LGPD no Brasil?",
    options: [
      "Ministério da Justiça e Segurança Pública",
      "PROCON — Programa de Proteção e Defesa do Consumidor",
      "ANPD — Autoridade Nacional de Proteção de Dados",
      "Banco Central do Brasil",
    ],
    correct: 2,
    explanation: "A ANPD é a autoridade criada pela LGPD para zelar pela proteção de dados pessoais, emitir regulamentos, fiscalizar e aplicar sanções administrativas às organizações infratoras.",
    phaseInfo: { scenario: "LGPD", phase: 4, total: 4 },
    hint: "A LGPD criou um órgão específico para fiscalização. Pense em qual sigla combina com 'Nacional de Proteção de Dados'.",
    feedbackCorrect: "Correto! A ANPD (Autoridade Nacional de Proteção de Dados) é o órgão regulador criado pela própria LGPD.",
    feedbackWrong: "A LGPD criou a ANPD especificamente para fiscalizar sua aplicação. PROCON cuida de relações de consumo, Banco Central cuida do sistema financeiro, Ministério da Justiça tem escopo diferente.",
    learnMore: "A ANPD pode aplicar multas de até 2% do faturamento ou R$ 50 milhões por infração. Além da ANPD, a própria LGPD permite que titulares busquem reparação judicial por danos.",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 4 — Phishing Avançado (indices 21–25)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Phishing e engenharia social",
    category: "awareness",
    difficulty: "Avançado",
    narrative:
      "Phishing é a técnica mais eficaz para comprometer credenciais corporativas — responsável por mais de 80% das violações de dados. Engenharia social explora o fator humano, não a tecnologia.\n\nSpear Phishing, BEC (Business Email Compromise) e Vishing são variações avançadas que usam personalização para enganar até profissionais treinados.",
    evidence:
      "Indicadores de Phishing:\n\n  Remetente   → Domínio diferente do oficial (.net vs .com)\n  Urgência    → 'Sua conta será bloqueada em 24h'\n  Links       → URLs com erros de grafia (misspelling)\n  Anexos      → .exe, .js, .vbs nunca devem ser abertos\n  Pedidos     → Credenciais, senhas, dados nunca por e-mail\n\nProtocolo: Não clique → Não abra → Reporte ao time de SI.",
    totalPhases: 4,
  },
  {
    type: "multiple_choice",
    question: "Um e-mail foi enviado especificamente ao gerente financeiro, citando seu nome, o nome do CEO e um número de contrato real. Que tipo de ataque é esse?",
    options: [
      "Phishing genérico — disparo em massa sem personalização",
      "Smishing — ataque via SMS ou WhatsApp",
      "Spear Phishing — e-mail altamente personalizado e direcionado",
      "Vishing — ataque por ligação telefônica",
    ],
    correct: 2,
    explanation: "Spear Phishing usa informações reais da vítima (nome, cargo, contexto) para criar e-mails convincentes. É 3x mais eficaz que phishing genérico exatamente por ser personalizado.",
    phaseInfo: { scenario: "Phishing", phase: 1, total: 4 },
    hint: "A palavra 'spear' significa lança em inglês — um ataque direcionado e preciso a uma pessoa específica, ao contrário de uma rede (fishing) genérica.",
    feedbackCorrect: "Correto! Spear Phishing é o ataque direcionado com informações reais da vítima — muito mais perigoso que o phishing genérico.",
    feedbackWrong: "A personalização é a chave: nome, cargo e contexto real = Spear Phishing. Smishing = SMS. Vishing = ligação. Phishing genérico = e-mail em massa sem personalização.",
    learnMore: "Spear Phishing é tão eficaz porque os atacantes pesquisam a vítima no LinkedIn, redes sociais e sites corporativos antes de agir. A familiaridade cria confiança — e aí está o perigo.",
  },
  {
    type: "phishing_email",
    subject: "🔴 URGENTE: Sua conta será bloqueada em 24 horas",
    phishingElements: [
      {
        id: "sender",
        label: "Segurança Corporativa TI <security@empresa-corp.net.br>",
        category: "suspicious",
        feedback: "O domínio do remetente termina em '.net.br' em vez do domínio oficial '.com.br' da sua empresa. Atacantes costumam registrar domínios parecidos para enganar."
      },
      {
        id: "greeting",
        label: "Olá funcionário,",
        category: "neutral",
        feedback: "Uma saudação impessoal pode ser um indício, mas não é prova definitiva de fraude."
      },
      {
        id: "urgency_text",
        label: "Detectamos acesso suspeito à sua conta corporativa. Para evitar o bloqueio imediato, verifique suas credenciais clicando no link abaixo. Esta ação é obrigatória e deve ser realizada em menos de 24 horas.",
        category: "suspicious",
        feedback: "O texto cria pânico ('bloqueio imediato', 'obrigatória') para forçar você a agir rápido. Serviços de TI não ameaçam bloqueios fulminantes por e-mail."
      },
      {
        id: "attachment",
        label: "📎 Comprovante_Acesso.exe",
        category: "suspicious",
        feedback: "Um anexo executável (.exe) enviado por e-mail é um alerta vermelho absoluto. É muito provável que seja um trojan."
      },
      {
        id: "link",
        label: "Verificar minha conta agora\n(http://empresa-corp.net.br/verify-acc0unt-secure)",
        category: "suspicious",
        feedback: "O link contém caracteres disfarçados (o número '0' no lugar da letra 'o' em 'acc0unt')."
      },
      {
        id: "footer",
        label: "Atenciosamente,\nTime de Segurança da Informação",
        category: "neutral",
        feedback: "A assinatura parece oficial, mas qualquer golpista pode copiar e colar uma assinatura corporativa."
      }
    ],
    correctElementIds: ["sender", "urgency_text", "link", "attachment"],
    explanation: "Três red flags gravíssimas: (1) Domínio do remetente falsificado; (2) Link usa 'acc0unt' com zero; (3) Anexo .exe nunca deve ser aberto em ambiente corporativo.",
    phaseInfo: { scenario: "Phishing", phase: 2, total: 4 },
    hint: "Examine com cuidado: o remetente é realmente da sua empresa? O link tem algo estranho? O anexo é seguro?",
    feedbackCorrect: "Muito bem! Você identificou todos os indicadores de fraude nesse e-mail.",
    feedbackWrong: "Sua análise falhou. Procure as irregularidades: domínio do remetente (.net.br), caracteres trocados no link (0 no lugar de 'o') e extensão perigosa do arquivo (.exe).",
    learnMore: "Protocolo anti-phishing: Não clique → Não abra → Reporte. Se receber um e-mail suspeito, sempre confirme pelo canal oficial antes de qualquer ação.",
  },
  {
    type: "ordering",
    instruction: "Ordene corretamente os passos do protocolo de resposta ao receber um e-mail suspeito:",
    items: [
      "Reportar o e-mail ao time de Segurança da Informação",
      "Não clicar em nenhum link ou botão do e-mail",
      "Não abrir anexos — mesmo que pareçam documentos normais",
      "Aguardar orientação do time de SI antes de qualquer ação",
    ],
    correctOrder: [1, 2, 0, 3],
    phaseInfo: { scenario: "Phishing", phase: 3, total: 4 },
    hint: "O protocolo começa com NÃO fazer nada de prejudicial (não clicar, não abrir), depois reportar, e por fim aguardar orientação.",
    feedbackCorrect: "Perfeito! O protocolo correto protege você e toda a organização.",
    feedbackWrong: "O protocolo é: primeiro evitar qualquer ação prejudicial (não clicar, não abrir), depois reportar ao time de SI, e então aguardar orientação antes de fazer qualquer outra coisa.",
    learnMore: "Reportar rapidamente um phishing permite que o time de SI bloqueie o domínio malicioso e alerte outros usuários. Uma denúncia a tempo pode evitar que dezenas de colegas caiam no mesmo golpe.",
  },
  {
    type: "association",
    instruction: "Associe cada variante de ataque ao seu vetor de entrega:",
    pairs: [
      { left: "Spear Phishing", right: "E-mail personalizado com dados reais da vítima" },
      { left: "Smishing", right: "SMS ou mensagem via WhatsApp" },
      { left: "Vishing", right: "Ligação telefônica fraudulenta" },
    ],
    phaseInfo: { scenario: "Phishing", phase: 4, total: 4 },
    hint: "Pense nos canais: 'Ph' de phishing = e-mail, 'Sm' de smishing = SMS, 'V' de vishing = voice (voz).",
    feedbackCorrect: "Excelente! Você conhece todos os vetores de ataque de engenharia social.",
    feedbackWrong: "Lembre das siglas: Phishing = e-mail. Smishing = SMS (SM = Short Message). Vishing = Voice phishing = ligação telefônica.",
    learnMore: "Atacantes escolhem o canal conforme a vítima. Spear Phishing por e-mail é o mais comum corporativamente. Smishing cresce com o uso de WhatsApp. Vishing usa IA de voz para imitar gerentes e CEOs.",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 7 — Tríade CID Aprofundamento (indices 26–29)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Tríade CID",
    category: "awareness",
    difficulty: "Iniciante",
    narrative: "A Tríade CID não é apenas teórica. Quando um hospital sofre um apagão cibernético e perde acesso a exames, a Disponibilidade é ferida. Quando um aluno altera suas notas no sistema, a Integridade falha. Quando um extrato bancário vaza na internet, a Confidencialidade é violada.",
    evidence: "A proteção exige balancear os 3 pilares.\nExcesso de confidencialidade pode prejudicar a disponibilidade.\nFalha de integridade pode causar danos físicos (ex: tipo sanguíneo errado no hospital).",
    totalPhases: 4,
  },
  {
    type: "multiple_choice",
    question: "Um administrador de banco de dados percebeu que um registro de log foi apagado intencionalmente para esconder uma transação financeira fraudulenta. Qual pilar foi violado diretamente por essa exclusão?",
    options: ["Confidencialidade", "Integridade", "Disponibilidade", "Autenticidade"],
    correct: 1,
    explanation: "A exclusão não autorizada de registros destrói a informação original, caracterizando violação de Integridade.",
    phaseInfo: { scenario: "Tríade CID Aprofundamento", phase: 2, total: 4 },
    hint: "A informação original foi apagada/modificada. Qual pilar garante que o dado seja exato e completo?",
    feedbackCorrect: "Exato! Modificar ou apagar dados de forma não autorizada fere a Integridade.",
    feedbackWrong: "O dado não vazou, ele foi destruído/modificado. Isso fere a Integridade da informação.",
  },
  {
    type: "fill_blank",
    instruction: "Complete com o pilar correto focado no impacto gerado:",
    sentence: "Um ataque de negação de serviço (DDoS) foca primariamente em ferir a ___ de um sistema. Já um vazamento de banco de dados fere a ___ dos clientes.",
    blanks: ["Disponibilidade", "Confidencialidade"],
    words: ["Disponibilidade", "Confidencialidade", "Integridade", "Autenticidade"],
    phaseInfo: { scenario: "Tríade CID Aprofundamento", phase: 3, total: 4 },
    hint: "DDoS derruba o sistema. Vazamento expõe dados a terceiros.",
    feedbackCorrect: "Correto! DDoS afeta Disponibilidade, vazamentos afetam Confidencialidade.",
    feedbackWrong: "DDoS impede o acesso (Disponibilidade). Vazamento expõe o dado (Confidencialidade).",
  },
  {
    type: "text_input",
    question: "Como chamamos a propriedade que garante que um sistema e seus dados estejam acessíveis sempre que os usuários autorizados precisarem deles?",
    answer: "disponibilidade",
    hint: "É o 'D' da sigla CID.",
    phaseInfo: { scenario: "Tríade CID Aprofundamento", phase: 4, total: 4 },
    feedbackCorrect: "Perfeito!",
    feedbackWrong: "A resposta correta é 'disponibilidade'.",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 8 — Ativos de Informação (indices 30–33)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Ativos de Informação",
    category: "awareness",
    difficulty: "Iniciante",
    narrative: "Tudo que tem valor para a organização é um 'Ativo'. Informação é um ativo, independentemente do formato: digital (banco de dados), físico (papel) ou até intangível (conhecimento na cabeça do funcionário).",
    evidence: "Exemplos de Ativos:\n- Código-fonte da aplicação\n- Cadernos de anotações com senhas\n- Lista de clientes VIP\n\nNão são ativos de informação: cadeiras, mesas (são ativos físicos sem dados).",
    totalPhases: 4,
  },
  {
    type: "association",
    instruction: "Classifique os itens abaixo como Ativo de Informação ou Não Ativo de Informação para um e-commerce:",
    pairs: [
      { left: "Banco de dados com histórico de compras", right: "Ativo de Informação" },
      { left: "Código-fonte do aplicativo próprio", right: "Ativo de Informação" },
      { left: "Mobiliário comum de escritório", right: "Não Ativo de Informação" }
    ],
    phaseInfo: { scenario: "Ativos", phase: 2, total: 4 },
    hint: "Se contém dados relevantes para o negócio, é um ativo de informação.",
    feedbackCorrect: "Excelente! Ativos de informação carregam valor e dados.",
    feedbackWrong: "Lembre-se que móveis normais não carregam dados.",
  },
  {
    type: "multiple_choice",
    question: "Qual deve ser o primeiro passo antes de implementar qualquer estratégia ou ferramenta de segurança na empresa?",
    options: [
      "Instalar o antivírus corporativo mais caro",
      "Identificar e inventariar todos os ativos de informação",
      "Contratar uma equipe de hackers éticos",
      "Bloquear todas as portas USB"
    ],
    correct: 1,
    explanation: "Você não pode proteger o que não sabe que existe. O inventário de ativos é a fundação da segurança.",
    phaseInfo: { scenario: "Ativos", phase: 3, total: 4 },
    hint: "Você consegue proteger o que você não conhece?",
    feedbackCorrect: "Isso mesmo! Identificar os ativos é a base de tudo.",
    feedbackWrong: "Antes de comprar ferramentas, é preciso saber O QUE estamos protegendo (Identificação de Ativos).",
  },
  {
    type: "text_input",
    question: "Um caderno de anotações contendo senhas de servidores é considerado um ativo físico ou digital?",
    answer: "físico|fisico",
    hint: "É feito de papel.",
    phaseInfo: { scenario: "Ativos", phase: 4, total: 4 },
    feedbackCorrect: "Certo! Ativos de informação podem estar em formato físico (papel) e devem ser protegidos com a mesma rigidez.",
    feedbackWrong: "É um ativo físico, pois está em papel, mas ainda carrega informações críticas.",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 9 — Classificação da Informação (indices 34–37)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Classificação da Informação",
    category: "awareness",
    difficulty: "Iniciante",
    narrative: "Nem toda informação tem o mesmo valor. Classificar dados ajuda a focar os recursos (dinheiro e esforço) onde realmente importa.\n\nNíveis comuns:\nPúblico, Interno, Confidencial, Estritamente Confidencial/Restrito.",
    evidence: "Público: Sem dano se vazar (ex: cardápio).\nInterno: Uso da empresa (ex: ramais).\nConfidencial: Dano médio/alto se vazar (ex: balanço financeiro antes da publicação).\nRestrito: Dano gravíssimo (ex: senhas master, dados médicos).",
    totalPhases: 4,
  },
  {
    type: "association",
    instruction: "Associe o tipo de dado ao seu nível de classificação mais provável:",
    pairs: [
      { left: "Material de marketing no site", right: "Público" },
      { left: "Política interna de reembolso", right: "Interno" },
      { left: "Chaves privadas criptográficas de servidores", right: "Estritamente Confidencial" }
    ],
    phaseInfo: { scenario: "Classificação", phase: 2, total: 4 },
    hint: "Pense no impacto se a informação cair na internet.",
    feedbackCorrect: "Perfeito!",
    feedbackWrong: "Chaves privadas são Estritamente Confidenciais. Material de marketing é Público.",
  },
  {
    type: "multiple_choice",
    question: "Por que uma organização NÃO deve classificar e proteger todas as suas informações como 'Estritamente Confidencial'?",
    options: [
      "Porque o processo de classificação é irrelevante.",
      "Porque proteger tudo no nível máximo é caro, complexo e inviabiliza o trabalho diário.",
      "Porque a ISO 27000 proíbe.",
      "Porque os funcionários vão ignorar as regras independentemente do nível."
    ],
    correct: 1,
    explanation: "Segurança tem custo. Proteger o cardápio do refeitório com a mesma rigidez que o código-fonte desperdiça recursos e trava a produtividade.",
    phaseInfo: { scenario: "Classificação", phase: 3, total: 4 },
    hint: "Se para ler um aviso no mural você precisasse de biometria e 3 senhas, você conseguiria trabalhar?",
    feedbackCorrect: "Isso aí. Segurança não pode inviabilizar o negócio.",
    feedbackWrong: "Proteger tudo no nível máximo custa muito caro e engessa a empresa.",
  },
  {
    type: "text_input",
    question: "Como se chama o processo de atribuir um rótulo ou nível de importância a um documento ou dado (ex: 'Público', 'Confidencial')?",
    answer: "classificação|classificacao|classificação da informação",
    hint: "É o nome deste módulo.",
    phaseInfo: { scenario: "Classificação", phase: 4, total: 4 },
    feedbackCorrect: "Exato! A classificação orienta como o dado será tratado e protegido.",
    feedbackWrong: "A resposta é Classificação (da informação).",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 10 — Autenticação e MFA (indices 38–41)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Autenticação e MFA",
    category: "blue_team",
    difficulty: "Intermediário",
    narrative: "Autenticação simples (só senha) não é mais suficiente. MFA (Múltiplos Fatores) exige prova em pelo menos duas categorias diferentes.\n\nFatores:\n1. Conhecimento (Saber)\n2. Posse (Ter)\n3. Inerência (Ser)",
    evidence: "Senhas fortes demoram para ser quebradas por força bruta, mas não protegem contra phishing. O MFA impede que o atacante tenha sucesso apenas roubando a senha.",
    totalPhases: 4,
  },
  {
    type: "association",
    instruction: "Associe o fator de MFA ao seu respectivo tipo:",
    pairs: [
      { left: "Senha ou PIN numérico", right: "O que você SABE" },
      { left: "Aplicativo Authenticator no celular", right: "O que você TEM" },
      { left: "Reconhecimento Facial ou Digital", right: "O que você É" }
    ],
    phaseInfo: { scenario: "MFA", phase: 2, total: 4 },
    hint: "Celular é um objeto físico (posse). Digital é biometria (inerência).",
    feedbackCorrect: "Muito bem! Entender essas 3 categorias é crucial para desenhar sistemas seguros.",
    feedbackWrong: "Lembre-se: celular/token é posse (TER). Biometria é inerência (SER). Senha é conhecimento (SABER).",
  },
  {
    type: "multiple_choice",
    question: "Um desenvolvedor sugeriu usar Senha + Pergunta Secreta ('Qual o nome do seu cachorro?') como sistema MFA. Essa implementação é eficaz?",
    options: [
      "Sim, porque são duas informações que apenas o usuário sabe.",
      "Sim, porque a pergunta secreta substitui um Token físico.",
      "Não, porque ambos pertencem à mesma categoria (Fator de Conhecimento / Algo que você sabe).",
      "Não, porque nomes de cachorros não são seguros."
    ],
    correct: 2,
    explanation: "MFA exige categorias DIFERENTES. Duas coisas que você sabe (senha e pergunta secreta) configuram Single-Factor Authentication em duas etapas, não Multi-Factor.",
    phaseInfo: { scenario: "MFA", phase: 3, total: 4 },
    hint: "Ambos dependem da sua memória. Eles pertencem a categorias diferentes?",
    feedbackCorrect: "Certo! Dois fatores da mesma categoria não formam um MFA verdadeiro.",
    feedbackWrong: "Para ser MFA, os fatores precisam ser de categorias distintas (ex: Saber + Ter). Senha e Pergunta Secreta são ambos Fator de Conhecimento.",
  },
  {
    type: "fill_blank",
    instruction: "Preencha a frase com as categorias corretas de fatores de autenticação:",
    sentence: "Para acessar a sala de servidores, o administrador precisa encostar seu crachá (algo que ele ___) e usar o leitor biométrico (algo que ele ___).",
    blanks: ["tem", "é"],
    words: ["tem", "sabe", "é", "esquece", "pensa"],
    phaseInfo: { scenario: "MFA", phase: 4, total: 4 },
    hint: "O crachá é um objeto físico. A biometria é o próprio corpo.",
    feedbackCorrect: "Excelente! Esta é uma autenticação de 2 fatores (Posse + Inerência).",
    feedbackWrong: "Crachá é posse (algo que você TEM). Biometria é inerência (algo que você É).",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 11 — Malware e Vetores de Infecção (indices 42–46)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Malware",
    category: "red_team",
    difficulty: "Intermediário",
    narrative: "Malware (Software Malicioso) tem vários formatos. Entender seu modo de operação ajuda a focar na defesa correta.\n\nRansomware sequestra. Trojan engana. Spyware espiona. Worm se replica sozinho.",
    evidence: "Um Ransomware pode usar o comportamento de um Worm para se espalhar automaticamente por toda a rede antes de iniciar a criptografia (ex: WannaCry).",
    totalPhases: 5,
  },
  {
    type: "multiple_choice",
    question: "O ataque WannaCry infectou milhares de hospitais no mundo de forma automática, explorando uma falha do Windows (EternalBlue), sem que os usuários precisassem clicar em nada. Qual comportamento define essa propagação autônoma?",
    options: ["Comportamento de Vírus", "Comportamento de Trojan", "Comportamento de Worm", "Comportamento de Spyware"],
    correct: 2,
    explanation: "Worms são conhecidos por sua capacidade de auto-propagação através da rede explorando vulnerabilidades, sem precisar de intervenção humana.",
    phaseInfo: { scenario: "Malware", phase: 2, total: 5 },
    hint: "Malwares que viajam sozinhos pela rede explorando falhas se comportam como vermes (worms).",
    feedbackCorrect: "Exato! O Worm é perigoso justamente porque não depende do clique do usuário para se espalhar.",
    feedbackWrong: "Ao contrário do Vírus, o Worm se espalha de forma completamente autônoma, sem intervenção humana.",
  },
  {
    type: "association",
    instruction: "Associe o tipo de malware ao seu foco principal:",
    pairs: [
      { left: "Trojan (Cavalo de Troia)", right: "Disfarce para acesso oculto" },
      { left: "Ransomware", right: "Sequestro de dados para extorsão" },
      { left: "Spyware", right: "Monitoramento e captura de telas/teclado" }
    ],
    phaseInfo: { scenario: "Malware", phase: 3, total: 5 },
    hint: "Trojan mente sobre o que é. Ransomware cobra resgate. Spyware espiona silenciosamente.",
    feedbackCorrect: "Muito bom! Diferenciar a intenção do atacante ajuda na contenção.",
    feedbackWrong: "Trojan = Disfarce. Ransomware = Extorsão/Sequestro. Spyware = Espionagem/Captura.",
  },
  {
    type: "fill_blank",
    instruction: "Complete com os vetores de infecção correspondentes:",
    sentence: "Muitos ataques começam por um e-mail falso de ___. Quando o usuário clica, uma falha de sistema não corrigida, chamada de ___, é explorada para instalar o malware.",
    blanks: ["phishing", "vulnerabilidade"],
    words: ["phishing", "vulnerabilidade", "botnet", "worm", "criptografia", "spam"],
    phaseInfo: { scenario: "Malware", phase: 4, total: 5 },
    hint: "O e-mail falso busca 'pescar' a vítima. O que os patches de segurança tentam fechar no sistema?",
    feedbackCorrect: "Certo! Phishing é a isca, e a vulnerabilidade é a porta de entrada técnica.",
    feedbackWrong: "As respostas corretas são: phishing (engenharia social por e-mail) e vulnerabilidade (falha técnica não corrigida).",
  },
  {
    type: "text_input",
    question: "Que tipo de malware exige o pagamento de um valor, muitas vezes em Bitcoin, para fornecer a chave de descriptografia dos arquivos corporativos?",
    answer: "ransomware",
    hint: "Ransom em inglês significa resgate.",
    phaseInfo: { scenario: "Malware", phase: 5, total: 5 },
    feedbackCorrect: "Perfeito. O ransomware é hoje a maior ameaça de impacto financeiro direto para as empresas.",
    feedbackWrong: "A resposta é Ransomware. (Ransom = Resgate).",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 12 — Controles de Segurança (indices 47–50)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Controles de Segurança",
    category: "blue_team",
    difficulty: "Avançado",
    narrative: "A Defesa em Profundidade aplica múltiplas camadas de controles para mitigar riscos. Eles podem ser Físicos, Lógicos ou Administrativos.\n\nAlém disso, dividem-se em preventivos, detectivos e corretivos.",
    evidence: "Nenhuma barreira única é 100% eficaz. Se o firewall falhar, o antivírus bloqueia. Se o antivírus falhar, o EDR detecta. Se a máquina criptografar, o backup (corretivo) recupera os dados.",
    totalPhases: 4,
  },
  {
    type: "ordering",
    instruction: "Coloque os tipos de controles na ordem temporal de atuação contra uma ameaça (Antes, Durante, Depois):",
    items: [
      "Controle Preventivo (ex: Firewall bloqueando conexão maliciosa)",
      "Controle Detectivo (ex: Alerta de antivírus sobre arquivo suspeito)",
      "Controle Corretivo (ex: Restauração de Backup após infecção)"
    ],
    correctOrder: [0, 1, 2],
    phaseInfo: { scenario: "Controles", phase: 2, total: 4 },
    hint: "Primeiro tentamos evitar, depois tentamos descobrir que ocorreu, e por fim consertamos o estrago.",
    feedbackCorrect: "Excelente! Preventivo, Detectivo e Corretivo formam a base da resposta a incidentes.",
    feedbackWrong: "A ordem temporal lógica é: Prevenir (evitar), Detectar (perceber que ocorreu), Corrigir (arrumar o dano).",
  },
  {
    type: "multiple_choice",
    question: "O uso de catracas biométricas na entrada do datacenter e a instalação de câmeras de segurança (CFTV) são exemplos de qual categoria de controle?",
    options: ["Controle Administrativo", "Controle Lógico / Técnico", "Controle Físico", "Controle Detectivo de Software"],
    correct: 2,
    explanation: "Barreiras reais, catracas, câmeras e portas trancadas representam controles físicos, essenciais para a segurança cibernética (pois o atacante não pode acessar fisicamente o servidor).",
    phaseInfo: { scenario: "Controles", phase: 3, total: 4 },
    hint: "Se envolve matéria física tangível (catracas, guardas, paredes, câmeras), a classificação é fácil.",
    feedbackCorrect: "Certo! Controles físicos protegem o acesso geográfico e o maquinário real.",
    feedbackWrong: "Esses são Controles Físicos. Embora a biometria use software, a catraca é uma barreira física que impede o acesso corporal ao ambiente.",
  },
  {
    type: "association",
    instruction: "Associe a solução de segurança ao seu tipo de controle lógico/técnico predominante:",
    pairs: [
      { left: "Firewall e Filtro de E-mail", right: "Preventivo" },
      { left: "SIEM (Monitoramento de Logs) e IDS", right: "Detectivo" },
      { left: "Script de recuperação de disco", right: "Corretivo" }
    ],
    phaseInfo: { scenario: "Controles", phase: 4, total: 4 },
    hint: "O que o firewall faz? Evita. O log faz o que? Mostra (detecta).",
    feedbackCorrect: "Ótimo!",
    feedbackWrong: "Firewalls são Preventivos (bloqueiam). Monitoramento é Detectivo (avisa). Scripts de recuperação são Corretivos.",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 13 — Tipos de Controles (indices 51–54)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Tipos de Controles Aplicados",
    category: "blue_team",
    difficulty: "Avançado",
    narrative: "Controles Administrativos (ou Organizacionais) são as políticas, normas, treinamentos e contratos de uma empresa.\n\nSem eles, a tecnologia não tem um direcionamento de 'o que' proteger. A Política de Segurança da Informação (PSI) é o controle administrativo primário.",
    evidence: "Tecnologia: Configurar o Active Directory.\nProcesso/Administrativo: A regra da PSI que define que estagiários não podem ter acesso Admin.\nPessoas: O treinamento que ensina o analista a seguir essa regra.",
    totalPhases: 4,
  },
  {
    type: "multiple_choice",
    question: "Um funcionário foi demitido. Para garantir a segurança, qual é a combinação ideal de controles que a empresa deve executar?",
    options: [
      "Apenas bloquear a senha dele no servidor central (Lógico).",
      "Pegar o notebook de volta (Físico) e confiar que ele não anotou senhas.",
      "Revogar acessos lógicos (TI), recolher equipamentos e crachá (Físico) e assinar termo de desligamento (Administrativo).",
      "Processar administrativamente e não alterar nenhuma senha tecnológica."
    ],
    correct: 2,
    explanation: "Um offboarding seguro aplica controles técnicos (cortar acessos VPN/Rede), físicos (tomar crachá e notebook) e administrativos (documentação legal e revogação de acessos autorizados).",
    phaseInfo: { scenario: "Tipos de Controles", phase: 2, total: 4 },
    hint: "Segurança total exige a combinação de controles Lógicos, Físicos e Administrativos.",
    feedbackCorrect: "Isso mesmo! O desligamento de um funcionário exige ação combinada das três esferas.",
    feedbackWrong: "Focar em apenas um tipo de controle deixa brechas graves. O ideal é a combinação Lógica, Física e Administrativa.",
  },
  {
    type: "association",
    instruction: "Associe a ação prática à categoria do controle:",
    pairs: [
      { left: "Publicar a Política de Uso Aceitável (PSI)", right: "Administrativo" },
      { left: "Configurar criptografia de disco de notebooks", right: "Lógico / Técnico" },
      { left: "Instalar extintores de incêndio no Datacenter", right: "Físico" }
    ],
    phaseInfo: { scenario: "Tipos de Controles", phase: 3, total: 4 },
    hint: "Políticas = papel/processo. Criptografia = software. Extintor = material palpável.",
    feedbackCorrect: "Exato! Você classificou corretamente as medidas de defesa em profundidade.",
    feedbackWrong: "Atenção: Regras e documentos são Administrativos. Software é Lógico. Barreiras materiais (e proteção contra elementos como fogo) são Físicos.",
  },
  {
    type: "fill_blank",
    instruction: "Complete:",
    sentence: "Uma campanha de conscientização sobre phishing foca nas pessoas e é considerada um controle ___. Já o software antispam que bloqueia o e-mail antes de chegar é um controle ___.",
    blanks: ["administrativo", "lógico"],
    words: ["administrativo", "lógico", "físico", "preventivo", "detectivo"],
    phaseInfo: { scenario: "Tipos de Controles", phase: 4, total: 4 },
    hint: "Treinamentos e campanhas são organizacionais. Softwares rodando no servidor são técnicos/lógicos.",
    feedbackCorrect: "Boa! O treinamento é uma ação organizacional/administrativa, enquanto o antispam atua de forma lógica no servidor.",
    feedbackWrong: "Treinamentos = administrativo. Software/TI = lógico.",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 14 — Fator Humano (indices 55–59)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Fator Humano",
    category: "awareness",
    difficulty: "Avançado",
    narrative: "Por trás de todo sistema, processo ou ataque, existem seres humanos. O cérebro humano é otimizado para ajudar os outros, evitar conflitos e obedecer autoridades.\n\nAtaques de Engenharia Social usam manipulação psicológica para burlar barreiras tecnológicas explorando atalhos mentais.",
    evidence: "Princípios da Persuasão (Cialdini) usados por atacantes:\n- Autoridade: 'Aqui é o Diretor Financeiro, faça agora.'\n- Urgência: 'Sua conta vai ser apagada em 10 min.'\n- Confiança/Familiaridade: Usar uma foto conhecida.",
    totalPhases: 5,
  },
  {
    type: "multiple_choice",
    question: "Um atacante liga para a recepção se passando pelo técnico de TI, informando que a internet cairá em 5 minutos se não informarem o IP da máquina, usando um tom irritado. Quais atalhos psicológicos ele está explorando?",
    options: [
      "Apenas falha de treinamento",
      "Autoridade e Urgência",
      "Familiaridade e Escassez",
      "Empatia e Avareza"
    ],
    correct: 1,
    explanation: "O atacante se finge de TI (Autoridade) e cria um limite de tempo crítico (Urgência) para causar estresse e impedir que a recepcionista raciocine de forma lógica.",
    phaseInfo: { scenario: "Fator Humano", phase: 2, total: 5 },
    hint: "Ele assumiu uma posição de poder (TI) e deu um limite de tempo estrito.",
    feedbackCorrect: "Perfeito! A tática do Vishing (voice phishing) utiliza o estresse contra o alvo.",
    feedbackWrong: "Ele finge ser de um departamento importante (Autoridade) e estabelece um prazo crítico (Urgência).",
  },
  {
    type: "association",
    instruction: "Associe o princípio de persuasão ao comportamento do ataque:",
    pairs: [
      { left: "'Faça o pagamento rápido antes que a fatura expire'", right: "Urgência" },
      { left: "'Olá, sou o auditor fiscal designado para sua empresa'", right: "Autoridade" },
      { left: "'O João do 3º andar já me passou esses dados ontem'", right: "Prova Social / Confiança" }
    ],
    phaseInfo: { scenario: "Fator Humano", phase: 3, total: 5 },
    hint: "Identifique as palavras-chave em cada frase.",
    feedbackCorrect: "Correto. Atacantes usam psicologia básica contra nós.",
    feedbackWrong: "Auditor = Autoridade. Rápido/expire = Urgência. Citar outras pessoas da empresa = Prova Social.",
  },
  {
    type: "fill_blank",
    instruction: "Complete a afirmação fundamental sobre Engenharia Social:",
    sentence: "A engenharia social é bem-sucedida porque foca na exploração de falhas ___, em vez de tentar quebrar a ___ e softwares do sistema.",
    blanks: ["humanas", "criptografia"],
    words: ["humanas", "criptografia", "técnicas", "infraestrutura", "físicas"],
    phaseInfo: { scenario: "Fator Humano", phase: 4, total: 5 },
    hint: "É muito mais fácil enganar uma pessoa do que quebrar a matemática dos algoritmos modernos.",
    feedbackCorrect: "É isso. Atacar o ser humano é sempre o caminho de menor resistência.",
    feedbackWrong: "O alvo da engenharia social é a mente (falhas humanas). Ela ignora softwares, firewalls e criptografia.",
  },
  {
    type: "text_input",
    question: "Qual técnica de fraude é baseada em ligações telefônicas onde o fraudador finge ser do suporte do banco ou setor de TI corporativo?",
    answer: "vishing|vishing (voice phishing)",
    hint: "A palavra é uma combinação de Voice (Voz) e Phishing.",
    phaseInfo: { scenario: "Fator Humano", phase: 5, total: 5 },
    feedbackCorrect: "Correto! Vishing tem se tornado cada vez mais sofisticado com uso de deepfakes de áudio.",
    feedbackWrong: "O termo correto é 'Vishing' (Voice Phishing).",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 15 — Cultura e Boas Práticas (indices 60–63)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Cultura e Boas Práticas",
    category: "awareness",
    difficulty: "Avançado",
    narrative: "Uma cultura de segurança forte não culpa o funcionário que comete um erro, mas sim encoraja o relato imediato e transparente dos incidentes. Se há punição por pequenos erros acidentais, os funcionários começam a esconder as falhas, aumentando o risco.",
    evidence: "Boas práticas pessoais:\n- Clean Desk (Mesa limpa) e Clean Screen (Bloquear o PC ao levantar Win+L).\n- Nunca reciclar senhas entre vida pessoal e profissional.\n- Reportar pendrives achados no chão e nunca plugá-los.",
    totalPhases: 4,
  },
  {
    type: "multiple_choice",
    question: "Um funcionário encontrou um pen-drive bonito no estacionamento da empresa e o colocou em sua máquina para ver de quem era. A máquina foi infectada. Qual a postura cultural ideal do time de segurança da empresa diante disso?",
    options: [
      "Demitir o funcionário por justa causa imediatamente.",
      "Acolher o relato do funcionário, isolar a máquina e revisar o treinamento corporativo sobre o perigo das mídias físicas desconhecidas.",
      "Multar o funcionário pelo conserto da máquina.",
      "Ignorar, pois o antivírus vai limpar sozinho e isso é comum."
    ],
    correct: 1,
    explanation: "Uma cultura 'Just Culture' busca melhorar o sistema e o treinamento em vez de punir severamente incidentes não-maliciosos, o que criaria uma cultura de esconder erros.",
    phaseInfo: { scenario: "Cultura de Segurança", phase: 2, total: 4 },
    hint: "A cultura punitiva cria o medo de reportar, permitindo que os ataques piorem silenciosamente.",
    feedbackCorrect: "Muito bem! Culpar a vítima afasta os colaboradores do time de Segurança.",
    feedbackWrong: "Demitir imediatamente gera medo: na próxima, os funcionários esconderão o vírus. O ideal é o treinamento contínuo e acolhimento dos relatos.",
  },
  {
    type: "fill_blank",
    instruction: "Complete com os nomes de duas políticas básicas do dia a dia corporativo:",
    sentence: "A política de ___ orienta a não deixar documentos sensíveis em papel dando sopa, enquanto a política de ___ garante que você aplique a tecla Win+L ao sair da mesa.",
    blanks: ["Mesa Limpa", "Tela Limpa"],
    words: ["Mesa Limpa", "Tela Limpa", "Senha Forte", "MFA", "Nuvem Limpa"],
    phaseInfo: { scenario: "Cultura de Segurança", phase: 3, total: 4 },
    hint: "Os nomes em inglês costumam ser Clean Desk e Clean Screen.",
    feedbackCorrect: "Isso! Políticas de Mesa Limpa (Clean Desk) e Tela Limpa (Clean Screen) são vitais em escritórios movimentados.",
    feedbackWrong: "O correto é Mesa Limpa (documentos físicos) e Tela Limpa (computador bloqueado).",
  },
  {
    type: "association",
    instruction: "Associe o comportamento à boa prática correspondente:",
    pairs: [
      { left: "Aperto Win+L sempre que vou tomar café", right: "Tela Limpa (Clean Screen)" },
      { left: "Não guardo cadernos com senhas debaixo do teclado", right: "Mesa Limpa (Clean Desk)" },
      { left: "Uso um app para gerar minhas chaves de acesso", right: "Cofre de Senhas Corporativo" }
    ],
    phaseInfo: { scenario: "Cultura de Segurança", phase: 4, total: 4 },
    hint: "Conecte o ato de bloquear a máquina com 'Tela', o caderno físico com 'Mesa', e o gerenciamento de credenciais com 'Cofre'.",
    feedbackCorrect: "Perfeito! São atitudes simples que fecham grandes vulnerabilidades físicas e lógicas.",
    feedbackWrong: "Win+L bloqueia a Tela. Remover papéis limpa a Mesa. Usar Apps trata do Cofre de Senhas.",
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 16 — Simulado Final Misto (indices 64–68)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Simulado Final",
    category: "awareness",
    difficulty: "Avançado",
    narrative: "Chegou a hora de provar que você está preparado para defender a organização. Este simulado cobre todos os temas de forma aleatória.",
    evidence: "Respire fundo.\nLembre-se da Tríade CID, das regras do MFA, dos perigos da Engenharia Social e de que você faz parte do controle de segurança mais forte que existe: a mente humana consciente.",
    totalPhases: 5,
  },
  {
    type: "multiple_choice",
    question: "[CID] Durante o Black Friday, os servidores da loja online sofrem uma sobrecarga intencional de 10 milhões de requisições por minuto e caem. Qual pilar caiu primeiro?",
    options: ["Confidencialidade", "Autenticidade", "Disponibilidade", "Integridade"],
    correct: 2,
    explanation: "Um ataque de negação de serviço distribuído (DDoS) exaure os recursos do servidor, impossibilitando que clientes reais acessem o site. O pilar afetado diretamente é a Disponibilidade.",
    phaseInfo: { scenario: "Simulado", phase: 2, total: 5 },
    hint: "Os dados não foram roubados nem modificados, eles apenas ficaram inacessíveis.",
    feedbackCorrect: "Certo! O serviço ficou fora do ar = Quebra de Disponibilidade.",
    feedbackWrong: "A queda do servidor impede o acesso. Isso fere a Disponibilidade.",
  },
  {
    type: "multiple_choice",
    question: "[IAM & MFA] Para garantir total Accountability (Responsabilização) de quem aprovou um pagamento no sistema interno, a equipe implantou autenticação forte. Qual opção abaixo caracteriza um MFA válido?",
    options: [
      "Senha longa e Pergunta Secreta da infância.",
      "Leitura da Iris e Leitura da Impressão Digital combinadas.",
      "Senha do usuário acompanhada de um código SMS temporário.",
      "Acesso via certificado de VPN exclusivo."
    ],
    correct: 2,
    explanation: "MFA exige que os fatores sejam de tipos distintos. Senha (SABER) + SMS (TER celular) forma uma barreira multicamada real. Iris e Digital são ambos SER. Senha e Pergunta são ambos SABER.",
    phaseInfo: { scenario: "Simulado", phase: 3, total: 5 },
    hint: "Busque a alternativa que mistura 'Saber', 'Ter' ou 'Ser'.",
    feedbackCorrect: "Exato! Senha (Saber) + SMS (Ter) são fatores independentes e válidos para MFA.",
    feedbackWrong: "Para ser MFA eficaz, devem ser categorias diferentes. A resposta correta mistura Conhecimento (Senha) e Posse (SMS enviado ao celular).",
  },
  {
    type: "multiple_choice",
    question: "[LGPD] Um desenvolvedor decide coletar o tipo sanguíneo de todos os usuários do seu app de 'Receitas de Bolo' para fazer um banco de dados gigantesco. Segundo a LGPD, o que está errado?",
    options: [
      "Falta de uso de criptografia.",
      "Quebra do Princípio da Finalidade, pois tipo sanguíneo não tem relação lógica com receitas de bolo.",
      "Nada, desde que os dados sejam hospedados no Brasil.",
      "Apenas o fato de ele não ter cobrado pelo serviço."
    ],
    correct: 1,
    explanation: "A LGPD exige que o dado coletado tenha uma finalidade legítima, específica e informada ao titular. Um app de receitas não possui finalidade ou justificativa para processar um dado sensível de saúde.",
    phaseInfo: { scenario: "Simulado", phase: 4, total: 5 },
    hint: "Por que um app de bolo precisa saber se você é O Positivo?",
    feedbackCorrect: "Perfeito! A LGPD proíbe a coleta desordenada de dados ('just in case'). O dado deve ter propósito claro.",
    feedbackWrong: "A LGPD dita que a coleta deve ter uma Finalidade lógica e clara. Receita de bolo e sangue não possuem finalidade lícita de conexão.",
  },
  {
    type: "multiple_choice",
    question: "[Malware e Ameaças] Ao baixar um software pirata de edição de imagens, o usuário, sem perceber, instalou um código paralelo que abriu uma porta nos bastidores (backdoor), permitindo que um hacker controle seu mouse à distância. Que tipo de malware é esse?",
    options: ["Worm", "Trojan (Cavalo de Troia)", "Ransomware", "Keylogger"],
    correct: 1,
    explanation: "Trojans (Cavalos de Troia) se disfarçam de softwares úteis, jogos ou arquivos piratas para enganar o usuário, abrindo portas para invasão silenciosa no background.",
    phaseInfo: { scenario: "Simulado", phase: 5, total: 5 },
    hint: "Ele veio disfarçado de um presente útil (software gratuito). Lembre-se da guerra na Grécia Antiga.",
    feedbackCorrect: "Correto! O disfarce é a marca registrada do Cavalo de Troia (Trojan).",
    feedbackWrong: "O Trojan atua através do disfarce, entregando uma 'funcionalidade' falsa enquanto ataca por trás. Assim como o presente dos gregos para os troianos.",
  }

];
