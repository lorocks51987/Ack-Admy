import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { CheckCircle, XCircle, Circle } from "lucide-react-native";
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

  const handleSelect = (idx: number) => {
    if (checked) return;
    Haptics.selectionAsync();
    setSelected(idx);
  };

  const handleCheck = () => {
    if (selected === null) return;
    setChecked(true);
    onAnswer(selected === exercise.correct);
  };

  const getOptionStyle = (idx: number) => {
    if (!checked) {
      return selected === idx
        ? { bg: "rgba(99,102,241,0.12)", border: colors.primary }
        : { bg: colors.card, border: colors.border };
    }
    if (idx === exercise.correct) return { bg: "rgba(34,197,94,0.1)", border: colors.success };
    if (idx === selected) return { bg: "rgba(239,68,68,0.1)", border: colors.error };
    return { bg: colors.card, border: colors.border };
  };

  const renderIcon = (idx: number) => {
    if (!checked) return <Circle size={18} color={selected === idx ? colors.primary : colors.border} strokeWidth={2} />;
    if (idx === exercise.correct) return <CheckCircle size={18} color={colors.success} strokeWidth={2} />;
    if (idx === selected) return <XCircle size={18} color={colors.error} strokeWidth={2} />;
    return <Circle size={18} color={colors.border} strokeWidth={2} />;
  };

  const canCheck = selected !== null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.tag, { color: colors.primary }]}>MÚLTIPLA ESCOLHA</Text>
        <Text style={[styles.question, { color: colors.foreground }]}>{exercise.question}</Text>
        <View style={styles.options}>
          {exercise.options.map((opt, idx) => {
            const s = getOptionStyle(idx);
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.option, { backgroundColor: s.bg, borderColor: s.border }]}
                onPress={() => handleSelect(idx)}
                activeOpacity={0.75}
              >
                {renderIcon(idx)}
                <Text style={[styles.optionText, { color: colors.foreground }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  scrollContent: { padding: 20, gap: 16, paddingBottom: 24 },
  tag: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  question: { fontSize: 17, fontFamily: "Inter_700Bold", lineHeight: 26 },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  optionText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  btn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
