import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Platform } from "react-native";
import { Shield } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { BriefingExercise } from "@/constants/lessons";

interface Props {
  exercise: BriefingExercise;
  onStart: () => void;
}

export function BriefingScreen({ exercise, onStart }: Props) {
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const native = Platform.OS !== "web";

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1000, useNativeDriver: native }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1000, useNativeDriver: native }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>{exercise.scenarioTitle}</Text>

        {/* Narrative text block */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.narrative, { color: colors.foreground }]}>{exercise.narrative}</Text>
        </View>

        {/* Clean evidence text block (no terminal design, no redundant headers) */}
        {!!exercise.evidence && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.evidence, { color: colors.foreground }]}>{exercise.evidence}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer containing the primary action button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onStart();
            }}
            activeOpacity={0.85}
          >
            <Shield size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.startBtnText}>Começar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, gap: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", lineHeight: 28, marginBottom: 8 },
  card: { borderRadius: 12, borderWidth: 1.5, padding: 20 },
  narrative: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  evidence: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  startBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3, color: "#FFFFFF" },
});
