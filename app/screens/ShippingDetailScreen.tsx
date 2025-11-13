import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../config/color';
import { useNavigation } from '@react-navigation/native';

// Định nghĩa kiểu cho state
type PayerType = 'seller' | 'buyer';

export default function ShippingDetailScreen() {
  // State để quản lý ai là người trả phí vận chuyển
  const [shippingPayer, setShippingPayer] = useState<PayerType>('buyer');

  // State cho Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigation= useNavigation<any>();

  // Hàm xử lý khi nhấn nút "Đăng Bán"
  const handlePost = () => {
    // Hiển thị modal và bật trạng thái loading
    setModalVisible(true);
    setIsLoading(true);
    setIsSuccess(false);

    // Giả lập một tiến trình xử lý (ví dụ: gọi API) mất 2 giây
    setTimeout(() => {
      // Sau 2 giây, tắt loading và bật trạng thái thành công
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000); // 2000ms = 2 giây

  };


  // Hàm xử lý khi đóng modal (sau khi đã thành công)
  const handleModalClose = () => {
    setModalVisible(false);
    console.log("Đã nhấn OK, chuẩn bị chuyển về Home...");
    navigation.navigate("HomeStack");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Đặt màu thanh status bar cho phù hợp với header */}
      <StatusBar barStyle="light-content" backgroundColor= {colors.accent}/>

      {/* Header */}
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
        showsVerticalScrollIndicator={false}>
        {/* Phần: Được gửi đi từ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Được gửi đi từ <Text style={styles.requiredMark}>*</Text>
          </Text>
          <Text style={styles.infoText}>Thông tin này là bắt buộc</Text>
          <TouchableOpacity style={styles.linkButton}>
            <Ionicons
              name="location-outline"
              size={18}
              color="#64B5F6" // Màu link sáng hơn cho dark mode
              style={styles.linkIcon}
            />
            <Text style={styles.linkText}>Thay đổi địa chỉ lấy hàng</Text>
          </TouchableOpacity>
        </View>

        {/* Phần: Trọng lượng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Trọng lượng <Text style={styles.requiredMark}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="400"
              keyboardType="numeric"
              defaultValue="400"
              placeholderTextColor="#777" // Thêm màu placeholder
            />
            <Text style={styles.unitText}>| Gr</Text>
          </View>
        </View>

        {/* Phần: Kích thước */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Kích thước <Text style={styles.requiredMark}>*</Text>
          </Text>
          <View style={styles.dimensionsContainer}>
            {/* Chiều dài */}
            <View style={styles.dimensionInputBox}>
              <TextInput
                style={styles.textInput}
                placeholder="Chiều dài"
                keyboardType="numeric"
                defaultValue="30"
                placeholderTextColor="#777" // Thêm màu placeholder
              />
              <Text style={styles.unitText}>| Cm</Text>
            </View>
            <Text style={styles.separator}>–</Text>
            {/* Chiều rộng */}
            <View style={styles.dimensionInputBox}>
              <TextInput
                style={styles.textInput}
                placeholder="Chiều rộng"
                keyboardType="numeric"
                defaultValue="20"
                placeholderTextColor="#777" // Thêm màu placeholder
              />
              <Text style={styles.unitText}>| Cm</Text>
            </View>
            <Text style={styles.separator}>–</Text>
            {/* Chiều cao */}
            <View style={styles.dimensionInputBox}>
              <TextInput
                style={styles.textInput}
                placeholder="Chiều cao"
                keyboardType="numeric"
                defaultValue="8"
                placeholderTextColor="#777" // Thêm màu placeholder
              />
              <Text style={styles.unitText}>| Cm</Text>
            </View>
          </View>

          {/* Ví dụ hộp giày */}
          <Text style={styles.exampleHintText}>Ví dụ như hộp giày</Text>
          <View style={styles.imagePlaceholderContainer}>
            {/* Placeholder cho hình ảnh cái hộp */}
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderBoxText}>Ảnh minh hoạ</Text>
            </View>
            {/* Chú thích kích thước bên cạnh */}
            <View style={styles.exampleDimensions}>
              <Text style={styles.exampleDimensionText}>Chiều dài: 33cm</Text>
              <Text style={styles.exampleDimensionText}>Chiều rộng: 20cm</Text>
              <Text style={styles.exampleDimensionText}>Chiều cao: 13cm</Text>
            </View>
          </View>
        </View>

        {/* Phần: Phí vận chuyển */}
        <View style={styles.section}>
          <View style={styles.shippingFeeHeader}>
            <Text style={styles.sectionTitle}>Phí vận chuyển</Text>
            <FontAwesome
              name="info-circle"
              size={18}
              color="#888"
              style={styles.infoIcon}
            />
          </View>

          <View style={styles.radioGroup}>
            {/* Option: Người bán trả */}
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setShippingPayer('seller')}>
              <Ionicons
                name={
                  shippingPayer === 'seller'
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={22}
                color={shippingPayer === 'seller' ? '#64B5F6' : '#888'} // Màu xanh sáng hơn
              />
              <Text style={styles.radioLabel}>Người bán trả</Text>
            </TouchableOpacity>

            {/* Option: Người mua trả */}
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setShippingPayer('buyer')}>
              <Ionicons
                name={
                  shippingPayer === 'buyer'
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={22}
                color={shippingPayer === 'buyer' ? '#64B5F6' : '#888'} // Màu xanh sáng hơn
              />
              <Text style={styles.radioLabel}>Người mua trả</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.footerButton, styles.postButton]} onPress={handlePost}>
          <Text style={styles.postButtonText}>ĐĂNG BÁN</Text>
        </TouchableOpacity>
      </View>


      {/* modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Chỉ cho phép đóng khi không còn loading
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
                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={handleModalClose}
                >
                  <Text style={styles.textStyle}>OK</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// StyleSheet ở cuối file
// Giữ nguyên StyleSheet.create, nhưng export nó để dùng ở trên
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
