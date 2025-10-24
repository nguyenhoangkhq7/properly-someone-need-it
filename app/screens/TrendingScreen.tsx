import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../config/color";

export default function TrendingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sản phẩm bán chạy 🔥</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  text: { color: colors.text, fontSize: 18 },
});
