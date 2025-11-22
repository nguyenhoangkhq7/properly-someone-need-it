import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../config/color";

interface Item {
  _id: string;
  title: string;
  description: string;
  price: number;
  images?: string[];
  status: "ACTIVE" | "PENDING" | "SOLD" | "DELETED";
  createdAt?: string;
}

export default function MySellingItemDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { itemId } = route.params as { itemId: string };

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = async () => {
    try {
      setError(null);
      const res = await fetch(`http://192.168.1.10:3000/api/items/${itemId}`);
      const text = await res.text();
      console.log("Get my selling item detail", res.status, text);

      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setError("Phản hồi không phải JSON");
        return;
      }

      if (!res.ok) {
        setError(data?.message || "Không thể lấy chi tiết sản phẩm");
        return;
      }

      setItem(data.item);
    } catch (e) {
      console.error("Get my selling item detail error", e);
      setError("Lỗi mạng");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItem();
    }, [itemId])
  );

  const confirmDelete = () => {
    if (!item) return;

    Alert.alert(
      "Xóa bài đăng",
      "Bạn có chắc chắn muốn xóa bài đăng này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          style: "destructive",
          onPress: handleDelete,
        },
      ]
    );
  };

  const handleDelete = async () => {
    if (!item) return;

    try {
      setUpdating(true);
      const res = await fetch(
        `http://192.168.1.10:3000/api/items/${item._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "DELETED" }),
        }
      );
      const text = await res.text();
      console.log("Delete my selling item", res.status, text);

      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        Alert.alert("Lỗi", "Phản hồi không phải JSON");
        return;
      }

      if (!res.ok) {
        Alert.alert("Lỗi", data?.message || "Không thể xóa bài đăng");
        return;
      }

      setItem(data.item);
      Alert.alert("Thành công", "Đã xóa bài đăng");
      navigation.goBack();
    } catch (e) {
      console.error("Delete my selling item error", e);
      Alert.alert("Lỗi", "Lỗi mạng");
    } finally {
      setUpdating(false);
    }
  };

  const renderStatus = (status: Item["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Text style={[styles.status, styles.statusActive]}>Đang đăng</Text>;
      case "PENDING":
        return <Text style={[styles.status, styles.statusPending]}>Đang chờ</Text>;
      case "SOLD":
        return <Text style={[styles.status, styles.statusSold]}>Đã bán</Text>;
      case "DELETED":
        return <Text style={[styles.status, styles.statusDeleted]}>Đã xóa</Text>;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBack}
          >
            <Icon name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || "Không tìm thấy sản phẩm"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const firstImage = item.images?.[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBack}
        >
          <Icon name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.mainImage} />
        ) : (
          <View style={[styles.mainImage, styles.thumbnailPlaceholder]}>
            <Icon
              name="image-outline"
              size={32}
              color={colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>{item.price} đ</Text>
          {renderStatus(item.status)}
          {item.createdAt && (
            <Text style={styles.timeText}>
              Đăng lúc {" "}
              {new Date(item.createdAt).toLocaleString("vi-VN")}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.deleteButton, updating && { opacity: 0.6 }]}
          onPress={confirmDelete}
          disabled={updating || item.status === "DELETED"}
        >
          <Text style={styles.deleteButtonText}>
            {item.status === "DELETED" ? "Đã xóa" : "Xóa bài đăng"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerBack: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  mainImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoSection: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  price: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  status: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  statusActive: {
    color: "#2e7d32",
  },
  statusPending: {
    color: "#f9a825",
  },
  statusSold: {
    color: "#1565c0",
  },
  statusDeleted: {
    color: "#9e9e9e",
  },
  timeText: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: colors.text,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 13,
    color: "red",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
