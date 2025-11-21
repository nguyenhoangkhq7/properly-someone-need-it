import React, { useState } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity, Text } from "react-native";
// IMPORT TẤT CẢ CÁC COMPONENT CON
import ProfileHeader from "../components/account/ProfileHeader";
import StatsBalanceSection from "../components/account/StatBalanceSection";
import MenuOptionList from "../components/account/MenuOptionList";
import { useNavigation } from "@react-navigation/native";

import colors from "../config/color"; // Import màu gốc

// Khai báo thêm màu phụ cho style của screen chính
const finalColors = {
    ...colors,
    warning: "#FF9800", 
    contact: "#00FFFF",
};

// Ánh xạ icon cho dữ liệu
const iconMap = {
    clock: "timer-sand", send: "truck-fast", loader: "progress-alert", user: "account",
    "dollar-sign": "wallet", info: "store-cog", "book-open": "book-open-page-variant",
    "help-circle": "help-circle-outline", shield: "shield-check-outline", trello: "sitemap",
    "edit-3": "alert-circle", "phone-call": "eye-circle", "check-circle": "account-check",
    settings: "cog", "log-out": "logout", "chevron-right": "chevron-right", zap: "lightning-bolt",
};
const mapIcon = (featherIconName: keyof typeof iconMap): string => {
    return iconMap[featherIconName] || "circle-outline";
};

// Dữ liệu Menu Lists (Cần định nghĩa ở đây vì MenuOptionList là component tái sử dụng)
const optionList1 = [
    { label: "Thông tin Shop", icon: mapIcon("info"), value: "https://oreka.vn/store/d1...", isSeller: true },
];
const optionList2 = [
    { label: "Điều khoản và Hướng dẫn", icon: mapIcon("book-open") },
    { label: "Câu hỏi thường gặp", icon: mapIcon("help-circle") },
    { label: "Đảm bảo cho người bán", icon: mapIcon("shield") },
    { label: "Quy tắc hoạt động", icon: mapIcon("trello") },
    { label: "Đóng góp ý kiến", icon: mapIcon("edit-3"), isWarning: true },
];
const optionList3 = [
    { label: "Xác minh danh tính", icon: mapIcon("check-circle"), rightText: "Chỉ còn 2 bước", isVerification: true },
    { label: "Hồ sơ của tôi", icon: mapIcon("user") },
    { label: "Thiết lập", icon: mapIcon("settings") },
    { label: "Đăng xuất", icon: mapIcon("log-out") },
];


export default function AccountScreen() {
  const [activeTab, setActiveTab] = useState<"BUY" | "SELL">("BUY");
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container}>
      {/* 1. Header */}
      <ProfileHeader />

      {/* 2. Stats & Balance */}
      <StatsBalanceSection />

      {/* Nút xem sản phẩm đang bán */}
      <TouchableOpacity
        style={styles.sellerOrdersButton}
        onPress={() => navigation.navigate("MySellingItems")}
      >
        <Text style={styles.sellerOrdersText}>Sản phẩm đang bán</Text>
      </TouchableOpacity>

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

      {/* 4. Option Lists */}
      <MenuOptionList list={optionList1} />
      <MenuOptionList title="Trung tâm hỗ trợ" list={optionList2} />
      <MenuOptionList title="Tài khoản" list={optionList3} />

      {/* Add some padding at the bottom */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: finalColors.background, 
    padding: 8 
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