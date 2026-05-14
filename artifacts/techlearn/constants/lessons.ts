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

// ── Module definitions ────────────────────────────────────────────────────────
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
    id: 1,
    title: "Fundamentos da Segurança Digital",
    subtitle: "Princípios essenciais e proteção de dados",
    iconName: "Shield",
    startIdx: 0,
    length: 5,
    accentColor: "#6366F1",
    category: "awareness",
    difficulty: "Iniciante",
  },
  {
    id: 2,
    title: "Senhas e Autenticação",
    subtitle: "Gestão de identidade e múltiplos fatores",
    iconName: "Key",
    startIdx: 5,
    length: 5,
    accentColor: "#3B82F6",
    category: "blue_team",
    difficulty: "Intermediário",
  },
  {
    id: 3,
    title: "Cultura de Segurança no Trabalho",
    subtitle: "Identificação de malwares e gestão de riscos",
    iconName: "AlertTriangle",
    startIdx: 10,
    length: 5,
    accentColor: "#EF4444",
    category: "red_team",
    difficulty: "Intermediário",
  },
  {
    id: 4,
    title: "LGPD e Proteção de Dados",
    subtitle: "Conformidade e privacidade corporativa",
    iconName: "FileText",
    startIdx: 15,
    length: 5,
    accentColor: "#8B5CF6",
    category: "lgpd",
    difficulty: "Intermediário",
  },
  {
    id: 5,
    title: "Phishing e Engenharia Social",
    subtitle: "Prevenção contra ataques direcionados",
    iconName: "Mail",
    startIdx: 20,
    length: 5,
    accentColor: "#F59E0B",
    category: "awareness",
    difficulty: "Avançado",
  },
];

// ── All lessons ───────────────────────────────────────────────────────────────
export const LESSONS: Exercise[] = [
  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 1 — Tríade CID (indices 0–4)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Tríade CID e Fundamentos de Segurança",
    category: "awareness",
    difficulty: "Iniciante",
    narrative:
      "A Segurança da Informação é sustentada por três pilares fundamentais da ISO 27000: Confidencialidade, Integridade e Disponibilidade — a Tríade CID.\n\nMas segurança vai além da tecnologia. Ela exige equilíbrio entre Tecnologia, Pessoas e Processos. O elo mais fraco de um sistema quase sempre é o humano.",
    evidence:
      "ISO/IEC 27000 — Pilares da Segurança:\n\n  Confidencialidade → Acesso somente por autorizados\n  Integridade       → Dados não alterados sem permissão\n  Disponibilidade   → Sistemas acessíveis quando necessário\n\nFato: 95% dos incidentes têm causa raiz humana (IBM, 2023).",
    totalPhases: 4,
  },
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
  {
    type: "multiple_choice",
    question: "No ataque de Ransomware ao Grupo Fleury, os sistemas ficaram paralisados por vários dias. Qual pilar da Tríade CID foi mais severamente impactado?",
    options: ["Integridade", "Confidencialidade", "Disponibilidade", "Autenticidade"],
    correct: 2,
    explanation: "A paralisação operacional total é uma violação direta da Disponibilidade — impede o acesso oportuno às informações quando necessário.",
    phaseInfo: { scenario: "Tríade CID", phase: 2, total: 4 },
  },
  {
    type: "fill_blank",
    instruction: "Complete os três pilares da Tríade CID conforme a ISO 27000:",
    sentence:
      "A ___ garante que a informação não seja vista por pessoas não autorizadas. A ___ assegura que o dado não foi modificado. A ___ garante que o sistema esteja acessível.",
    blanks: ["Confidencialidade", "Integridade", "Disponibilidade"],
    words: ["Confidencialidade", "Integridade", "Disponibilidade", "Autenticidade", "Privacidade", "Não Repúdio"],
    phaseInfo: { scenario: "Tríade CID", phase: 3, total: 4 },
  },
  {
    type: "multiple_choice",
    question: "Uma empresa investe nos melhores firewalls, mas não treina seus funcionários. Por que essa estratégia é incompleta?",
    options: [
      "Porque a segurança depende apenas de software atualizado",
      "Porque segurança exige equilíbrio entre Tecnologia, Pessoas e Processos",
      "Porque processos são irrelevantes se a tecnologia for de ponta",
      "Porque firewalls não protegem redes corporativas modernas",
    ],
    correct: 1,
    explanation: "Segurança não é só tecnologia. Depende de pessoas treinadas e processos definidos. O fator humano é o elo mais crítico.",
    phaseInfo: { scenario: "Tríade CID", phase: 4, total: 4 },
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 2 — IAM (indices 5–9)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "IAM — Gestão de Identidade e Acesso",
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
  },
  {
    type: "multiple_choice",
    question: "Qual combinação representa uma Autenticação de Múltiplos Fatores (MFA) eficaz?",
    options: [
      "Senha e PIN — dois fatores do mesmo tipo 'saber'",
      "Senha (saber) e Token no celular (ter) — fatores independentes",
      "Cartão de acesso (ter) e chave física da sala (ter)",
      "Reconhecimento facial e leitura de íris — ambos 'ser'",
    ],
    correct: 1,
    explanation: "A segurança aumenta com fatores de categorias DIFERENTES: algo que você sabe (senha) + algo que você tem (token) garante proteção mesmo com senha vazada.",
    phaseInfo: { scenario: "IAM", phase: 3, total: 4 },
  },
  {
    type: "multiple_choice",
    question: "Em um hospital, médicos editam prontuários, mas recepcionistas só veem a agenda. Se uma recepcionista tentar alterar um prontuário, qual etapa do IAM a bloqueia?",
    options: [
      "Identificação — o sistema não reconhece o usuário",
      "Autenticação — a senha da recepcionista é inválida",
      "Autorização — ela não tem permissão para essa ação",
      "Criptografia — o arquivo está protegido por chave",
    ],
    correct: 2,
    explanation: "A Autorização define quais ações um usuário autenticado pode executar. A recepcionista foi identificada e autenticada, mas não tem permissão de Update sobre prontuários.",
    phaseInfo: { scenario: "IAM", phase: 4, total: 4 },
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 3 — Ameaças e Malware (indices 10–14)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Ameaças, Malware e Gestão de Riscos",
    category: "red_team",
    difficulty: "Intermediário",
    narrative:
      "Ameaças são agentes externos que exploram Vulnerabilidades — fraquezas internas dos sistemas. A combinação gera o Risco.\n\nMalwares são os principais vetores: Vírus, Worms, Trojans, Ransomware e Botnets têm comportamentos distintos e exigem respostas específicas.",
    evidence:
      "Tipos de Malware:\n\n  Vírus      → Depende do usuário para se espalhar\n  Worm       → Propaga-se sozinho pela rede\n  Trojan     → Disfarça-se como software legítimo\n  Ransomware → Criptografa dados e exige resgate\n  Botnet     → Rede de zumbis para ataques em escala\n\nFórmula: Risco = Ameaça × Vulnerabilidade × Impacto",
    totalPhases: 4,
  },
  {
    type: "association",
    instruction: "Associe cada cenário ao conceito correto na cadeia de risco:",
    pairs: [
      { left: "Grupo hacker buscando dados de cartões de crédito", right: "Ameaça" },
      { left: "Servidor sem backup e software desatualizado", right: "Vulnerabilidade" },
      { left: "Possibilidade real de perda total dos dados", right: "Risco" },
    ],
    phaseInfo: { scenario: "Ameaças", phase: 1, total: 4 },
  },
  {
    type: "association",
    instruction: "Associe o comportamento ao tipo correto de malware:",
    pairs: [
      { left: "Infecta arquivos, precisa de execução pelo usuário", right: "Vírus" },
      { left: "Propaga-se automaticamente por vulnerabilidades de rede", right: "Worm" },
      { left: "Disfarça-se como programa legítimo para enganar", right: "Trojan" },
    ],
    phaseInfo: { scenario: "Ameaças", phase: 2, total: 4 },
  },
  {
    type: "fill_blank",
    instruction: "Complete a definição técnica de Ransomware:",
    sentence:
      "O ___ é um tipo de malware que realiza a ___ dos arquivos da vítima e exige o pagamento de um ___ para restaurar o acesso.",
    blanks: ["ransomware", "criptografia", "resgate"],
    words: ["ransomware", "criptografia", "resgate", "spyware", "compressão", "contrato", "keylogger", "backup"],
    phaseInfo: { scenario: "Ameaças", phase: 3, total: 4 },
  },
  {
    type: "multiple_choice",
    question: "Um atacante infectou milhares de dispositivos para realizar um ataque DDoS. Qual o nome dado a essa rede de zumbis controlados remotamente?",
    options: [
      "Spyware — monitora o usuário secretamente",
      "Botnet — rede de bots controlada por servidor C&C",
      "Keylogger — captura tudo que o usuário digita",
      "Adware — exibe publicidade não solicitada",
    ],
    correct: 1,
    explanation: "Uma Botnet é controlada por servidor C&C. Cada dispositivo age como zumbi para ataques em larga escala como DDoS, spam ou roubo de credenciais.",
    phaseInfo: { scenario: "Ameaças", phase: 4, total: 4 },
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 4 — LGPD e Privacidade (indices 15–19)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "LGPD — Lei Geral de Proteção de Dados",
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
    question: "Quais das alternativas abaixo são exemplos de dados pessoais conforme a LGPD?",
    options: [
      "Apenas CPF, pois é o único número único por pessoa",
      "CPF e nome completo, mas não o endereço de e-mail",
      "CPF, nome, e-mail e IP — todos identificam uma pessoa natural",
      "Nenhum, pois todos esses dados são públicos na internet",
    ],
    correct: 2,
    explanation: "A LGPD define dado pessoal como qualquer informação que identifique ou possa identificar uma pessoa natural, incluindo nome, CPF, e-mail, endereço IP e muito mais.",
    phaseInfo: { scenario: "LGPD", phase: 1, total: 4 },
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
  },
  {
    type: "fill_blank",
    instruction: "Complete as bases legais para tratamento de dados pessoais:",
    sentence:
      "O tratamento de dados é permitido com o ___ do titular, para cumprir uma ___ legal, ou para proteger a ___ ou incolumidade física do titular.",
    blanks: ["consentimento", "obrigação", "vida"],
    words: ["consentimento", "obrigação", "vida", "interesse", "contrato", "lucro", "aprovação", "notificação"],
    phaseInfo: { scenario: "LGPD", phase: 3, total: 4 },
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
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 5 — Phishing Avançado (indices 20–24)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Phishing e Engenharia Social",
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
  },
  {
    type: "phishing_email",
    fromDisplay: "Segurança Corporativa TI",
    fromEmail: "security@empresa-corp.net.br",
    to: "voce@empresa.com.br",
    subject: "🔴 URGENTE: Sua conta será bloqueada em 24 horas",
    body: "Detectamos acesso suspeito à sua conta corporativa. Para evitar o bloqueio imediato, verifique suas credenciais clicando no link abaixo. Esta ação é obrigatória e deve ser realizada em menos de 24 horas.",
    linkText: "Verificar minha conta agora",
    linkRealUrl: "http://empresa-corp.net.br/verify-acc0unt-secure",
    attachmentName: "Comprovante_Acesso_Suspeito.exe",
    fraudIndicators: ["sender", "link", "attachment"],
    explanation: "Três red flags: (1) Domínio do remetente é .net.br, não .com.br; (2) Link usa 'acc0unt' com zero no lugar do 'o'; (3) Anexo .exe nunca deve ser aberto em ambiente corporativo.",
    phaseInfo: { scenario: "Phishing", phase: 2, total: 4 },
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
  },
];
