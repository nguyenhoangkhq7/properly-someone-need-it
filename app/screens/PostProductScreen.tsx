  import React, { useState } from "react";
  import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Modal,
    SafeAreaView,
    StatusBar,
    ImageBackground,
    ScrollView,
  } from "react-native";
  import Icon from "react-native-vector-icons/Ionicons";
  import FeatherIcon from "react-native-vector-icons/Feather";
  import MaterialIcon from "react-native-vector-icons/MaterialIcons";
  import { useNavigation } from "@react-navigation/native";
  import colors from "../config/color";

  // Hình ảnh placeholder cho nền camera.
  // Trong một ứng dụng thật, đây sẽ là component <CameraView>.
  const CAMERA_PLACEHOLDER_IMAGE = {
    uri: 'https://placehold.co/400x600/222/FFF?text=Camera+View', // Đổi tỷ lệ một chút
  };

  // Component Checkbox tùy chỉnh vì CheckBox không phải là component cốt lõi
  const CustomCheckbox = ({
    label,
    value,
    onValueChange,
  }: {
    label: string;
    value: boolean;
    onValueChange: (newValue: boolean) => void;
  }) => (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
    >
      <View style={[styles.checkboxBase, value && styles.checkboxChecked]}>
        {value && <FeatherIcon name="check" size={14} color="#fff" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Component TipItem để cho dễ đọc
  const TipItem = ({
    icon,
    text,
  }: {
    icon: React.ReactNode;
    text: string;
  }) => (
    <View style={styles.tipItem}>
      <View style={styles.tipIconContainer}>{icon}</View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );

  // Component cho các ô preview ảnh
  const PreviewItem = ({ active = false }: { active?: boolean }) => (
    <View
      style={[
        styles.previewItem,
        active && styles.previewItemActive,
      ]}
    />
  );

  export default function PostProductScreen() {
    const [modalVisible, setModalVisible] = useState(true);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const navigation = useNavigation<any>();

    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          {/* Nền Camera (Giả lập) */}
          <ImageBackground
            source={CAMERA_PLACEHOLDER_IMAGE}
            style={styles.cameraView} // Đổi tên từ cameraBackground
            resizeMode="cover"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="close" size={30} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.libraryButton}>
                <Text style={styles.libraryButtonText}>Thư viện</Text>
              </TouchableOpacity>
            </View>

            {/* Khung hướng dẫn (Viewfinder) */}
            <View style={styles.viewfinderContainer}>
              <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>

            {/* Footer (Giả lập) - ĐÃ XÓA khỏi đây */}

          </ImageBackground>

          {/* Khu vực điều khiển (Control Area) - MỚI */}
          <View style={styles.controlsContainer}>
            {/* Dải ảnh preview */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.previewCarousel}
            >
              <PreviewItem active={true} />
              <PreviewItem />
              <PreviewItem />
              <PreviewItem />
              <PreviewItem />
              <PreviewItem />
            </ScrollView>

            {/* Hàng nút điều khiển chính */}
            <View style={styles.mainControls}>
              <TouchableOpacity style={styles.controlButton}>
                <Icon name="flash-off-outline" size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureButton}>
                <Icon name="camera-outline" size={36} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton}>
                <Icon name="camera-reverse-outline" size={32} color="white" />
              </TouchableOpacity>
            </View>

            {/* Hàng nút dưới cùng */}
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.controlButton}>
                <Icon name="videocam-outline" size={32} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate("PostProductDetail")}>
                <Text style={styles.doneButtonText}>Xong</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>


        {/* Modal Mẹo Chụp Ảnh */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Mẹo chụp ảnh đẹp</Text>

              <TipItem
                icon={<FeatherIcon name="box" size={24} color="#4A4A4A" />}
                text="Đặt sản phẩm vào khung hướng dẫn"
              />
              <TipItem
                icon={<MaterialIcon name="aspect-ratio" size={24} color="#4A4A4A" />}
                text="Chọn/chụp ảnh vuông để hiển thị tốt"
              />
              <TipItem
                icon={<Icon name="refresh" size={24} color="#4A4A4A" />}
                text="Ảnh toàn bộ sản phẩm"
              />
              <TipItem
                icon={<Icon name="water-outline" size={24} color="#4A4A4A" />}
                text="Ảnh chụp phần bị hư hỏng (nếu có)"
              />

              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.mainButtonText}>BẮT ĐẦU CHỤP ẢNH</Text>
              </TouchableOpacity>

              <CustomCheckbox
                label="Không hiển thị lại"
                value={dontShowAgain}
                onValueChange={setDontShowAgain}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // === STYLESHEET ===
  // Toàn bộ CSS được định nghĩa ở đây bằng StyleSheet

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#000',
      paddingTop: StatusBar.currentHeight || 0,
    },
    safeArea: {
      flex: 1,
      backgroundColor: '#000', // Đảm bảo nền đen
    },
    cameraView: { // Đổi tên từ cameraBackground
      flex: 1, // Chiếm phần không gian còn lại
      justifyContent: 'flex-start', // Căn header lên trên
    },
    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 10,
      position: 'absolute', // Header nằm trên camera view
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    libraryButton: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    libraryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },

    // Viewfinder (Khung hướng dẫn) - MỚI
    viewfinderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewfinder: {
      width: 280,
      height: 280,
      position: 'relative',
    },
    corner: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderColor: 'white',
      borderWidth: 4,
    },
    topLeft: {
      top: 0,
      left: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    topRight: {
      top: 0,
      right: 0,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
    },
    bottomLeft: {
      bottom: 0,
      left: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
    },
    bottomRight: {
      bottom: 0,
      right: 0,
      borderLeftWidth: 0,
      borderTopWidth: 0,
    },

    // Khu vực điều khiển - MỚI
    controlsContainer: {
      paddingVertical: 10,
      backgroundColor: '#000', // Nền đen cho khu vực control
    },
    // Dải ảnh preview - MỚI
    previewCarousel: {
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    previewItem: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: '#333',
      marginHorizontal: 4,
    },
    previewItemActive: {
      borderColor: 'white',
      borderWidth: 2,
    },

    // Hàng nút điều khiển chính - CẬP NHẬT (trước là 'footer')
    mainControls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    controlButton: {
      padding: 10, // Vùng nhấn lớn hơn
    },
    captureButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // ĐÃ XÓA captureButtonInner

    // Hàng nút dưới cùng - MỚI
    bottomBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 10, // Thêm padding cho an toàn
    },
    doneButton: {
      backgroundColor: '#333',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    doneButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },

    // Modal
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center', // Căn giữa các item
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
    },
    // Tip Item
    tipItem: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: 16,
    },
    tipIconContainer: {
      width: 40, // Đảm bảo icon được căn chỉnh
      alignItems: 'center',
      marginRight: 12,
    },
    tipText: {
      flex: 1, // Cho phép text chiếm phần còn lại
      fontSize: 16,
      color: '#4A4A4A',
    },
    // Main Button
    mainButton: {
      backgroundColor: colors.accent, // Màu cam từ ảnh
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: '100%',
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 20,
    },
    mainButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    // Custom Checkbox
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkboxBase: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#999',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    checkboxChecked: {
      backgroundColor: '#EE702D', // Màu cam
      borderColor: '#EE702D',
    },
    checkboxLabel: {
      fontSize: 15,
      color: '#555',
    },
  });