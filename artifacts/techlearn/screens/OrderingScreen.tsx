import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { X, CheckCircle, XCircle } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import type { OrderingExercise } from "@/constants/lessons";

interface Props {
  exercise: OrderingExercise;
  onAnswer: (correct: boolean) => void;
  feedbackVisible?: boolean;
  powerUpUsed?: boolean;
}

export function OrderingScreen({ exercise, onAnswer, feedbackVisible = false, powerUpUsed = false }: Props) {
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
  const [checked, setChecked] = useState(false);
  const insets = useSafeAreaInsets();

  const locked = checked || feedbackVisible;

  React.useEffect(() => {
    if (powerUpUsed && arranged[0]?.origIdx !== exercise.correctOrder[0]) {
      const correctIdx = exercise.correctOrder[0];
      const correctItem = exercise.items[correctIdx];
      
      setArranged(prev => {
        const next = prev.filter(e => e.origIdx !== correctIdx);
        return [{ item: correctItem, origIdx: correctIdx }, ...next];
      });
    }
  }, [powerUpUsed, exercise]);

  const addToArranged = (entry: { item: string; origIdx: number }) => {
    if (locked) return;
    Haptics.selectionAsync();
    setArranged((a) => [...a, entry]);
  };

  const removeFromArranged = (entry: { item: string; origIdx: number }) => {
    if (locked || (powerUpUsed && entry.origIdx === exercise.correctOrder[0])) return;
    Haptics.selectionAsync();
    setArranged((a) => a.filter((e) => e.origIdx !== entry.origIdx));
  };

  const handleCheck = () => {
    if (arranged.length < exercise.items.length || locked) return;
    setChecked(true);
    const correct = arranged.every((entry, i) => entry.origIdx === exercise.correctOrder[i]);
    Haptics.impactAsync(correct ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy);
    onAnswer(correct);
  };

  const canCheck = arranged.length === exercise.items.length && !locked;

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

        {/* Drop zone */}
        <View style={[styles.dropZone, { backgroundColor: colors.card, borderColor: canCheck ? colors.primary : colors.border }]}>
          <Text style={[styles.dropLabel, { color: colors.mutedForeground }]}>SUA SEQUÊNCIA</Text>
          {arranged.length === 0 ? (
            <View style={styles.placeholderBox}>
              <Text style={[styles.placeholder, { color: colors.mutedForeground }]}>
                Toque nos itens abaixo para ordená-los aqui
              </Text>
            </View>
          ) : (
            <View style={styles.arrangedList}>
              {arranged.map((entry, i) => {
                const isCorrect = entry.origIdx === exercise.correctOrder[i];
                const isPowerUpSolved = powerUpUsed && i === 0 && entry.origIdx === exercise.correctOrder[0];
                const bg = checked 
                  ? (isCorrect ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)") 
                  : isPowerUpSolved ? colors.success + "12" : colors.card;
                const border = checked
                  ? (isCorrect ? colors.success : colors.error)
                  : isPowerUpSolved ? colors.success : colors.border;
                
                return (
                  <TouchableOpacity
                    key={entry.origIdx}
                    style={[styles.arrangedChip, { backgroundColor: bg, borderColor: border }]}
                    onPress={() => removeFromArranged(entry)}
                    activeOpacity={locked || isPowerUpSolved ? 1 : 0.7}
                    disabled={locked || isPowerUpSolved}
                  >
                    <View style={[styles.numBadge, { backgroundColor: isPowerUpSolved ? colors.success + "15" : (checked ? (isCorrect ? colors.success : colors.error) : colors.primary) }]}>
                      <Text style={[styles.numText, { color: isPowerUpSolved ? colors.success : "#FFFFFF" }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.arrangedText, { color: colors.foreground }]}>{entry.item}</Text>
                    
                    {isPowerUpSolved ? (
                      <CheckCircle size={18} color={colors.success} style={{ marginLeft: 8 }} />
                    ) : checked ? (
                      isCorrect ? <CheckCircle size={16} color={colors.success} /> : <XCircle size={16} color={colors.error} />
                    ) : (
                      <X size={16} color={colors.mutedForeground} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Pool */}
        <Text style={[styles.poolLabel, { color: colors.mutedForeground }]}>ITENS DISPONÍVEIS</Text>
        <View style={styles.pool}>
          {initialPool.map((entry) => {
            const isUsed = arranged.some((a) => a.origIdx === entry.origIdx);
            const isPowerUpReserved = powerUpUsed && entry.origIdx === exercise.correctOrder[0];

            return (
              <TouchableOpacity
                key={entry.origIdx}
                style={[
                  styles.poolChip,
                  {
                    backgroundColor: isUsed ? colors.background : colors.card,
                    borderColor: isUsed ? colors.border : colors.primary,
                    borderStyle: isUsed ? "dashed" : "solid",
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => {
                  if (isUsed) {
                    removeFromArranged(entry);
                  } else {
                    addToArranged(entry);
                  }
                }}
                activeOpacity={locked || isPowerUpReserved ? 1 : 0.7}
                disabled={locked || isPowerUpReserved}
              >
                <Text style={[styles.poolText, { color: isUsed ? "transparent" : colors.primary }]}>
                  {entry.item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  instructionCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  instruction: { fontSize: 17, fontFamily: "Inter_600SemiBold", lineHeight: 26 },
  dropZone: {
    borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed",
    minHeight: 120, padding: 20, gap: 14,
  },
  dropLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  placeholderBox: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 70 },
  placeholder: { fontSize: 14, fontFamily: "Inter_500Medium", textAlign: "center", fontStyle: "italic" },
  arrangedList: { gap: 12 },
  arrangedChip: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1.5,
    paddingVertical: 14, paddingHorizontal: 16, gap: 14,
  },
  numBadge: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  numText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  arrangedText: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  poolLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.2, marginTop: 8 },
  pool: { gap: 12, width: "100%" },
  poolChip: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  poolText: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
});
