import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import colors from "../config/color";
import { categories, Category } from "../data/categories"; // ✅ Import data của bạn
import Screen from "../components/Screen";

// --- Tính toán kích thước cho Grid 3 cột ---
const { width } = Dimensions.get("window");
const numColumns = 3;
const listPadding = 16; // Padding 16 hai bên
const itemGap = 16; // Khoảng cách 16 giữa các item

// (Tổng chiều rộng - Tổng padding 2 bên - Tổng khoảng cách giữa các item) / số cột
const itemSize =
  (width - listPadding * 2 - itemGap * (numColumns - 1)) / numColumns;
// ---

export default function CategoryScreen() {
  // Hàm render cho mỗi mục trong FlatList
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        // Thêm hành động khi nhấn vào (ví dụ: navigate)
        console.log("Pressed:", item.name);
      }}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <Text style={styles.nameText} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Screen style={styles.safeArea}>
      {/* 1. Header tùy chỉnh */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục</Text>
        {/* Bạn có thể thêm Icon tìm kiếm ở đây nếu muốn */}
      </View>

      {/* 2. Danh sách dạng Grid */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        style={styles.list}
        // Áp dụng padding cho toàn bộ danh sách
        contentContainerStyle={{ paddingHorizontal: listPadding }}
        // Tạo khoảng cách giữa các cột
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background, // Nền than chì
  },
  header: {
    paddingHorizontal: listPadding,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    color: colors.text, // Chữ trắng
    fontSize: 28,
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  // --- Style cho từng mục ---
  itemContainer: {
    width: itemSize,
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: itemSize, // Kích thước hình tròn
    height: itemSize,
    borderRadius: itemSize / 2, // Biến thành hình tròn
    backgroundColor: colors.surface, // Nền xám tối (giống card)
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12, // Khoảng cách tới chữ
  },
  iconText: {
    fontSize: itemSize * 0.5, // Kích thước emoji vừa vặn
  },
  nameText: {
    color: colors.textSecondary, // Chữ xám nhạt
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
