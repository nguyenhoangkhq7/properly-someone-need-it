import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import colors from "../config/color";

export default function OrderSuccessScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt hàng thành công!</Text>
      {orderId ? (
        <Text style={styles.subtitle}>Mã đơn: {orderId}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("HomeStack", { screen: "HomeScreen" })}
      >
        <Text style={styles.buttonText}>Về trang chủ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    color: colors.background,
    fontWeight: "600",
    fontSize: 14,
  },
});
