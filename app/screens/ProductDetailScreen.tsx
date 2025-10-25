// screens/ProductDetailScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  FlatList,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../config/color";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { trendingProducts } from "../data/products";
import ProductItem from "../components/ProductItem"; // component dùng chung
import { shop } from "../data/shops";
import type { HomeStackParamList } from "../navigator/HomeNavigator";

const { width } = Dimensions.get("window");

// Định nghĩa type cho route
type ProductDetailScreenRouteProp = RouteProp<
  HomeStackParamList,
  "ProductDetail"
>;

const OtherProductCard = ({
  imageUri,
  price,
}: {
  imageUri: string;
  price: string;
}) => (
  <TouchableOpacity style={styles.otherProductCard}>
    <Image source={{ uri: imageUri }} style={styles.otherProductImage} />
    <View style={styles.otherProductInfo}>
      <Text style={styles.otherProductPrice}>{price}</Text>
      <View style={styles.otherProductTag}>
        <Text style={styles.otherProductTagText}>FREE</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ProductDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { product } = route.params; // Nhận product từ ProductList

  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="heart-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="chatbubble-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>Hiện tất cả ảnh 1/8</Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.section}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>{product.price}</Text>
          {product.discount && (
            <View style={styles.tag}>
              <Icon
                name="shield-checkmark-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.tagText}>{product.discount}</Text>
            </View>
          )}
          {product.originalPrice && <Text>{product.originalPrice}</Text>}
        </View>

        <View style={styles.divider} />

        {/* Details */}
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tình trạng:</Text>
            <Text style={styles.detailValue}>Mới</Text>
            <Icon
              name="information-circle-outline"
              size={16}
              color={colors.textSecondary}
            />
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nhãn hiệu:</Text>
            <Text style={styles.detailValue}>UNIE</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Màu sắc:</Text>
            <Text style={styles.detailValue}>Trắng</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Quantity */}
        <View style={[styles.section, styles.quantitySection]}>
          <Text style={styles.detailLabel}>Số lượng:</Text>
          <View style={styles.quantityStepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => handleQuantityChange(-1)}
            >
              <Text style={styles.stepperText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => handleQuantityChange(1)}
            >
              <Text style={styles.stepperText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.stockText}>1 còn hàng</Text>
        </View>

        <View style={styles.divider} />

        {/* Seller Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người bán</Text>
          <View style={styles.sellerInfo}>
            <Image
              source={require("../../assets/peopple.jpg")}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>Tuấn Phú</Text>
              <Text style={styles.sellerStats}>
                0 Đã bán • 0 Đánh giá (0/5)
              </Text>
            </View>
          </View>
          <View style={styles.sellerButtons}>
            <TouchableOpacity
              style={styles.sellerButton}
              onPress={() => navigation.navigate("ShopScreen", { shop })}
            >
              <Text style={styles.sellerButtonText}>XEM SHOP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sellerButton}>
              <Text style={styles.sellerButtonText}>SẢN PHẨM (70)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Other Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm khác của shop</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={trendingProducts}
            renderItem={({ item }) => <ProductItem product={item} horizontal />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 12 }}
          />
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButtonSecondary}>
          <Icon name="add-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.footerButtonTextSecondary}>YÊU THÍCH</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButtonPrimary}>
          <Text style={styles.footerButtonTextPrimary}>MUA NGAY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerButton: {
    padding: 5,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "bold",
  },
  // Image
  imageContainer: {
    width: width,
    height: width, // Ảnh vuông
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imageCounter: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  imageCounterText: {
    color: colors.text,
    fontSize: 12,
  },
  // Section chung
  section: {
    padding: 15,
    backgroundColor: colors.surface,
  },
  divider: {
    height: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  // Product Info
  productTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 24,
  },
  productPrice: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  tagText: {
    color: colors.primary,
    marginLeft: 6,
    fontSize: 12,
  },
  // Details
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    width: 80,
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    marginRight: 8,
  },
  // Quantity
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityStepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
  },
  stepperButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
  },
  stepperText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  quantityValue: {
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 15,
  },
  stockText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  // Seller
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sellerDetails: {
    marginLeft: 12,
  },
  sellerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  sellerStats: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  sellerButtons: {
    flexDirection: "row",
    marginTop: 15,
  },
  sellerButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  sellerButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "bold",
  },
  // Other Products
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  otherProductCard: {
    width: 150,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    overflow: "hidden",
  },
  otherProductImage: {
    width: 150,
    height: 150,
  },
  otherProductInfo: {
    padding: 8,
  },
  otherProductPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  otherProductTag: {
    backgroundColor: colors.accent,
    borderRadius: 5,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  otherProductTagText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: "bold",
  },
  // Description
  descriptionText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  bulletText: {
    color: colors.text,
    fontSize: 14,
    marginLeft: 8,
    flex: 1, // Cho phép text xuống dòng
  },
  // Footer
  footer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  footerButtonSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRightWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButtonTextSecondary: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  footerButtonPrimary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: colors.primary,
  },
  footerButtonTextPrimary: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "bold",
  },
});
