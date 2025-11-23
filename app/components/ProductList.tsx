import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import colors from "../config/color";
import type { Item } from "../types/Item";
import type { ItemWithDistance } from "../types/Item"; // Giả sử bạn để type ở đây
import ProductItem from "./ProductItem";

interface Props {
  title: string;
  // Cho phép nhận cả Item thường và Item có khoảng cách
  products: Array<Item | ItemWithDistance>;
  horizontal?: boolean;
  onSeeAll?: () => void;
}

const SPACING = 12; // Khoảng cách giữa các item
const PADDING_H = 16; // Padding lề màn hình (đồng bộ với Header)

const ProductList: React.FC<Props> = ({
  title,
  products,
  horizontal = false,
  onSeeAll,
}) => {
  return (
    <View style={styles.section}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        // QUAN TRỌNG: Thay đổi key để FlatList biết cần render lại cấu trúc cột khi props horizontal đổi
        key={horizontal ? "h" : "v"}
        data={products}
        renderItem={({ item }) => (
          <View
            style={
              horizontal ? styles.horizontalItemWrapper : styles.gridItemWrapper
            }
          >
            <ProductItem product={item as Item} horizontal={horizontal} />
          </View>
        )}
        keyExtractor={(item) => item._id}
        // Cấu hình hướng scroll
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        // Cấu hình Grid (Chỉ dùng khi không horizontal)
        numColumns={horizontal ? undefined : 2}
        // Styling container
        contentContainerStyle={[
          styles.listContainer,
          horizontal
            ? { paddingHorizontal: PADDING_H }
            : { paddingHorizontal: PADDING_H },
        ]}
        // Styling cho Grid (khoảng cách giữa 2 cột)
        columnWrapperStyle={horizontal ? undefined : styles.columnWrapper}
        // Khoảng cách giữa các dòng (cho Grid) hoặc các cột (cho Horizontal)
        ItemSeparatorComponent={() => (
          <View style={{ width: SPACING, height: SPACING }} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24, // Tăng khoảng cách dưới để thoáng hơn
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING_H, // ĐỒNG BỘ: 16px
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18, // Tăng nhẹ để nổi bật tiêu đề
    fontWeight: "700",
  },
  seeAll: {
    color: colors.neonSoft, // Hoặc colors.primary
    fontSize: 14,
    fontWeight: "500",
  },

  // Container chung của list
  listContainer: {
    // Padding bottom để shadow của item dưới cùng không bị cắt
    paddingBottom: 8,
  },

  // Dùng cho Grid (2 cột)
  columnWrapper: {
    justifyContent: "space-between", // Đẩy 2 item ra 2 bên
    gap: SPACING, // (React Native 0.71+) Giúp khoảng cách giữa các cột đều tăm tắp
  },

  // Wrapper để đảm bảo kích thước item trong Grid
  gridItemWrapper: {
    flex: 1, // Để item tự giãn ra lấp đầy cột
    maxWidth: "48%", // Đảm bảo 2 cột không bị dính vào nhau (khi không dùng gap)
  },

  horizontalItemWrapper: {
    // Không cần style đặc biệt nếu ProductItem đã có width cố định
  },
});

export default ProductList;
