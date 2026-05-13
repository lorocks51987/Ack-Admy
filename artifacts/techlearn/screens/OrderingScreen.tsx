import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import type { OrderingExercise } from "@/constants/lessons";

interface Props {
  exercise: OrderingExercise;
  onAnswer: (correct: boolean) => void;
}

export function OrderingScreen({ exercise, onAnswer }: Props) {
  const colors = useColors();

  const initialPool = useMemo(
    () =>
      exercise.items
        .map((item, i) => ({ item, origIdx: i }))
        .sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [arranged, setArranged] = useState<{ item: string; origIdx: number }[]>([]);
  const [pool, setPool] = useState(initialPool);

  const addToArranged = (entry: { item: string; origIdx: number }) => {
    Haptics.selectionAsync();
    setPool((p) => p.filter((e) => e.origIdx !== entry.origIdx));
    setArranged((a) => [...a, entry]);
  };

  const removeFromArranged = (entry: { item: string; origIdx: number }) => {
    Haptics.selectionAsync();
    setArranged((a) => a.filter((e) => e.origIdx !== entry.origIdx));
    setPool((p) => [...p, entry]);
  };

  const handleCheck = () => {
    if (arranged.length < exercise.items.length) return;
    onAnswer(arranged.every((entry, i) => entry.origIdx === exercise.correctOrder[i]));
  };

  const canCheck = arranged.length === exercise.items.length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.tag, { color: colors.primary }]}>ORDENAÇÃO</Text>
        <Text style={[styles.instruction, { color: colors.foreground }]}>{exercise.instruction}</Text>

        {/* Drop zone */}
        <View style={[styles.dropZone, { backgroundColor: colors.muted, borderColor: canCheck ? colors.primary : colors.border }]}>
          <Text style={[styles.dropLabel, { color: colors.mutedForeground }]}>SEQUÊNCIA CORRETA</Text>
          {arranged.length === 0 ? (
            <Text style={[styles.placeholder, { color: colors.mutedForeground }]}>
              Toque nos itens abaixo para ordenar
            </Text>
          ) : (
            <View style={styles.arrangedList}>
              {arranged.map((entry, i) => (
                <TouchableOpacity
                  key={entry.origIdx}
                  style={[styles.arrangedChip, { backgroundColor: "rgba(99,102,241,0.12)", borderColor: colors.primary }]}
                  onPress={() => removeFromArranged(entry)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.numBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.numText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.arrangedText, { color: colors.foreground }]}>{entry.item}</Text>
                  <X size={14} color={colors.mutedForeground} strokeWidth={2} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Pool */}
        <Text style={[styles.poolLabel, { color: colors.mutedForeground }]}>ITENS DISPONÍVEIS</Text>
        <View style={styles.pool}>
          {pool.map((entry) => (
            <TouchableOpacity
              key={entry.origIdx}
              style={[styles.poolChip, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => addToArranged(entry)}
              activeOpacity={0.75}
            >
              <Text style={[styles.poolText, { color: colors.foreground }]}>{entry.item}</Text>
            </TouchableOpacity>
          ))}
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
  scrollContent: { padding: 20, gap: 14, paddingBottom: 24 },
  tag: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  instruction: { fontSize: 16, fontFamily: "Inter_700Bold", lineHeight: 26 },
  dropZone: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    minHeight: 80,
    padding: 12,
    gap: 8,
  },
  dropLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  placeholder: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", fontStyle: "italic", paddingVertical: 12 },
  arrangedList: { gap: 8 },
  arrangedChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  numBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  arrangedText: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  poolLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  pool: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  poolChip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  poolText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  btn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
