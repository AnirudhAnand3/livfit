import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, type } from "../tokens";

export default function ProgressRing({ size = 100, strokeWidth = 10, progress = 0, color = colors.primary, label, value }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - progress);

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={colors.border} strokeWidth={strokeWidth} fill="none"
          />
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.center}>
            {value !== undefined && <Text style={styles.value}>{value}</Text>}
          </View>
        </View>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  value: { ...type.body, color: colors.text, fontWeight: "700" },
  label: { ...type.caption, color: colors.textMuted, marginTop: 4 },
});
