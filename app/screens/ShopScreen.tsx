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
import { RouteProp, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import ProductItem from "../components/ProductItem"; // component dùng chung
import { useAuth } from "../context/AuthContext";
import {
  createShopReview,
  fetchShopReviews,
  checkReviewEligibility,
  type ShopReview,
  type ReviewStats,
} from "../api/reviewApi";
import type { HomeStackParamList } from "../navigator/HomeNavigator";
import type { Item } from "../types/Item";
import { productApi } from "../api/productApi";
import { uploadMultipleImages } from "../utils/imageUpload";

const { width } = Dimensions.get("window");
const PRODUCT_CARD_WIDTH = (width - 40) / 3 - 10;
const STAR_COLOR = colors.accent;

type ShopScreenRouteProp = RouteProp<HomeStackParamList, "ShopScreen">;
type Props = { route: ShopScreenRouteProp };

const MAX_REVIEW_IMAGES = 3;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type LocalReviewImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

type EligibilityState = {
  eligible: boolean;
  reason?: string;
  orderId?: string;
  itemId?: string;
  reviewId?: string;
};

export default function ShopScreen({ route }: Props) {
  const { shop } = route.params;
  const navigation = useNavigation<any>();
  const { accessToken } = useAuth();

  const sellerId =
    shop?.ownerId ?? shop?.sellerId ?? shop?._id ?? shop?.id ?? null;
  const coverImageUri =
    shop?.coverImage ||
    shop?.banner ||
    shop?.avatar ||
    "https://placehold.co/600x250/11120F/F6FF00?text=Cover";

  const [reviews, setReviews] = useState<ShopReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    averageRating: 0,
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerItems, setSellerItems] = useState<Item[]>([]);
  const [loadingSellerItems, setLoadingSellerItems] = useState(false);
  const [sellerItemsError, setSellerItemsError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityState>({
    eligible: false,
  });
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [selectedReviewImages, setSelectedReviewImages] = useState<
    LocalReviewImage[]
  >([]);

  const averageRatingLabel = useMemo(() => {
    return stats.averageRating ? stats.averageRating.toFixed(1) : "0.0";
  }, [stats.averageRating]);

  const shopDisplayName = shop?.name ?? shop?.fullName ?? "Shop";
  const shopAvatar =
    shop?.avatar || "https://placehold.co/200x200/11120F/F6FF00?text=Shop";
  const shopRatingValue = Number(shop?.rating ?? stats.averageRating ?? 0);
  const shopTotalProducts = shop?.totalProducts ?? sellerItems.length;
  const shopSold = shop?.sold ?? stats.total;

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

  const refreshEligibility = useCallback(async () => {
    if (!sellerId) {
      setEligibility({
        eligible: false,
        reason: "Không xác định được người bán.",
      });
      return;
    }

    if (!accessToken) {
      setEligibility({
        eligible: false,
        reason: "Đăng nhập để viết đánh giá.",
      });
      return;
    }

    setCheckingEligibility(true);
    try {
      const data = await checkReviewEligibility(sellerId);
      setEligibility(data);
    } catch (error) {
      setEligibility({
        eligible: false,
        reason:
          (error as Error).message || "Không kiểm tra được quyền đánh giá.",
      });
    } finally {
      setCheckingEligibility(false);
    }
  }, [sellerId, accessToken]);

  useEffect(() => {
    refreshEligibility();
  }, [refreshEligibility]);

  const loadSellerItems = useCallback(async () => {
    if (!sellerId) {
      setSellerItems([]);
      setSellerItemsError(null);
      return;
    }

    setLoadingSellerItems(true);
    try {
      const allItems = await productApi.getAll();
      const filtered = (allItems || []).filter(
        (item) => item.sellerId === sellerId
      );
      setSellerItems(filtered);
      setSellerItemsError(null);
    } catch (error) {
      setSellerItemsError("Khong the tai san pham cua nguoi ban nay");
    } finally {
      setLoadingSellerItems(false);
    }
  }, [sellerId]);

  useEffect(() => {
    loadSellerItems();
  }, [loadSellerItems]);

  const handleOpenReviewModal = useCallback(() => {
    if (!sellerId) {
      Alert.alert("Không hợp lệ", "Không xác định được người bán để đánh giá");
      return;
    }

    if (!eligibility.eligible) {
      Alert.alert(
        "Không thể viết đánh giá",
        eligibility.reason || "Bạn cần hoàn tất đơn với shop này trước."
      );
      return;
    }

    setIsModalVisible(true);
  }, [sellerId, eligibility]);

  const handleCloseReviewModal = useCallback(() => {
    setIsModalVisible(false);
    setCommentInput("");
    setRatingInput(5);
    setSelectedReviewImages([]);
  }, []);

  const handleRemoveImage = useCallback((uri: string) => {
    setSelectedReviewImages((prev) => prev.filter((img) => img.uri !== uri));
  }, []);

  const handlePickImages = useCallback(async () => {
    const remainingSlots = MAX_REVIEW_IMAGES - selectedReviewImages.length;
    if (remainingSlots <= 0) {
      Alert.alert(
        "Giới hạn ảnh",
        `Bạn chỉ có thể chọn tối đa ${MAX_REVIEW_IMAGES} ảnh.`
      );
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Thiếu quyền", "Vui lòng cấp quyền truy cập thư viện ảnh.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: remainingSlots > 1,
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (pickerResult.canceled) {
      return;
    }

    const accepted: LocalReviewImage[] = [];
    const rejected: string[] = [];

    pickerResult.assets.forEach((asset) => {
      const size = asset.fileSize ?? 0;
      if (size && size > MAX_IMAGE_SIZE_BYTES) {
        rejected.push(asset.fileName ?? asset.uri);
        return;
      }

      accepted.push({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        fileSize: asset.fileSize,
      });
    });

    if (rejected.length) {
      Alert.alert("Ảnh vượt quá 5MB", `Đã bỏ qua: ${rejected.join(", ")}`);
    }

    if (!accepted.length) {
      return;
    }

    setSelectedReviewImages((prev) => {
      const merged = [...prev, ...accepted];
      return merged.slice(0, MAX_REVIEW_IMAGES);
    });
  }, [selectedReviewImages.length]);

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
      let uploadedUrls: string[] = [];
      if (selectedReviewImages.length) {
        uploadedUrls = await uploadMultipleImages(
          selectedReviewImages.map((img) => img.uri)
        );
      }

      await createShopReview({
        sellerId,
        rating: ratingInput,
        comment: commentInput.trim() || undefined,
        images: uploadedUrls,
      });

      await loadReviews();
      await refreshEligibility();
      handleCloseReviewModal();
    } catch (error) {
      const message = (error as Error).message || "Không thể gửi đánh giá";
      Alert.alert("Lỗi", message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    sellerId,
    accessToken,
    ratingInput,
    commentInput,
    selectedReviewImages,
    loadReviews,
    refreshEligibility,
    handleCloseReviewModal,
  ]);

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
              <Image
                source={{ uri: item.reviewerId.avatar }}
                style={styles.reviewAvatarImage}
              />
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
                  color={
                    value <= item.rating ? STAR_COLOR : colors.textSecondary
                  }
                />
              ))}
            </View>
          </View>
          <Text style={styles.reviewDate}>{formattedDate}</Text>
        </View>
        {item.comment ? (
          <Text style={styles.reviewComment}>{item.comment}</Text>
        ) : null}
        {item.images && item.images.length ? (
          <View style={styles.reviewImagesRow}>
            {item.images.map((uri) => (
              <Image
                key={uri}
                source={{ uri }}
                style={styles.reviewImageThumb}
              />
            ))}
          </View>
        ) : null}
      </View>
    );
  }, []);

  const reviewList = useMemo(() => {
    if (loadingReviews) {
      return (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginVertical: 16 }}
        />
      );
    }

    if (reviewsError) {
      return <Text style={styles.errorText}>{reviewsError}</Text>;
    }

    if (!reviews.length) {
      return (
        <Text style={styles.emptyText}>Chưa có đánh giá nào cho shop này.</Text>
      );
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
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={{ uri: coverImageUri }}
          style={styles.coverImage}
        />

        <View style={styles.mainContent}>
          <View style={styles.shopInfoCard}>
            <Image source={{ uri: shopAvatar }} style={styles.shopAvatar} />
            <Text style={styles.shopName}>{shopDisplayName}</Text>
            <Text style={styles.shopStats}>
              {shopTotalProducts} Sản phẩm • {shopSold} Đã bán
            </Text>
            <View style={styles.shopStars}>
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  name={i + 1 <= shopRatingValue ? "star" : "star-outline"}
                  size={16}
                  color={i + 1 <= shopRatingValue ? STAR_COLOR : colors.border}
                />
              ))}
              <Text style={styles.shopRatingText}>
                ({shopRatingValue.toFixed(1)}/5)
              </Text>
            </View>
          </View>

          {/* badges removed */}
            {/* <View style={styles.badge}>
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
          </View> */}
        </View>

        <View style={styles.divider} />

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Về Tuấn Phú</Text>
          <Text style={styles.descriptionText}>
            "Mình không muốn những món đồ còn giá trị phải nằm yên. Nếu nó có
            thể phục vụ cho người khác, thì..."
          </Text>
        </View>

        <View style={styles.divider} /> */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đánh giá</Text>
            <TouchableOpacity
              onPress={handleOpenReviewModal}
              disabled={checkingEligibility}
            >
              <Text
                style={[
                  styles.writeReviewText,
                  (!eligibility.eligible || checkingEligibility) &&
                    styles.writeReviewDisabled,
                ]}
              >
                {checkingEligibility ? "Đang kiểm tra..." : "Viết đánh giá"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ratingSummary}>
            <View style={styles.ratingValueWrapper}>
              <Text style={styles.ratingValue}>{averageRatingLabel}</Text>
              <Text style={styles.ratingSuffix}>/5 sao</Text>
            </View>
            <Text style={styles.ratingCountText}>{stats.total} đánh giá</Text>
          </View>
          {!eligibility.eligible && eligibility.reason ? (
            <Text style={styles.eligibilityHint}>{eligibility.reason}</Text>
          ) : null}
          {reviewList}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm từ người bán này</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("HomeStack", { screen: "SearchResults" })
              }
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            {loadingSellerItems ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginVertical: 12 }}
              />
            ) : sellerItemsError ? (
              <Text style={styles.errorText}>{sellerItemsError}</Text>
            ) : sellerItems.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có sản phẩm nào.</Text>
            ) : (
              <FlatList
                data={sellerItems}
                renderItem={({ item }) => (
                  <ProductItem product={item} horizontal />
                )}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 12 }}
              />
            )}
          </View>
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
            <View style={styles.imagePickerHeader}>
              <Text style={styles.imagePickerLabel}>
                {"Ảnh minh họa (tối đa 3 ảnh, <=5MB/ảnh)"}
              </Text>
              <TouchableOpacity onPress={handlePickImages}>
                <Text style={styles.imagePickerAction}>Chọn ảnh</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.selectedImagesRow}>
              {selectedReviewImages.length ? (
                selectedReviewImages.map((img) => (
                  <View key={img.uri} style={styles.selectedImageWrapper}>
                    <Image
                      source={{ uri: img.uri }}
                      style={styles.selectedImage}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(img.uri)}
                    >
                      <Icon name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.imagePlaceholderText}>
                  Chưa chọn ảnh nào
                </Text>
              )}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleCloseReviewModal}
                disabled={isSubmitting}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSubmitReview}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonTextPrimary,
                  ]}
                >
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
    top: (StatusBar.currentHeight || 0) + 24,
    left: 0,
    zIndex: 10,
  },
  headerButton: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.55)", // Nền đậm hơn cho dễ nhìn
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
  // Nút viền
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
  writeReviewDisabled: {
    color: colors.textSecondary,
  },
  eligibilityHint: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
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
  reviewImagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  reviewImageThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.border,
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
  imagePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  imagePickerLabel: {
    color: colors.text,
    fontSize: 13,
    flex: 1,
  },
  imagePickerAction: {
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 12,
  },
  selectedImagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  selectedImageWrapper: {
    position: "relative",
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  removeImageButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "rgba(0,0,0,0.7)",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    color: colors.textSecondary,
    fontSize: 12,
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
