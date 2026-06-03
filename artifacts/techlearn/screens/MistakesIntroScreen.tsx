import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Brain, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Reanimated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Props {
  count: number;
  onStart: () => void;
}

export function MistakesIntroScreen({ count, onStart }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const handleStart = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.center}>
        <Reanimated.View entering={FadeIn.duration(400).delay(100)}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + "15" }]}>
            <Brain size={48} color={colors.primary} strokeWidth={2} />
          </View>
        </Reanimated.View>
        
        <Reanimated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Caixa de Erros Inteligente
          </Text>
        </Reanimated.View>

        <Reanimated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Você tem {count} {count === 1 ? "questão quase sumindo" : "questões quase sumindo"} da sua memória. 
            Vamos fortalecer essas sinapses e subir sua barra de retenção!
          </Text>
        </Reanimated.View>
      </View>

      <Reanimated.View entering={FadeInDown.duration(400).delay(400)} style={styles.footer}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          onPress={handleStart}
          activeOpacity={0.88}
        >
          <Text style={styles.startBtnText}>Fortalecer Conhecimento</Text>
          <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </Reanimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    width: "100%",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 6,
  },
  startBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
