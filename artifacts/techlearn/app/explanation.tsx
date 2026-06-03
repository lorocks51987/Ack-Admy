import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, CheckCircle, XCircle, Info, BookOpen } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useExplanation } from "@/contexts/ExplanationContext";
import * as Haptics from "expo-haptics";

export default function ExplanationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { explanationData } = useExplanation();

  if (!explanationData) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.foreground }}>Dados de explicação não encontrados.</Text>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={{ marginTop: 20, padding: 12, backgroundColor: colors.primary, borderRadius: 8 }}>
          <Text style={{ color: "#FFF" }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { mode, question, userAnswer, correctAnswer, explanation, learnMore, examples } = explanationData;

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const getHeaderTitle = () => {
    if (mode === "error") return "Entenda seu erro";
    if (mode === "success") return "Saiba mais";
    return "Conceito importante";
  };

  const getHeaderIcon = () => {
    if (mode === "error") return <XCircle size={28} color={colors.error} />;
    if (mode === "success") return <CheckCircle size={28} color={colors.success} />;
    return <Info size={28} color={colors.primary} />;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleContinue}
          activeOpacity={0.7}
        >
          <X size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{getHeaderTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          {getHeaderIcon()}
          <Text style={[styles.mainTitle, { color: colors.foreground }]}>
            {mode === "error" ? "Onde você errou" : "Aprofundando"}
          </Text>
        </View>

        {question && (
          <View style={[styles.questionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.questionText, { color: colors.foreground }]}>{question}</Text>
          </View>
        )}

        {mode === "error" && userAnswer && (
          <View style={[styles.answerCard, { backgroundColor: "rgba(239,68,68,0.08)", borderColor: colors.error }]}>
            <Text style={[styles.answerLabel, { color: colors.error }]}>VOCÊ RESPONDEU</Text>
            <Text style={[styles.answerValue, { color: colors.foreground }]}>{userAnswer}</Text>
          </View>
        )}

        {correctAnswer && (
          <View style={[styles.answerCard, { backgroundColor: "rgba(34,197,94,0.08)", borderColor: colors.success }]}>
            <Text style={[styles.answerLabel, { color: colors.success }]}>RESPOSTA CORRETA</Text>
            <Text style={[styles.answerValue, { color: colors.foreground }]}>{correctAnswer}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.explanationSection}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <BookOpen size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Explicação</Text>
          </View>
          
          <Text style={[styles.explanationText, { color: colors.foreground }]}>
            {explanation || learnMore || "Este conceito será detalhado melhor nas próximas versões."}
          </Text>
        </View>

        {examples && examples.length > 0 && (
          <View style={styles.examplesSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>Exemplos práticos</Text>
            {examples.map((ex, idx) => (
              <View key={idx} style={[styles.exampleItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ fontSize: 16, color: colors.primary, marginRight: 8 }}>•</Text>
                <Text style={[styles.exampleText, { color: colors.foreground }]}>{ex}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer Fixo */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Continuar lição</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 24,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  questionBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  questionText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
  },
  answerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  answerLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
  },
  answerValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(150,150,150,0.2)",
    marginVertical: 4,
  },
  explanationSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  explanationText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  examplesSection: {
    marginTop: 16,
    gap: 8,
  },
  exampleItem: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
