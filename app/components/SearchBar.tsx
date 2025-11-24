import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import colors from "../config/color";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  onSearchPress: () => void;
}

const finalColors = {
  ...colors,
  textSecondary: colors.textSecondary || "#BDBDBD",
  border: colors.border || "#232621",
};

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchPress,
}) => {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm sản phẩm..."
        placeholderTextColor={finalColors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={onSearchPress}
      />
      <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
        <Text style={styles.searchButtonText}>Tìm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 8,
    backgroundColor: finalColors.background,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: finalColors.text,
    fontSize: 16,
    backgroundColor: finalColors.surface,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 0,
  },
  searchButton: {
    backgroundColor: finalColors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchButtonText: {
    color: finalColors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SearchBar;
