import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { Link2 } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import type { AssociationExercise } from "@/constants/lessons";

interface Props {
  exercise: AssociationExercise;
  onAnswer: (correct: boolean) => void;
}

export function AssociationScreen({ exercise, onAnswer }: Props) {
  const colors = useColors();
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  // Shuffle right side once on mount
  const shuffledRight = useMemo(
    () =>
      exercise.pairs
        .map((p, i) => ({ label: p.right, originalIdx: i }))
        .sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ---------- handlers ----------
  const handleLeft = useCallback(
    (idx: number) => {
      if (checked) return;
      if (matched[idx] !== undefined) {
        // Tap a paired left item → unlink it
        Haptics.selectionAsync();
        setMatched((prev) => {
          const next = { ...prev };
          delete next[idx];
          return next;
        });
        setSelectedLeft(null);
        return;
      }
      Haptics.selectionAsync();
      setSelectedLeft((prev) => (prev === idx ? null : idx));
    },
    [checked, matched]
  );

  const handleRight = useCallback(
    (origIdx: number) => {
      if (checked || selectedLeft === null) return;
      // Tap an already-paired right item that belongs to selectedLeft → unlink
      const existingLeft = Object.keys(matched).find(
        (k) => matched[+k] === origIdx
      );
      if (existingLeft !== undefined) return; // belongs to another left, ignore
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMatched((prev) => ({ ...prev, [selectedLeft]: origIdx }));
      setSelectedLeft(null);
    },
    [checked, selectedLeft, matched]
  );

  const handleCheck = () => {
    if (Object.keys(matched).length < exercise.pairs.length) return;
    setChecked(true);
    onAnswer(exercise.pairs.every((_, i) => matched[i] === i));
  };

  // ---------- style helpers ----------
  // Returns { bg, border } based on state — only left items are ever "selected"
  const leftStyle = (idx: number) => {
    if (checked) {
      if (matched[idx] !== undefined) {
        const ok = matched[idx] === idx;
        return { bg: ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: ok ? colors.success : colors.error };
      }
      return { bg: colors.card, border: colors.border };
    }
    if (selectedLeft === idx) return { bg: "rgba(99,102,241,0.18)", border: colors.primary };
    if (matched[idx] !== undefined) return { bg: "rgba(99,102,241,0.07)", border: colors.primary + "70" };
    return { bg: colors.card, border: colors.border };
  };

  const rightStyle = (origIdx: number) => {
    const isPaired = Object.values(matched).includes(origIdx);
    if (checked) {
      const lKey = Object.keys(matched).find((k) => matched[+k] === origIdx);
      if (lKey !== undefined) {
        const ok = +lKey === origIdx;
        return { bg: ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: ok ? colors.success : colors.error };
      }
      return { bg: colors.card, border: colors.border };
    }
    if (isPaired) return { bg: "rgba(99,102,241,0.07)", border: colors.primary + "70" };
    // Only highlight available right items when a left is selected
    if (selectedLeft !== null) return { bg: "rgba(99,102,241,0.06)", border: colors.primary };
    return { bg: colors.card, border: colors.border };
  };

  const allMatched = Object.keys(matched).length === exercise.pairs.length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.tag, { color: colors.primary }]}>ASSOCIAÇÃO</Text>
        <Text style={[styles.instruction, { color: colors.foreground }]}>
          {exercise.instruction}
        </Text>

        {/* Active selection hint */}
        <View style={[styles.hintBar, { backgroundColor: colors.card, borderColor: selectedLeft !== null ? colors.primary : colors.border }]}>
          <Link2 size={13} color={selectedLeft !== null ? colors.primary : colors.mutedForeground} strokeWidth={2} />
          <Text style={[styles.hintText, { color: selectedLeft !== null ? colors.primary : colors.mutedForeground }]}>
            {selectedLeft !== null
              ? `"${exercise.pairs[selectedLeft].left}" — agora selecione à direita`
              : allMatched
              ? "Todos os pares conectados!"
              : "Selecione um item à esquerda para começar"}
          </Text>
        </View>

        {/* Two columns */}
        <View style={styles.columns}>
          {/* LEFT column */}
          <View style={styles.column}>
            <Text style={[styles.colLabel, { color: colors.mutedForeground }]}>CONCEITO</Text>
            {exercise.pairs.map((pair, idx) => {
              const s = leftStyle(idx);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.chip, { backgroundColor: s.bg, borderColor: s.border }]}
                  onPress={() => handleLeft(idx)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, { color: colors.foreground }]}>{pair.left}</Text>
                  {matched[idx] !== undefined && (
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* RIGHT column */}
          <View style={styles.column}>
            <Text style={[styles.colLabel, { color: colors.mutedForeground }]}>CATEGORIA</Text>
            {shuffledRight.map((item) => {
              const isPaired = Object.values(matched).includes(item.originalIdx);
              const s = rightStyle(item.originalIdx);
              // Right items are ONLY tappable when a left is selected and this right isn't paired to another left
              const disabled = checked || selectedLeft === null || isPaired;
              return (
                <TouchableOpacity
                  key={item.originalIdx}
                  style={[
                    styles.chip,
                    { backgroundColor: s.bg, borderColor: s.border, opacity: isPaired && selectedLeft !== null ? 0.5 : 1 },
                  ]}
                  onPress={() => handleRight(item.originalIdx)}
                  activeOpacity={disabled ? 1 : 0.75}
                  disabled={disabled}
                >
                  <Text style={[styles.chipText, { color: colors.foreground }]}>{item.label}</Text>
                  {isPaired && !checked && (
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: allMatched ? colors.primary : colors.muted }]}
          onPress={handleCheck}
          activeOpacity={0.85}
          disabled={!allMatched}
        >
          <Text style={[styles.btnText, { color: allMatched ? "#FFFFFF" : colors.mutedForeground }]}>
            Verificar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  scroll:        { flex: 1 },
  scrollContent: { padding: 20, gap: 14, paddingBottom: 24 },
  tag:           { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  instruction:   { fontSize: 15, fontFamily: "Inter_700Bold", lineHeight: 24 },
  hintBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  hintText: { flex: 1, fontSize: 12, fontFamily: "Inter_600SemiBold" },
  columns:   { flexDirection: "row", gap: 10 },
  column:    { flex: 1, gap: 8 },
  colLabel:  { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.5, textAlign: "center" },
  chip: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  chipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    lineHeight: 17,
  },
  dot:    { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  btn:    { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnText:{ fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
