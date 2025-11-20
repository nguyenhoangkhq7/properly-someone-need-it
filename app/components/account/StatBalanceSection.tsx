import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import colors from "../../config/color";
import type { AuthUser } from "../../context/AuthContext";

const finalColors = {
    ...colors,
    warning: "#FF9800",
    contact: "#00FFFF",
};

interface StatsBalanceSectionProps {
  user: AuthUser | null;
}

export default function StatsBalanceSection({ user }: StatsBalanceSectionProps) {
  const stats = [
    { label: "Đánh giá", value: (user?.rating ?? 0).toFixed(1) },
    { label: "Đã bán", value: String(user?.successfulTrades ?? 0) },
    { label: "Nhận xét", value: String(user?.reviewCount ?? 0) },
    { label: "Tin cậy", value: `${user?.trustScore ?? 0}%` },
  ];
  return (
    <>
      {/* Stats */}
      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsRow}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statItem}>
              <Text style={styles.statNumber}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
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