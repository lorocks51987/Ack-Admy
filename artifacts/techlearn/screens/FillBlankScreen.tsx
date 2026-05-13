import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { FillBlankExercise } from "@/constants/lessons";

interface Props {
  exercise: FillBlankExercise;
  onAnswer: (correct: boolean) => void;
}

export function FillBlankScreen({ exercise, onAnswer }: Props) {
  const colors = useColors();
  const [filled, setFilled] = useState<(string | null)[]>(exercise.blanks.map(() => null));
  const [usedWords, setUsedWords] = useState<string[]>([]);

  const nextBlankIdx = filled.findIndex((f) => f === null);

  const handleWordPress = (word: string) => {
    if (usedWords.includes(word)) {
      const idx = filled.findIndex((f) => f === word);
      if (idx === -1) return;
      Haptics.selectionAsync();
      const nf = [...filled];
      nf[idx] = null;
      setFilled(nf);
      setUsedWords((u) => u.filter((w) => w !== word));
      return;
    }
    if (nextBlankIdx === -1) return;
    Haptics.selectionAsync();
    const nf = [...filled];
    nf[nextBlankIdx] = word;
    setFilled(nf);
    setUsedWords((u) => [...u, word]);
  };

  const handleBlankPress = (idx: number) => {
    if (!filled[idx]) return;
    Haptics.selectionAsync();
    const word = filled[idx]!;
    const nf = [...filled];
    nf[idx] = null;
    setFilled(nf);
    setUsedWords((u) => u.filter((w) => w !== word));
  };

  const handleCheck = () => {
    if (filled.includes(null)) return;
    onAnswer(filled.every((f, i) => f === exercise.blanks[i]));
  };

  const canCheck = !filled.includes(null);

  // Split sentence by ___ and render inline
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
        nodes.push(
          <TouchableOpacity
            key={`b-${i}`}
            style={[
              styles.blank,
              {
                borderColor: val ? colors.primary : colors.border,
                backgroundColor: val ? "rgba(99,102,241,0.12)" : colors.input,
                minWidth: Math.max(70, (val?.length ?? 4) * 9),
              },
            ]}
            onPress={() => handleBlankPress(i)}
            activeOpacity={0.8}
          >
            <Text style={[styles.blankText, { color: val ? colors.primary : colors.mutedForeground }]}>
              {val ?? "___"}
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.tag, { color: colors.primary }]}>COMPLETAR</Text>
        <Text style={[styles.instruction, { color: colors.foreground }]}>{exercise.instruction}</Text>

        <View style={[styles.sentenceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sentenceWrap}>{renderSentence()}</View>
        </View>

        <Text style={[styles.wordsLabel, { color: colors.mutedForeground }]}>PALAVRAS DISPONÍVEIS</Text>

        <View style={styles.wordsPool}>
          {exercise.words.map((word) => {
            const used = usedWords.includes(word);
            return (
              <TouchableOpacity
                key={word}
                style={[
                  styles.wordChip,
                  {
                    backgroundColor: used ? colors.muted : colors.card,
                    borderColor: used ? colors.border : colors.primary,
                    opacity: used ? 0.45 : 1,
                  },
                ]}
                onPress={() => handleWordPress(word)}
                activeOpacity={0.75}
              >
                <Text style={[styles.wordText, { color: used ? colors.mutedForeground : colors.primary }]}>
                  {word}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {nextBlankIdx !== -1
            ? `Preencha o campo ${nextBlankIdx + 1} de ${exercise.blanks.length}`
            : "Toque numa palavra para removê-la"}
        </Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: canCheck ? colors.primary : colors.muted }]}
          onPress={handleCheck}
          activeOpacity={0.85}
          disabled={!canCheck}
        >
          <Text style={[styles.btnText, { color: canCheck ? "#FFFFFF" : colors.mutedForeground }]}>Verificar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 14, paddingBottom: 24 },
  tag: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  instruction: { fontSize: 16, fontFamily: "Inter_700Bold", lineHeight: 26 },
  sentenceBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  sentenceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
    rowGap: 10,
  },
  sentenceText: { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 28 },
  blank: {
    borderRadius: 7,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  blankText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  wordsLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  wordsPool: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  wordChip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  wordText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hint: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", fontStyle: "italic" },
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  btn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
