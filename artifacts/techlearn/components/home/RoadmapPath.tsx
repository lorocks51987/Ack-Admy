import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface RoadmapPathProps {
  filled: boolean;
  primaryColor: string;
  mutedColor: string;
  startX: number;
  endX: number;
  height?: number;
  isActive?: boolean;
}

/**
 * Segmento sinuoso de estrada entre nós.
 * Renderiza uma curva Bezier suave em SVG conectando os nós intercalados.
 */
export function RoadmapPath({
  filled,
  primaryColor,
  mutedColor,
  startX,
  endX,
  height = 70,
  isActive = false,
}: RoadmapPathProps) {
  const width = 160; 
  const cx = width / 2;
  const x1 = cx + startX;
  const x2 = cx + endX;

  const strokeColor = filled ? primaryColor : mutedColor + "40";
  const strokeWidth = filled ? 2.5 : 2; // Fina e elegante

  // Curva Bezier de cima (startX) para baixo (endX)
  const d = `M ${x1} 0 C ${x1} ${height / 2}, ${x2} ${height / 2}, ${x2} ${height}`;

  return (
    <View
      style={{
        width,
        height,
        alignSelf: "center",
        // Margem negativa ajustada para conectar nós sem quebrar layout
        marginVertical: -8,
        zIndex: 0,
      }}
      pointerEvents="none"
    >
      <Svg width={width} height={height}>
        {/* Glow subjacente na estrada ativa */}
        {isActive && (
          <Path
            d={d}
            stroke={primaryColor}
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
            strokeOpacity={0.15}
          />
        )}

        {/* Trilha principal - fina e elegante */}
        <Path
          d={d}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={filled ? "" : "6 6"}
        />
      </Svg>
    </View>
  );
}
