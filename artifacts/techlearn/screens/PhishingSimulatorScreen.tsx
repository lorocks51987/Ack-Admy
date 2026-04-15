import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { AlertTriangle, CheckCircle, Mail, Paperclip, ExternalLink, User, Flag } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import type { PhishingEmailExercise, FraudIndicator } from "@/constants/lessons";

interface Props {
  exercise: PhishingEmailExercise;
  onAnswer: (correct: boolean) => void;
}

export function PhishingSimulatorScreen({ exercise, onAnswer }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [flagged, setFlagged] = useState<FraudIndicator[]>([]);
  const [checked, setChecked] = useState(false);

  const toggle = (indicator: FraudIndicator) => {
    if (checked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlagged((prev) =>
      prev.includes(indicator) ? prev.filter((f) => f !== indicator) : [...prev, indicator]
    );
  };

  const isFlagged = (indicator: FraudIndicator) => flagged.includes(indicator);

  const canCheck = flagged.length > 0;

  const handleCheck = () => {
    if (!canCheck) return;
    setChecked(true);
    const allCorrect = exercise.fraudIndicators.every((ind) => flagged.includes(ind)) && flagged.length === exercise.fraudIndicators.length;
    onAnswer(allCorrect);
  };

  const getZoneStyle = (indicator: FraudIndicator) => {
    if (!checked) {
      return isFlagged(indicator)
        ? { bg: "rgba(239,68,68,0.12)", border: "#EF4444" }
        : { bg: colors.card, border: colors.border };
    }
    const isCorrectlyFlagged = exercise.fraudIndicators.includes(indicator) && flagged.includes(indicator);
    const isMissed = exercise.fraudIndicators.includes(indicator) && !flagged.includes(indicator);
    const isFalsePositive = !exercise.fraudIndicators.includes(indicator) && flagged.includes(indicator);
    if (isCorrectlyFlagged) return { bg: "rgba(239,68,68,0.12)", border: "#EF4444" };
    if (isMissed) return { bg: "rgba(245,158,11,0.12)", border: "#F59E0B" };
    if (isFalsePositive) return { bg: "rgba(34,197,94,0.12)", border: "#22C55E" };
    return { bg: colors.card, border: colors.border };
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 100 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.tag, { color: colors.primary }]}>SIMULADOR DE PHISHING</Text>
        <Text style={[styles.instruction, { color: colors.foreground }]}>
          Toque nos elementos suspeitos do e-mail abaixo para sinalizá-los:
        </Text>

        <View style={[styles.emailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emailToolbar, { borderBottomColor: colors.border }]}>
            <Mail size={14} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={[styles.toolbarText, { color: colors.mutedForeground }]}>Caixa de Entrada</Text>
          </View>

          <View style={styles.emailHeader}>
            <View style={styles.subjectRow}>
              <Text style={[styles.subject, { color: colors.foreground }]}>{exercise.subject}</Text>
            </View>

            <TouchableOpacity
              style={[styles.zone, { backgroundColor: getZoneStyle("sender").bg, borderColor: getZoneStyle("sender").border }]}
              onPress={() => toggle("sender")}
              activeOpacity={0.8}
            >
              <View style={styles.zoneInner}>
                <User size={13} color={isFlagged("sender") ? "#EF4444" : colors.mutedForeground} strokeWidth={2} />
                <View style={styles.senderInfo}>
                  <Text style={[styles.senderName, { color: colors.foreground }]}>{exercise.fromDisplay}</Text>
                  <Text style={[styles.senderEmail, { color: isFlagged("sender") ? "#EF4444" : colors.mutedForeground }]}>
                    &lt;{exercise.fromEmail}&gt;
                  </Text>
                </View>
                {isFlagged("sender") && <Flag size={14} color="#EF4444" strokeWidth={2} />}
              </View>
              {isFlagged("sender") && (
                <Text style={[styles.flagLabel, { color: "#EF4444" }]}>⚠ Remetente suspeito</Text>
              )}
            </TouchableOpacity>

            <View style={styles.toRow}>
              <Text style={[styles.toLabel, { color: colors.mutedForeground }]}>Para: </Text>
              <Text style={[styles.toText, { color: colors.foreground }]}>{exercise.to}</Text>
            </View>
          </View>

          <View style={[styles.emailBody, { borderTopColor: colors.border }]}>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>{exercise.body}</Text>

            <TouchableOpacity
              style={[styles.zone, styles.linkZone, { backgroundColor: getZoneStyle("link").bg, borderColor: getZoneStyle("link").border }]}
              onPress={() => toggle("link")}
              activeOpacity={0.8}
            >
              <ExternalLink size={14} color={isFlagged("link") ? "#EF4444" : colors.primary} strokeWidth={2} />
              <View style={styles.linkContent}>
                <Text style={[styles.linkText, { color: isFlagged("link") ? "#EF4444" : colors.primary }]}>
                  {exercise.linkText}
                </Text>
                <Text style={[styles.linkUrl, { color: colors.mutedForeground }]}>{exercise.linkRealUrl}</Text>
              </View>
              {isFlagged("link") && <Flag size={14} color="#EF4444" strokeWidth={2} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.zone, styles.attachZone, { backgroundColor: getZoneStyle("attachment").bg, borderColor: getZoneStyle("attachment").border }]}
              onPress={() => toggle("attachment")}
              activeOpacity={0.8}
            >
              <Paperclip size={14} color={isFlagged("attachment") ? "#EF4444" : colors.mutedForeground} strokeWidth={2} />
              <Text style={[styles.attachText, { color: isFlagged("attachment") ? "#EF4444" : colors.foreground }]}>
                {exercise.attachmentName}
              </Text>
              {isFlagged("attachment") && <Flag size={14} color="#EF4444" strokeWidth={2} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.legend, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <AlertTriangle size={13} color={colors.warning} strokeWidth={2} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
            Toque em cada elemento que considerar suspeito. Sinalize todos os indicadores de fraude para passar.
          </Text>
        </View>

        <View style={styles.flagsRow}>
          {(["sender", "link", "attachment"] as FraudIndicator[]).map((ind) => (
            <View key={ind} style={[styles.flagBadge, { backgroundColor: isFlagged(ind) ? "rgba(239,68,68,0.12)" : colors.card, borderColor: isFlagged(ind) ? "#EF4444" : colors.border }]}>
              <CheckCircle size={12} color={isFlagged(ind) ? "#EF4444" : colors.border} strokeWidth={2} />
              <Text style={[styles.flagBadgeText, { color: isFlagged(ind) ? "#EF4444" : colors.mutedForeground }]}>
                {ind === "sender" ? "Remetente" : ind === "link" ? "Link" : "Anexo"}
              </Text>
            </View>
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
          <Text style={[styles.btnText, { color: canCheck ? "#FFFFFF" : colors.mutedForeground }]}>
            Verificar Análise
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, gap: 16 },
  tag: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  instruction: { fontSize: 16, fontFamily: "Inter_600SemiBold", lineHeight: 24 },
  emailCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  emailToolbar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  toolbarText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  emailHeader: { padding: 14, gap: 10 },
  subjectRow: { marginBottom: 4 },
  subject: { fontSize: 15, fontFamily: "Inter_700Bold", lineHeight: 22 },
  zone: { borderRadius: 8, borderWidth: 1, padding: 10, gap: 4 },
  zoneInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  senderInfo: { flex: 1 },
  senderName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  senderEmail: { fontSize: 11, fontFamily: "Inter_400Regular" },
  flagLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  toRow: { flexDirection: "row", alignItems: "center" },
  toLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  toText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  emailBody: { padding: 14, gap: 12, borderTopWidth: 1 },
  bodyText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
  linkZone: { flexDirection: "row", alignItems: "center", gap: 8 },
  linkContent: { flex: 1 },
  linkText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  linkUrl: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  attachZone: { flexDirection: "row", alignItems: "center", gap: 8 },
  attachText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  legend: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 8, borderWidth: 1, padding: 12 },
  legendText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  flagsRow: { flexDirection: "row", gap: 8 },
  flagBadge: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 8, borderWidth: 1, paddingVertical: 8 },
  flagBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  btn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
