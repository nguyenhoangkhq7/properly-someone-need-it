import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "react-native-paper";
import colors from "../../config/color";
import type { AuthUser } from "../../context/AuthContext";

const finalColors = {
  ...colors,
  warning: "#FF9800",
  contact: "#00FFFF",
};

interface ProfileHeaderProps {
  user: AuthUser | null;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = (user?.fullName || user?.email || user?.phone || "?")
    .trim()
    .charAt(0)
    .toUpperCase();
  const fullName = user?.fullName ?? "Người dùng mới";
  const email = user?.email ?? "Chưa cập nhật email";
  const phone = user?.phone ?? "Chưa cập nhật số điện thoại";
  const city = user?.address?.city;
  const district = user?.address?.district;

  return (
    <>
      <View style={styles.topSpacer} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.email}>{email}</Text>
            <Text style={styles.phone}>{phone}</Text>
            {(city || district) && (
              <Text style={styles.location}>
                {[district, city].filter(Boolean).join(", ")}
              </Text>
            )}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topSpacer: {
    height: 20,
    backgroundColor: finalColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: finalColors.surface,
    borderRadius: 20,
    marginHorizontal: 12,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: finalColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: finalColors.background,
  },
  userInfo: {
    justifyContent: "center",
  },
  name: {
    color: finalColors.text,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  email: { color: finalColors.textSecondary, fontSize: 14 },
  phone: { color: finalColors.textSecondary, fontSize: 14 },
  location: { color: finalColors.textSecondary, fontSize: 13, marginTop: 2 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: finalColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: finalColors.border,
  },
  badgeText: {
    color: finalColors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});
