import React, { useMemo } from "react";
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

const { width } = Dimensions.get("window");
const numColumns = 3;
const listPadding = 16;
const itemGap = 16;

const itemSize =
  (width - listPadding * 2 - itemGap * (numColumns - 1)) / numColumns;

type CategoryTarget =
  | { type: "category"; value: string }
  | { type: "query"; value: string };

type CategoryCard = {
  id: string;
  label: string;
  icon: string;
  target: CategoryTarget;
};

// Da dang danh muc: ket hop filter theo category va goi y tim kiem tu do (chi thiet bi dien tu)
const curatedCategories: CategoryCard[] = [
  {
    id: "phone",
    label: "Dien thoai",
    icon: "\u{1F4F1}",
    target: { type: "category", value: "PHONE" },
  },
  {
    id: "laptop",
    label: "Laptop",
    icon: "\u{1F4BB}",
    target: { type: "category", value: "LAPTOP" },
  },
  {
    id: "tablet",
    label: "Tablet",
    icon: "\u{1F4F2}",
    target: { type: "category", value: "TABLET" },
  },
  {
    id: "watch",
    label: "Dong ho",
    icon: "\u231A",
    target: { type: "category", value: "WATCH" },
  },
  {
    id: "audio",
    label: "Tai nghe / Loa",
    icon: "\u{1F3A7}",
    target: { type: "category", value: "HEADPHONE" },
  },
  {
    id: "accessory",
    label: "Phu kien",
    icon: "\u{1F392}",
    target: { type: "category", value: "ACCESSORY" },
  },
  {
    id: "camera",
    label: "May anh",
    icon: "\u{1F4F7}",
    target: { type: "query", value: "may anh" },
  },
  {
    id: "console",
    label: "Console & game",
    icon: "\u{1F3AE}",
    target: { type: "query", value: "console game" },
  },
  {
    id: "smarthome",
    label: "Nha thong minh",
    icon: "\u{1F3E0}",
    target: { type: "query", value: "smarthome" },
  },
  {
    id: "tv",
    label: "TV / Man hinh",
    icon: "\u{1F4FA}",
    target: { type: "query", value: "tv man hinh" },
  },
  {
    id: "pc",
    label: "PC & linh kien",
    icon: "\u{1F5A5}",
    target: { type: "query", value: "linh kien pc" },
  },
  {
    id: "other",
    label: "Khac",
    icon: "\u2734",
    target: { type: "category", value: "OTHER" },
  },
];

export default function CategoryScreen() {
  const navigation = useNavigation<any>();

  const categories = useMemo(() => curatedCategories, []);

  const renderCategoryItem = ({ item }: { item: CategoryCard }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (item.target.type === "category") {
          navigation.navigate("HomeStack", {
            screen: "SearchResults",
            params: { category: item.target.value },
          });
          return;
        }
        navigation.navigate("HomeStack", {
          screen: "SearchResults",
          params: { query: item.target.value },
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
        <Text style={styles.headerTitle}>Danh muc</Text>
        <Text style={styles.headerSubtitle}>
          Chon nhanh hoac nhan de tim goi y
        </Text>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        style={styles.list}
        contentContainerStyle={{ paddingHorizontal: listPadding }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
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
  headerSubtitle: {
    color: colors.textSecondary,
    marginTop: 6,
    fontSize: 13,
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
