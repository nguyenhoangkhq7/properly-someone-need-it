import React, { useCallback } from "react";
import { Alert, ScrollView, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import ProfileHeader from "../components/account/ProfileHeader";
import StatsBalanceSection from "../components/account/StatBalanceSection";
import MenuOptionList, { type OptionItem } from "../components/account/MenuOptionList";
import colors from "../config/color";
import { useAuth } from "../context/AuthContext";
import type { AccountStackParamList } from "../navigator/AccountNavigator";

const finalColors = {
  ...colors,
  warning: "#FF9800",
  contact: "#00FFFF",
};

const accountOptions: OptionItem[] = [
  { label: "Thông tin cá nhân", icon: "account-circle-outline", action: "profile" },
  { label: "Địa chỉ giao dịch", icon: "map-marker-radius", action: "address" },
  { label: "Đăng xuất", icon: "logout", action: "logout", isWarning: true },
];

const supportOptions: OptionItem[] = [
  { label: "Trung tâm hỗ trợ", icon: "headset", action: "support" },
  { label: "Điều khoản sử dụng", icon: "file-document-outline", action: "terms" },
];

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<StackNavigationProp<AccountStackParamList>>();

  const handleOptionPress = useCallback(
    (item: OptionItem) => {
      if (item.action === "logout") {
        Alert.alert("Đăng xuất", "Bạn chắc chắn muốn đăng xuất?", [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng xuất",
            style: "destructive",
            onPress: async () => {
              try {
                await logout();
              } catch (error) {
                console.error("Logout failed", error);
              }
            },
          },
        ]);
        return;
      }

      Alert.alert(item.label, "Tính năng sẽ sớm được cập nhật.");
    },
    [logout]
  );

  return (
    <ScrollView style={styles.container}>
      <ProfileHeader user={user} />
      <StatsBalanceSection user={user} />
{/* --Phúc Vinh-- */}

      {/* Nút chuyển sang trang Đơn bán hàng */}
      <TouchableOpacity
        style={styles.sellerOrdersButton}
        onPress={() => navigation.navigate("SellerOrders")}
      >
        <Text style={styles.sellerOrdersText}>Đơn bán hàng</Text>
      </TouchableOpacity>

      {/* Nút chuyển sang trang Đơn mua hàng */}
      <TouchableOpacity
        style={styles.sellerOrdersButton}
        onPress={() => navigation.navigate("BuyerOrders")}
      >
        <Text style={styles.sellerOrdersText}>Đơn mua hàng</Text>
      </TouchableOpacity>

      {/* Nút hiển thị danh sách sản phẩm đang bán */}
      <TouchableOpacity
        style={styles.sellerOrdersButton}
        onPress={() => navigation.navigate("MySellingItems")}
      >
        <Text style={styles.sellerOrdersText}>Sản phẩm đang bán</Text>
      </TouchableOpacity>

{/* --End Phúc Vinh-- */}

      <MenuOptionList title="Tài khoản" list={accountOptions} onPressItem={handleOptionPress} />
      <MenuOptionList title="Hỗ trợ" list={supportOptions} onPressItem={handleOptionPress} />

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: finalColors.background,
    padding: 8,
  },
  sellerOrdersButton: {
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: finalColors.surface,
    borderWidth: 1,
    borderColor: finalColors.primary,
  },
  sellerOrdersText: {
    color: finalColors.primary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 70,
    backgroundColor: finalColors.background,
  },
});
