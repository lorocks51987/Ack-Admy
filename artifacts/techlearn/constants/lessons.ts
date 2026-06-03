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
    title: "Fundamentos de Segurança de Aplicações",
    subtitle: "Princípios essenciais da informação",
    iconName: "Shield",
    startIdx: 0,
    length: 6,
    accentColor: "#6366F1",
    category: "awareness",
    difficulty: "Iniciante",
  },
  {
    id: 2,
    title: "Riscos comuns em aplicações",
    subtitle: "Identificação de malwares e riscos",
    iconName: "AlertTriangle",
    startIdx: 11,
    length: 5,
    accentColor: "#EF4444",
    category: "red_team",
    difficulty: "Intermediário",
  },
  {
    id: 3,
    title: "Controle de acesso e autenticação",
    subtitle: "Gestão de identidade e acessos",
    iconName: "Key",
    startIdx: 6,
    length: 5,
    accentColor: "#3B82F6",
    category: "blue_team",
    difficulty: "Intermediário",
  },
  {
    id: 4,
    title: "Phishing e engenharia social",
    subtitle: "Prevenção contra ataques",
    iconName: "Mail",
    startIdx: 21,
    length: 5,
    accentColor: "#F59E0B",
    category: "awareness",
    difficulty: "Avançado",
  },
  {
    id: 5,
    title: "Proteção de dados",
    subtitle: "Privacidade e conformidade",
    iconName: "FileText",
    startIdx: 16,
    length: 5,
    accentColor: "#8B5CF6",
    category: "lgpd",
    difficulty: "Intermediário",
  },
  {
    id: 6,
    title: "Aplicando o que aprendeu",
    subtitle: "Teste seus conhecimentos",
    iconName: "Shield",
    startIdx: 0,
    length: 6,
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
    question: "Uma empresa investe nos melhores firewalls, mas não treina seus funcionários. Por que essa estratégia é incompleta?",
    options: [
      "Porque a segurança depende apenas de software atualizado",
      "Porque segurança exige equilíbrio entre Tecnologia, Pessoas e Processos",
      "Porque processos são irrelevantes se a tecnologia for de ponta",
      "Porque firewalls não protegem redes corporativas modernas",
    ],
    correct: 1,
    explanation: "Segurança não é só tecnologia. Depende de pessoas treinadas e processos definidos. O fator humano é o elo mais crítico.",
    phaseInfo: { scenario: "Tríade CID", phase: 4, total: 5 },
    hint: "Segurança da Informação é sustentada por três pilares além da CID: Tecnologia, Pessoas e Processos. Nenhum funciona sozinho.",
    feedbackCorrect: "Muito bem! Segurança eficaz exige o equilíbrio entre Tecnologia, Pessoas e Processos. Nenhum pilar sozinho é suficiente.",
    feedbackWrong: "Firewalls são ferramentas de Tecnologia. Mas sem Pessoas treinadas e Processos definidos, qualquer sistema fica vulnerável. Segurança exige os três elementos juntos.",
    learnMore: "Pesquisas da IBM mostram que 95% dos incidentes de segurança têm causa raiz humana: um clique errado, uma senha fraca, falta de procedimento. Por isso pessoas e processos são tão críticos quanto a tecnologia.",
  },
  {
    type: "text_input",
    question: "Em uma aplicação web, qual é o nome do controle que impede um usuário de acessar dados de outro usuário?",
    answer: "autorização|controle de autorização|validação de autorização",
    hint: "Pense na diferença entre provar quem você é e definir o que você pode acessar.",
    phaseInfo: { scenario: "Tríade CID", phase: 5, total: 5 },
    feedbackCorrect: "Boa! Autorização é o que garante que o usuário só acesse recursos permitidos.",
    feedbackWrong: "Quase. Aqui a ideia não é apenas saber quem é o usuário, mas verificar o que ele pode acessar.",
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
    hint: "MFA eficaz combina fatores de categorias DIFERENTES. Dois fatores da mesma categoria (como duas senhas) não aumentam a segurança.",
    feedbackCorrect: "Correto! Senha (SABER) + Token (TER) combinam categorias distintas, tornando o acesso muito mais seguro.",
    feedbackWrong: "Atenção: para MFA ser eficaz, os fatores precisam ser de categorias DIFERENTES. Dois fatores do mesmo tipo (duas senhas ou dois cartões) não oferecem proteção adicional real.",
    learnMore: "MFA só é eficaz quando combina categorias distintas. Se um atacante obtém sua senha, ele ainda precisaria de algo físico (celular/token) para entrar. Por isso o MFA reduz drasticamente o risco de invasão.",
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
    hint: "A recepcionista já está logada e identificada. O bloqueio acontece quando o sistema decide O QUE ela pode ou não fazer.",
    feedbackCorrect: "Certo! A Autorização controla as permissões de cada usuário autenticado.",
    feedbackWrong: "A recepcionista já passou pela Identificação (login) e Autenticação (senha). O bloqueio ocorre na Autorização — a etapa que define quais ações cada usuário pode executar.",
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
    hint: "A LGPD tem uma definição ampla: dado pessoal é qualquer informação que identifique ou possa identificar uma pessoa — direta ou indiretamente.",
    feedbackCorrect: "Correto! A LGPD tem uma definição muito ampla de dado pessoal — qualquer informação que possa identificar alguém.",
    feedbackWrong: "A LGPD define dado pessoal de forma muito ampla: qualquer informação que identifique uma pessoa, direta ou indiretamente. Isso inclui IP, e-mail, nome, CPF e muito mais.",
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
];
