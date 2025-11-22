import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../config/color";

type BottomNavProps = {
  state: any;
  navigation: any;
};

const BottomNav: React.FC<BottomNavProps> = ({ state, navigation }) => {
  const currentTab = state.routes[state.index];

  // 🟦 Lấy màn hiện tại trong nested stack
  const nestedRoute =
    currentTab.state?.routes?.[currentTab.state.index]?.name || currentTab.name;

  // 🛑 Danh sách các màn cần ẩn bottom nav
  const hiddenRoutes = [
    "ChatRoom",
    "PostProduct",
    "PostProductDetail",
    "ShippingDetailScreen",
    "Center",
    "MapPickerScreen"
  ];

  // 🔥 Nếu tên màn nằm trong hiddenRoutes → ẩn tab bar
  if (hiddenRoutes.includes(nestedRoute)) {
    return null;
  }

  const tabs = [
    { name: "HomeStack", label: "Trang chủ", icon: "🏠" },
    { name: "Category", label: "Danh mục", icon: "📋" },
    { name: "Center", label: "", icon: "📷" },
    { name: "Chat", label: "Chat", icon: "💬" },
    { name: "Account", label: "Tài khoản", icon: "👤" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;

        if (tab.name === "Center") {
          return (
            <View key="center" style={styles.centerWrap}>
              <TouchableOpacity
                style={styles.centerBtn}
                onPress={() => navigation.navigate("Center", {screen:"PostProduct"})}
              >
                <Text style={styles.centerIcon}>📷</Text>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.item}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Text
              style={{
                ...styles.icon,
                color: isFocused ? colors.primary : colors.textSecondary,
              }}
            >
              {tab.icon}
            </Text>
            <Text
              style={{
                ...styles.label,
                color: isFocused ? colors.primary : colors.textSecondary,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
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
  icon: { fontSize: 20 },
  label: { fontSize: 11, marginTop: 2 },
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
