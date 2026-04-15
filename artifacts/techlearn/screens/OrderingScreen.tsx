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

  const shuffled = useMemo(() => {
    return [...exercise.items].map((item, i) => ({ item, origIdx: i })).sort(() => Math.random() - 0.5);
  }, [exercise.items]);

  const [arranged, setArranged] = useState<{ item: string; origIdx: number }[]>([]);
  const [pool, setPool] = useState(shuffled);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.tag, { color: colors.primary }]}>ORDENAÇÃO</Text>
        <Text style={[styles.instruction, { color: colors.foreground }]}>{exercise.instruction}</Text>

        <View style={[styles.arrangedZone, { backgroundColor: colors.muted, borderColor: canCheck ? colors.primary : colors.border }]}>
          {arranged.length === 0 ? (
            <Text style={[styles.placeholder, { color: colors.mutedForeground }]}>Toque nos itens abaixo para ordenar</Text>
          ) : (
            <View style={styles.chips}>
              {arranged.map((entry, i) => (
                <TouchableOpacity key={entry.origIdx} style={[styles.chip, { backgroundColor: "rgba(99,102,241,0.1)", borderColor: colors.primary }]} onPress={() => removeFromArranged(entry)} activeOpacity={0.8}>
                  <Text style={[styles.chipNum, { color: colors.mutedForeground }]}>{i + 1}</Text>
                  <Text style={[styles.chipText, { color: colors.primary }]}>{entry.item}</Text>
                  <X size={13} color={colors.mutedForeground} strokeWidth={2} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Text style={[styles.poolLabel, { color: colors.mutedForeground }]}>ITENS DISPONÍVEIS</Text>

        <View style={styles.pool}>
          {pool.map((entry) => (
            <TouchableOpacity key={entry.origIdx} style={[styles.poolChip, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => addToArranged(entry)} activeOpacity={0.8}>
              <Text style={[styles.chipText, { color: colors.foreground }]}>{entry.item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: canCheck ? colors.primary : colors.muted }]} onPress={handleCheck} activeOpacity={0.85} disabled={!canCheck}>
          <Text style={[styles.btnText, { color: canCheck ? "#FFFFFF" : colors.mutedForeground }]}>Verificar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120, gap: 16 },
  tag: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  instruction: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 28 },
  arrangedZone: { borderRadius: 10, borderWidth: 1, minHeight: 80, padding: 12, justifyContent: "center" },
  placeholder: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", fontStyle: "italic" },
  chips: { gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", borderRadius: 8, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14, gap: 8 },
  chipNum: { fontSize: 11, fontFamily: "Inter_700Bold" },
  chipText: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  poolLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  pool: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  poolChip: { borderRadius: 8, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 16 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  btn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
