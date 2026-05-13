import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { X, Heart, AlertCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { ProgressBar } from "./ProgressBar";
import type { PhaseInfo } from "@/constants/lessons";

interface ExerciseHeaderProps {
  current: number;
  total: number;
  lives: number;
  onClose: () => void;
  phaseInfo?: PhaseInfo;
  isBriefing?: boolean;
  moduleName?: string;
}

export function ExerciseHeader({
  current, total, lives, onClose, phaseInfo, isBriefing, moduleName,
}: ExerciseHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <X size={20} color={colors.mutedForeground} strokeWidth={2} />
      </TouchableOpacity>

      <View style={styles.center}>
        {phaseInfo && !isBriefing ? (
          <View style={styles.phaseCol}>
            {moduleName && (
              <Text style={[styles.moduleLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
                {moduleName}
              </Text>
            )}
            <View style={styles.dotsRow}>
              {Array.from({ length: phaseInfo.total }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.phaseDot,
                    {
                      backgroundColor: i < phaseInfo.phase ? colors.primary : colors.border,
                      width: i < phaseInfo.phase ? 16 : 8,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.phaseText, { color: colors.primary }]}>
              Fase {phaseInfo.phase} de {phaseInfo.total}
            </Text>
          </View>
        ) : (
          <View style={styles.phaseCol}>
            {moduleName && (
              <Text style={[styles.moduleLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
                {moduleName}
              </Text>
            )}
            <ProgressBar progress={current} total={total} />
          </View>
        )}
      </View>

      <View style={styles.livesContainer}>
        {isBriefing ? (
          <AlertCircle size={18} color={colors.primary} strokeWidth={2} />
        ) : (
          <>
            <Heart size={16} color={colors.error} strokeWidth={2} fill={colors.error} />
            <Text style={[styles.livesText, { color: colors.error }]}>{lives}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  closeBtn: { padding: 4 },
  center: { flex: 1 },
  phaseCol: { gap: 4 },
  moduleLabel: { fontSize: 10, fontFamily: "Inter_500Medium", letterSpacing: 0.5 },
  dotsRow: { flexDirection: "row", gap: 4, alignItems: "center" },
  phaseDot: { height: 4, borderRadius: 2 },
  phaseText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  livesContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  livesText: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
