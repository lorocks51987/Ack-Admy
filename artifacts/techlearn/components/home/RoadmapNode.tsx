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
  shape: NodeShape;
  accentColor: string;
  icon: React.ReactNode;
  onPress: () => void;
  isSelected: boolean;
}

const NODE_CURRENT = 76;
const NODE_COMPLETED = 66;
const NODE_AVAILABLE = 62;
const NODE_LOCKED = 56;

export function RoadmapNode({
  state,
  shape,
  accentColor,
  icon,
  onPress,
  isSelected,
}: RoadmapNodeProps) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (state === "current") {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.08, { damping: 6, stiffness: 80 }),
          withSpring(1.0, { damping: 6, stiffness: 80 }),
        ),
        -1,
        true,
      );
    } else {
      scale.value = withSpring(1, { damping: 12 });
    }
  }, [state]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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

  // Cores intensificadas e elegantes
  const bgColor = isCompleted
    ? "#3F3F4640" // Cinza/Verde bem discreto
    : isLocked
      ? "#27272A90"
      : isCurrent
        ? accentColor + "25"
        : accentColor + "10";

  const borderColor = isCompleted
    ? "#52525B" // Borda discreta de finalizado (não verde berrante)
    : isLocked
      ? "#3F3F46"
      : isCurrent
        ? accentColor
        : accentColor + "50";

  const baseBorderWidth = isCurrent ? 2.5 : isCompleted ? 2 : 1.5;
  // Fator de escala do SVG (viewBox é 100x100)
  const strokeWidth = baseBorderWidth * (100 / nodeSize);

  // Sombras e glow
  const shadow = isCurrent
    ? {
        shadowColor: accentColor,
        shadowOpacity: 0.6,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 0 },
        elevation: 15,
      }
    : isSelected && !isLocked
      ? {
          shadowColor: isCompleted ? "#52525B" : accentColor,
          shadowOpacity: 0.4,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
          elevation: 8,
        }
      : {};

  // Opacidade do locked mais visível que antes
  const lockedOpacity = isLocked ? 0.65 : 1;

  // Renderiza a forma correta em SVG
  const renderShape = () => {
    switch (shape) {
      case "hexagon":
        return (
          <Polygon
            points="50,4 96,25 96,75 50,96 4,75 4,25"
            fill={bgColor}
            stroke={borderColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );
      case "diamond":
        return (
          <Polygon
            points="50,4 96,50 50,96 4,50"
            fill={bgColor}
            stroke={borderColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );
      case "shield":
        return (
          <Path
            d="M 10 12 Q 50 2 90 12 L 90 45 C 90 85, 50 96, 50 96 C 50 96, 10 85, 10 45 Z"
            fill={bgColor}
            stroke={borderColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );
      case "capsule":
        return (
          <Rect
            x="15"
            y="4"
            width="70"
            height="92"
            rx="35"
            fill={bgColor}
            stroke={borderColor}
            strokeWidth={strokeWidth}
          />
        );
      case "circle":
      default:
        return (
          <Circle
            cx="50"
            cy="50"
            r="46"
            fill={bgColor}
            stroke={borderColor}
            strokeWidth={strokeWidth}
          />
        );
    }
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
            <Check size={26} color="#10B981" strokeWidth={2.5} />
          ) : isLocked ? (
            <Lock size={20} color="#A1A1AA" strokeWidth={2.5} />
          ) : (
            icon
          )}
        </View>

        {/* Anel de seleção ou pulse */}
        {isCurrent && (
          <View
            style={[StyleSheet.absoluteFillObject, { margin: -6, zIndex: 0 }]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              {shape === "hexagon" && (
                <Polygon
                  points="50,4 96,25 96,75 50,96 4,75 4,25"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={2}
                  strokeOpacity={0.4}
                />
              )}
              {shape === "diamond" && (
                <Polygon
                  points="50,4 96,50 50,96 4,50"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={2}
                  strokeOpacity={0.4}
                />
              )}
              {shape === "shield" && (
                <Path
                  d="M 10 12 Q 50 2 90 12 L 90 45 C 90 85, 50 96, 50 96 C 50 96, 10 85, 10 45 Z"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={2}
                  strokeOpacity={0.4}
                />
              )}
              {shape === "capsule" && (
                <Rect
                  x="15"
                  y="4"
                  width="70"
                  height="92"
                  rx="35"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={2}
                  strokeOpacity={0.4}
                />
              )}
              {shape === "circle" && (
                <Circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={2}
                  strokeOpacity={0.4}
                />
              )}
            </Svg>
          </View>
        )}
      </TouchableOpacity>
    </Reanimated.View>
  );
}
