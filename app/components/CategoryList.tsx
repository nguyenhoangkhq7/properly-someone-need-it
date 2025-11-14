import React from "react";
import {
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import colors from "../config/color";
import { useNavigation } from "@react-navigation/native";

export interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryListProps {
  categories: Category[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  const navigation=useNavigation<any>();
  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={() => {
        navigation.navigate("HomeStack", {
          screen: "SearchResults",
          params: { category: item.name },
        });
      }}>
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Danh mục</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoriesList: { paddingHorizontal: 12 },
  categoryItem: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 70,
  },
  categoryIcon: { fontSize: 32, marginBottom: 8 },
  categoryName: { color: colors.text, fontSize: 12, textAlign: "center" },
});

export default CategoryList;
