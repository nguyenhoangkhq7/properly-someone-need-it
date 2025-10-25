import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground,
  FlatList,
} from "react-native";
import colors from "../config/color";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { trendingProducts } from "../data/products";
import ProductItem from "../components/ProductItem"; // component dùng chung
import ReviewCard from "../components/ReviewCard";
import type { HomeStackParamList } from "../navigator/HomeNavigator";

const { width } = Dimensions.get("window");
const PRODUCT_CARD_WIDTH = (width - 40) / 3 - 10;
const STAR_COLOR = colors.accent;
const OUTLINE_BUTTON_COLOR = colors.primary;

type ShopScreenRouteProp = RouteProp<HomeStackParamList, "ShopScreen">;
type Props = { route: ShopScreenRouteProp };

// Component Nút Viền
const OutlineButton = ({ text }: { text: string }) => (
  <TouchableOpacity style={styles.outlineButton}>
    <Text style={styles.outlineButtonText}>{text}</Text>
  </TouchableOpacity>
);

// Component Rating Bar
const RatingBar = ({
  label,
  percentage,
  count,
}: {
  label: string;
  percentage: number | `${number}%`;
  count: number;
}) => (
  <View style={styles.ratingBarRow}>
    <Text style={styles.ratingBarLabel}>{label}</Text>
    <View style={styles.progressBarBg}>
      <View
        style={[
          styles.progressBarFg,
          { width: percentage, backgroundColor: STAR_COLOR },
        ]}
      />
    </View>
    <Text style={styles.ratingBarCount}>({count})</Text>
  </View>
);

export default function ShopScreen({ route }: Props) {
  const { shop } = route.params; // nhận shop từ props
  const navigation = useNavigation();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Header với nút back */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Ảnh bìa */}
        <ImageBackground
          source={{
            uri:
              shop.avatar ||
              "https://placehold.co/600x250/11120F/F6FF00?text=Cover",
          }}
          style={styles.coverImage}
        />

        {/* Nội dung chính */}
        <View style={styles.mainContent}>
          {/* Thẻ thông tin shop */}
          <View style={styles.shopInfoCard}>
            <Image
              source={require("../../assets/peopple.jpg")}
              style={styles.shopAvatar}
            />
            <Text style={styles.shopName}>{shop.name}</Text>
            <Text style={styles.shopStats}>
              {shop.totalProducts} Sản phẩm • {shop.sold} Đã bán
            </Text>
            <View style={styles.shopStars}>
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  name="star"
                  size={16}
                  color={i < shop.rating ? STAR_COLOR : colors.border}
                />
              ))}
              <Text style={styles.shopRatingText}>({shop.rating}/5)</Text>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <MaterialIcon
                name="message-reply-text-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={styles.badgeText}>Phản hồi nhanh</Text>
            </View>
            <View style={styles.badge}>
              <MaterialIcon
                name="truck-fast-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={styles.badgeText}>Gửi nhanh</Text>
            </View>
            <View style={styles.badge}>
              <MaterialIcon
                name="shield-check-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text style={styles.badgeText}>Đáng tin cậy</Text>
            </View>
          </View>

          <OutlineButton text={`XEM TẤT CẢ SẢN PHẨM (${shop.totalProducts})`} />
        </View>

        <View style={styles.divider} />

        {/* Về shop*/}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Về Tuấn Phú</Text>
          <Text style={styles.descriptionText}>
            "Mình không muốn những món đồ còn giá trị phải nằm yên. Nếu nó có
            thể phục vụ cho người khác, thì..."
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Đánh giá */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            <Text style={styles.totalRatingText}>Tổng cộng: 4</Text>
          </View>
          <View style={styles.overallRating}>
            <Icon name="star" size={20} color={STAR_COLOR} />
            <Text style={styles.overallRatingValue}>5.0</Text>
          </View>
          <RatingBar label="5 sao" percentage="100%" count={4} />
          <RatingBar label="4 sao" percentage="0%" count={0} />
          <RatingBar label="3 sao" percentage="0%" count={0} />
          <RatingBar label="2 sao" percentage="0%" count={0} />
          <RatingBar label="1 sao" percentage="0%" count={0} />
        </View>

        {/* Danh sách đánh giá */}
        <ReviewCard
          avatar={require("../../assets/peopple.jpg")}
          name="Gogo Book Store"
          date="20/10/2025 21:00"
          productImage={require("../../assets/laptop.jpg")}
          productName="Laptop - Chín Mươi Ba"
        />
        <ReviewCard
          avatar={require("../../assets/peopple.jpg")}
          name="Toan Ho"
          date="10/10/2025 15:00"
          productImage={require("../../assets/laptop.jpg")}
          productName="Laptop - Dốc hết trái tim"
        />
        <ReviewCard
          avatar={require("../../assets/peopple.jpg")}
          name="No Name"
          date="07/10/2025 15:02"
          productImage={require("../../assets/laptop.jpg")}
          productName="Laptop"
          reviewText="Khác hàng mới mỗi cái seal"
          tags={["Giao hàng nhanh", "Giá cả phù hợp", "Người bán đáng tin cậy"]}
        />

        <View style={styles.section}>
          <OutlineButton text="TẤT CẢ ĐÁNH GIÁ" />
        </View>

        <View style={styles.divider} />

        {/* Sản phẩm từ người bán này */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm từ người bán này</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            <FlatList
              data={trendingProducts}
              renderItem={({ item }) => (
                <ProductItem product={item} horizontal />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 12 }}
            />
          </View>
          <OutlineButton text="HIỂN THỊ THÊM" />
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>
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
    position: "absolute",
    top: StatusBar.currentHeight || 0,
    left: 0,
    zIndex: 10,
  },
  headerButton: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)", // Nền mờ
    borderRadius: 20,
    margin: 10,
  },
  // Ảnh bìa
  coverImage: {
    width: "100%",
    height: 220,
    backgroundColor: colors.surface,
  },
  // Nội dung chính & Thẻ shop
  mainContent: {
    padding: 15,
    backgroundColor: colors.surface, // Nền cho phần nội dung nổi
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  shopInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginTop: -80, // Kéo thẻ nổi lên trên ảnh bìa
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 5,
    shadowColor: "#000",
  },
  shopAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
    marginTop: -40, // Kéo avatar nổi lên trên thẻ
    backgroundColor: colors.background,
  },
  shopName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  shopStats: {
    color: colors.textSecondary,
    fontSize: 14,
    marginVertical: 4,
  },
  shopStars: {
    flexDirection: "row",
    alignItems: "center",
  },
  shopRatingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  // Badges
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  badge: {
    alignItems: "center",
    flex: 1,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  // Nút viền
  outlineButton: {
    borderWidth: 1,
    borderColor: OUTLINE_BUTTON_COLOR,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  outlineButtonText: {
    color: OUTLINE_BUTTON_COLOR,
    fontSize: 14,
    fontWeight: "bold",
  },
  // Section chung
  divider: {
    height: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  section: {
    padding: 15,
    backgroundColor: colors.surface,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  descriptionText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  seeAllText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  // Đánh giá
  totalRatingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  overallRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  overallRatingValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  ratingBarLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    width: 50,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginHorizontal: 8,
  },
  progressBarFg: {
    height: 6,
    borderRadius: 3,
  },
  ratingBarCount: {
    color: colors.textSecondary,
    fontSize: 13,
    width: 30,
    textAlign: "right",
  },

  // Lưới sản phẩm
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: PRODUCT_CARD_WIDTH, // Ảnh vuông
  },
  productInfo: {
    padding: 8,
  },
  productPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  productTag: {
    backgroundColor: colors.accent,
    borderRadius: 5,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  productTagText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: "bold",
  },
});
