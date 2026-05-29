import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { FillBlankExercise } from "@/constants/lessons";

interface Props {
  exercise: FillBlankExercise;
  onAnswer: (correct: boolean) => void;
  feedbackVisible?: boolean;
  powerUpUsed?: boolean;
}

export function FillBlankScreen({ exercise, onAnswer, feedbackVisible = false, powerUpUsed = false }: Props) {
  const colors = useColors();
  const [filled, setFilled] = useState<(string | null)[]>(exercise.blanks.map(() => null));
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [selectedBlankIdx, setSelectedBlankIdx] = useState<number>(0);
  const [checked, setChecked] = useState(false);
  // Rastreia qual lacuna foi preenchida pelo power-up (para proteger de remoção pelo aluno)
  const [powerUpFilledIdx, setPowerUpFilledIdx] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  const locked = checked || feedbackVisible;

  const getNextEmptyIndex = (currentFilled: (string | null)[], currentTarget: number) => {
    for (let i = currentTarget + 1; i < currentFilled.length; i++) {
      if (currentFilled[i] === null) return i;
    }
    for (let i = 0; i < currentTarget; i++) {
      if (currentFilled[i] === null) return i;
    }
    return -1;
  };

  React.useEffect(() => {
    if (!powerUpUsed) return;

    // Encontra a PRIMEIRA lacuna ainda vazia (null) — não sobrescreve o que o aluno digitou
    const firstEmptyIdx = filled.findIndex((f) => f === null);
    if (firstEmptyIdx === -1) {
      // Nenhuma lacuna vazia disponível — não faz nada (XP não foi debitado)
      return;
    }

    const word = exercise.blanks[firstEmptyIdx];
    setFilled((prev) => {
      const next = [...prev];
      next[firstEmptyIdx] = word;
      return next;
    });
    setUsedWords((u) => Array.from(new Set([...u, word])));
    // Registra qual índice foi preenchido pelo power-up (protegido de remoção)
    setPowerUpFilledIdx(firstEmptyIdx);
    // Move seleção para próxima lacuna vazia após a preenchida
    setSelectedBlankIdx((prev) => (prev === firstEmptyIdx ? firstEmptyIdx + 1 : prev));
  }, [powerUpUsed]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWordPress = (word: string) => {
    if (locked) return;

    if (usedWords.includes(word)) {
      const idx = filled.indexOf(word);
      if (idx !== -1) {
        Haptics.selectionAsync();
        const nf = [...filled];
        nf[idx] = null;
        setFilled(nf);
        setUsedWords((u) => u.filter((w) => w !== word));
        setSelectedBlankIdx(idx);
      }
      return;
    }

    let targetIdx = selectedBlankIdx;
    if (targetIdx === -1 || targetIdx >= filled.length || filled[targetIdx] !== null) {
      targetIdx = filled.findIndex((f) => f === null);
    }

    if (targetIdx === -1) {
      if (selectedBlankIdx !== -1 && selectedBlankIdx < filled.length) {
        targetIdx = selectedBlankIdx;
      } else {
        return;
      }
    }

    Haptics.selectionAsync();

    const nf = [...filled];
    const oldWord = nf[targetIdx];
    let newUsedWords = [...usedWords];

    if (oldWord) {
      newUsedWords = newUsedWords.filter((w) => w !== oldWord);
    }

    nf[targetIdx] = word;
    newUsedWords.push(word);

    setFilled(nf);
    setUsedWords(newUsedWords);

    const nextEmpty = getNextEmptyIndex(nf, targetIdx);
    setSelectedBlankIdx(nextEmpty);
  };

  const handleBlankPress = (idx: number) => {
    // Bloqueia remoção da lacuna preenchida pelo power-up
    if (locked || (powerUpFilledIdx !== null && idx === powerUpFilledIdx)) return;

    Haptics.selectionAsync();
    const word = filled[idx];

    if (word) {
      const nf = [...filled];
      nf[idx] = null;
      setFilled(nf);
      setUsedWords((u) => u.filter((w) => w !== word));
    }

    setSelectedBlankIdx(idx);
  };

  const handleCheck = () => {
    if (filled.includes(null) || locked) return;
    setChecked(true);
    const correct = filled.every((f, i) => f === exercise.blanks[i]);
    Haptics.impactAsync(correct ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy);
    onAnswer(correct);
  };

  const canCheck = !filled.includes(null) && !locked;

  const renderSentence = () => {
    const parts = exercise.sentence.split("___");
    const nodes: React.ReactNode[] = [];
    parts.forEach((part, i) => {
      if (part) {
        nodes.push(
          <Text key={`t-${i}`} style={[styles.sentenceText, { color: colors.foreground }]}>
            {part}
          </Text>
        );
      }
      if (i < exercise.blanks.length) {
        const val = filled[i];
        const isSelected = selectedBlankIdx === i && !checked && !feedbackVisible;

        let blankBg = val ? colors.primary + "0A" : colors.input;
        let blankBorder = val ? colors.primary : colors.border;
        let blankTextColor = val ? colors.foreground : colors.mutedForeground;
        let borderWidth = 1.5;
        let borderStyle: "solid" | "dashed" = "solid";

        if (isSelected) {
          blankBg = colors.primary + "14";
          blankBorder = colors.primary;
          borderWidth = 2.5;
        } else if (!val) {
          borderStyle = "dashed";
        }

        if (checked) {
          const ok = val === exercise.blanks[i];
          blankBg = ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
          blankBorder = ok ? colors.success : colors.error;
          blankTextColor = ok ? colors.success : colors.error;
          borderWidth = 2;
          borderStyle = "solid";
        } else if (powerUpUsed && i === 0) {
          blankBg = colors.success + "12";
          blankBorder = colors.success;
          blankTextColor = colors.success;
          borderWidth = 2;
          borderStyle = "solid";
        }

        nodes.push(
          <TouchableOpacity
            key={`b-${i}`}
            style={[
              styles.blank,
              {
                borderColor: blankBorder,
                backgroundColor: blankBg,
                borderWidth: borderWidth,
                borderStyle: borderStyle,
                minWidth: Math.max(80, (val?.length ?? 5) * 11),
              },
            ]}
            onPress={() => handleBlankPress(i)}
            activeOpacity={locked || (powerUpUsed && i === 0) ? 1 : 0.7}
            disabled={locked || (powerUpUsed && i === 0)}
          >
            <Text style={[
              styles.blankText,
              {
                color: isSelected && !val ? colors.primary : blankTextColor,
                fontFamily: val ? "Inter_700Bold" : "Inter_500Medium"
              }
            ]}>
              {val ?? "____"}
            </Text>
          </TouchableOpacity>
        );
      }
    });
    return nodes;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.instructionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.instruction, { color: colors.foreground }]}>{exercise.instruction}</Text>
        </View>

        <View style={[styles.sentenceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sentenceWrap}>{renderSentence()}</View>
        </View>

        <Text style={[styles.wordsLabel, { color: colors.mutedForeground }]}>PALAVRAS DISPONÍVEIS</Text>

        <View style={styles.wordsPool}>
          {exercise.words.map((word) => {
            const used = usedWords.includes(word);
            const isPowerUpReserved = powerUpUsed && word === exercise.blanks[0];

            return (
              <TouchableOpacity
                key={word}
                style={[
                  styles.wordChip,
                  {
                    backgroundColor: used ? colors.background : colors.card,
                    borderColor: used ? colors.border : colors.primary,
                    borderStyle: used ? "dashed" : "solid",
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => handleWordPress(word)}
                activeOpacity={locked || isPowerUpReserved ? 1 : 0.7}
                disabled={locked || isPowerUpReserved}
              >
                <Text style={[styles.wordText, { color: used ? "transparent" : colors.primary }]}>
                  {word}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {!checked && (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Dica: Toque em uma lacuna para selecioná-la ou toque nas palavras para preencher.
          </Text>
        )}
      </ScrollView>

      {!feedbackVisible && (
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: canCheck ? colors.primary : colors.muted, opacity: canCheck ? 1 : 0.6 }]}
            onPress={handleCheck}
            activeOpacity={0.85}
            disabled={!canCheck}
          >
            <Text style={[styles.btnText, { color: canCheck ? "#FFFFFF" : colors.mutedForeground }]} adjustsFontSizeToFit={true} numberOfLines={1}>Confirmar resposta</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, gap: 16, paddingBottom: 32 },
  instructionCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  instruction: { fontSize: 17, fontFamily: "Inter_600SemiBold", lineHeight: 26 },
  sentenceBox: { borderRadius: 16, borderWidth: 1, padding: 24 },
  sentenceWrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, rowGap: 16 },
  sentenceText: { fontSize: 15, fontFamily: "Inter_500Medium", lineHeight: 28 },
  blank: {
    borderRadius: 8, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 6,
    alignItems: "center", justifyContent: "center",
    marginHorizontal: 2,
  },
  blankText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  wordsLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.2, marginTop: 8 },
  wordsPool: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  wordChip: { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 14 },
  wordText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  hint: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center", fontStyle: "italic", marginTop: 8 },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
});
