import { ReactNode } from "react";

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

export interface EducationalFields {
  hint?: string;
  feedbackCorrect?: string;
  feedbackWrong?: string;
  learnMore?: string;
}

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  phaseInfo?: PhaseInfo;
}

export interface MultipleChoiceExercise extends BaseExercise, EducationalFields {
  type: "multiple_choice";
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface AssociationExercise extends BaseExercise, EducationalFields {
  type: "association";
  instruction: string;
  pairs: { left: string; right: string }[];
}

export interface TextInputExercise extends BaseExercise, EducationalFields {
  type: "text_input";
  question: string;
  answer: string;
}

export interface OrderingExercise extends BaseExercise, EducationalFields {
  type: "ordering";
  instruction: string;
  items: string[];
  correctOrder: number[];
}

export interface FillBlankExercise extends BaseExercise, EducationalFields {
  type: "fill_blank";
  instruction: string;
  sentence: string;
  blanks: string[];
  words: string[];
}

export interface BriefingExercise extends BaseExercise {
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

export interface PhishingEmailExercise extends BaseExercise, EducationalFields {
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
  fraudIndicators?: FraudIndicator[];
  phishingElements?: PhishingElementDef[];
  correctElementIds?: string[];
  explanation: string;
}

export type Exercise =
  | MultipleChoiceExercise
  | AssociationExercise
  | TextInputExercise
  | OrderingExercise
  | FillBlankExercise
  | BriefingExercise
  | PhishingEmailExercise;

export interface ModuleDefinition {
  id: number;
  stringId: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  iconName: "Shield" | "Key" | "AlertTriangle" | "FileText" | "Mail" | "CheckCircle" | "UserX";
  accentColor: string;
  category: BriefingExercise["category"];
  difficulty: BriefingExercise["difficulty"];
  checkpoint?: boolean;
  exercises: Exercise[];
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: 1,
    stringId: "fsi-01-seguranca-pratica",
    title: "Segurança da Informação na prática",
    shortTitle: "Fundamentos",
    subtitle: "Princípios essenciais e a Tríade CID",
    iconName: "Shield",
    accentColor: "#6366F1", // Indigo
    category: "awareness",
    difficulty: "Iniciante",
    exercises: [
      {
        id: "fsi-01-triade-cid-brief",
        type: "briefing",
        scenarioTitle: "A Tríade CID",
        category: "awareness",
        difficulty: "Iniciante",
        narrative: "A Segurança da Informação é sustentada por três pilares fundamentais da ISO 27000: Confidencialidade, Integridade e Disponibilidade — a Tríade CID.\n\nMas segurança vai além da tecnologia. Ela exige equilíbrio entre Tecnologia, Pessoas e Processos. O elo mais fraco de um sistema quase sempre é o humano.",
        evidence: "ISO/IEC 27000 — Pilares da Segurança:\n\n  Confidencialidade → Acesso somente por autorizados\n  Integridade       → Dados não alterados sem permissão\n  Disponibilidade   → Sistemas acessíveis quando necessário",
        totalPhases: 5,
      },
      {
        id: "fsi-01-triade-cid-assoc-01",
        type: "association",
        instruction: "Associe cada incidente ao pilar da Tríade CID que foi violado:",
        pairs: [
          { left: "Hacker visualiza dados médicos sem autorização", right: "Confidencialidade" },
          { left: "Vírus altera os valores de uma planilha financeira", right: "Integridade" },
          { left: "Ataque DDoS deixa site de banco fora do ar", right: "Disponibilidade" },
        ],
        phaseInfo: { scenario: "Tríade CID", phase: 1, total: 5 },
        hint: "Confidencialidade = quem pode ver; Integridade = se foi alterado; Disponibilidade = se está acessível.",
        feedbackCorrect: "Perfeito! Você entendeu como cada pilar protege um aspecto diferente da informação.",
        feedbackWrong: "Relembre: Confidencialidade = visualização não autorizada, Integridade = alteração indevida, Disponibilidade = falta de acesso.",
      },
      {
        id: "fsi-01-triade-cid-mc-01",
        type: "multiple_choice",
        question: "No ataque de Ransomware ao Grupo Fleury, os sistemas ficaram paralisados por dias. Qual pilar foi o mais severamente impactado inicialmente?",
        options: ["Integridade", "Confidencialidade", "Disponibilidade", "Autenticidade"],
        correct: 2,
        explanation: "A paralisação operacional total é uma violação direta da Disponibilidade.",
        phaseInfo: { scenario: "Tríade CID", phase: 2, total: 5 },
        feedbackCorrect: "Exato! Quando sistemas ficam paralisados, o pilar da Disponibilidade é violado.",
        feedbackWrong: "Se os usuários não conseguem acessar o sistema, o problema é de disponibilidade.",
      },
      {
        id: "fsi-01-triade-cid-fill-01",
        type: "fill_blank",
        instruction: "Complete os três pilares da Tríade CID:",
        sentence: "A ___ garante que a informação não seja vista por pessoas não autorizadas. A ___ assegura que o dado não foi modificado. A ___ garante que o sistema esteja acessível.",
        blanks: ["Confidencialidade", "Integridade", "Disponibilidade"],
        words: ["Confidencialidade", "Integridade", "Disponibilidade", "Privacidade"],
        phaseInfo: { scenario: "Tríade CID", phase: 3, total: 5 },
        hint: "A sigla CID forma a resposta.",
      },
      {
        id: "fsi-01-triade-cid-mc-02",
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
        feedbackCorrect: "Muito bem! Segurança eficaz exige o equilíbrio entre os três pilares.",
        feedbackWrong: "Tecnologia sozinha não resolve. Você precisa das pessoas e dos processos.",
      },
    ]
  },
  {
    id: 2,
    stringId: "fsi-02-ativos-informacao",
    title: "Ativos de Informação",
    shortTitle: "Ativos",
    subtitle: "Identificação e valor da informação",
    iconName: "FileText",
    accentColor: "#3B82F6", // Blue
    category: "blue_team",
    difficulty: "Iniciante",
    exercises: [
      {
        id: "fsi-02-ativos-brief",
        type: "briefing",
        scenarioTitle: "O que proteger?",
        category: "blue_team",
        difficulty: "Iniciante",
        narrative: "Toda estratégia de segurança começa pela identificação dos ativos. Um ativo de informação é qualquer dado ou recurso que tenha valor para a organização.\n\nEles não precisam ser digitais. Um contrato impresso e o conhecimento de um funcionário também são ativos cruciais.",
        evidence: "Exemplos de ativos:\n- Bancos de dados de clientes\n- Código-fonte de aplicações\n- Documentos e processos físicos\n- Reputação da marca",
        totalPhases: 4,
      },
      {
        id: "fsi-02-ativos-order-01",
        type: "ordering",
        instruction: "Ordene os passos lógicos de uma estratégia inicial de proteção:",
        items: [
          "Identificar os ativos de informação",
          "Avaliar o valor e criticidade de cada ativo",
          "Definir controles de proteção para a tríade CID",
          "Monitorar e auditar os controles continuamente"
        ],
        correctOrder: [0, 1, 2, 3],
        phaseInfo: { scenario: "Estratégia", phase: 1, total: 4 },
        hint: "Você não pode proteger o que não conhece, e não deve gastar muito com o que vale pouco.",
      },
      {
        id: "fsi-02-ativos-mc-01",
        type: "multiple_choice",
        question: "Qual das opções abaixo NÃO é considerada um ativo de informação vital para a maioria das empresas?",
        options: [
          "Banco de dados de clientes",
          "Código-fonte de um aplicativo próprio",
          "Mobiliário de escritório comum",
          "Prontuário médico em papel"
        ],
        correct: 2,
        explanation: "Ativos de informação são aqueles que processam, armazenam ou transmitem informações de valor.",
        phaseInfo: { scenario: "Ativos", phase: 2, total: 4 },
      },
      {
        id: "fsi-02-ativos-assoc-01",
        type: "association",
        instruction: "Associe o tipo de ativo à sua representação prática:",
        pairs: [
          { left: "Ativo Físico", right: "Servidor no data center" },
          { left: "Ativo Intangível", right: "Reputação da marca" },
          { left: "Ativo de Informação", right: "Planilha de projeção financeira" }
        ],
        phaseInfo: { scenario: "Ativos", phase: 3, total: 4 },
      },
      {
        id: "fsi-02-ativos-mc-02",
        type: "multiple_choice",
        question: "Durante a classificação da informação, um documento contendo a estratégia de fusão da empresa vazou antes do anúncio oficial. Como esse ativo deveria estar classificado?",
        options: ["Público", "Uso Interno", "Confidencial", "Restrito (Crítico)"],
        correct: 3,
        explanation: "Estratégias de negócio confidenciais possuem impacto crítico/devastador caso vazem, exigindo o nível máximo de proteção (Restrito).",
        phaseInfo: { scenario: "Ativos", phase: 4, total: 4 },
      }
    ]
  },
  {
    id: 3,
    stringId: "fsi-03-identidade-acesso",
    title: "Identidade e Acesso",
    shortTitle: "Acesso",
    subtitle: "Gestão do fluxo IAM",
    iconName: "Key",
    accentColor: "#F59E0B", // Amber
    category: "blue_team",
    difficulty: "Intermediário",
    exercises: [
      {
        id: "fsi-03-iam-brief",
        type: "briefing",
        scenarioTitle: "Gestão de Identidade e Acesso (IAM)",
        category: "blue_team",
        difficulty: "Intermediário",
        narrative: "A Gestão de Identidade e Acesso (IAM) controla quem pode acessar o quê. O fluxo obrigatório tem três etapas em sequência: Identificação, Autenticação e Autorização.",
        evidence: "Fluxo IAM obrigatório:\n  1. Identificação  → Quem é você? (login)\n  2. Autenticação   → Prove que é você (senha)\n  3. Autorização    → O que pode fazer? (permissões)",
        totalPhases: 4,
      },
      {
        id: "fsi-03-iam-order-01",
        type: "ordering",
        instruction: "Ordene as etapas do fluxo de acesso do IAM:",
        items: [
          "Verificar se o usuário tem permissão para acessar (Autorização)",
          "Informar o nome de usuário ao sistema (Identificação)",
          "Inserir senha para validar a identidade (Autenticação)"
        ],
        correctOrder: [1, 2, 0],
        phaseInfo: { scenario: "IAM", phase: 1, total: 4 },
        hint: "Primeiro você diz quem é, depois prova, e por fim o sistema decide o que pode fazer.",
      },
      {
        id: "fsi-03-iam-assoc-01",
        type: "association",
        instruction: "Associe a etapa à sua pergunta central:",
        pairs: [
          { left: "Quem é você?", right: "Identificação" },
          { left: "Prove que é você!", right: "Autenticação" },
          { left: "O que você pode fazer?", right: "Autorização" }
        ],
        phaseInfo: { scenario: "IAM", phase: 2, total: 4 },
      },
      {
        id: "fsi-03-iam-mc-01",
        type: "multiple_choice",
        question: "Em um hospital, uma recepcionista já está logada, mas ao tentar alterar um prontuário médico, o sistema a bloqueia. Em qual etapa ocorreu o bloqueio?",
        options: ["Identificação", "Autenticação", "Autorização", "Criptografia"],
        correct: 2,
        explanation: "Ela foi identificada e autenticada, mas bloqueada na Autorização, que define o que ela tem permissão para fazer.",
        phaseInfo: { scenario: "IAM", phase: 3, total: 4 },
      },
      {
        id: "fsi-03-iam-text-01",
        type: "text_input",
        question: "Qual o princípio de segurança que determina que um usuário deve ter apenas o nível de acesso estritamente necessário para realizar seu trabalho?",
        answer: "menor privilegio|privilegio minimo|least privilege",
        hint: "Princípio do M____ P____",
        phaseInfo: { scenario: "IAM", phase: 4, total: 4 },
      }
    ]
  },
  {
    id: 4,
    stringId: "fsi-04-autenticacao-mfa",
    title: "Autenticação e MFA",
    shortTitle: "Autenticação",
    subtitle: "Protegendo identidades com múltiplos fatores",
    iconName: "Shield",
    accentColor: "#10B981", // Emerald
    category: "blue_team",
    difficulty: "Intermediário",
    exercises: [
      {
        id: "fsi-04-mfa-brief",
        type: "briefing",
        scenarioTitle: "Múltiplos Fatores",
        category: "blue_team",
        difficulty: "Intermediário",
        narrative: "Senhas sozinhas já não oferecem proteção suficiente. A Autenticação de Múltiplos Fatores (MFA) é a medida mais eficaz para proteger contas.\n\nPara ser um MFA real, os fatores devem vir de categorias diferentes: Saber, Ter ou Ser.",
        evidence: "Fatores MFA:\n  Saber → Senha, PIN\n  Ter   → Token físico, App no celular\n  Ser   → Biometria, face ID",
        totalPhases: 4,
      },
      {
        id: "fsi-04-mfa-assoc-01",
        type: "association",
        instruction: "Classifique cada método no tipo de fator correto:",
        pairs: [
          { left: "Impressão digital", right: "Algo que você É" },
          { left: "Senha numérica", right: "Algo que você SABE" },
          { left: "Token no celular", right: "Algo que você TEM" }
        ],
        phaseInfo: { scenario: "MFA", phase: 1, total: 4 },
      },
      {
        id: "fsi-04-mfa-mc-01",
        type: "multiple_choice",
        question: "Qual combinação representa um MFA eficaz e robusto?",
        options: [
          "Senha (saber) e PIN (saber) juntos",
          "Senha (saber) e Token gerado no celular (ter)",
          "Cartão de acesso (ter) e chave da sala (ter)",
          "Apenas reconhecimento facial e de íris"
        ],
        correct: 1,
        explanation: "A segurança aumenta apenas quando combinamos fatores de categorias independentes.",
        phaseInfo: { scenario: "MFA", phase: 2, total: 4 },
      },
      {
        id: "fsi-04-mfa-fill-01",
        type: "fill_blank",
        instruction: "Complete sobre a robustez da autenticação:",
        sentence: "O uso de múltiplos ___ independentes dificulta drasticamente a vida de atacantes. Uma senha vazada pode ser inútil se o sistema também exigir a ___ digital do usuário.",
        blanks: ["fatores", "biometria"],
        words: ["fatores", "biometria", "senhas", "assinatura"],
        phaseInfo: { scenario: "MFA", phase: 3, total: 4 },
      },
      {
        id: "fsi-04-mfa-mc-02",
        type: "multiple_choice",
        question: "Ao remover a exigência do token (SMS/App) no login de um internet banking, qual propriedade de segurança é diretamente enfraquecida?",
        options: ["Confidencialidade", "Autenticidade", "Disponibilidade", "Integridade"],
        correct: 1,
        explanation: "A autenticidade é a certeza de que a entidade é quem afirma ser. Remover fatores a enfraquece.",
        phaseInfo: { scenario: "MFA", phase: 4, total: 4 },
      }
    ]
  },
  {
    id: 5,
    stringId: "fsi-05-privacidade-lgpd",
    title: "Privacidade e LGPD",
    shortTitle: "LGPD",
    subtitle: "Proteção de dados pessoais",
    iconName: "FileText",
    accentColor: "#8B5CF6", // Violet
    category: "lgpd",
    difficulty: "Intermediário",
    checkpoint: true,
    exercises: [
      {
        id: "fsi-05-lgpd-brief",
        type: "briefing",
        scenarioTitle: "Proteção de Dados Pessoais",
        category: "lgpd",
        difficulty: "Intermediário",
        narrative: "A LGPD regulamenta como organizações devem tratar dados pessoais de brasileiros. A lei garante direitos ao titular e obrigações estritas às empresas.\n\nA Privacidade atua como a confidencialidade aplicada especificamente a dados de pessoas físicas.",
        evidence: "LGPD - Conceitos:\n- Dado Pessoal: Qualquer info que identifique a pessoa (nome, CPF, IP)\n- Titular: O dono dos dados\n- Controlador: Quem decide o uso\n- ANPD: Órgão fiscalizador com multas de até R$ 50M",
        totalPhases: 5,
      },
      {
        id: "fsi-05-lgpd-mc-01",
        type: "multiple_choice",
        question: "Quais alternativas listam APENAS exemplos de dados pessoais sob a LGPD?",
        options: [
          "Apenas CPF, RG e Nome completo.",
          "CNPJ, Razão Social e Balanço financeiro corporativo.",
          "CPF, Nome, E-mail corporativo, Endereço de IP e Geolocalização.",
          "Dados anonimizados que nunca podem ser revertidos."
        ],
        correct: 2,
        explanation: "A LGPD abrange qualquer informação que possa identificar uma pessoa, mesmo indiretamente (IP, geolocalização).",
        phaseInfo: { scenario: "LGPD", phase: 1, total: 5 },
      },
      {
        id: "fsi-05-lgpd-assoc-01",
        type: "association",
        instruction: "Associe o direito do titular ao que ele permite:",
        pairs: [
          { left: "Acesso", right: "Saber quais dados a empresa tem" },
          { left: "Exclusão", right: "Apagar seus dados da plataforma" },
          { left: "Portabilidade", right: "Transferir dados para outro serviço" }
        ],
        phaseInfo: { scenario: "LGPD", phase: 2, total: 5 },
      },
      {
        id: "fsi-05-lgpd-fill-01",
        type: "fill_blank",
        instruction: "Complete as bases legais da LGPD:",
        sentence: "O tratamento de dados pode ocorrer com o ___ do titular, para cumprir uma ___ legal, ou para execução de um ___.",
        blanks: ["consentimento", "obrigação", "contrato"],
        words: ["consentimento", "obrigação", "contrato", "lucro", "desejo"],
        phaseInfo: { scenario: "LGPD", phase: 3, total: 5 },
      },
      {
        id: "fsi-05-lgpd-mc-02",
        type: "multiple_choice",
        question: "Qual órgão é o responsável federal por aplicar multas relacionadas à quebra da LGPD?",
        options: ["Polícia Federal", "ANPD", "Ministério Público", "PROCON"],
        correct: 1,
        explanation: "A Autoridade Nacional de Proteção de Dados (ANPD) é a responsável primária por sanções da LGPD.",
        phaseInfo: { scenario: "LGPD", phase: 4, total: 5 },
      },
      {
        id: "fsi-05-lgpd-text-01",
        type: "text_input",
        question: "O acesso sem justificativa a registros de dados de terceiros, mesmo dentro da empresa, viola diretamente qual direito protegido pela LGPD?",
        answer: "privacidade",
        hint: "P____",
        phaseInfo: { scenario: "LGPD", phase: 5, total: 5 },
      }
    ]
  },
  {
    id: 6,
    stringId: "fsi-06-accountability",
    title: "Não Repúdio e Accountability",
    shortTitle: "Accountability",
    subtitle: "Rastreabilidade e garantias de autoria",
    iconName: "FileText",
    accentColor: "#F43F5E", // Rose
    category: "blue_team",
    difficulty: "Intermediário",
    exercises: [
      {
        id: "fsi-06-acc-brief",
        type: "briefing",
        scenarioTitle: "Garantindo Autoria",
        category: "blue_team",
        difficulty: "Intermediário",
        narrative: "Para que um ambiente seja seguro, usuários não podem negar as ações que cometeram (Não Repúdio). Além disso, cada ação precisa ser rastreável a uma identidade única (Accountability ou Responsabilização).",
        evidence: "Trilha de Auditoria eficaz exige 4 elementos:\n1. Quem?\n2. O quê?\n3. Quando?\n4. De onde?\n\nAssinaturas digitais são o principal exemplo de garantia de Não Repúdio.",
        totalPhases: 4,
      },
      {
        id: "fsi-06-acc-mc-01",
        type: "multiple_choice",
        question: "Um usuário assina um contrato digital usando sua chave privada. Dias depois, afirma que não foi ele. Qual propriedade o impede de negar?",
        options: ["Confidencialidade", "Não Repúdio", "Disponibilidade", "Anonimização"],
        correct: 1,
        explanation: "Não repúdio garante que o emissor não possa negar a autoria da ação ou mensagem.",
        phaseInfo: { scenario: "Autoria", phase: 1, total: 4 },
      },
      {
        id: "fsi-06-acc-assoc-01",
        type: "association",
        instruction: "Diferencie os conceitos:",
        pairs: [
          { left: "Não Repúdio", right: "Prova criptográfica de autoria" },
          { left: "Accountability", right: "Histórico completo de auditoria das ações" },
          { left: "Integridade", right: "Garantia de que o arquivo não foi alterado" }
        ],
        phaseInfo: { scenario: "Autoria", phase: 2, total: 4 },
      },
      {
        id: "fsi-06-acc-mc-02",
        type: "multiple_choice",
        question: "Durante uma auditoria, percebe-se que os usuários podem apagar seus próprios logs de ações no sistema. Qual é o risco?",
        options: [
          "Aumenta a disponibilidade destruindo arquivos velhos.",
          "Viola a Accountability, pois evidências são perdidas.",
          "Fortalece a privacidade do funcionário perante o chefe."
        ],
        correct: 1,
        explanation: "Logs devem ser inalteráveis. Se um usuário pode apagar seu rastro, a responsabilização é destruída.",
        phaseInfo: { scenario: "Autoria", phase: 3, total: 4 },
      },
      {
        id: "fsi-06-acc-text-01",
        type: "text_input",
        question: "O processo que registra de forma inalterável 'quem' fez 'o quê' em um sistema é chamado de trilha de ________.",
        answer: "auditoria",
        hint: "A____",
        phaseInfo: { scenario: "Autoria", phase: 4, total: 4 },
      }
    ]
  },
  {
    id: 7,
    stringId: "fsi-07-ameacas-vulnerabilidades",
    title: "Ameaças e Vulnerabilidades",
    shortTitle: "Riscos",
    subtitle: "A equação do Risco em Segurança",
    iconName: "AlertTriangle",
    accentColor: "#EF4444", // Red
    category: "red_team",
    difficulty: "Intermediário",
    exercises: [
      {
        id: "fsi-07-riscos-brief",
        type: "briefing",
        scenarioTitle: "A Equação do Risco",
        category: "red_team",
        difficulty: "Intermediário",
        narrative: "Ameaças são agentes externos (ou eventos) capazes de causar dano. Vulnerabilidades são fraquezas internas do seu sistema.\n\nQuando uma Ameaça explora uma Vulnerabilidade, temos um Incidente de Segurança. O Risco é a combinação da Probabilidade disso ocorrer com o Impacto.",
        evidence: "Fórmula Clássica:\nRisco = (Ameaça × Vulnerabilidade) × Impacto\n\nClassificação de Ameaças:\n- Naturais (enchentes, raios)\n- Humanas Intencionais (hackers, espiões)\n- Humanas Acidentais (erro do usuário)",
        totalPhases: 5,
      },
      {
        id: "fsi-07-riscos-assoc-01",
        type: "association",
        instruction: "Associe os termos ao cenário de um banco de dados vazado:",
        pairs: [
          { left: "Vulnerabilidade", right: "Software de banco de dados desatualizado" },
          { left: "Ameaça", right: "Grupo hacker varrendo a internet" },
          { left: "Risco", right: "Probabilidade de perda e multa da LGPD" }
        ],
        phaseInfo: { scenario: "Riscos", phase: 1, total: 5 },
      },
      {
        id: "fsi-07-riscos-mc-01",
        type: "multiple_choice",
        question: "Uma enchente que alaga o Data Center corporativo é classificada como que tipo de ameaça?",
        options: ["Ameaça Técnica", "Ameaça Natural", "Ameaça Humana Acidental", "Ameaça Lógica"],
        correct: 1,
        explanation: "Fenômenos da natureza são ameaças naturais que afetam drasticamente a disponibilidade física.",
        phaseInfo: { scenario: "Riscos", phase: 2, total: 5 },
      },
      {
        id: "fsi-07-riscos-fill-01",
        type: "fill_blank",
        instruction: "Complete a lógica de mitigação de risco:",
        sentence: "Não podemos eliminar totalmente as ___. No entanto, podemos reduzir nossas ___ aplicando atualizações e boas práticas, o que consequentemente reduz o ___ final.",
        blanks: ["ameaças", "vulnerabilidades", "risco"],
        words: ["ameaças", "vulnerabilidades", "risco", "impactos"],
        phaseInfo: { scenario: "Riscos", phase: 3, total: 5 },
      },
      {
        id: "fsi-07-riscos-mc-02",
        type: "multiple_choice",
        question: "Um servidor possui uma vulnerabilidade Média. Porém, ele processa todo o faturamento da empresa (Impacto Muito Alto). Como devemos classificar a prioridade desse risco?",
        options: ["Risco Baixo, pois a vulnerabilidade é média.", "Risco Alto, pois o impacto traria prejuízo severo.", "Risco Nulo, pois ameaças ainda não agiram."],
        correct: 1,
        explanation: "Impacto Muito Alto eleva o risco geral, demandando mitigação imediata.",
        phaseInfo: { scenario: "Riscos", phase: 4, total: 5 },
      },
      {
        id: "fsi-07-riscos-text-01",
        type: "text_input",
        question: "Qual nome damos a uma falha, brecha ou fraqueza no código ou processo que permite que um atacante comprometa o sistema?",
        answer: "vulnerabilidade",
        hint: "V____",
        phaseInfo: { scenario: "Riscos", phase: 5, total: 5 },
      }
    ]
  },
  {
    id: 8,
    stringId: "fsi-08-malware",
    title: "Malware",
    shortTitle: "Malware",
    subtitle: "Vírus, Worms e Trojans",
    iconName: "AlertTriangle",
    accentColor: "#D946EF", // Fuchsia
    category: "red_team",
    difficulty: "Intermediário",
    exercises: [
      {
        id: "fsi-08-malware-brief",
        type: "briefing",
        scenarioTitle: "Anatomia dos Softwares Maliciosos",
        category: "red_team",
        difficulty: "Intermediário",
        narrative: "Malware (Malicious Software) engloba diversos códigos projetados para causar danos. Entender seus comportamentos é essencial para defesa.\n\nVírus, Worms e Trojans são frequentemente confundidos, mas atuam de maneiras completamente distintas.",
        evidence: "Comportamentos:\n- Vírus: Precisa de um arquivo hospedeiro e execução manual\n- Worm (Verme): Autônomo, espalha-se via redes e falhas sem ajuda\n- Trojan (Cavalo de Troia): Disfarça-se de programa legítimo e instala backdoors",
        totalPhases: 4,
      },
      {
        id: "fsi-08-malware-assoc-01",
        type: "association",
        instruction: "Associe o comportamento ao tipo correto de malware:",
        pairs: [
          { left: "Infecta arquivos e depende de clique do usuário", right: "Vírus" },
          { left: "Propaga-se sozinho buscando falhas na rede", right: "Worm" },
          { left: "Parece útil mas esconde intenções maliciosas", right: "Trojan" }
        ],
        phaseInfo: { scenario: "Malware", phase: 1, total: 4 },
      },
      {
        id: "fsi-08-malware-mc-01",
        type: "multiple_choice",
        question: "Um funcionário baixou um 'gerador de senhas PDF' da internet. Ele funcionou perfeitamente, mas secretamente abriu uma porta para hackers. O que ele baixou?",
        options: ["Um Worm de rede", "Um Cavalo de Troia (Trojan)", "Um Adware irritante", "Um Ransomware imediato"],
        correct: 1,
        explanation: "Trojans entregam o que prometem (ou fingem entregar) enquanto executam cargas maliciosas em segundo plano.",
        phaseInfo: { scenario: "Malware", phase: 2, total: 4 },
      },
      {
        id: "fsi-08-malware-fill-01",
        type: "fill_blank",
        instruction: "Complete a característica técnica de propagação:",
        sentence: "Diferente de um ___, que precisa infectar outros arquivos e ser executado por um humano, um ___ age de forma autônoma e silenciosa consumindo banda da rede para se multiplicar.",
        blanks: ["vírus", "worm"],
        words: ["vírus", "worm", "spyware"],
        phaseInfo: { scenario: "Malware", phase: 3, total: 4 },
      },
      {
        id: "fsi-08-malware-order-01",
        type: "ordering",
        instruction: "Ao detectar um malware no seu computador corporativo, qual a ordem de resposta?",
        items: [
          "Desconectar o computador da rede",
          "Avisar imediatamente o time de Segurança (TI)",
          "Aguardar orientação e não tentar apagar arquivos sozinhos"
        ],
        correctOrder: [0, 1, 2],
        phaseInfo: { scenario: "Malware", phase: 4, total: 4 },
      }
    ]
  },
  {
    id: 9,
    stringId: "fsi-09-vetores-infeccao",
    title: "Vetores e Botnets",
    shortTitle: "Vetores",
    subtitle: "Ransomware e Ataques DDoS",
    iconName: "Shield",
    accentColor: "#F97316", // Orange
    category: "red_team",
    difficulty: "Avançado",
    exercises: [
      {
        id: "fsi-09-vetores-brief",
        type: "briefing",
        scenarioTitle: "O Ecossistema do Crime Cibernético",
        category: "red_team",
        difficulty: "Avançado",
        narrative: "Hoje os ataques são orquestrados em escala industrial. Botnets usam milhares de roteadores e câmeras infectadas para desferir golpes coordenados.\n\nE o Ransomware evoluiu de simples bloqueadores de tela para cartéis sofisticados de dupla-extorsão.",
        evidence: "Vetores Modernos:\n- Botnet: Rede zumbi usada para sobrecarga (DDoS)\n- Ransomware: Sequestra dados com criptografia forte\n- Spyware: Fica oculto espionando e roubando senhas",
        totalPhases: 4,
      },
      {
        id: "fsi-09-vetores-mc-01",
        type: "multiple_choice",
        question: "Como o Ransomware moderno monetiza seus ataques (Dupla Extorsão)?",
        options: [
          "Apenas criptografando e pedindo resgate.",
          "Criptografando os dados E ameaçando vazar arquivos sensíveis na internet.",
          "Minerando criptomoedas no servidor da vítima."
        ],
        correct: 1,
        explanation: "A Dupla Extorsão criptografa o servidor e ameaça expor dados roubados, garantindo o pagamento mesmo que a vítima tenha backup.",
        phaseInfo: { scenario: "Vetores", phase: 1, total: 4 },
      },
      {
        id: "fsi-09-vetores-text-01",
        type: "text_input",
        question: "Milhares de dispositivos IoT comprometidos atacam um único servidor governamental até ele cair. Como chamamos esse ataque de sobrecarga?",
        answer: "ddos|ataque ddos|negacao de servico",
        hint: "Abreviação de Distributed Denial of Service",
        phaseInfo: { scenario: "Vetores", phase: 2, total: 4 },
      },
      {
        id: "fsi-09-vetores-assoc-01",
        type: "association",
        instruction: "Associe o termo ao cenário:",
        pairs: [
          { left: "Ransomware", right: "Bloqueia acesso a planilhas pedindo Bitcoin" },
          { left: "Botnet", right: "Exército de roteadores infectados" },
          { left: "Spyware", right: "Monitora teclas digitadas (keylogger)" }
        ],
        phaseInfo: { scenario: "Vetores", phase: 3, total: 4 },
      },
      {
        id: "fsi-09-vetores-mc-02",
        type: "multiple_choice",
        question: "Por que manter backups apenas sincronizados na nuvem em tempo real (como uma pasta compartilhada) não é suficiente contra um ataque de Ransomware agressivo?",
        options: [
          "Porque a nuvem é naturalmente frágil contra hackers externos.",
          "Porque o Ransomware criptografa o arquivo no seu PC e a nuvem sincroniza a versão corrompida imediatamente.",
          "Porque backups em nuvem não suportam o tamanho dos vírus modernos."
        ],
        correct: 1,
        explanation: "Backups de sincronização espelham o estrago em tempo real. A defesa correta exige backups isolados da rede (offline) ou com imutabilidade (onde versões antigas não podem ser apagadas).",
        phaseInfo: { scenario: "Vetores", phase: 4, total: 4 },
      }
    ]
  },
  {
    id: 10,
    stringId: "fsi-10-controles-seguranca",
    title: "Controles de Segurança",
    shortTitle: "Controles",
    subtitle: "Categorias e Defesa em Profundidade",
    iconName: "Shield",
    accentColor: "#0EA5E9", // Light Blue
    category: "blue_team",
    difficulty: "Intermediário",
    checkpoint: true,
    exercises: [
      {
        id: "fsi-10-ctrls-brief",
        type: "briefing",
        scenarioTitle: "Defesa em Profundidade",
        category: "blue_team",
        difficulty: "Intermediário",
        narrative: "A estratégia de Defesa em Profundidade usa múltiplas camadas de controles. Se um falhar, outro segura a ameaça.\n\nControles são divididos em categorias lógicas (Físicos, Lógicos, Administrativos) e por função (Preventivos, Detetivos, Corretivos).",
        evidence: "Categorias Básicas:\n- Físico: Trancas, guardas, catracas\n- Lógico/Técnico: Firewalls, MFA, Criptografia\n- Administrativo: Políticas, treinamentos\n\nFunções Básicas:\n- Preventivo: Evita o dano (Firewall)\n- Detetivo: Alerta o dano (Antivírus / Alarme)\n- Corretivo: Conserta o dano (Backup)",
        totalPhases: 5,
      },
      {
        id: "fsi-10-ctrls-assoc-01",
        type: "association",
        instruction: "Associe a Categoria de Controle ao seu exemplo:",
        pairs: [
          { left: "Controle Físico", right: "Catraca com biometria na portaria" },
          { left: "Controle Lógico", right: "Firewall e Autenticação MFA" },
          { left: "Controle Administrativo", right: "Norma de Segurança e Treinamento" }
        ],
        phaseInfo: { scenario: "Controles", phase: 1, total: 5 },
      },
      {
        id: "fsi-10-ctrls-mc-01",
        type: "multiple_choice",
        question: "Qual é um controle puramente Corretivo que salva a empresa após um ataque bem sucedido?",
        options: ["Criptografia AES", "Câmeras de Segurança", "Restauração de Backup", "Política de Senhas"],
        correct: 2,
        explanation: "O backup entra em ação para corrigir o dano e restaurar a operação após o incidente.",
        phaseInfo: { scenario: "Controles", phase: 2, total: 5 },
      },
      {
        id: "fsi-10-ctrls-fill-01",
        type: "fill_blank",
        instruction: "Defesa em profundidade:",
        sentence: "A estratégia de defesa em profundidade assume que não existe ___ infalível. Por isso, usamos múltiplas ___ sobrepostas para dificultar a ação do atacante.",
        blanks: ["controle", "camadas"],
        words: ["controle", "camadas", "ataque", "portas"],
        phaseInfo: { scenario: "Controles", phase: 3, total: 5 },
      },
      {
        id: "fsi-10-ctrls-mc-02",
        type: "multiple_choice",
        question: "Um SIEM (sistema que analisa logs e gera alertas de segurança) atua predominantemente em qual função?",
        options: ["Prevenção", "Detecção", "Correção", "Recuperação"],
        correct: 1,
        explanation: "O SIEM gera alertas (detecção) para que a equipe atue. Ele não bloqueia sozinho por padrão.",
        phaseInfo: { scenario: "Controles", phase: 4, total: 5 },
      },
      {
        id: "fsi-10-ctrls-text-01",
        type: "text_input",
        question: "Um firewall de rede que bloqueia conexões não autorizadas de entrar é um controle Técnico e do tipo P_________.",
        answer: "preventivo",
        hint: "Age antes que algo aconteça",
        phaseInfo: { scenario: "Controles", phase: 5, total: 5 },
      }
    ]
  },
  {
    id: 11,
    stringId: "fsi-11-fator-humano",
    title: "O Fator Humano",
    shortTitle: "Humano",
    subtitle: "O elo mais crítico da Segurança",
    iconName: "UserX",
    accentColor: "#14B8A6", // Teal
    category: "awareness",
    difficulty: "Iniciante",
    exercises: [
      {
        id: "fsi-11-humano-brief",
        type: "briefing",
        scenarioTitle: "O Elo Mais Fraco",
        category: "awareness",
        difficulty: "Iniciante",
        narrative: "Cerca de 85% a 95% das violações de dados envolvem falha humana (Verizon DBIR).\n\nNenhuma criptografia consegue impedir que um usuário autorizado, enganado ou subornado, entregue seus dados de mão beijada.",
        evidence: "Fraquezas Comuns:\n- Uso de senhas óbvias (123456)\n- Reuso da mesma senha corporativa no Netflix\n- Excesso de confiança no remetente\n- Senso de Urgência cego",
        totalPhases: 4,
      },
      {
        id: "fsi-11-humano-mc-01",
        type: "multiple_choice",
        question: "Por que os cibercriminosos modernos preferem explorar falhas humanas em vez de falhas tecnológicas?",
        options: [
          "Porque firewalls corporativos são fáceis de invadir hoje em dia.",
          "Porque hackear um cérebro é mais fácil e barato do que hackear um servidor criptografado.",
          "Porque os atacantes não possuem mais conhecimento técnico."
        ],
        correct: 1,
        explanation: "O 'hacking de pessoas' (engenharia social) é a rota de menor resistência.",
        phaseInfo: { scenario: "Humano", phase: 1, total: 4 },
      },
      {
        id: "fsi-11-humano-assoc-01",
        type: "association",
        instruction: "Associe o comportamento de risco à consequência direta:",
        pairs: [
          { left: "Usar mesma senha corporativa e pessoal", right: "Vazamento em site de jogos compromete a rede da empresa" },
          { left: "Deixar a tela do PC desbloqueada no almoço", right: "Acesso físico indevido por terceiros" },
          { left: "Responder a todos em um e-mail confidencial", right: "Vazamento de dados (Quebra de Confidencialidade)" }
        ],
        phaseInfo: { scenario: "Humano", phase: 2, total: 4 },
      },
      {
        id: "fsi-11-humano-fill-01",
        type: "fill_blank",
        instruction: "Complete a máxima de segurança da informação:",
        sentence: "Você é a principal ___ de defesa da organização. As ferramentas técnicas só ajudam, mas a ___ começa com as suas atitudes.",
        blanks: ["linha", "segurança"],
        words: ["linha", "segurança", "falha", "tecnologia"],
        phaseInfo: { scenario: "Humano", phase: 3, total: 4 },
      },
      {
        id: "fsi-11-humano-mc-02",
        type: "multiple_choice",
        question: "Qual atitude demonstra excelência no fator humano em segurança?",
        options: [
          "Anotar senhas fortes em post-its embaixo do teclado.",
          "Questionar processos estranhos e relatar e-mails suspeitos ao time de SI.",
          "Confiar cegamente em qualquer e-mail que contenha o logotipo da empresa."
        ],
        correct: 1,
        explanation: "O ceticismo saudável e o relato ativo são a base do comportamento seguro.",
        phaseInfo: { scenario: "Humano", phase: 4, total: 4 },
      }
    ]
  },
  {
    id: 12,
    stringId: "fsi-12-engenharia-social",
    title: "Engenharia Social",
    shortTitle: "Eng. Social",
    subtitle: "Manipulação psicológica",
    iconName: "AlertTriangle",
    accentColor: "#FACC15", // Yellow
    category: "awareness",
    difficulty: "Intermediário",
    exercises: [
      {
        id: "fsi-12-social-brief",
        type: "briefing",
        scenarioTitle: "Manipulação e Confiança",
        category: "awareness",
        difficulty: "Intermediário",
        narrative: "Engenharia Social é a arte da manipulação. Atacantes usam gatilhos psicológicos (medo, urgência, ganância, autoridade) para convencer as vítimas a quebrarem protocolos de segurança.",
        evidence: "Gatilhos Mentais Mais Usados:\n- Urgência: 'Conta bloqueada em 15 minutos!'\n- Autoridade: 'Aqui é do suporte técnico de TI'\n- Oportunidade: 'Você ganhou um voucher premium'",
        totalPhases: 4,
      },
      {
        id: "fsi-12-social-assoc-01",
        type: "association",
        instruction: "Associe o discurso do atacante ao gatilho psicológico:",
        pairs: [
          { left: "Aviso do CEO pedindo compra imediata de gift cards", right: "Autoridade" },
          { left: "Desconto de 90% na nova geladeira. Faltam 2 horas!", right: "Urgência e Ganância" },
          { left: "Seu colega indicou você para preencher esta planilha", right: "Confiança/Familiaridade" }
        ],
        phaseInfo: { scenario: "Engenharia Social", phase: 1, total: 4 },
      },
      {
        id: "fsi-12-social-mc-01",
        type: "multiple_choice",
        question: "Um homem fardado com a logo do provedor de internet diz que precisa 'testar o roteador da sua sala', mas não tem agendamento. O que fazer?",
        options: [
          "Liberar a entrada, afinal, a internet estava lenta mesmo.",
          "Pedir credenciais e confirmar com a portaria/administração antes de liberar.",
          "Oferecer um café e deixá-lo trabalhar."
        ],
        correct: 1,
        explanation: "Engenharia social ocorre tanto online quanto fisicamente. Confirmar via canal oficial é a regra de ouro.",
        phaseInfo: { scenario: "Engenharia Social", phase: 2, total: 4 },
      },
      {
        id: "fsi-12-social-order-01",
        type: "ordering",
        instruction: "Como validar uma ligação supostamente urgente do seu 'banco'?",
        items: [
          "Desconfiar do senso de urgência na ligação",
          "Desligar educadamente a chamada",
          "Procurar o número oficial no verso do seu cartão",
          "Ligar e questionar sobre o suposto problema"
        ],
        correctOrder: [0, 1, 2, 3],
        phaseInfo: { scenario: "Engenharia Social", phase: 3, total: 4 },
      },
      {
        id: "fsi-12-social-fill-01",
        type: "fill_blank",
        instruction: "Gatilhos da Engenharia Social:",
        sentence: "Golpistas adoram criar situações de extrema ___ para impedir que a vítima tenha tempo para ___ sobre a lógica do pedido.",
        blanks: ["urgência", "pensar"],
        words: ["urgência", "pensar", "calma", "dormir"],
        phaseInfo: { scenario: "Engenharia Social", phase: 4, total: 4 },
      }
    ]
  },
  {
    id: 13,
    stringId: "fsi-13-phishing",
    title: "Phishing e Vetores Avançados",
    shortTitle: "Phishing",
    subtitle: "Spear Phishing, Smishing e Vishing",
    iconName: "Mail",
    accentColor: "#EAB308", // Yellow Dark
    category: "awareness",
    difficulty: "Avançado",
    exercises: [
      {
        id: "fsi-13-phishing-brief",
        type: "briefing",
        scenarioTitle: "Anatomia do Phishing",
        category: "awareness",
        difficulty: "Avançado",
        narrative: "Phishing é o roubo de informações através de e-mails falsos. Mas a técnica evoluiu.\nSpear Phishing direciona o ataque a VOCÊ, usando seu cargo e contatos reais. Smishing ataca pelo celular (SMS/WhatsApp). Vishing ataca pela voz.",
        evidence: "Regras de Ouro no E-mail:\n- Verifique o domínio remetente com lupa (@empressa.com)\n- Passe o mouse sobre os links antes de clicar\n- NUNCA abra anexos desconhecidos (.exe, .zip)\n- Bancos/TI nunca pedem sua senha por e-mail",
        totalPhases: 4,
      },
      {
        id: "fsi-13-phishing-assoc-01",
        type: "association",
        instruction: "Associe o vetor de ataque moderno ao seu canal:",
        pairs: [
          { left: "Ataque direcionado por e-mail com dados reais", right: "Spear Phishing" },
          { left: "Golpe pedindo Pix pelo WhatsApp", right: "Smishing" },
          { left: "Ligação de um 'gerente' clonando a voz", right: "Vishing" }
        ],
        phaseInfo: { scenario: "Phishing Avançado", phase: 1, total: 4 },
      },
      {
        id: "fsi-13-phishing-mc-01",
        type: "multiple_choice",
        question: "Por que o Spear Phishing é estatisticamente 3x mais perigoso que o Phishing normal?",
        options: [
          "Porque ele burla o antivírus magicamente.",
          "Porque ele usa informações reais e contextuais da vítima para criar alta confiança e familiaridade.",
          "Porque ele é enviado do celular do chefe."
        ],
        correct: 1,
        explanation: "Os atacantes estudam você no LinkedIn e redes sociais para criar um contexto muito realista.",
        phaseInfo: { scenario: "Phishing Avançado", phase: 2, total: 4 },
      },
      {
        id: "fsi-13-phishing-sim-01",
        type: "phishing_email",
        subject: "URGENTE: Atualização do Portal RH",
        fromDisplay: "Recursos Humanos",
        fromEmail: "noreply@empresa-rh-portal.com",
        greeting: "Prezado colaborador,",
        urgencyText: "Seu acesso ao holerite será desativado em 2 horas. Atualize suas credenciais agora.",
        linkText: "Acessar Portal Seguro",
        linkRealUrl: "http://bit.ly/update-rh-029",
        fraudIndicators: ["sender", "link", "attachment"],
        phishingElements: [
          {
            id: "sender",
            label: "noreply@empresa-rh-portal.com",
            category: "suspicious",
            feedback: "O domínio é uma falsificação que tenta parecer oficial. Domínios corporativos não costumam ter traços longos inventados."
          },
          {
            id: "urgency_text",
            label: "desativado em 2 horas",
            category: "suspicious",
            feedback: "Ameaças de bloqueio fulminante são o gatilho clássico para impedir o raciocínio."
          },
          {
            id: "link",
            label: "http://bit.ly/update-rh-029",
            category: "suspicious",
            feedback: "Links encurtados (bit.ly) escondem o destino real e são muito usados em golpes."
          }
        ],
        correctElementIds: ["sender", "urgency_text", "link"],
        explanation: "Domínio suspeito, urgência fabricada e link oculto são claros sinais de Phishing.",
        phaseInfo: { scenario: "Phishing Avançado", phase: 3, total: 4 },
      },
      {
        id: "fsi-13-phishing-text-01",
        type: "text_input",
        question: "Qual protocolo básico ao desconfiar de um e-mail interno? NÃO clique, NÃO abra anexos e ________ o e-mail ao time de TI/Segurança.",
        answer: "reporte|encaminhe|denuncie",
        hint: "Alerte o time.",
        phaseInfo: { scenario: "Phishing Avançado", phase: 4, total: 4 },
      }
    ]
  },
  {
    id: 14,
    stringId: "fsi-14-cultura-seguranca",
    title: "Cultura e Boas Práticas",
    shortTitle: "Práticas",
    subtitle: "Hábitos do Usuário Seguro",
    iconName: "Shield",
    accentColor: "#8B5CF6", // Violet/Purple
    category: "awareness",
    difficulty: "Iniciante",
    exercises: [
      {
        id: "fsi-14-cultura-brief",
        type: "briefing",
        scenarioTitle: "O Dia a Dia Seguro",
        category: "awareness",
        difficulty: "Iniciante",
        narrative: "Segurança da Informação é um hábito diário. Boas práticas protegem a empresa, sua carreira e sua vida pessoal.",
        evidence: "Os 5 Mandamentos Práticos:\n1. Bloqueie a tela do PC ao sair (Win + L)\n2. Nunca compartilhe senhas nem contas\n3. Evite Wi-Fi público sem uso de VPN\n4. Mantenha os sistemas e apps sempre atualizados\n5. Em caso de dúvida, pergunte à TI",
        totalPhases: 5,
      },
      {
        id: "fsi-14-cultura-mc-01",
        type: "multiple_choice",
        question: "Você está trabalhando remotamente em um café e precisa acessar o sistema da empresa. Qual a melhor prática?",
        options: [
          "Conectar no Wi-Fi aberto do café e acessar rapidamente.",
          "Usar a rede do café, mas com uma aba anônima do navegador.",
          "Usar a internet do seu celular (4G) ou ligar a VPN corporativa."
        ],
        correct: 2,
        explanation: "Redes públicas podem ser facilmente interceptadas. VPN criptografa o túnel, e o 4G isola seu tráfego.",
        phaseInfo: { scenario: "Boas Práticas", phase: 1, total: 5 },
      },
      {
        id: "fsi-14-cultura-order-01",
        type: "ordering",
        instruction: "Qual a sequência de ação correta ao precisar se afastar do seu PC na mesa do escritório?",
        items: [
          "Garantir que a senha está exigida no retorno",
          "Pressionar 'Win + L' ou bloquear o Mac",
          "Levantar da cadeira e realizar sua pausa"
        ],
        correctOrder: [0, 1, 2],
        phaseInfo: { scenario: "Boas Práticas", phase: 2, total: 5 },
      },
      {
        id: "fsi-14-cultura-assoc-01",
        type: "association",
        instruction: "Associe a prática ao benefício:",
        pairs: [
          { left: "Uso de Gerenciador de Senhas", right: "Permite ter senhas únicas e complexas sem esquecer" },
          { left: "Atualização de Software (Patching)", right: "Corrige vulnerabilidades recém descobertas" },
          { left: "Clean Desk (Mesa Limpa)", right: "Impede o furto visual de informações" }
        ],
        phaseInfo: { scenario: "Boas Práticas", phase: 3, total: 5 },
      },
      {
        id: "fsi-14-cultura-fill-01",
        type: "fill_blank",
        instruction: "Cultura de reporte:",
        sentence: "Ocultar um incidente por medo de demissão é perigoso. A cultura forte de segurança incentiva o ___ imediato, para que o dano seja ___ o mais rápido possível.",
        blanks: ["reporte", "contido"],
        words: ["reporte", "contido", "esquecido", "ampliado"],
        phaseInfo: { scenario: "Boas Práticas", phase: 4, total: 5 },
      },
      {
        id: "fsi-14-cultura-mc-02",
        type: "multiple_choice",
        question: "Sua colega esqueceu a senha corporativa dela e pede a sua emprestada 'rapidinho' para aprovar um chamado urgente. O que fazer?",
        options: [
          "Emprestar, pois é uma emergência corporativa.",
          "Digitar a senha para ela, sem falar alto.",
          "Negar educadamente e orientá-la a redefinir a própria senha no HelpDesk."
        ],
        correct: 2,
        explanation: "Senhas são intransferíveis. O empréstimo quebra a trilha de auditoria e a responsabilização (Accountability).",
        phaseInfo: { scenario: "Boas Práticas", phase: 5, total: 5 },
      }
    ]
  },
  {
    id: 15,
    stringId: "fsi-15-simulado-final",
    title: "Simulado Shield-ACK",
    shortTitle: "Simulado",
    subtitle: "O Exame Final de Segurança",
    iconName: "CheckCircle",
    accentColor: "#10B981", // Emerald
    category: "awareness",
    difficulty: "Avançado",
    checkpoint: true,
    exercises: [
      {
        id: "fsi-15-simulado-brief",
        type: "briefing",
        scenarioTitle: "O Exame Final",
        category: "awareness",
        difficulty: "Avançado",
        narrative: "Parabéns, você chegou ao último estágio do treinamento Fundamentos de Segurança da Informação.\n\nAgora seu conhecimento prático será testado em desafios aleatórios de tudo que você aprendeu. Prove que você possui uma mente ciberneticamente atenta!",
        evidence: "Regras do Jogo:\n- 10 perguntas sorteadas de módulos anteriores.\n- Vida extra: 3 chances.\n- Foco na análise situacional.\nBoa sorte, Defensor!",
        totalPhases: 1,
      }
    ]
  }
];

export const LESSONS: Exercise[] = MODULE_DEFINITIONS.flatMap(m => m.exercises);
