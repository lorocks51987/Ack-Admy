import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

export default function CompleteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { xp } = useLocalSearchParams<{ xp: string }>();
  const xpValue = parseInt(xp || "0", 10);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.primary,
          paddingTop: topPad + 20,
          paddingBottom: bottomPad + 20,
        },
      ]}
    >
      <Animated.View
        style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={[styles.iconBg, { backgroundColor: "#FFFFFF20" }]}>
          <Feather name="award" size={64} color="#FFFFFF" />
        </View>
      </Animated.View>

      <Animated.View style={[styles.textArea, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Licao Completa!</Text>
        <Text style={styles.subtitle}>
          Voce terminou todas as atividades dessa licao.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="zap" size={24} color="#F5C842" />
            <Text style={styles.statValue}>{xpValue}</Text>
            <Text style={styles.statLabel}>XP Ganho</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="star" size={24} color="#F5C842" />
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Licao</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="trending-up" size={24} color="#F5C842" />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Sequencia</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.btns}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.replace("/");
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, { color: colors.primary }]}>
            Continuar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => {
            Haptics.selectionAsync();
            router.replace("/lesson");
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Repetir Licao</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: "center",
  },
  iconBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: {
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF99",
    textAlign: "center",
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF15",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF88",
    textAlign: "center",
  },
  btns: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF40",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
