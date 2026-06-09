const fs = require('fs');
const path = require('path');

const lessonsPath = path.join(__dirname, '../artifacts/techlearn/constants/lessons.ts');
let content = fs.readFileSync(lessonsPath, 'utf8');

const newQuestions = `
  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 7 — Tríade CID Aprofundamento (indices 26–29)
  // ══════════════════════════════════════════════════════════════════
  {
    type: "briefing",
    scenarioTitle: "Tríade CID",
    category: "awareness",
    difficulty: "Iniciante",
    narrative: "A Tríade CID não é apenas teórica. Quando um hospital sofre um apagão cibernético e perde acesso a exames, a Disponibilidade é ferida. Quando um aluno altera suas notas no sistema, a Integridade falha. Quando um extrato bancário vaza na internet, a Confidencialidade é violada.",
    evidence: "A proteção exige balancear os 3 pilares.\\nExcesso de confidencialidade pode prejudicar a disponibilidade.\\nFalha de integridade pode causar danos físicos (ex: tipo sanguíneo errado no hospital).",
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
    evidence: "Exemplos de Ativos:\\n- Código-fonte da aplicação\\n- Cadernos de anotações com senhas\\n- Lista de clientes VIP\\n\\nNão são ativos de informação: cadeiras, mesas (são ativos físicos sem dados).",
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
    narrative: "Nem toda informação tem o mesmo valor. Classificar dados ajuda a focar os recursos (dinheiro e esforço) onde realmente importa.\\n\\nNíveis comuns:\\nPúblico, Interno, Confidencial, Estritamente Confidencial/Restrito.",
    evidence: "Público: Sem dano se vazar (ex: cardápio).\\nInterno: Uso da empresa (ex: ramais).\\nConfidencial: Dano médio/alto se vazar (ex: balanço financeiro antes da publicação).\\nRestrito: Dano gravíssimo (ex: senhas master, dados médicos).",
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
    narrative: "Autenticação simples (só senha) não é mais suficiente. MFA (Múltiplos Fatores) exige prova em pelo menos duas categorias diferentes.\\n\\nFatores:\\n1. Conhecimento (Saber)\\n2. Posse (Ter)\\n3. Inerência (Ser)",
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
    narrative: "Malware (Software Malicioso) tem vários formatos. Entender seu modo de operação ajuda a focar na defesa correta.\\n\\nRansomware sequestra. Trojan engana. Spyware espiona. Worm se replica sozinho.",
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
    narrative: "A Defesa em Profundidade aplica múltiplas camadas de controles para mitigar riscos. Eles podem ser Físicos, Lógicos ou Administrativos.\\n\\nAlém disso, dividem-se em preventivos, detectivos e corretivos.",
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
    narrative: "Controles Administrativos (ou Organizacionais) são as políticas, normas, treinamentos e contratos de uma empresa.\\n\\nSem eles, a tecnologia não tem um direcionamento de 'o que' proteger. A Política de Segurança da Informação (PSI) é o controle administrativo primário.",
    evidence: "Tecnologia: Configurar o Active Directory.\\nProcesso/Administrativo: A regra da PSI que define que estagiários não podem ter acesso Admin.\\nPessoas: O treinamento que ensina o analista a seguir essa regra.",
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
    narrative: "Por trás de todo sistema, processo ou ataque, existem seres humanos. O cérebro humano é otimizado para ajudar os outros, evitar conflitos e obedecer autoridades.\\n\\nAtaques de Engenharia Social usam manipulação psicológica para burlar barreiras tecnológicas explorando atalhos mentais.",
    evidence: "Princípios da Persuasão (Cialdini) usados por atacantes:\\n- Autoridade: 'Aqui é o Diretor Financeiro, faça agora.'\\n- Urgência: 'Sua conta vai ser apagada em 10 min.'\\n- Confiança/Familiaridade: Usar uma foto conhecida.",
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
    evidence: "Boas práticas pessoais:\\n- Clean Desk (Mesa limpa) e Clean Screen (Bloquear o PC ao levantar Win+L).\\n- Nunca reciclar senhas entre vida pessoal e profissional.\\n- Reportar pendrives achados no chão e nunca plugá-los.",
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
    evidence: "Respire fundo.\\nLembre-se da Tríade CID, das regras do MFA, dos perigos da Engenharia Social e de que você faz parte do controle de segurança mais forte que existe: a mente humana consciente.",
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
`;

// remove last `];`
const updatedContent = content.replace(/];\s*$/, newQuestions + "\n];\n");
fs.writeFileSync(lessonsPath, updatedContent);
console.log("Successfully appended new questions to lessons.ts!");
