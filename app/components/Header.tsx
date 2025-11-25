import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import colors from "../config/color";

const Header: React.FC = () => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoContainer}>
        {/* Tên App */}
        <Text style={styles.appName}>PSNI</Text>

        {/* Đường gạch đứng trang trí */}
        <View style={styles.verticalDivider} />

        {/* Slogan / Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Properly</Text>
          <Text style={styles.subtitle}>someone needs it</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.background || "#FFFFFF", // Đảm bảo nền trắng
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)", // Viền mờ tinh tế
    // Tạo đổ bóng (Shadow) để Header nổi lên
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  appName: {
    fontSize: 28, // Tăng kích thước để làm điểm nhấn
    fontWeight: "900", // Đậm nhất có thể
    color: colors.primary,
    letterSpacing: 1, // Giãn chữ nhẹ tạo cảm giác sang trọng
  },
  verticalDivider: {
    width: 1,
    height: 24, // Chiều cao đường gạch
    backgroundColor: "#E0E0E0", // Màu xám nhạt
    marginHorizontal: 12, // Khoảng cách 2 bên
  },
  subtitleContainer: {
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 10,
    color: "#777", // Màu xám trung tính
    fontWeight: "500",
    textTransform: "uppercase", // Viết hoa toàn bộ trông gọn gàng hơn
    letterSpacing: 0.5,
    lineHeight: 12,
  },
});

export default Header;
