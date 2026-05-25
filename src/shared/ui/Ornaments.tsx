import { useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import GirihTile from "@shared/assets/svg/girih-tile.svg";
import PaperGrainSvg from "@shared/assets/svg/paper-grain.svg";

type OrnamentProps = {
  size?: number;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
};

// Tiles an SVG in a grid over its container (absolute positioning).
// Not a true background-repeat, but visually equivalent for decorative use.
function TiledSvg({
  SvgComponent,
  tileSize,
  opacity,
  style,
  tintColor,
}: {
  SvgComponent: React.FC<{ width: number; height: number; opacity?: number; color?: string }>;
  tileSize: number;
  opacity: number;
  style?: StyleProp<ViewStyle>;
  tintColor?: string;
}) {
  // We render enough tiles to cover a full screen. 480x900px ÷ tileSize.
  const cols = Math.ceil(480 / tileSize) + 1;
  const rows = Math.ceil(900 / tileSize) + 1;

  const tiles = useMemo(() => {
    const items: { key: string; top: number; left: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push({ key: `${r}-${c}`, top: r * tileSize, left: c * tileSize });
      }
    }
    return items;
  }, [cols, rows, tileSize]);

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: "hidden" }, style]} pointerEvents="none">
      {tiles.map(({ key, top, left }) => (
        <View key={key} style={{ position: "absolute", top, left }}>
          <SvgComponent width={tileSize} height={tileSize} opacity={opacity} color={tintColor} />
        </View>
      ))}
    </View>
  );
}

export function GirihOverlay({ size = 80, opacity = 0.08, style }: OrnamentProps) {
  return (
    <TiledSvg
      SvgComponent={GirihTile as React.FC<{ width: number; height: number; opacity?: number; color?: string }>}
      tileSize={size}
      opacity={opacity}
      style={style}
    />
  );
}

export function PaperGrain({ size = 200, opacity = 0.07, style }: OrnamentProps) {
  return (
    <TiledSvg
      SvgComponent={PaperGrainSvg as React.FC<{ width: number; height: number; opacity?: number; color?: string }>}
      tileSize={size}
      opacity={opacity}
      style={style}
    />
  );
}
