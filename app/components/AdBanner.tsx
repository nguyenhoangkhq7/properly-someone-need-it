import React, { useCallback } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Alert,
  Platform,
} from "react-native";
import colors from "../config/color";

type Props = {
  title: string;
  description: string;
  image: string;
  cta: string;
  url?: string;
  onPress?: () => void;
};

const AdBanner: React.FC<Props> = ({
  title,
  description,
  image,
  cta,
  url,
  onPress,
}) => {
  const handlePress = useCallback(async () => {
    if (onPress) onPress();

    if (url) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          await Linking.openURL(url);
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không thể mở đường dẫn này.");
        console.error("An error occurred", error);
      }
    }
  }, [url, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.95}
      style={styles.touchable}
    >
      <ImageBackground
        source={{ uri: image }}
        style={styles.container}
        imageStyle={styles.image}
      >
        {/* Lớp phủ tối giúp chữ luôn đọc được */}
        <View style={styles.overlay} />

        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          </View>

          {/* Nút CTA nổi bật */}
          <View style={styles.cta}>
            <Text style={styles.ctaText}>{cta}</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginHorizontal: 16,
    marginBottom: 20,
    // Đổ bóng cho cả khối Banner để tạo độ nổi (Card Shadow)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Bóng cho Android
  },
  container: {
    height: 160, // Tăng chiều cao một chút để thoáng hơn
    borderRadius: 20, // Bo góc mềm mại hơn
    overflow: "hidden",
    justifyContent: "flex-end", // Đẩy nội dung xuống dưới
  },
  image: {
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Màu đen mờ: Giúp chữ trắng nổi bật
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  content: {
    flex: 1,
    padding: 20,
    flexDirection: "row", // Xếp ngang để nút CTA nằm bên phải (tuỳ chọn) hoặc để bố cục linh hoạt
    alignItems: "flex-end", // Căn đáy
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: 10, // Khoảng cách với nút CTA
  },
  title: {
    color: "#FFFFFF", // Luôn dùng màu trắng trên nền tối
    fontSize: 22,
    fontWeight: "800", // Chữ đậm hơn
    marginBottom: 4,
    // Hiệu ứng bóng chữ (Text Shadow) giúp đọc được trên nền sáng
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  description: {
    color: "#F0F0F0", // Màu trắng hơi xám nhẹ
    fontSize: 14,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  cta: {
    backgroundColor: "#FFFFFF", // Nền trắng
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25, // Bo tròn dạng viên thuốc
    // Bóng nhẹ cho nút
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaText: {
    color: colors.primary || "#FF5722", // Dùng màu chủ đạo của app, hoặc màu cam Shopee
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase", // Viết hoa toàn bộ để nhấn mạnh
  },
});

export default AdBanner;
