import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../config/color";
import Screen from "../components/Screen";
import { productApi } from "../api/productApi";
import type { Item } from "../types/Item";

const { width } = Dimensions.get("window");
const numColumns = 3;
const listPadding = 16;
const itemGap = 16;

const itemSize =
  (width - listPadding * 2 - itemGap * (numColumns - 1)) / numColumns;

const categoryLabel: Record<Item["category"], string> = {
  PHONE: "Điện thoại",
  LAPTOP: "Laptop",
  TABLET: "Tablet",
  WATCH: "Đồng hồ",
  HEADPHONE: "Tai nghe",
  ACCESSORY: "Phụ kiện",
  OTHER: "Khác",
};

const categoryIcon: Record<Item["category"], string> = {
  PHONE: "📱",
  LAPTOP: "💻",
  TABLET: "📲",
  WATCH: "⌚",
  HEADPHONE: "🎧",
  ACCESSORY: "🔌",
  OTHER: "📦",
};

export default function CategoryScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await productApi.getAll();
        setItems(data);
      } catch (e) {
        setItems([]);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<Item["category"]>();
    items.forEach((i) => set.add(i.category));
    return Array.from(set).map((value) => ({
      value,
      label: categoryLabel[value] || value,
      icon: categoryIcon[value] || "📦",
    }));
  }, [items]);

  const renderCategoryItem = ({
    item,
  }: {
    item: { value: Item["category"]; label: string; icon: string };
  }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        navigation.navigate("HomeStack", {
          screen: "SearchResults",
          params: { category: item.value },
        });
      }}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <Text style={styles.nameText} numberOfLines={2}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Screen style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục</Text>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.value}
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
