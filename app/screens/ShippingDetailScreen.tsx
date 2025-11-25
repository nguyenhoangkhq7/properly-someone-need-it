import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../config/color';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ShippingDetailScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, accessToken, refreshProfile } = useAuth();

  const pickupAddressFromParams = (route.params as any)?.pickupAddress as string | undefined;
  const productFromParams = (route.params as any)?.product;
  const latitudeFromParams = (route.params as any)?.latitude as number | undefined;
  const longitudeFromParams = (route.params as any)?.longitude as number | undefined;
  const [pickupAddress, setPickupAddress] = useState<string>(
    pickupAddressFromParams ?? 'Đang dùng vị trí hiện tại của bạn'
  );

  useEffect(() => {
    if (pickupAddressFromParams) {
      setPickupAddress(pickupAddressFromParams);
    }
  }, [pickupAddressFromParams]);

  const uploadImageToCloudinary = async (uri: string): Promise<string> => {
    const CLOUD_NAME = 'dxvkjwsj8';
    const UPLOAD_PRESET = 'mobile';

    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Cloudinary response status', response.status, 'data', response.data);

    return response.data.secure_url as string;
  };

  const uploadAllImages = async (uris: string[]): Promise<string[]> => {
    const uploaded: string[] = [];
    for (const uri of uris) {
      const url = await uploadImageToCloudinary(uri);
      uploaded.push(url);
    }
    return uploaded;
  };

  const mapConditionToEnum = (c: string | null | undefined) => {
    switch (c) {
      case 'Mới':
        return 'LIKE_NEW';
      case 'Như mới':
        return 'LIKE_NEW';
      case 'Tốt':
        return 'GOOD';
      case 'Trung bình':
        return 'FAIR';
      case 'Kém':
        return 'POOR';
      default:
        return 'GOOD';
    }
  };

  const handlePost = async () => {
    if (!productFromParams) {
      console.warn('No product data passed to ShippingDetailScreen');
      return;
    }

    const lat = latitudeFromParams;
    const lng = longitudeFromParams;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      console.warn('No location coordinates provided for item');
      return;
    }

    setModalVisible(true);
    setIsLoading(true);
    setIsSuccess(false);

    try {
      // Ensure user is authenticated
      if (!user) {
        if (accessToken) {
          // Try to refresh profile if we have token but no user
          try {
            await refreshProfile();
          } catch (profileError) {
            console.error('Failed to refresh profile:', profileError);
            navigation.navigate('Auth', { screen: 'Login' });
            setModalVisible(false);
            setIsLoading(false);
            return;
          }
        } else {
          navigation.navigate('Auth', { screen: 'Login' });
          setModalVisible(false);
          setIsLoading(false);
          return;
        }
      }

      const localImages: string[] = productFromParams.images || [];
      const imageUrls = await uploadAllImages(localImages);

      const payload = {
        sellerId: user?.id as string,
        title: productFromParams.title,
        description: productFromParams.description || 'Không có mô tả',
        category: productFromParams.category,
        subcategory: productFromParams.subcategory || undefined,
        brand: productFromParams.brand || undefined,
        modelName: productFromParams.modelName || undefined,
        condition: mapConditionToEnum(productFromParams.condition),
        price: productFromParams.price,
        isNegotiable: productFromParams.isNegotiable ?? true,
        images: imageUrls,
        location: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      };

      console.log('Posting item payload:', payload);
      const response = await api.post('/items', payload);

      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Error posting item:', err);
      setIsLoading(false);
      setModalVisible(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    console.log('Đã nhấn OK, chuẩn bị chuyển về Home...');
    navigation.navigate('HomeStack');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.accent} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điều kiện bán hàng</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Được gửi đi từ <Text style={styles.requiredMark}>*</Text>
          </Text>
          <Text style={styles.infoText}>{pickupAddress}</Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              const params = route.params as any;
              const lat = params?.latitude as number | undefined;
              const lng = params?.longitude as number | undefined;

              navigation.navigate('MapPickerScreen', {
                product: params?.product,
                latitude: lat,
                longitude: lng,
              });
            }}
          >
            <Ionicons name="location-outline" size={18} color="#64B5F6" style={styles.linkIcon} />
            <Text style={styles.linkText}>Thay đổi địa chỉ lấy hàng</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.footerButton, styles.postButton]} onPress={handlePost}>
          <Text style={styles.postButtonText}>ĐĂNG BÁN</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          if (!isLoading) {
            setModalVisible(false);
          }
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {isLoading && (
              <>
                <ActivityIndicator size="large" color="#f96d01" />
                <Text style={styles.modalText}>Đang đăng bán...</Text>
              </>
            )}
            {isSuccess && (
              <>
                <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                <Text style={styles.modalTitle}>Thành công!</Text>
                <Text style={styles.modalText}>Sản phẩm đã được đăng bán.</Text>
                <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={handleModalClose}>
                  <Text style={styles.textStyle}>OK</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212', // Dark mode background
    paddingTop: StatusBar.currentHeight || 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Dark mode background
  },
  scrollContent: {
    paddingBottom: 100, // Để tránh footer che mất nội dung
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#111', // nền đồng bộ với StatusBar
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.accent,
  },
  section: {
    backgroundColor: '#242424', // Màu nền section tối
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E0E0', // Màu text sáng
    marginBottom: 4,
  },
  requiredMark: {
    color: 'red',
  },
  infoText: {
    fontSize: 14,
    color: '#B0B0B0', // Màu text sáng
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    marginRight: 6,
  },
  linkText: {
    fontSize: 15,
    color: '#64B5F6', // Màu link sáng
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444', // Viền tối
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#333', // Nền input tối
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#E0E0E0', // Màu text sáng
  },
  unitText: {
    fontSize: 16,
    color: '#999', // Màu text sáng
    marginLeft: 8,
  },
  dimensionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimensionInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444', // Viền tối
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#333', // Nền input tối
  },
  separator: {
    fontSize: 20,
    color: '#888', // Màu sáng
    marginHorizontal: 8,
  },
  exampleHintText: {
    fontSize: 14,
    color: '#999', // Màu sáng
    marginTop: 16,
    marginBottom: 12,
  },
  imagePlaceholderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imagePlaceholder: {
    width: 150,
    height: 100,
    backgroundColor: '#333', // Nền placeholder tối
    borderWidth: 1,
    borderColor: '#555', // Viền tối
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderStyle: 'dashed',
  },
  placeholderBoxText: {
    color: '#888', // Màu text tối
    fontSize: 14,
  },
  exampleDimensions: {
    flex: 1,
    justifyContent: 'center',
  },
  exampleDimensionText: {
    fontSize: 14,
    color: '#B0B0B0', // Màu text sáng
    lineHeight: 22,
  },
  shippingFeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginLeft: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioLabel: {
    fontSize: 16,
    color: '#E0E0E0', // Màu text sáng
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#242424', // Nền footer tối
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 30, // Thêm padding cho khu vực home indicator trên iOS
    borderTopWidth: 1,
    borderTopColor: '#444', // Viền tối
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  draftButton: {
    backgroundColor: 'transparent', // Nền trong suốt
    borderWidth: 1,
    borderColor: colors.accent, // Giữ viền cam
  },
  draftButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  postButton: {
    backgroundColor: colors.accent,
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Nền tối mờ
  },
  modalView: {
    margin: 20,
    backgroundColor: '#2e2e2e', // Nền modal tối
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Chiều rộng tương đối
    minHeight: 200, // Chiều cao tối thiểu để spinner vừa
    justifyContent: 'center',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E0E0', // Màu text sáng
    marginTop: 10,
  },
  modalText: {
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 16,
    color: '#B0B0B0', // Màu text sáng
    marginTop: 15,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#f96d01', // Màu cam
    marginTop: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
