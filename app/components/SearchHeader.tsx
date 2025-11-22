// components/SearchHeader.tsx
import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "../config/color";

interface SearchHeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onSubmit: () => void;
  onBackPress: () => void;
}

const finalColors = {
  ...colors,
  text: colors.text || "#FFFFFF",
  textSecondary: colors.textSecondary || "#BDBDBD",
  background: colors.background || "#0A0A0A",
  surface: colors.surface || "#1F1F1F",
  primary: colors.primary || "#FF6B00",
};

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchText,
  setSearchText,
  onBackPress,
  onSubmit,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={{ paddingRight: 8 }}>
        <Feather name="arrow-left" size={24} color={finalColors.text} />
      </TouchableOpacity>

      <View style={styles.searchBar}>
        <Feather
          name="search"
          size={18}
          color={finalColors.textSecondary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.input}
          placeholder="Tìm kiếm sản phẩm"
          placeholderTextColor={finalColors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
        />
      </View>

      <TouchableOpacity style={styles.goButton} onPress={onSubmit}>
        <Text style={styles.goButtonText}>Tìm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: finalColors.background,
    paddingTop: 40,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: finalColors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 10,
    height: 42,
  },
  input: {
    flex: 1,
    color: finalColors.text,
    fontSize: 15,
    paddingVertical: 0,
    marginVertical: 0,
  },
  goButton: {
    backgroundColor: finalColors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  goButtonText: { color: finalColors.surface, fontWeight: "700", fontSize: 14 },
});

export default SearchHeader;
