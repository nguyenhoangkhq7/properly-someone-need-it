// File: components/FilterSortBar.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../config/color';

interface FilterSortBarProps {
    totalResults: number;
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
    sortType: string;
    setSortType: (sort: string) => void;
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
    setSortType 
}) => {
    const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);

    const handleSortChange = (newSortType: string) => {
        setSortType(newSortType);
        setShowSortDropdown(false);
    };

    const getSortTitle = () => {
        switch (sortType) {
            case 'priceAsc':
                return 'Giá thấp nhất';
            case 'priceDesc':
                return 'Giá cao nhất';
            default:
                return 'Sắp xếp theo';
        }
    };

    return (
        <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
                Kết quả tìm kiếm ({totalResults} Sản phẩm)
            </Text>
            
            <View style={styles.filterSortRow}>
                {/* Nút 0đ */}
                <TouchableOpacity
                    style={[
                        styles.smallFilterBtn,
                        activeFilter === "zeroFee" && styles.activeFilterBtn,
                    ]}
                    onPress={() => setActiveFilter(activeFilter === "zeroFee" ? "all" : "zeroFee")}
                >
                    <Text style={activeFilter === "zeroFee" ? styles.activeFilterText : styles.filterText}>
                        0đ
                    </Text>
                </TouchableOpacity>

                {/* Nút Miễn phí vận chuyển */}
                <TouchableOpacity
                    style={[
                        styles.smallFilterBtn,
                        activeFilter === "freeShip" && styles.activeFilterBtn,
                    ]}
                    onPress={() => setActiveFilter(activeFilter === "freeShip" ? "all" : "freeShip")}
                >
                    <Text style={activeFilter === "freeShip" ? styles.activeFilterText : styles.filterText}>
                        Miễn phí vận chuyển
                    </Text>
                </TouchableOpacity>
                
                {/* Dropdown Sắp xếp - Đẩy sang phải */}
                <View style={styles.sortDropdownContainer}>
                    <TouchableOpacity
                        style={[
                            styles.sortBtn, 
                            // Tăng nhẹ khoảng cách khi dropdown đang mở
                            showSortDropdown && {borderColor: finalColors.primary} 
                        ]} 
                        onPress={() => setShowSortDropdown(!showSortDropdown)}
                    >
                        <Text style={[styles.filterText, sortType !== 'default' && {fontWeight: '700'}]}>{getSortTitle()}</Text>
                        <Feather name="chevron-down" size={16} color={finalColors.text} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    {showSortDropdown && (
                        <View style={styles.dropdownMenu}>
                            <TouchableOpacity 
                                style={styles.dropdownItem} 
                                onPress={() => handleSortChange('priceAsc')}
                            >
                                <Text style={styles.dropdownItemText}>Giá thấp nhất</Text>
                                {sortType === 'priceAsc' && <Feather name="check" size={16} color={finalColors.primary} />}
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.dropdownItem, { borderBottomWidth: 0 }]} 
                                onPress={() => handleSortChange('priceDesc')}
                            >
                                <Text style={styles.dropdownItemText}>Giá cao nhất</Text>
                                {sortType === 'priceDesc' && <Feather name="check" size={16} color={finalColors.primary} />}
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
        // Giảm margin dưới để sát với thanh lọc hơn
        marginBottom: 8, 
    },
    filterSortRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'flex-start',
        // Dùng flex-start để các nút lọc nằm sát trái
    },
    smallFilterBtn: {
        backgroundColor: finalColors.surface,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
        marginRight: 8,
        borderWidth: 1,
        borderColor: finalColors.border,
    },
    activeFilterBtn: {
        backgroundColor: finalColors.primary,
        borderColor: finalColors.primary,
    },
    filterText: { color: finalColors.text, fontSize: 13, fontWeight: "500" },
    activeFilterText: { color: finalColors.background, fontSize: 13, fontWeight: "500" },

    sortDropdownContainer: {
        // Đẩy container sắp xếp sang phải hoàn toàn
        marginLeft: 'auto', 
        position: 'relative',
        // Tăng zIndex để đảm bảo Dropdown hiển thị trên FlatList bên dưới
        zIndex: 100, 
    },
    sortBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: finalColors.surface,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: finalColors.border,
    },
    dropdownMenu: {
        position: 'absolute',
        right: 0,
        top: 35, // Cách nút 35px
        backgroundColor: finalColors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: finalColors.border,
        minWidth: 150,
        // Đảm bảo Dropdown không bị ẩn
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: finalColors.border,
    },
    dropdownItemText: {
        color: finalColors.text,
        fontSize: 14,
    },
});

export default FilterSortBar;