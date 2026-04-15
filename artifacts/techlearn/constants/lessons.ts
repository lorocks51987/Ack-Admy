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
  // ═══════════════════════════════════════════════════
  // MÓDULO 1 — Fundamentos da LGPD
  // ═══════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Fundamentos da LGPD",
    category: "lgpd",
    difficulty: "Iniciante",
    narrative:
      "A Lei Geral de Proteção de Dados (LGPD) entrou em vigor em 2020 e se aplica a TODOS os funcionários que tratam dados pessoais — não só à área de TI.\n\nComo colaborador, você é responsável por proteger os dados dos clientes, fornecedores e colegas com quem trabalha diariamente.",
    evidence:
      "Lei nº 13.709/2020 — LGPD\n\nArt. 6º: O tratamento de dados pessoais deve\nobservar a boa-fé e os princípios de:\n- Finalidade\n- Adequação\n- Necessidade\n- Transparência\n- Segurança",
    totalPhases: 3,
  },
  {
    type: "multiple_choice",
    question: "Qual destes é considerado um dado pessoal segundo a LGPD?",
    options: [
      "CPF de um cliente",
      "Temperatura do ar condicionado",
      "Nome do produto vendido",
      "Cor da parede do escritório",
    ],
    correct: 0,
    explanation:
      "Dado pessoal é qualquer informação que identifique ou possa identificar uma pessoa natural — CPF, nome, e-mail, telefone, endereço, entre outros.",
    phaseInfo: { scenario: "Fundamentos da LGPD", phase: 1, total: 3 },
  },
  {
    type: "association",
    instruction: "Associe cada direito do titular ao seu significado:",
    pairs: [
      { left: "Acesso", right: "Ver quais dados foram coletados" },
      { left: "Correção", right: "Atualizar dados incorretos" },
      { left: "Eliminação", right: "Pedir exclusão dos dados" },
      { left: "Portabilidade", right: "Transferir dados para outro serviço" },
    ],
    phaseInfo: { scenario: "Fundamentos da LGPD", phase: 2, total: 3 },
  },
  {
    type: "fill_blank",
    instruction: "Complete a definição de dado sensível conforme a LGPD:",
    sentence:
      "Dados sobre ___, raça, ___, saúde, ___ política ou ___ criminal são considerados dados sensíveis e têm proteção reforçada.",
    blanks: ["religião", "etnia", "opinião", "antecedente"],
    words: [
      "religião", "etnia", "opinião", "antecedente",
      "financeiro", "cargo", "endereço", "telefone",
    ],
    phaseInfo: { scenario: "Fundamentos da LGPD", phase: 3, total: 3 },
  },

  // ═══════════════════════════════════════════════════
  // MÓDULO 2 — Engenharia Social e Phishing
  // ═══════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Engenharia Social e Phishing",
    category: "awareness",
    difficulty: "Intermediário",
    narrative:
      "95% dos ataques cibernéticos bem-sucedidos começam com um e-mail. Atacantes se passam por colegas, CEOs, bancos ou fornecedores para manipular funcionários a clicar em links, fornecer senhas ou transferir dinheiro.\n\nEsse tipo de ataque se chama Business Email Compromise (BEC) e gerou mais de US$ 2,9 bilhões em perdas globais em 2023.",
    evidence:
      "Fonte: FBI Internet Crime Report 2023\n\nTop 3 vetores de ataque:\n1. Phishing por e-mail        → 36%\n2. Credenciais roubadas      → 19%\n3. Vulnerabilidade de software → 16%",
    totalPhases: 3,
  },
  {
    type: "phishing_email",
    fromDisplay: "Carlos Mendes — CEO",
    fromEmail: "carlos.mendes@empresa-corp.xyz",
    to: "voce@suaempresa.com.br",
    subject: "URGENTE: Transferência Autorizada",
    body: "Preciso que você realize uma transferência urgente de R$ 47.500 para finalizar a aquisição que estamos negociando. Trata-se de um assunto confidencial — não mencione para ninguém do financeiro ainda.\n\nAcesse o sistema pelo link abaixo para confirmar os dados bancários:\n\nEssa operação precisa ser concluída hoje antes das 17h.",
    linkText: "Acessar Sistema Financeiro",
    linkRealUrl: "http://empresa-corp.xyz.malware.ru/login",
    attachmentName: "CONTRATO_URGENTE_2024.exe",
    fraudIndicators: ["sender", "link", "attachment"],
    explanation:
      "Este é um ataque clássico de BEC (Business Email Compromise). Três red flags: (1) domínio do remetente diferente do oficial (.xyz em vez de .com.br), (2) link aponta para um servidor russo, (3) anexo .exe é um executável malicioso. Nunca transfira valores por solicitação de e-mail sem confirmar por telefone.",
    phaseInfo: { scenario: "Engenharia Social e Phishing", phase: 1, total: 3 },
  },
  {
    type: "ordering",
    instruction: "Ordene os passos corretos ao receber um e-mail suspeito:",
    items: [
      "Clicar no link para verificar",
      "NÃO clicar em nenhum link ou anexo",
      "Encaminhar para o time de segurança",
      "Confirmar com o remetente por telefone",
      "Marcar como phishing no cliente de e-mail",
    ],
    correctOrder: [1, 3, 4, 2, 0],
    phaseInfo: { scenario: "Engenharia Social e Phishing", phase: 2, total: 3 },
  },
  {
    type: "multiple_choice",
    question: "Qual destes NÃO é um sinal de alerta em um e-mail corporativo?",
    options: [
      "Urgência extrema e sigilo obrigatório",
      "Domínio do remetente diferente do oficial",
      "E-mail assinado com nome completo e ramal",
      "Pedido de transferência sem aprovação formal",
    ],
    correct: 2,
    explanation:
      "E-mail com nome completo e ramal é um sinal de autenticidade, não de fraude. Os outros três são red flags clássicos de engenharia social: urgência artificial, domínio falso e bypass de processos internos.",
    phaseInfo: { scenario: "Engenharia Social e Phishing", phase: 3, total: 3 },
  },

  // ═══════════════════════════════════════════════════
  // MÓDULO 3 — Higiene de Senhas e Mesa Limpa
  // ═══════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Higiene de Senhas e Mesa Limpa",
    category: "awareness",
    difficulty: "Iniciante",
    narrative:
      "Senhas fracas são responsáveis por 81% das violações de dados confirmadas. Além disso, documentos físicos deixados sobre a mesa são uma das formas mais antigas — e mais negligenciadas — de vazamento de informações confidenciais.\n\nA política de Mesa Limpa garante que informações sensíveis não fiquem expostas quando você se ausenta.",
    evidence:
      "Senhas mais usadas em 2023 (e tempo para quebrar):\n\n  123456       →  < 1 segundo\n  senha123     →  < 1 segundo\n  qwerty       →  < 1 segundo\n  Tr0ub4dor&3  →  ~3 dias\n  correct-horse-battery →  Séculos",
    totalPhases: 3,
  },
  {
    type: "multiple_choice",
    question: "Qual dessas senhas segue as melhores práticas de segurança?",
    options: [
      "joao1985",
      "Empresa@2024",
      "correto-cavalo-bateria-grampo",
      "P@$$w0rd",
    ],
    correct: 2,
    explanation:
      "Passphrase de múltiplas palavras aleatórias é mais segura E mais fácil de lembrar. Substituições óbvias como @ por 'a' e 0 por 'o' são conhecidas por atacantes. Dados pessoais (nome, ano de nascimento) tornam a senha previsível.",
    phaseInfo: { scenario: "Higiene de Senhas e Mesa Limpa", phase: 1, total: 3 },
  },
  {
    type: "fill_blank",
    instruction: "Complete a Política de Mesa Limpa da empresa:",
    sentence:
      "Ao se ausentar da mesa, ___ a tela do computador. Documentos confidenciais devem ser guardados em ___ ou destruídos na ___. Nunca deixe seu ___ sem supervisão.",
    blanks: ["bloqueie", "gaveta", "fragmentadora", "crachá"],
    words: [
      "bloqueie", "gaveta", "fragmentadora", "crachá",
      "desligue", "armário", "lixeira", "celular",
    ],
    phaseInfo: { scenario: "Higiene de Senhas e Mesa Limpa", phase: 2, total: 3 },
  },
  {
    type: "ordering",
    instruction: "Ordene as ações do checklist de saída do escritório:",
    items: [
      "Recolher documentos da mesa e gavetas",
      "Bloquear ou desligar o computador",
      "Verificar se a impressora está vazia",
      "Guardar mídias removíveis (pen drives)",
      "Trancar o armário com documentos sigilosos",
    ],
    correctOrder: [1, 0, 2, 3, 4],
    phaseInfo: { scenario: "Higiene de Senhas e Mesa Limpa", phase: 3, total: 3 },
  },
];
