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
  const [checked, setChecked] = useState(false);
  const insets = useSafeAreaInsets();

  const locked = checked || feedbackVisible;
  const nextBlankIdx = filled.findIndex((f) => f === null);

  React.useEffect(() => {
    if (powerUpUsed && filled[0] !== exercise.blanks[0]) {
      const word = exercise.blanks[0];
      setFilled(prev => {
        const next = [...prev];
        next[0] = word;
        return next;
      });
      setUsedWords(u => Array.from(new Set([...u, word])));
    }
  }, [powerUpUsed, exercise]);

  const handleWordPress = (word: string) => {
    if (locked) return;
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
    if (!filled[idx] || locked || (powerUpUsed && idx === 0)) return;
    Haptics.selectionAsync();
    const word = filled[idx]!;
    const nf = [...filled];
    nf[idx] = null;
    setFilled(nf);
    setUsedWords((u) => u.filter((w) => w !== word));
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
        let blankBg = val ? colors.primary + "1A" : colors.input;
        let blankBorder = val ? colors.primary : colors.border;
        let blankTextColor = val ? colors.primary : colors.mutedForeground;

        if (checked) {
          const ok = val === exercise.blanks[i];
          blankBg = ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
          blankBorder = ok ? colors.success : colors.error;
          blankTextColor = ok ? colors.success : colors.error;
        } else if (powerUpUsed && i === 0) {
          blankBg = colors.success + "12";
          blankBorder = colors.success;
          blankTextColor = colors.success;
        }

        nodes.push(
          <TouchableOpacity
            key={`b-${i}`}
            style={[
              styles.blank,
              {
                borderColor: blankBorder,
                backgroundColor: blankBg,
                minWidth: Math.max(70, (val?.length ?? 5) * 9),
              },
            ]}
            onPress={() => handleBlankPress(i)}
            activeOpacity={locked || (powerUpUsed && i === 0) ? 1 : 0.7}
            disabled={locked || (powerUpUsed && i === 0)}
          >
            <Text style={[styles.blankText, { color: blankTextColor }]}>
              {val ?? "...."}
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
            return (
              <TouchableOpacity
                key={word}
                style={[
                  styles.wordChip,
                  { 
                    backgroundColor: used ? colors.card : colors.primary + "14", 
                    borderColor: used ? colors.border : colors.primary, 
                    opacity: used || (powerUpUsed && word === exercise.blanks[0]) ? 0.4 : 1 
                  },
                ]}
                onPress={() => handleWordPress(word)}
                activeOpacity={locked || used || (powerUpUsed && word === exercise.blanks[0]) ? 1 : 0.7}
                disabled={locked || used || (powerUpUsed && word === exercise.blanks[0])}
              >
                <Text style={[styles.wordText, { color: used ? colors.mutedForeground : colors.primary }]}>
                  {word}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {!checked && (
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            {nextBlankIdx !== -1
              ? `Preencha a lacuna ${nextBlankIdx + 1} de ${exercise.blanks.length}`
              : "Toque numa palavra para removê-la"}
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
            <Text style={[styles.btnText, { color: canCheck ? "#FFFFFF" : colors.mutedForeground }]}>Confirmar resposta</Text>
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
  tagRow: { flexDirection: "row" },
  tag: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  tagText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.2 },
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
