import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import colors from "../config/color";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { RouteProp, useNavigation } from "@react-navigation/native";
import ProductItem from "../components/ProductItem"; // component dùng chung
import { useAuth } from "../context/AuthContext";
import {
  createShopReview,
  fetchShopReviews,
  type ShopReview,
  type ReviewStats,
} from "../api/reviewApi";
import type { HomeStackParamList } from "../navigator/HomeNavigator";
import type { Item } from "../types/Item";
import { productApi } from "../api/productApi";

const { width } = Dimensions.get("window");
const PRODUCT_CARD_WIDTH = (width - 40) / 3 - 10;
const STAR_COLOR = colors.accent;
const OUTLINE_BUTTON_COLOR = colors.primary;

type ShopScreenRouteProp = RouteProp<HomeStackParamList, "ShopScreen">;
type Props = { route: ShopScreenRouteProp };

// Component Nút Viền
const OutlineButton = ({
  text,
  onPress,
}: {
  text: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.outlineButton} onPress={onPress}>
    <Text style={styles.outlineButtonText}>{text}</Text>
  </TouchableOpacity>
);

export default function ShopScreen({ route }: Props) {
  const { shop } = route.params;
  const navigation = useNavigation<any>();
  const { accessToken } = useAuth();

  const sellerId =
    shop?.ownerId ?? shop?.sellerId ?? shop?._id ?? shop?.id ?? null;

  const [reviews, setReviews] = useState<ShopReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ total: 0, averageRating: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const averageRatingLabel = useMemo(() => {
    return stats.averageRating ? stats.averageRating.toFixed(1) : "0.0";
  }, [stats.averageRating]);

  const loadReviews = useCallback(async () => {
    if (!sellerId) {
      setReviews([]);
      setStats({ total: 0, averageRating: 0 });
      setReviewsError("Chưa xác định được người bán để xem đánh giá.");
      return;
    }

    setLoadingReviews(true);
    try {
      const response = await fetchShopReviews(sellerId);
      setReviews(response.reviews);
      setStats(response.stats);
      setReviewsError(null);
    } catch (error) {
      setReviewsError((error as Error).message || "Không thể tải đánh giá");
    } finally {
      setLoadingReviews(false);
    }
  }, [sellerId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleOpenReviewModal = useCallback(() => {
    if (!sellerId) {
      Alert.alert("Không hợp lệ", "Không xác định được người bán để đánh giá");
      return;
    }
    setIsModalVisible(true);
  }, [sellerId]);

  const handleSubmitReview = useCallback(async () => {
    if (!sellerId) {
      Alert.alert("Không hợp lệ", "Không xác định được người bán để đánh giá");
      return;
    }

    if (!accessToken) {
      Alert.alert("Cần đăng nhập", "Bạn cần đăng nhập để viết đánh giá");
      return;
    }

    try {
      setIsSubmitting(true);
      const newReview = await createShopReview(
        {
          sellerId,
          rating: ratingInput,
          comment: commentInput.trim() || undefined,
        },
        accessToken
      );

      setReviews((prev) => [newReview, ...prev]);
      setStats((prev) => {
        const newTotal = prev.total + 1;
        const sum = prev.averageRating * prev.total + ratingInput;
        return { total: newTotal, averageRating: Number((sum / newTotal).toFixed(2)) };
      });

      setCommentInput("");
      setRatingInput(5);
      setIsModalVisible(false);
    } catch (error) {
      const message = (error as Error).message || "Không thể gửi đánh giá";
      Alert.alert("Lỗi", message);
    } finally {
      setIsSubmitting(false);
    }
  }, [sellerId, accessToken, ratingInput, commentInput]);

  const renderReviewItem = useCallback(({ item }: { item: ShopReview }) => {
    const reviewerName = item.reviewerId?.fullName || "Người dùng";
    const createdDate = new Date(item.createdAt);
    const formattedDate = createdDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewAvatar}>
            {item.reviewerId?.avatar ? (
              <Image source={{ uri: item.reviewerId.avatar }} style={styles.reviewAvatarImage} />
            ) : (
              <Text style={styles.reviewAvatarText}>
                {reviewerName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.reviewHeaderInfo}>
            <Text style={styles.reviewName}>{reviewerName}</Text>
            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Icon
                  key={value}
                  name={value <= item.rating ? "star" : "star-outline"}
                  size={14}
                  color={value <= item.rating ? STAR_COLOR : colors.textSecondary}
                />
              ))}
            </View>
          </View>
          <Text style={styles.reviewDate}>{formattedDate}</Text>
        </View>
        {item.comment ? <Text style={styles.reviewComment}>{item.comment}</Text> : null}
      </View>
    );
  }, []);

  const reviewList = useMemo(() => {
    if (loadingReviews) {
      return <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />;
    }

    if (reviewsError) {
      return <Text style={styles.errorText}>{reviewsError}</Text>;
    }

    if (!reviews.length) {
      return <Text style={styles.emptyText}>Chưa có đánh giá nào cho shop này.</Text>;
    }

    return (
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        renderItem={renderReviewItem}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.reviewDivider} />}
      />
    );
  }, [loadingReviews, reviewsError, reviews, renderReviewItem]);

  const ratingPicker = (
    <View style={styles.ratingPicker}>
      {[1, 2, 3, 4, 5].map((value) => (
        <TouchableOpacity key={value} onPress={() => setRatingInput(value)}>
          <Icon
            name={value <= ratingInput ? "star" : "star-outline"}
            size={28}
            color={value <= ratingInput ? STAR_COLOR : colors.textSecondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={{
            uri: shop.avatar || "https://placehold.co/600x250/11120F/F6FF00?text=Cover",
          }}
          style={styles.coverImage}
        />

        <View style={styles.mainContent}>
          <View style={styles.shopInfoCard}>
            <Image source={require("../../assets/peopple.jpg")} style={styles.shopAvatar} />
            <Text style={styles.shopName}>{shop.name}</Text>
            <Text style={styles.shopStats}>
              {shop.totalProducts} Sản phẩm • {shop.sold} Đã bán
            </Text>
            <View style={styles.shopStars}>
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  name={i + 1 <= shop.rating ? "star" : "star-outline"}
                  size={16}
                  color={i + 1 <= shop.rating ? STAR_COLOR : colors.border}
                />
              ))}
              <Text style={styles.shopRatingText}>({shop.rating}/5)</Text>
            </View>
          </View>

          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <MaterialIcon name="message-reply-text-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.badgeText}>Phản hồi nhanh</Text>
            </View>
            <View style={styles.badge}>
              <MaterialIcon name="truck-fast-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.badgeText}>Gửi nhanh</Text>
            </View>
            <View style={styles.badge}>
              <MaterialIcon name="shield-check-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.badgeText}>Đáng tin cậy</Text>
            </View>
          </View>

          <OutlineButton
            onPress={() => navigation.navigate("HomeStack", { screen: "SearchResults" })}
            text={`XEM TẤT CẢ SẢN PHẨM (${shop.totalProducts})`}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Về Tuấn Phú</Text>
          <Text style={styles.descriptionText}>
            "Mình không muốn những món đồ còn giá trị phải nằm yên. Nếu nó có thể phục vụ cho người khác, thì..."
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            <TouchableOpacity onPress={handleOpenReviewModal}>
              <Text style={styles.writeReviewText}>Viết đánh giá</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ratingSummary}>
            <View style={styles.ratingValueWrapper}>
              <Text style={styles.ratingValue}>{averageRatingLabel}</Text>
              <Text style={styles.ratingSuffix}>/5 sao</Text>
            </View>
            <Text style={styles.ratingCountText}>{stats.total} đánh giá</Text>
          </View>
          {reviewList}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm từ người bán này</Text>
            <TouchableOpacity onPress={() => navigation.navigate("HomeStack", { screen: "SearchResults" })}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            <FlatList
              data={trendingProducts}
              renderItem={({ item }) => <ProductItem product={item} horizontal />}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 12 }}
            />
          </View>
          <OutlineButton
            text="HIỂN THỊ THÊM"
            onPress={() => navigation.navigate("HomeStack", { screen: "SearchResults" })}
          />
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Viết đánh giá</Text>
            {ratingPicker}
            <TextInput
              style={styles.modalInput}
              placeholder="Chia sẻ trải nghiệm của bạn"
              placeholderTextColor={colors.textSecondary}
              multiline
              value={commentInput}
              onChangeText={setCommentInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setIsModalVisible(false);
                  setCommentInput("");
                  setRatingInput(5);
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSubmitReview}
                disabled={isSubmitting}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Đánh giá động
  writeReviewText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  ratingValueWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  ratingValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  ratingSuffix: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  ratingCountText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  ratingPicker: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  reviewAvatarImage: {
    width: 40,
    height: 40,
  },
  reviewAvatarText: {
    color: colors.text,
    fontWeight: "bold",
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  reviewName: {
    color: colors.text,
    fontWeight: "600",
  },
  reviewStars: {
    flexDirection: "row",
    marginTop: 4,
  },
  reviewDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  reviewComment: {
    color: colors.text,
    marginTop: 10,
    lineHeight: 20,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  errorText: {
    color: colors.accent,
    textAlign: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
  },

  // Modal viết review
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    color: colors.text,
    marginTop: 8,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: colors.border,
  },
  modalButtonText: {
    color: colors.text,
    fontWeight: "600",
  },
  modalButtonTextPrimary: {
    color: colors.background,
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
