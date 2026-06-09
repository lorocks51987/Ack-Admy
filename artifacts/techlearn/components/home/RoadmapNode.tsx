import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Check, Lock } from "lucide-react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import Svg, { Polygon, Path, Rect, Circle } from "react-native-svg";

export type NodeState = "completed" | "current" | "available" | "locked";
export type NodeShape = "circle" | "hexagon" | "shield" | "diamond" | "capsule";

interface RoadmapNodeProps {
  state: NodeState;
  accentColor: string;
  icon: React.ReactNode;
  onPress: () => void;
  isSelected: boolean;
}

const NODE_CURRENT = 84;
const NODE_AVAILABLE = 72;
const NODE_COMPLETED = 64;
const NODE_LOCKED = 64;

export function RoadmapNode({
  state,
  accentColor,
  icon,
  onPress,
  isSelected,
}: RoadmapNodeProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    if (state === "current") {
      scale.value = withSpring(1.05, { damping: 10, stiffness: 100 });
      glowOpacity.value = withRepeat(
        withSequence(
          withSpring(0.7, { damping: 15, stiffness: 40 }),
          withSpring(0.2, { damping: 15, stiffness: 40 }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = withSpring(1, { damping: 12 });
      glowOpacity.value = 0;
    }
  }, [state]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const isCurrent = state === "current";
  const isCompleted = state === "completed";
  const isLocked = state === "locked";
  const isAvailable = state === "available";

  const nodeSize = isCurrent
    ? NODE_CURRENT
    : isCompleted
      ? NODE_COMPLETED
      : isAvailable
        ? NODE_AVAILABLE
        : NODE_LOCKED;

  // Hybrid Hexagon Styles
  const bgColor = isCompleted
    ? "#27272A" // Cinza escuro premium
    : isLocked
      ? "transparent" // Dark outline
      : isCurrent
        ? "#09090B" // Muito escuro para dar contraste ao anel
        : "#18181B";

  const borderColor = isCompleted
    ? "#52525B" // Borda fria elegante
    : isLocked
      ? "#27272A"
      : isCurrent
        ? accentColor
        : accentColor + "60"; // Borda azul discreta

  const innerRingColor = isCurrent ? "rgba(255,255,255,0.25)" : "transparent";

  const baseBorderWidth = isCurrent ? 3 : isCompleted ? 2 : 2;
  const strokeWidth = baseBorderWidth * (100 / nodeSize);

  // Sombras
  const shadow = isCurrent
    ? {
        shadowColor: accentColor,
        shadowOpacity: 0.5,
        shadowRadius: 25,
        shadowOffset: { width: 0, height: 0 },
        elevation: 12,
      }
    : isSelected && !isLocked
      ? {
          shadowColor: accentColor,
          shadowOpacity: 0.3,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        }
      : {};

  const lockedOpacity = isLocked ? 0.7 : 1;

  // Apenas Hexágono (híbrido)
  const renderShape = () => {
    return (
      <>
        <Polygon
          points="50,4 96,25 96,75 50,96 4,75 4,25"
          fill={bgColor}
          stroke={borderColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {isCurrent && (
          <Polygon
            points="50,9 91,28 91,72 50,91 9,72 9,28"
            fill="none"
            stroke={innerRingColor}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        )}
      </>
    );
  };

  return (
    <Reanimated.View
      style={[
        animStyle,
        { zIndex: isCurrent ? 10 : 1, opacity: lockedOpacity },
        shadow,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={isLocked ? 0.7 : 0.8}
        style={{
          width: nodeSize,
          height: nodeSize,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Shape em SVG ao fundo */}
        <View style={StyleSheet.absoluteFillObject}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            {renderShape()}
          </Svg>
        </View>

        {/* Ícone no topo */}
        <View style={{ zIndex: 2 }}>
          {isCompleted ? (
            <Check size={20} color="#A1A1AA" strokeWidth={2.5} />
          ) : isLocked ? (
            <Lock size={20} color="#52525B" strokeWidth={2} />
          ) : (
            icon
          )}
        </View>

        {/* Anel de seleção ou pulse externo */}
        {isCurrent && (
          <Reanimated.View
            style={[StyleSheet.absoluteFillObject, { margin: -10, zIndex: 0 }, glowStyle]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              <Polygon
                points="50,4 96,25 96,75 50,96 4,75 4,25"
                fill="none"
                stroke={accentColor}
                strokeWidth={3}
              />
            </Svg>
          </Reanimated.View>
        )}
      </TouchableOpacity>
    </Reanimated.View>
  );
}
