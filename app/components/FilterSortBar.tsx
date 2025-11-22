// components/FilterSortBar.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "../config/color";

interface FilterSortBarProps {
  totalResults: number;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  sortType: string;
  setSortType: (sort: string) => void;
  nearMe: boolean;
  setNearMe: (v: boolean) => void;
}

const finalColors = {
  ...colors,
  text: colors.text || "#FFFFFF",
  background: colors.background || "#0A0A0A",
  surface: colors.surface || "#1F1F1F",
  primary: colors.primary || "#FF6B00",
  border: colors.border || "#232621",
};

const FilterSortBar: React.FC<FilterSortBarProps> = ({
  totalResults,
  activeFilter,
  setActiveFilter,
  sortType,
  setSortType,
  nearMe,
  setNearMe,
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleSortChange = (newSortType: string) => {
    setSortType(newSortType);
    setShowSortDropdown(false);
  };

  const getSortTitle = () => {
    switch (sortType) {
      case "priceAsc":
        return "Giá thấp nhất";
      case "priceDesc":
        return "Giá cao nhất";
      case "newest":
        return "Mới nhất";
      default:
        return "Sắp xếp theo";
    }
  };

  return (
    <View style={styles.resultsHeader}>
      <Text style={styles.resultsCount}>Kết quả ({totalResults} sản phẩm)</Text>

      <View style={styles.filterSortRow}>
        <TouchableOpacity
          style={[
            styles.smallFilterBtn,
            activeFilter === "zeroPrice" && styles.activeFilterBtn,
          ]}
          onPress={() =>
            setActiveFilter(activeFilter === "zeroPrice" ? "all" : "zeroPrice")
          }
        >
          <Text
            style={
              activeFilter === "zeroPrice"
                ? styles.activeFilterText
                : styles.filterText
            }
          >
            0 đ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallFilterBtn, nearMe && styles.activeFilterBtn]}
          onPress={() => setNearMe(!nearMe)}
        >
          <Text style={nearMe ? styles.activeFilterText : styles.filterText}>
            Gần tôi
          </Text>
        </TouchableOpacity>

        <View style={styles.sortDropdownContainer}>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              showSortDropdown && { borderColor: finalColors.primary },
            ]}
            onPress={() => setShowSortDropdown(!showSortDropdown)}
          >
            <Text
              style={[
                styles.filterText,
                sortType !== "default" && { fontWeight: "700" },
              ]}
            >
              {getSortTitle()}
            </Text>
            <Feather
              name="chevron-down"
              size={16}
              color={finalColors.text}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>

          {showSortDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSortChange("priceAsc")}
              >
                <Text style={styles.dropdownItemText}>Giá thấp nhất</Text>
                {sortType === "priceAsc" && (
                  <Feather name="check" size={16} color={finalColors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSortChange("priceDesc")}
              >
                <Text style={styles.dropdownItemText}>Giá cao nhất</Text>
                {sortType === "priceDesc" && (
                  <Feather name="check" size={16} color={finalColors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                onPress={() => handleSortChange("newest")}
              >
                <Text style={styles.dropdownItemText}>Mới nhất</Text>
                {sortType === "newest" && (
                  <Feather name="check" size={16} color={finalColors.primary} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  resultsHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: finalColors.background,
  },
  resultsCount: {
    color: finalColors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  filterSortRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallFilterBtn: {
    backgroundColor: finalColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: finalColors.border,
  },
  activeFilterBtn: {
    backgroundColor: finalColors.primary,
    borderColor: finalColors.primary,
  },
  filterText: { color: finalColors.text, fontSize: 13, fontWeight: "500" },
  activeFilterText: {
    color: finalColors.background,
    fontSize: 13,
    fontWeight: "600",
  },
  sortDropdownContainer: {
    marginLeft: "auto",
    position: "relative",
    zIndex: 100,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: finalColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: finalColors.border,
  },
  dropdownMenu: {
    position: "absolute",
    right: 0,
    top: 35,
    backgroundColor: finalColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: finalColors.border,
    minWidth: 170,
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: finalColors.border,
  },
  dropdownItemText: {
    color: finalColors.text,
    fontSize: 14,
  },
});

export default FilterSortBar;
