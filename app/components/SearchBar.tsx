import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons"; // ✅ SỬ DỤNG ICON FEATHER
import colors from "../config/color";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  onSearchPress: () => void; // ✅ THÊM PROP ĐIỀU HƯỚNG
}

const finalColors = {
    ...colors,
    textSecondary: colors.textSecondary || "#BDBDBD",
    border: colors.border || "#232621",
};

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchPress, // ✅ SỬ DỤNG PROP
}) => {
  return (
    <View style={styles.searchContainer}>
      {/* Icon Lọc (Tương tự như trong hình ảnh) */}
      <TouchableOpacity style={styles.filterButton}>
        <Feather name="filter" size={20} color={finalColors.primary} />
      </TouchableOpacity>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm bằng từ khóa..."
        placeholderTextColor={finalColors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={onSearchPress} // ✅ Kích hoạt tìm kiếm khi nhấn Enter/Go
      />
      
      {/* Nút GO */}
      <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
        <Text style={styles.searchButtonText}>GO</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0, // Đã xóa padding ngang vì Homescreen đã có padding 16
    paddingVertical: 8, 
    backgroundColor: finalColors.background,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: finalColors.border,
    backgroundColor: finalColors.surface,
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
    // Bỏ border để trông liền mạch với nền
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
    fontWeight: 'bold',
  },
});

export default SearchBar;