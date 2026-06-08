import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface RoadmapPathProps {
  filled: boolean;
  primaryColor: string;
  mutedColor: string;
  /** De qual lado a curva começa (topo) */
  startSide: "left" | "right";
  /** Largura disponível para a curva no mapa */
  width: number;
}

/**
 * Segmento sinuoso de estrada entre nós.
 * Renderiza uma curva Bezier suave em SVG conectando os nós intercalados.
 */
export function RoadmapPath({
  filled,
  primaryColor,
  mutedColor,
  startSide,
  width,
}: RoadmapPathProps) {
  const HEIGHT = 56;

  const strokeColor = filled ? primaryColor : mutedColor + "20";
  const strokeWidth = filled ? 2 : 1;

  // Curva S suave (Bezier)
  const d =
    startSide === "left"
      ? `M 0 0 C 0 ${HEIGHT / 2}, ${width} ${HEIGHT / 2}, ${width} ${HEIGHT}`
      : `M ${width} 0 C ${width} ${HEIGHT / 2}, 0 ${HEIGHT / 2}, 0 ${HEIGHT}`;

  return (
    <View
      style={{
        width,
        height: HEIGHT,
        alignSelf: "center",
        // Margem negativa para o SVG entrar por trás dos nós (zIndex 0 contra zIndex 1 dos nós)
        marginVertical: -8,
        zIndex: 0,
      }}
    >
      <Svg width={width} height={HEIGHT}>
        {/* Glow subjacente na estrada ativa - mais largo e sutil */}
        {filled && (
          <Path
            d={d}
            stroke={primaryColor}
            strokeWidth={16}
            fill="none"
            strokeLinecap="round"
            strokeOpacity={0.08}
          />
        )}

        {/* Trilha principal - fina e elegante */}
        <Path
          d={d}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={filled ? "" : "6, 6"}
        />
      </Svg>
    </View>
  );
}
