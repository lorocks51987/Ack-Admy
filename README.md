# ACK-ADMY — Educação Gamificada em Segurança de Aplicações (AppSec)

O **ACK-ADMY** é uma plataforma móvel e web gamificada e de alto impacto visual dedicada ao ensino prático de **Segurança de Aplicações (AppSec)**. Inspirada nos melhores fluxos de aprendizado modernos (como Duolingo) e adaptada para a identidade técnica e visual de cibersegurança (Shield/Defensor), a aplicação foi projetada sob o princípio de **fricção cognitiva zero**: o aluno foca estritamente na resposta, sem ter de decifrar como utilizar a interface.

---

## 🚀 Princípios de Design e UX

- **Padrão Único de Exercício**: Todas as atividades contam com a mesma hierarquia visual comum. Cabeçalho com barra de progresso horizontal linear animada e vidas discretas; corpo central com a pergunta direta; e um botão de ação único e fixo no rodapé (respeitando a Safe Area e o teclado virtual).
- **Sem Linguagem Interna Complexa**: O vocabulário visual do aplicativo foi limpo de jargões estruturais e administrativos (como "Módulo X", "Briefing", "Aula", "Associação"). A comunicação com o aluno é feita por meio de comandos de ação diretos e focados (ex: *"Escolha a opção mais segura"*, *"Complete a frase"*, *"Toque nos sinais suspeitos"*).
- **Home em Sequência Linear**: Uma trilha clara e simplificada que responde instantaneamente às três perguntas fundamentais do aluno: *Onde estou?*, *Qual é a próxima atividade?* e *O que eu clico agora?*. Um card primário destacado guia o estudante de forma proeminente com o botão *"Começar do Início"* (novos alunos), *"Continuar Aprendizado"* (progresso ativo), ou exibe **"Em breve novas trilhas"** na cor dourada desabilitando a navegação quando todos os módulos são concluídos (dando o gostinho de quero mais).
- **Estatísticas como Indicadores**: Métricas de XP, ofensiva (streak) e precisão são exibidas de forma minimalista como status estáticos, eliminando botões adicionais e poluição visual que competem com a trilha de aprendizado.

---

## 🎮 Tipos de Exercícios Disponíveis

1. **Múltipla Escolha**: Questões com alternativas verticais completas de largura total, projetadas para toque confortável em telas de smartphones. O botão de verificação só é ativado após a seleção.
2. **Associação de Conceitos**: Substitui a tradicional coluna dupla apertada por um fluxo vertical intuitivo passo a passo. O aluno escolhe um conceito, depois a definição e, ao acertar, a conexão é movida para a gaveta inferior rolável de *"Conexões feitas"*.
3. **Phishing e Simulação de E-mail**: Um emulador de cliente de e-mail rolável integrado com áreas tácteis confortáveis (remetentes, anexos e links). O aluno analisa o e-mail e toca nos elementos suspeitos para sinalizá-los com uma bandeira vermelha antes de confirmar.
4. **Ordenação Vertical**: Itens listados verticalmente que o aluno ordena de forma intuitiva, sem que os números de ordenação esmaguem o texto do card em celulares de menor porte.
5. **Completar Lacunas (Fill the Blanks)**: Frases com lacunas dinâmicas alimentadas por um banco de palavras (chips) que quebram linha perfeitamente via flex wrap.
6. **Entrada de Texto**: Inputs com `KeyboardAvoidingView` integrado e tolerância robusta a maiúsculas, minúsculas, espaços adicionais e normalização completa de diacríticos e acentuações (ex: aceita *"autorizacao"* ou *"autorização"* de forma idêntica).

---

## 🛡️ Estabilidade, Robustez e Proteção Contra Falhas

- **Lesson ErrorBoundary & Fallback**: A página principal de lições é envelopada por um `ErrorBoundary` isolado. Qualquer falha de renderização de um exercício ou inconsistência de dados do progresso ativa um fallback amigável informando *"Não foi possível carregar esta atividade."*, com um botão direto para retornar à Home de forma segura.
- **Optional Chaining em Estados**: Prevenção ativa de crashs de propriedades nulas ou indefinidas (`progress`, `moduleDef`, `currentExercise`) com checagens em tempo real e early returns.
- **Áudio Nativo Blindado**: Todos os efeitos de áudio nativos e sintetizados (acertos, erros, fanfarras de badges e XP) contam com tratamento robusto de exceções (`try/catch`). Falhas físicas de driver de som ou conexão de rede são silenciadas para não bloquear o fluxo da atividade.
- **Resiliência Supabase & AsyncStorage**: O progresso de XP, conquistas e os feedbacks dos alunos são persistidos de forma segura e paralela localmente e na nuvem. Em caso de quedas ou oscilações de rede, a aplicação prossegue normalmente salvando os dados no dispositivo.

---

## ⚙️ Estrutura do Projeto

O projeto está organizado na subpasta `artifacts/techlearn` com a seguinte estrutura de desenvolvimento:

```text
techlearn/
├── app/                  # Rotas do Expo Router (tabs, complete.tsx, lesson.tsx)
├── assets/               # Imagens, fontes e sons
├── components/           # Componentes compartilhados (Header, ProgressBar, ErrorBoundary)
├── constants/            # Banco de dados de lições, módulos e gabaritos
├── contexts/             # Contexto de Progresso (XP, conquistas) e Autenticação
├── hooks/                # Custom hooks (cores e acessibilidade)
├── screens/              # Telas específicas de cada exercício de lição
├── services/             # Serviços do Supabase, AsyncStorage e Audio nativo
└── tsconfig.json         # Configurações estáticas do TypeScript
```

---

## 💻 Como Executar Localmente

Certifique-se de que o Node.js e o gerenciador de pacotes `pnpm` estejam instalados.

1. Navegue para o diretório da aplicação:
   ```bash
   cd artifacts/techlearn
   ```
2. Instale as dependências:
   ```bash
   pnpm install
   ```
3. Inicie o servidor do Expo Go com limpeza de cache:
   ```bash
   pnpm exec expo start --clear
   ```

---

## 📦 Como Gerar o Build (APK Final)

Para empacotar a versão nativa e de visualização estável (.apk) para distribuição direta aos alunos, execute os seguintes comandos com o EAS CLI configurado:

```powershell
cd artifacts/techlearn

# Compilação e empacotamento do APK final para Android
eas build --platform android --profile preview
```

*Nota: O perfil `preview` está devidamente parametrizado com `"buildType": "apk"` em `eas.json`, de modo que o link de download direto do arquivo APK independente seja disponibilizado no painel do Expo.*
