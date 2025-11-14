import { useNavigation } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

// Import icon từ react-native-vector-icons
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from "react-native-vector-icons/Ionicons";

import colors from '../config/color';

// --- Dữ liệu giả lập cho danh sách đánh giá ---
const reviewsData = [
  {
    id: '1',
    userName: 'An Cao',
    userAvatar: 'An', // Dùng chữ cái đầu làm avatar
    isAvatarImage: false,
    avatarUri: 'https-placeholder-for-an',
    rating: 5,
    timestamp: '11/11/2025 20:00',
    product: {
      name: 'Bao Thanh Thiên - Thất Hiệp Ngũ Nghĩa',
      quantity: 1,
      imageUri: 'https://placehold.co/100x120/EFEFEF/AAAAAA?text=Sach&font=sans-serif',
    },
  },
  {
    id: '2',
    userName: 'Cashflow 101',
    userAvatar: 'C',
    isAvatarImage: false,
    avatarUri: 'https://placehold.co/100x100/EFEFEF/AAAAAA?text=User',
    rating: 5,
    timestamp: '08/11/2025 15:00',
    product: {
      name: 'MƯU LƯỢC CỔ NHÂN',
      quantity: 1,
      imageUri: 'https://placehold.co/100x120/EFEFEF/AAAAAA?text=Sach&font=sans-serif',
    },
  },
  {
    id: '3',
    userName: 'hanh ngoc le',
    userAvatar: 'H',
    isAvatarImage: false,
    avatarUri: 'https://placehold.co/100x100/EFEFEF/AAAAAA?text=User',
    rating: 5,
    timestamp: '30/10/2025 12:00',
    product: {
      name: 'Huy Cận – Thơ và Đời',
      quantity: 1,
      imageUri: 'https://placehold.co/100x120/EFEFEF/AAAAAA?text=Sach&font=sans-serif',
    },
  },
];

// --- Dữ liệu giả lập cho thanh progress bar ---
const ratingSummary = [
  { stars: 5, count: 10, percent: '100%' },
  { stars: 4, count: 0, percent: '0%' },
  { stars: 3, count: 0, percent: '0%' },
  { stars: 2, count: 0, percent: '0%' },
  { stars: 1, count: 0, percent: '0%' },
];

// Component hiển thị 5 sao
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <View style={styles.starContainer}>
      {[...Array(5)].map((_, index) => (
        <Ionicons
          key={index}
          name={index < rating ? 'star' : 'star-outline'}
          size={14}
          color={index < rating ? '#f96d01' : '#555'} // Đổi màu sao rỗng
        />
      ))}
    </View>
  );
};

// Component chính của màn hình
const AllRatingScreen: React.FC = () => {
    const navigation= useNavigation<any>();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#242424" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=> navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ratings / Reviews</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* Phần tổng quan đánh giá */}
        <View style={styles.summarySection}>
          <Text style={styles.storeName}>Tiệm Sách Ong Vàng</Text>
          <View style={styles.ratingBarsContainer}>
            {ratingSummary.map((item) => (
              <View style={styles.ratingBarRow} key={item.stars}>
                <Text style={styles.starLabel}>{item.stars} sao</Text>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarForeground,
                    //   { width: item.percent },
                    ]}
                  />
                </View>
                <Text style={styles.ratingCount}>({item.count})</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Đường kẻ phân cách */}
        <View style={styles.divider} />

        {/* Danh sách đánh giá */}
        {reviewsData.map((review, index) => (
          <View key={review.id}>
            <View style={styles.reviewItem}>
              {/* Avatar và thông tin người dùng */}
              <View style={styles.reviewHeader}>
                <View style={styles.avatar}>
                  {review.isAvatarImage ? (
                    <Image
                      source={{ uri: review.avatarUri }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>{review.userAvatar}</Text>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{review.userName}</Text>
                  <StarRating rating={review.rating} />
                </View>
                <Text style={styles.timestamp}>{review.timestamp}</Text>
              </View>

              {/* Thông tin sản phẩm đã mua */}
              <View style={styles.productInfo}>
                <Image
                  source={{ uri: review.product.imageUri }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{review.product.name}</Text>
                  <Text style={styles.productQuantity}>
                    x{review.product.quantity}
                  </Text>
                </View>
              </View>
            </View>
            {/* Đường kẻ phân cách mỏng hơn */}
            {index < reviewsData.length - 1 && (
              <View style={styles.thinDivider} />
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
  safeArea: {
    paddingTop: StatusBar.currentHeight || 0,
    flex: 1,
    backgroundColor: '#121212', // Nền chính
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Nền scrollview
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#242424', // Nền header
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Viền header
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E0E0E0', // Chữ header
    marginLeft: 16,
  },
  summarySection: {
    backgroundColor: '#242424', // Nền section
    padding: 16,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0', // Chữ sáng
    marginBottom: 16,
  },
  ratingBarsContainer: {
    // Container cho 5 thanh progress bar
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starLabel: {
    fontSize: 14,
    color: '#B0B0B0', // Chữ sáng
    width: 50,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#333', // Nền thanh bar
    borderRadius: 6,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#f96d01', // Giữ màu cam
    borderRadius: 6,
  },
  ratingCount: {
    fontSize: 14,
    color: '#B0B0B0', // Chữ sáng
    width: 30,
    textAlign: 'right',
  },
  divider: {
    height: 10,
    backgroundColor: '#121212', // Màu phân cách
  },
  thinDivider: {
    height: 1,
    backgroundColor: '#333', // Phân cách mỏng
    marginHorizontal: 16,
  },
  reviewItem: {
    backgroundColor: '#242424', // Nền item
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C8E6C9', // Giữ màu avatar
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarText: {
    color: '#1B5E20', // Giữ màu chữ avatar
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E0E0E0', // Chữ sáng
    marginBottom: 4,
  },
  starContainer: {
    flexDirection: 'row',
  },
  timestamp: {
    fontSize: 12,
    color: '#888', // Chữ sáng
    alignSelf: 'flex-start',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#1a1a1a', // Nền tối hơn
    borderRadius: 8,
    marginLeft: 52,
  },
  productImage: {
    width: 50,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#333', // Thêm nền cho ảnh
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E0E0E0', // Chữ sáng
  },
  productQuantity: {
    fontSize: 13,
    color: '#B0B0B0', // Chữ sáng
    marginTop: 4,
  },
});

export default AllRatingScreen;