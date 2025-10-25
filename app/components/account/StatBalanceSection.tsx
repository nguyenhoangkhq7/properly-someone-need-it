import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import colors from "../../config/color"; // Giả định đường dẫn này

const finalColors = {
    ...colors,
    warning: "#FF9800",
    contact: "#00FFFF",
};

export default function StatsBalanceSection() {
  return (
    <>
      {/* Stats */}
      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsRow}>
          {["Yêu thích", "Đang bán", "Đã bán", "Độ tin cậy"].map((label, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    marginBottom: 20,
    backgroundColor: finalColors.surface,
    borderRadius: 20,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: finalColors.border,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12 },
  statItem: { alignItems: "center" },
  statNumber: { color: finalColors.primary, fontSize: 24, fontWeight: "bold" },
  statLabel: { color: finalColors.textSecondary, marginTop: 4, fontSize: 13 },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: finalColors.surface,
    marginHorizontal: 12,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: finalColors.border,
  },
  balanceText: { color: finalColors.textSecondary, fontSize: 14 },
  balanceAmount: { color: finalColors.primary, fontSize: 32, fontWeight: "bold", marginTop: 4 },
  scoreContainer: { alignItems: "flex-end" },
  scoreValue: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  scoreAmount: { color: finalColors.primary, fontSize: 24, fontWeight: "bold" },
});