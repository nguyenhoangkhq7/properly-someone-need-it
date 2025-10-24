import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RootTabParamList } from "../navigator/AppNavigator";
import colors from "../config/color";

const BottomNav: React.FC = () => {
  // 👇 Lấy navigation object để chuyển trang
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  return (
    <View style={styles.container}>
      {/* Trang chủ */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.icon}>🏠</Text>
        <Text style={styles.label}>Trang chủ</Text>
      </TouchableOpacity>

      {/* Danh mục */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("Category")}
      >
        <Text style={styles.icon}>📋</Text>
        <Text style={styles.label}>Danh mục</Text>
      </TouchableOpacity>

      {/* Nút giữa */}
      <View style={styles.centerWrap}>
        <TouchableOpacity style={styles.centerBtn}>
          <Text style={styles.centerIcon}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Chat */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("ChatStack")}
      >
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.label}>Chat</Text>
      </TouchableOpacity>

      {/* Tài khoản */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("Account")}
      >
        <Text style={styles.icon}>👤</Text>
        <Text style={styles.label}>Tài khoản</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 78,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 6,
  },
  item: { alignItems: "center", width: 64 },
  icon: { fontSize: 20, color: colors.textSecondary },
  label: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  centerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    top: -28,
  },
  centerBtn: {
    backgroundColor: colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.surface,
    elevation: 6,
  },
  centerIcon: { fontSize: 22, color: colors.surface, fontWeight: "800" },
});

export default BottomNav;
