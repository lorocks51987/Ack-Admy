import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { MultipleChoiceExercise } from "@/constants/lessons";

interface Props {
  exercise: MultipleChoiceExercise;
  onAnswer: (correct: boolean) => void;
}

export function MultipleChoiceScreen({ exercise, onAnswer }: Props) {
  const colors = useColors();
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  function handleSelect(idx: number) {
    if (checked) return;
    setSelected(idx);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleCheck() {
    if (selected === null) return;
    setChecked(true);
    onAnswer(selected === exercise.correct);
  }

  function getOptionStyle(idx: number) {
    if (!checked) {
      if (idx === selected) return { backgroundColor: "#1E1A2E", borderColor: colors.primary };
      return { backgroundColor: colors.card, borderColor: colors.border };
    }
    if (idx === exercise.correct) return { backgroundColor: "#0D1F0D", borderColor: "#3FB950" };
    if (idx === selected) return { backgroundColor: "#1F0A0A", borderColor: "#F85149" };
    return { backgroundColor: colors.card, borderColor: colors.border };
  }

  function getTextColor(idx: number) {
    if (!checked) return idx === selected ? colors.primary : colors.foreground;
    if (idx === exercise.correct) return "#3FB950";
    if (idx === selected) return "#F85149";
    return colors.mutedForeground;
  }

  function getLetterBg(idx: number) {
    if (!checked) return idx === selected ? colors.primary : colors.muted;
    if (idx === exercise.correct) return "#3FB950";
    if (idx === selected) return "#F85149";
    return colors.muted;
  }

  function getLetterColor(idx: number) {
    if (!checked) return idx === selected ? "#0A0E1A" : colors.mutedForeground;
    if (idx === exercise.correct || idx === selected) return "#0A0E1A";
    return colors.mutedForeground;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.tag, { color: colors.primary }]}>MÚLTIPLA ESCOLHA</Text>
        <Text style={[styles.question, { color: colors.foreground }]}>{exercise.question}</Text>
        <View style={styles.options}>
          {exercise.options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.option, getOptionStyle(idx)]}
              onPress={() => handleSelect(idx)}
              activeOpacity={0.8}
            >
              <View style={[styles.letter, { backgroundColor: getLetterBg(idx) }]}>
                <Text style={[styles.letterText, { color: getLetterColor(idx) }]}>
                  {["A", "B", "C", "D"][idx]}
                </Text>
              </View>
              <Text style={[styles.optionText, { color: getTextColor(idx) }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: selected !== null ? colors.primary : colors.muted }]}
          onPress={handleCheck}
          activeOpacity={0.85}
          disabled={selected === null || checked}
        >
          <Text style={[styles.btnText, { color: selected !== null ? "#0A0E1A" : colors.mutedForeground }]}>
            Verificar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120, gap: 16 },
  tag: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  question: { fontSize: 20, fontFamily: "Inter_700Bold", lineHeight: 30 },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  letter: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  letterText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  optionText: { fontSize: 15, fontFamily: "Inter_500Medium", flex: 1, lineHeight: 22 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  btn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
