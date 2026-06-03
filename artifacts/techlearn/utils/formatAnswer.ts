export function formatAnswerForDisplay(answer: any): string {
  if (answer === null || answer === undefined) {
    return "Não respondido";
  }

  if (typeof answer === "string" || typeof answer === "number" || typeof answer === "boolean") {
    return String(answer);
  }

  if (Array.isArray(answer)) {
    // Para arrays de Association (onde cada item é algo como { term: string, match: string })
    if (answer.length > 0 && typeof answer[0] === "object" && "term" in answer[0]) {
      return answer.map((pair: any) => `${pair.term} → ${pair.match}`).join("\n");
    }
    // Arrays simples (FillBlank, Ordering)
    return answer.join(", ");
  }

  // Fallback genérico para objetos
  try {
    return JSON.stringify(answer, null, 2);
  } catch (e) {
    return "Formato não suportado";
  }
}
