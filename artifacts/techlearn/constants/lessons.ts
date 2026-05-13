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
  category: "blue_team" | "red_team" | "lgpd" | "awareness";
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
  narrative: string;
  evidence: string;
  totalPhases: number;
}

export type FraudIndicator = "sender" | "link" | "attachment";

export interface PhishingEmailExercise {
  type: "phishing_email";
  fromDisplay: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  linkText: string;
  linkRealUrl: string;
  attachmentName: string;
  fraudIndicators: FraudIndicator[];
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

export const LESSONS: Exercise[] = [
  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 1 — Tríade CID e Fundamentos da Segurança da Informação
  // ═══════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Tríade CID e Fundamentos de Segurança",
    category: "awareness",
    difficulty: "Iniciante",
    narrative:
      "A Segurança da Informação é sustentada por três pilares fundamentais da ISO 27000: Confidencialidade, Integridade e Disponibilidade — a chamada Tríade CID.\n\nMas segurança vai além da tecnologia. Ela exige equilíbrio entre Tecnologia, Pessoas e Processos. O elo mais fraco de um sistema quase sempre é o humano — não a máquina.",
    evidence:
      "ISO/IEC 27000 — Pilares da Segurança:\n\n  Confidencialidade → Acesso somente por autorizados\n  Integridade       → Dados não alterados sem permissão\n  Disponibilidade   → Sistemas acessíveis quando necessário\n\nFato: 95% dos incidentes têm causa raiz humana (IBM, 2023).",
    totalPhases: 4,
  },

  // Fase 1 — Associação: incidentes → pilar CID
  {
    type: "association",
    instruction: "Associe cada incidente ao pilar da Tríade CID que foi violado:",
    pairs: [
      { left: "Hacker visualiza dados médicos sem autorização", right: "Confidencialidade" },
      { left: "Vírus altera os valores de uma planilha financeira", right: "Integridade" },
      { left: "Ataque DDoS deixa site de banco fora do ar", right: "Disponibilidade" },
    ],
    phaseInfo: { scenario: "Tríade CID", phase: 1, total: 4 },
  },

  // Fase 2 — Múltipla escolha: Caso Fleury
  {
    type: "multiple_choice",
    question: "No ataque de Ransomware ao Grupo Fleury, os sistemas de agendamento e entrega de resultados ficaram paralisados por vários dias. Qual pilar da Tríade CID foi mais severamente impactado?",
    options: [
      "Integridade",
      "Confidencialidade",
      "Disponibilidade",
      "Autenticidade",
    ],
    correct: 2,
    explanation:
      "Embora o ransomware possa afetar outros pilares, a paralisação operacional total é uma violação direta da Disponibilidade — impede o acesso oportuno às informações quando necessário.",
    phaseInfo: { scenario: "Tríade CID", phase: 2, total: 4 },
  },

  // Fase 3 — Completar: os três pilares CID
  {
    type: "fill_blank",
    instruction: "Complete os três pilares da Tríade CID conforme a ISO 27000:",
    sentence:
      "A ___ garante que a informação não seja vista por pessoas não autorizadas. A ___ assegura que o dado não foi modificado indevidamente. A ___ garante que o sistema esteja acessível quando necessário.",
    blanks: ["Confidencialidade", "Integridade", "Disponibilidade"],
    words: [
      "Confidencialidade", "Integridade", "Disponibilidade",
      "Autenticidade", "Privacidade", "Não Repúdio",
    ],
    phaseInfo: { scenario: "Tríade CID", phase: 3, total: 4 },
  },

  // Fase 4 — Múltipla escolha: Tecnologia, Pessoas e Processos
  {
    type: "multiple_choice",
    question: "Uma empresa investe nos melhores firewalls do mercado, mas não treina seus funcionários sobre senhas seguras. Por que essa estratégia de segurança é incompleta?",
    options: [
      "Porque a segurança depende apenas de software atualizado",
      "Porque a segurança da informação exige equilíbrio entre Tecnologia, Pessoas e Processos",
      "Porque processos são irrelevantes se a tecnologia for de ponta",
      "Porque firewalls não protegem redes corporativas modernas",
    ],
    correct: 1,
    explanation:
      "Segurança não é só tecnologia. Ela depende de pessoas treinadas e processos bem definidos. Um colaborador sem treinamento pode comprometer todo o investimento em infraestrutura — o fator humano é o elo mais crítico.",
    phaseInfo: { scenario: "Tríade CID", phase: 4, total: 4 },
  },

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 2 — IAM: Gestão de Identidade e Controle de Acesso
  // ═══════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "IAM — Gestão de Identidade e Acesso",
    category: "blue_team",
    difficulty: "Intermediário",
    narrative:
      "A Gestão de Identidade e Acesso (IAM) controla quem pode acessar o quê dentro de um sistema. O fluxo obrigatório tem três etapas em sequência: Identificação, Autenticação e Autorização.\n\nAutenticar com múltiplos fatores (MFA) é a medida mais eficaz para proteger identidades digitais — combina algo que você SABE, TEM ou É.",
    evidence:
      "Fluxo IAM obrigatório:\n\n  1. Identificação  → Quem é você? (usuário/login)\n  2. Autenticação   → Prove que é você (senha + token)\n  3. Autorização    → O que você pode fazer? (permissões)\n\nFatores MFA:\n  Saber → Senha, PIN\n  Ter   → Token, smart card, celular\n  Ser   → Biometria, face ID, íris",
    totalPhases: 4,
  },

  // Fase 1 — Ordenação: fluxo IAM
  {
    type: "ordering",
    instruction: "Ordene as etapas do fluxo de acesso seguindo a lógica correta do IAM:",
    items: [
      "Verificar se o usuário tem permissão para acessar o arquivo (Autorização)",
      "Informar o nome de usuário (login) ao sistema (Identificação)",
      "Inserir senha e token para validar a identidade (Autenticação)",
    ],
    // Correct order: Identificação (idx 1) → Autenticação (idx 2) → Autorização (idx 0)
    correctOrder: [1, 2, 0],
    phaseInfo: { scenario: "IAM", phase: 1, total: 4 },
  },

  // Fase 2 — Associação: fatores de autenticação
  {
    type: "association",
    instruction: "Classifique cada método de autenticação no tipo de fator correto:",
    pairs: [
      { left: "Impressão digital ou reconhecimento facial", right: "Algo que você É" },
      { left: "Senha numérica (PIN) ou frase secreta", right: "Algo que você SABE" },
      { left: "Token físico, smart card ou celular", right: "Algo que você TEM" },
    ],
    phaseInfo: { scenario: "IAM", phase: 2, total: 4 },
  },

  // Fase 3 — Múltipla escolha: MFA eficaz
  {
    type: "multiple_choice",
    question: "Você precisa aumentar a segurança de um aplicativo bancário. Qual combinação representa uma Autenticação de Múltiplos Fatores (MFA) eficaz?",
    options: [
      "Senha (saber) e PIN (saber) — dois fatores do mesmo tipo",
      "Senha (saber) e Token no celular (ter) — fatores independentes",
      "Cartão de acesso (ter) e chave física da sala (ter)",
      "Reconhecimento facial (ser) e leitura de íris (ser)",
    ],
    correct: 1,
    explanation:
      "A segurança aumenta quando usamos fatores de categorias DIFERENTES e independentes: algo que você sabe (senha) + algo que você tem (token) garante que mesmo com a senha vazada, o invasor não acessa a conta.",
    phaseInfo: { scenario: "IAM", phase: 3, total: 4 },
  },

  // Fase 4 — Múltipla escolha: Autorização no modelo Sujeito-Objeto
  {
    type: "multiple_choice",
    question: "Em um sistema hospitalar, médicos podem ler e editar prontuários, mas recepcionistas só podem visualizar a agenda. Se uma recepcionista tentar alterar um prontuário, qual etapa do IAM deve bloqueá-la?",
    options: [
      "Identificação — o sistema não reconhece o usuário",
      "Autenticação — a senha da recepcionista é inválida",
      "Autorização — a recepcionista não tem permissão para essa ação",
      "Criptografia — o arquivo está protegido por chave",
    ],
    correct: 2,
    explanation:
      "A Autorização define quais ações um usuário autenticado pode executar sobre recursos específicos. A recepcionista foi identificada e autenticada corretamente, mas não possui permissão de Update sobre prontuários.",
    phaseInfo: { scenario: "IAM", phase: 4, total: 4 },
  },

  // ═══════════════════════════════════════════════════════════════
  // MÓDULO 3 — Ameaças, Malware e Gestão de Riscos
  // ═══════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Ameaças, Malware e Gestão de Riscos",
    category: "red_team",
    difficulty: "Intermediário",
    narrative:
      "Ameaças são agentes externos que exploram Vulnerabilidades — fraquezas internas dos sistemas — para causar danos. A combinação desses elementos gera o Risco.\n\nMalwares são os principais vetores de ameaça moderna. Vírus, Worms, Trojans, Ransomware e Botnets têm comportamentos distintos e exigem respostas específicas de defesa.",
    evidence:
      "Classificação de Malware:\n\n  Vírus      → Depende do usuário para se espalhar\n  Worm       → Propaga-se sozinho pela rede\n  Trojan     → Disfarça-se como software legítimo\n  Ransomware → Criptografa dados e exige resgate\n  Botnet     → Rede de zumbis para ataques em escala\n\nFórmula: Risco = Ameaça × Vulnerabilidade × Impacto",
    totalPhases: 4,
  },

  // Fase 1 — Associação: cadeia de risco
  {
    type: "association",
    instruction: "Associe cada cenário do e-commerce ao conceito correto na cadeia de risco:",
    pairs: [
      { left: "Grupo hacker buscando dados de cartões de crédito", right: "Ameaça" },
      { left: "Servidor sem backup e com software desatualizado", right: "Vulnerabilidade" },
      { left: "Possibilidade real de perda total dos dados de clientes", right: "Risco" },
    ],
    phaseInfo: { scenario: "Ameaças e Riscos", phase: 1, total: 4 },
  },

  // Fase 2 — Associação: tipos de malware
  {
    type: "association",
    instruction: "Associe o comportamento descrito ao tipo correto de malware:",
    pairs: [
      { left: "Infecta arquivos e precisa ser executado pelo usuário para se espalhar", right: "Vírus" },
      { left: "Propaga-se automaticamente explorando vulnerabilidades de rede", right: "Worm" },
      { left: "Disfarça-se como programa legítimo para enganar a vítima", right: "Trojan" },
    ],
    phaseInfo: { scenario: "Ameaças e Riscos", phase: 2, total: 4 },
  },

  // Fase 3 — Completar: Ransomware
  {
    type: "fill_blank",
    instruction: "Complete a definição técnica de Ransomware:",
    sentence:
      "O ___ é um tipo de malware que realiza a ___ dos arquivos da vítima e exige o pagamento de um ___ para restaurar o acesso aos dados.",
    blanks: ["ransomware", "criptografia", "resgate"],
    words: [
      "ransomware", "criptografia", "resgate",
      "spyware", "compressão", "contrato", "keylogger", "backup",
    ],
    phaseInfo: { scenario: "Ameaças e Riscos", phase: 3, total: 4 },
  },

  // Fase 4 — Múltipla escolha: Botnet e DDoS
  {
    type: "multiple_choice",
    question: "Um atacante infectou milhares de dispositivos para realizar um ataque de negação de serviço (DDoS) contra um site de governo. Qual é o nome dado a essa rede de dispositivos zumbis controlados remotamente?",
    options: [
      "Spyware — software que monitora o usuário secretamente",
      "Botnet — rede de bots controlada por servidor C&C",
      "Keylogger — captura tudo que o usuário digita",
      "Adware — exibe publicidade não solicitada",
    ],
    correct: 1,
    explanation:
      "Uma Botnet é uma rede de bots controlada por um servidor de Comando e Controle (C&C). Cada dispositivo infectado age como um 'zumbi', obedecendo ao atacante para realizar ataques em larga escala como DDoS, envio de spam ou roubo de credenciais.",
    phaseInfo: { scenario: "Ameaças e Riscos", phase: 4, total: 4 },
  },
];
