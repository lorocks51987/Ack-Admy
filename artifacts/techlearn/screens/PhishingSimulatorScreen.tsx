import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { AlertTriangle, CheckCircle, Mail, Paperclip, ExternalLink, User, Flag } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import type { PhishingEmailExercise, FraudIndicator } from "@/constants/lessons";

interface Props {
  exercise: PhishingEmailExercise;
  onAnswer: (correct: boolean) => void;
  feedbackVisible?: boolean;
  powerUpUsed?: boolean;
}

export function PhishingSimulatorScreen({ exercise, onAnswer, feedbackVisible = false, powerUpUsed = false }: Props) {
  const colors = useColors();
  const [flagged, setFlagged] = useState<FraudIndicator[]>([]);
  const [checked, setChecked] = useState(false);
  const insets = useSafeAreaInsets();

  const locked = checked || feedbackVisible;

  React.useEffect(() => {
    if (powerUpUsed && exercise.fraudIndicators.length > 0) {
      const firstIndicator = exercise.fraudIndicators[0];
      setFlagged((prev) => {
        if (prev.includes(firstIndicator)) return prev;
        return [...prev, firstIndicator];
      });
    }
  }, [powerUpUsed, exercise]);

  const toggle = (indicator: FraudIndicator) => {
    if (locked || (powerUpUsed && indicator === exercise.fraudIndicators[0])) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlagged((prev) =>
      prev.includes(indicator) ? prev.filter((f) => f !== indicator) : [...prev, indicator]
    );
  };

  const isFlagged = (indicator: FraudIndicator) => flagged.includes(indicator);
  const canCheck = flagged.length > 0 && !locked;

  const handleCheck = () => {
    if (!canCheck) return;
    setChecked(true);
    const allCorrect =
      exercise.fraudIndicators.every((ind) => flagged.includes(ind)) &&
      flagged.length === exercise.fraudIndicators.length;
    onAnswer(allCorrect);
  };

  const zoneStyle = (indicator: FraudIndicator) => {
    if (!checked) {
      return isFlagged(indicator)
        ? { bg: "rgba(239,68,68,0.12)", border: "#EF4444" }
        : { bg: colors.card, border: colors.border };
    }
    const isCorrect = exercise.fraudIndicators.includes(indicator) && flagged.includes(indicator);
    const isMissed = exercise.fraudIndicators.includes(indicator) && !flagged.includes(indicator);
    if (isCorrect) return { bg: "rgba(239,68,68,0.12)", border: "#EF4444" };
    if (isMissed) return { bg: "rgba(245,158,11,0.12)", border: "#F59E0B" };
    return { bg: colors.card, border: colors.border };
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >


        <View style={[styles.instructionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.instruction, { color: colors.foreground }]}>
            Toque nos elementos suspeitos do e-mail para sinalizá-los:
          </Text>
        </View>

        <View style={[styles.emailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Toolbar */}
          <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
            <Mail size={14} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={[styles.toolbarText, { color: colors.mutedForeground }]}>Caixa de Entrada</Text>
          </View>

          {/* Header */}
          <View style={styles.emailHeader}>
            <Text style={[styles.subject, { color: colors.foreground }]}>{exercise.subject}</Text>

            {/* Sender zone */}
            <TouchableOpacity
              style={[styles.zone, { backgroundColor: zoneStyle("sender").bg, borderColor: zoneStyle("sender").border }]}
              onPress={() => toggle("sender")}
              activeOpacity={0.7}
              disabled={locked}
            >
              <View style={styles.zoneRow}>
                <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                  <User size={16} color={isFlagged("sender") ? "#EF4444" : colors.mutedForeground} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.senderName, { color: colors.foreground }]}>{exercise.fromDisplay}</Text>
                  <Text style={[styles.senderEmail, { color: isFlagged("sender") ? "#EF4444" : colors.mutedForeground }]}>
                    &lt;{exercise.fromEmail}&gt;
                  </Text>
                </View>
                {isFlagged("sender") && <Flag size={14} color="#EF4444" strokeWidth={2} />}
              </View>
            </TouchableOpacity>

            <View style={styles.toRow}>
              <Text style={[styles.toLabel, { color: colors.mutedForeground }]}>Para: </Text>
              <Text style={[styles.toText, { color: colors.foreground }]}>{exercise.to}</Text>
            </View>
          </View>

          {/* Body */}
          <View style={[styles.emailBody, { borderTopColor: colors.border }]}>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>{exercise.body}</Text>

            {/* Link zone */}
            <TouchableOpacity
              style={[styles.zone, styles.linkZone, { backgroundColor: zoneStyle("link").bg, borderColor: zoneStyle("link").border }]}
              onPress={() => toggle("link")}
              activeOpacity={0.7}
              disabled={locked}
            >
              <ExternalLink size={16} color={isFlagged("link") ? "#EF4444" : colors.primary} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.linkText, { color: isFlagged("link") ? "#EF4444" : colors.primary }]}>
                  {exercise.linkText}
                </Text>
                <Text style={[styles.linkUrl, { color: colors.mutedForeground }]}>{exercise.linkRealUrl}</Text>
              </View>
              {isFlagged("link") && <Flag size={14} color="#EF4444" strokeWidth={2} />}
            </TouchableOpacity>

            {/* Attachment zone */}
            {exercise.fraudIndicators.includes("attachment") || exercise.attachmentName ? (
              <TouchableOpacity
                style={[styles.zone, styles.attachZone, { backgroundColor: zoneStyle("attachment").bg, borderColor: zoneStyle("attachment").border }]}
                onPress={() => toggle("attachment")}
                activeOpacity={0.7}
                disabled={locked}
              >
                <Paperclip size={16} color={isFlagged("attachment") ? "#EF4444" : colors.mutedForeground} strokeWidth={2} />
                <Text style={[styles.attachText, { color: isFlagged("attachment") ? "#EF4444" : colors.foreground, flex: 1 }]}>
                  {exercise.attachmentName || "Anexo.zip"}
                </Text>
                {isFlagged("attachment") && <Flag size={14} color="#EF4444" strokeWidth={2} />}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Legend */}
        <View style={[styles.legend, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <AlertTriangle size={14} color={colors.warning} strokeWidth={2} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
            Sinalize todos os indicadores de fraude para passar.
          </Text>
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
            <Text style={[styles.btnText, { color: canCheck ? "#FFFFFF" : colors.mutedForeground }]}>
              Confirmar resposta
            </Text>
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
  instruction: { fontSize: 16, fontFamily: "Inter_600SemiBold", lineHeight: 24 },
  emailCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toolbarText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  emailHeader: { padding: 20, gap: 16 },
  subject: { fontSize: 16, fontFamily: "Inter_700Bold", lineHeight: 24 },
  zone: { borderRadius: 12, borderWidth: 1.5, padding: 16 },
  zoneRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  senderName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  senderEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  toRow: { flexDirection: "row", alignItems: "center", paddingLeft: 2 },
  toLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  toText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emailBody: { padding: 20, gap: 16, borderTopWidth: 1 },
  bodyText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },
  linkZone: { flexDirection: "row", alignItems: "center", gap: 12 },
  linkText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  linkUrl: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  attachZone: { flexDirection: "row", alignItems: "center", gap: 12 },
  attachText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  legend: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  legendText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
});
