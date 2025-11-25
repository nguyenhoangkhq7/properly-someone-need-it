import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons"; // 1. Import Icon

// Components
import ProfileHeader from "../components/account/ProfileHeader";
import StatsBalanceSection from "../components/account/StatBalanceSection";
import MenuOptionList, {
  type OptionItem,
} from "../components/account/MenuOptionList";
import colors from "../config/color";
import { useAuth } from "../context/AuthContext";
import type { AccountStackParamList } from "../navigator/AccountNavigator";

// API Imports
import { productApi } from "../api/productApi";
import { orderApi } from "../api/orderApi";

// Định nghĩa Type Status dựa trên Schema của bạn
type ItemStatus = "ACTIVE" | "PENDING" | "SOLD" | "DELETED";

const finalColors = {
  ...colors,
  warning: "#FF9800",
  contact: "#00FFFF", // Màu dùng cho nút Xem Shop
  badgeBg: "#FF3B30",
  badgeText: "#FFFFFF",
};

const accountOptions: OptionItem[] = [
  {
    label: "Thông tin cá nhân",
    icon: "account-circle-outline",
    action: "profile",
  },
  { label: "Địa chỉ giao dịch", icon: "map-marker-radius", action: "address" },
  { label: "Đăng xuất", icon: "logout", action: "logout", isWarning: true },
];

const supportOptions: OptionItem[] = [
  { label: "Trung tâm hỗ trợ", icon: "headset", action: "support" },
  {
    label: "Điều khoản sử dụng",
    icon: "file-document-outline",
    action: "terms",
  },
];

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const navigation =
    useNavigation<StackNavigationProp<AccountStackParamList>>();

  const [counts, setCounts] = useState({
    sellerOrders: 0,
    buyerOrders: 0,
    sellingItems: 0, // Đếm số sản phẩm PENDING (Chờ duyệt)
  });

  // Logic: Đơn hàng cần xử lý (Pending, Negotiating, Scheduled)
  const isOrderActive = (status: string) => {
    const activeStatuses = ["PENDING", "NEGOTIATING", "MEETUP_SCHEDULED"];
    return activeStatuses.includes(status);
  };

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const fetchBadges = async () => {
        try {
          // 1. Đơn Bán Hàng (Seller Orders)
          const sellerOrders = await orderApi.getSellerOrders({
            userId: user.id,
          });
          const pendingSellerCount = sellerOrders.filter((order) =>
            isOrderActive(order.order.status)
          ).length;

          // 2. Đơn Mua Hàng (Buyer Orders)
          const buyerOrders = await orderApi.getBuyerOrders({
            userId: user.id,
          });
          const pendingBuyerCount = buyerOrders.filter((order) =>
            isOrderActive(order.order.status)
          ).length;

          // 3. Sản Phẩm Đang Bán (Items) - Chỉ tính PENDING (Chờ duyệt)
          const myItems = await productApi.getBySeller(user.id);
          const pendingItemsCount = myItems.filter(
            (item) => item.status === "PENDING"
          ).length;

          setCounts({
            sellerOrders: pendingSellerCount,
            buyerOrders: pendingBuyerCount,
            sellingItems: pendingItemsCount,
          });
        } catch (error) {
          console.warn("Lỗi lấy thông tin badge:", error);
        }
      };

      fetchBadges();
    }, [user])
  );

  // --- 2. HÀM XỬ LÝ XEM SHOP CỦA TÔI ---
  const handleViewMyShop = () => {
    if (!user) return;

    navigation.navigate("ShopScreen", {
      shop: {
        ...user,
        _id: user.id, // ShopScreen cần _id hoặc ownerId
        name: user.fullName || "Shop của tôi",
        avatar: user.avatar,
      },
    });
  };
  // -------------------------------------

  const handleOptionPress = useCallback(
    (item: OptionItem) => {
      if (!user) {
        Alert.alert("Phiên đăng nhập", "Vui lòng đăng nhập lại.");
        return;
      }
      if (item.action === "logout") {
        Alert.alert("Đăng xuất", "Bạn chắc chắn muốn đăng xuất?", [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng xuất", style: "destructive", onPress: logout },
        ]);
        return;
      }
      if (item.action === "profile") {
        navigation.navigate("ProfileEdit");
        return;
      }
      Alert.alert(item.label, "Tính năng sẽ sớm được cập nhật.");
    },
    [logout, navigation, user]
  );

  if (!user) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateTitle}>Phiên đăng nhập đã hết hạn</Text>
        <TouchableOpacity style={styles.reloginButton} onPress={logout}>
          <Text style={styles.reloginText}>Đăng nhập lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Component Nút Badge
  const BadgeButton = ({
    title,
    count,
    onPress,
  }: {
    title: string;
    count: number;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.badgeBtnContainer} onPress={onPress}>
      <View style={styles.badgeBtnLeft}>
        <Text style={styles.badgeBtnText}>{title}</Text>
      </View>

      {/* Chỉ hiện badge khi count > 0 */}
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <ProfileHeader user={user} />
      <StatsBalanceSection user={user} />

      <View style={styles.managementSection}>
        {/* --- 3. NÚT XEM SHOP CỦA TÔI (MỚI) --- */}
        <TouchableOpacity
          style={[styles.badgeBtnContainer, styles.shopBtnContainer]}
          onPress={handleViewMyShop}
        >
          <View style={styles.badgeBtnLeft}>
            <Ionicons
              name="storefront"
              size={20}
              color={finalColors.contact}
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.badgeBtnText, { color: finalColors.contact }]}>
              Xem Shop của tôi
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={finalColors.textSecondary}
          />
        </TouchableOpacity>
        {/* ---------------------------------- */}

        <BadgeButton
          title="Đơn bán hàng"
          count={counts.sellerOrders}
          onPress={() => navigation.navigate("SellerOrders")}
        />

        <BadgeButton
          title="Đơn mua hàng"
          count={counts.buyerOrders}
          onPress={() => navigation.navigate("BuyerOrders")}
        />

        <BadgeButton
          title="Sản phẩm của tôi"
          count={counts.sellingItems}
          onPress={() => navigation.navigate("MySellingItems")}
        />
      </View>

      <MenuOptionList
        title="Tài khoản"
        list={accountOptions}
        onPressItem={handleOptionPress}
      />
      <MenuOptionList
        title="Hỗ trợ"
        list={supportOptions}
        onPressItem={handleOptionPress}
      />

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
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: finalColors.background,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: finalColors.text,
    marginBottom: 12,
  },
  reloginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: finalColors.primary,
  },
  reloginText: {
    color: finalColors.background,
    fontWeight: "600",
    fontSize: 16,
  },
  managementSection: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 12,
    gap: 10,
  },
  badgeBtnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: finalColors.surface,
    borderWidth: 1,
    borderColor: finalColors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Style riêng cho nút Shop
  shopBtnContainer: {
    borderColor: finalColors.contact,
    borderWidth: 1,
    marginBottom: 4,
  },
  badgeBtnLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeBtnText: {
    color: finalColors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: finalColors.badgeBg,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: finalColors.badgeText,
    fontSize: 11,
    fontWeight: "bold",
  },
  bottomSpacer: {
    height: 70,
    backgroundColor: finalColors.background,
  },
});
