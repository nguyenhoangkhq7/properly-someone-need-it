import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // 👈 thêm dòng này
import colors from "../config/color";
import { categories, Category } from "../data/categories";
import Screen from "../components/Screen";

const { width } = Dimensions.get("window");
const numColumns = 3;
const listPadding = 16;
const itemGap = 16;

const itemSize =
  (width - listPadding * 2 - itemGap * (numColumns - 1)) / numColumns;

export default function CategoryScreen() {
  const navigation = useNavigation<any>(); // 👈 khởi tạo navigation

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        navigation.navigate("HomeStack", {
          screen: "SearchResults",
          params: { category: item.name },
        });
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục</Text>
      </View>

      {/* Danh sách dạng Grid */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        style={styles.list}
        contentContainerStyle={{ paddingHorizontal: listPadding }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: listPadding,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    width: itemSize,
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: itemSize,
    height: itemSize,
    borderRadius: itemSize / 2,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  iconText: {
    fontSize: itemSize * 0.5,
  },
  nameText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
