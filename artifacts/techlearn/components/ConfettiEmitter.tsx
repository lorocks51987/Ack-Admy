import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Easing, Platform } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CONFETTI_COLORS = [
  "#FFD700", // Dourado
  "#FF6B6B", // Coral
  "#4D96FF", // Azul
  "#6BCB77", // Verde
  "#F7D060", // Amarelo
  "#FF96AD", // Rosa
  "#8B5CF6", // Roxo
];

interface ConfettiParticleProps {
  delay: number;
}

function ConfettiParticle({ delay }: ConfettiParticleProps) {
  const yAnim = useRef(new Animated.Value(-20)).current;
  const xOffset = useRef(new Animated.Value(Math.random() * (SCREEN_WIDTH > 0 ? SCREEN_WIDTH : 400))).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const swingAnim = useRef(new Animated.Value(0)).current;

  const size = useRef(Math.random() * 6 + 6).current; // 6 a 12
  const color = useRef(CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]).current;
  const isCircle = useRef(Math.random() > 0.5).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(yAnim, {
          toValue: (SCREEN_HEIGHT > 0 ? SCREEN_HEIGHT : 800) + 20,
          duration: Math.random() * 2500 + 2500, // 2.5s a 5s
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(rotateAnim, {
          toValue: Math.random() * 10 + 5, // rotações completas
          duration: Math.random() * 2000 + 2000,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(swingAnim, {
              toValue: 1,
              duration: Math.random() * 1000 + 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: Platform.OS !== "web",
            }),
            Animated.timing(swingAnim, {
              toValue: -1,
              duration: Math.random() * 1000 + 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: Platform.OS !== "web",
            }),
          ])
        ),
      ]),
    ]).start();
  }, []);

  const translateX = Animated.add(
    xOffset,
    swingAnim.interpolate({
      inputRange: [-1, 1],
      outputRange: [-30, 30],
    })
  );

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: isCircle ? size : size * 1.5,
          borderRadius: isCircle ? size / 2 : 2,
          backgroundColor: color,
          transform: [
            { translateY: yAnim },
            { translateX: translateX },
            { rotate: rotate },
          ],
        },
      ]}
    />
  );
}

export function ConfettiEmitter() {
  const particles = Array.from({ length: 60 }, (_, i) => i);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((id) => (
        <ConfettiParticle key={id} delay={Math.random() * 1500} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
