export type ExerciseType = "multiple_choice" | "association" | "text_input" | "ordering" | "fill_blank";

export interface MultipleChoiceExercise {
  type: "multiple_choice";
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface AssociationExercise {
  type: "association";
  instruction: string;
  pairs: { left: string; right: string }[];
}

export interface TextInputExercise {
  type: "text_input";
  question: string;
  answer: string;
  hint: string;
}

export interface OrderingExercise {
  type: "ordering";
  instruction: string;
  items: string[];
  correctOrder: number[];
}

export interface FillBlankExercise {
  type: "fill_blank";
  instruction: string;
  sentence: string;
  blanks: string[];
  words: string[];
}

export type Exercise =
  | MultipleChoiceExercise
  | AssociationExercise
  | TextInputExercise
  | OrderingExercise
  | FillBlankExercise;

export const LESSONS: Exercise[] = [
  {
    type: "multiple_choice",
    question: "O que significa 'HTML' em desenvolvimento web?",
    options: [
      "HyperText Markup Language",
      "High-Tech Modern Language",
      "HyperText Machine Logic",
      "Home Tool Markup Language",
    ],
    correct: 0,
    explanation:
      "HTML (HyperText Markup Language) é a linguagem padrão para criar páginas web.",
  },
  {
    type: "association",
    instruction: "Associe cada linguagem com sua principal finalidade:",
    pairs: [
      { left: "Python", right: "Ciência de dados" },
      { left: "JavaScript", right: "Web front-end" },
      { left: "SQL", right: "Banco de dados" },
      { left: "Swift", right: "Apps iOS" },
    ],
  },
  {
    type: "text_input",
    question:
      'Qual comando Git é usado para criar uma cópia de um repositório remoto na sua máquina?',
    answer: "git clone",
    hint: "git c___e",
  },
  {
    type: "ordering",
    instruction:
      "Organize as etapas do ciclo de desenvolvimento de software na ordem correta:",
    items: [
      "Implementação",
      "Requisitos",
      "Testes",
      "Design",
      "Manutenção",
    ],
    correctOrder: [1, 3, 0, 2, 4],
  },
  {
    type: "fill_blank",
    instruction: "Complete a frase com as palavras corretas:",
    sentence: "Em programação, uma ___ é um bloco de código reutilizável que realiza uma tarefa específica, e uma ___ é um tipo de dados que armazena uma coleção ordenada de elementos.",
    blanks: ["função", "lista"],
    words: ["função", "variável", "lista", "loop", "classe", "objeto"],
  },
];
