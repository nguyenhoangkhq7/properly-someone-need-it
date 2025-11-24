import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import colors from "../config/color";
import { useAuth } from "../context/AuthContext";
import { uploadImageToCloudinary } from "../utils/imageUpload";
import { updateMyProfile } from "../api/userApi";
import type { ApiClientError } from "../api/axiosClient";
import { useNavigation } from "@react-navigation/native";

const finalColors = {
  ...colors,
  borderMuted: "rgba(255,255,255,0.1)",
};

const fieldLabels = {
  fullName: "Họ và tên",
  phone: "Số điện thoại",
  city: "Tỉnh / Thành phố",
  district: "Quận / Huyện",
};

type FieldKey = keyof typeof fieldLabels;

const buildErrorMessage = (error: unknown): string => {
  const apiError = error as ApiClientError | undefined;
  return apiError?.message ?? "Không thể cập nhật thông tin. Vui lòng thử lại.";
};

export default function ProfileEditScreen() {
  const navigation = useNavigation();
  const { user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.address?.city ?? "");
  const [district, setDistrict] = useState(user?.address?.district ?? "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setPhone(user?.phone ?? "");
    setCity(user?.address?.city ?? "");
    setDistrict(user?.address?.district ?? "");
    setAvatar(user?.avatar ?? null);
  }, [user]);

  const disabled = useMemo(() => saving || uploadingAvatar, [saving, uploadingAvatar]);

  const ensurePermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền truy cập", "Ứng dụng cần quyền truy cập thư viện ảnh để chọn avatar.");
      return false;
    }
    return true;
  }, []);

  const handlePickAvatar = useCallback(async () => {
    const hasPermission = await ensurePermission();
    if (!hasPermission) {
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (pickerResult.canceled || !pickerResult.assets?.length) {
      return;
    }

    const uri = pickerResult.assets[0]?.uri;
    if (!uri) {
      Alert.alert("Chọn ảnh", "Không thể đọc tệp ảnh, vui lòng thử lại.");
      return;
    }

    try {
      setUploadingAvatar(true);
      const uploadedUrl = await uploadImageToCloudinary(uri);
      setAvatar(uploadedUrl);
    } catch (error) {
      console.error("Upload avatar error", error);
      Alert.alert("Upload thất bại", "Không thể tải ảnh lên Cloudinary. Vui lòng thử lại.");
    } finally {
      setUploadingAvatar(false);
    }
  }, [ensurePermission]);

  const handleRemoveAvatar = useCallback(() => {
    Alert.alert("Xóa ảnh đại diện", "Bạn chắc chắn muốn gỡ ảnh đại diện hiện tại?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Gỡ ảnh",
        style: "destructive",
        onPress: () => setAvatar(null),
      },
    ]);
  }, []);

  const validateField = useCallback(
    (key: FieldKey, value: string): boolean => {
      const trimmed = value.trim();
      if (!trimmed) {
        Alert.alert("Thiếu thông tin", `${fieldLabels[key]} không được để trống.`);
        return false;
      }
      if (key === "fullName" && trimmed.length < 2) {
        Alert.alert("Thông tin chưa hợp lệ", "Họ tên phải có ít nhất 2 ký tự.");
        return false;
      }
      if (key === "phone" && trimmed.replace(/\D/g, "").length < 9) {
        Alert.alert("Thông tin chưa hợp lệ", "Số điện thoại không hợp lệ.");
        return false;
      }
      return true;
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!user) {
      Alert.alert("Phiên đăng nhập", "Vui lòng đăng nhập lại.");
      return;
    }

    if (!validateField("fullName", fullName)) {
      return;
    }
    if (!validateField("phone", phone)) {
      return;
    }
    if (!validateField("city", city)) {
      return;
    }

    setSaving(true);
    try {
      await updateMyProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatar,
        address: {
          city: city.trim(),
          district: district.trim() || null,
        },
      });

      await refreshProfile();
      Alert.alert("Thành công", "Thông tin cá nhân đã được cập nhật.", [
        {
          text: "Đóng",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const message = buildErrorMessage(error);
      Alert.alert("Cập nhật thất bại", message);
    } finally {
      setSaving(false);
    }
  }, [avatar, city, district, fullName, navigation, phone, refreshProfile, user, validateField]);

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Không thể tải thông tin người dùng</Text>
        <Text style={styles.emptySubtitle}>Vui lòng đăng nhập lại để chỉnh sửa hồ sơ.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handlePickAvatar}
          disabled={disabled}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>Chọn ảnh</Text>
            </View>
          )}
          {uploadingAvatar && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color={finalColors.background} />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRemoveAvatar} disabled={!avatar || disabled}>
          <Text
            style={[
              styles.removeAvatarText,
              (!avatar || disabled) && { opacity: 0.5 },
            ]}
          >
            Gỡ ảnh đại diện
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{fieldLabels.fullName}</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            editable={!disabled}
            placeholder="Nhập họ và tên"
            placeholderTextColor={finalColors.textSecondary}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{fieldLabels.phone}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!disabled}
            placeholder="Nhập số điện thoại"
            placeholderTextColor={finalColors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Địa chỉ giao dịch</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{fieldLabels.city}</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            editable={!disabled}
            placeholder="Ví dụ: TP. Hồ Chí Minh"
            placeholderTextColor={finalColors.textSecondary}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{fieldLabels.district}</Text>
          <TextInput
            style={styles.input}
            value={district}
            onChangeText={setDistrict}
            editable={!disabled}
            placeholder="Ví dụ: Quận 1"
            placeholderTextColor={finalColors.textSecondary}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, disabled && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={disabled}
      >
        {saving ? (
          <ActivityIndicator color={finalColors.background} />
        ) : (
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: finalColors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: finalColors.background,
  },
  emptyTitle: {
    fontSize: 18,
    color: finalColors.text,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    color: finalColors.textSecondary,
    textAlign: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: finalColors.surface,
    borderWidth: 1,
    borderColor: finalColors.border,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  avatarPlaceholderText: {
    color: finalColors.textSecondary,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeAvatarText: {
    marginTop: 12,
    color: "orange",
    fontWeight: "600",
  },
  formSection: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: finalColors.surface,
    borderWidth: 1,
    borderColor: finalColors.border,
    marginBottom: 24,
  },
  sectionTitle: {
    color: finalColors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: finalColors.textSecondary,
    marginBottom: 6,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: finalColors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: finalColors.text,
    backgroundColor: finalColors.background,
  },
  saveButton: {
    backgroundColor: finalColors.primary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: finalColors.background,
    fontWeight: "700",
    fontSize: 16,
  },
});
