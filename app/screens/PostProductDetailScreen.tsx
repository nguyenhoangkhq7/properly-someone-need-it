import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Switch, // Thêm Switch
} from 'react-native';
// Sử dụng icon từ react-native-vector-icons
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import colors from "../config/color";
import { CameraStackParamList } from '../navigator/CameraNavigator';

type PostProductDetailScreenProps = RouteProp<CameraStackParamList, 'PostProductDetail'>;

// Placeholder cho ảnh bìa
const COVER_IMAGE_PLACEHOLDER = {
  uri: 'https://placehold.co/200x200/eee/333?text=B%C3%ACa',
};

// Component cho các lựa chọn tình trạng
const ConditionButton = ({
  title,
  description,
  isSelected,
  onPress,
}: {
  title: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.conditionButton, isSelected && styles.conditionButtonSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text
      style={[
        styles.conditionTitle,
        isSelected && styles.conditionTitleSelected,
      ]}
    >
      {title}
    </Text>
    <Text
      style={[
        styles.conditionDesc,
        isSelected && styles.conditionDescSelected,
      ]}
    >
      {description}
    </Text>
  </TouchableOpacity>
);

export default function ProductDetailScreen() {

  const navigation= useNavigation<any>();
  const route= useRoute<PostProductDetailScreenProps>();
  const product= route.params?.product;


  const [selectedCondition, setSelectedCondition] = useState<string | null>(
    null
  );
  const [quantity, setQuantity] = useState(1); // State cho số lượng
  const [isZeroDongProduct, setIsZeroDongProduct] = useState(false); // State cho switch
  const [price, setPrice] = useState("");

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount)); // Đảm bảo số lượng không dưới 1
  };

  const handleZeroDongSwitch = (newValue: boolean) => {
    setIsZeroDongProduct(newValue);
    if (newValue) {
      setPrice("0"); // Tự động set giá là 0
    } else {
      setPrice(""); // Xóa giá khi tắt (hoặc bạn có thể giữ "0" tùy logic)
    }
  };
  
  return (
    <SafeAreaView style={styles.screen}>
       <StatusBar 
        barStyle="light-content" // chữ trắng cho dark mode
        backgroundColor="#111"    // nền trùng với header/scroll
  />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết về sản phẩm</Text>
        <View style={{ width: 28 }} />{/* Placeholder for spacing */}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Phần Đăng ảnh/video */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Đăng ảnh/video</Text>
              <Text style={styles.requiredStar}> *</Text>
              <TouchableOpacity style={{ marginLeft: 4 }}>
                <Ionicons name="information-circle-outline" size={18} color="#888" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.deleteButton}>
              <Feather name="trash-2" size={16} color="#888" />
              <Text style={styles.deleteButtonText}>Xóa tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.imageUploadContainer}>
            {/* Ảnh bìa */}
            <TouchableOpacity style={styles.imagePreviewBox}>
              <Image source={COVER_IMAGE_PLACEHOLDER} style={styles.imagePreview} />
              <View style={styles.coverLabel}>
                <Text style={styles.coverLabelText}>Bìa</Text>
              </View>
            </TouchableOpacity>
            
            {/* Nút thêm ảnh */}
            <TouchableOpacity style={styles.addMediaButton}>
              <Ionicons name="camera-outline" size={32} color={colors.accent} />
              <Text style={styles.addMediaText}>+ Thêm ảnh/ video</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Phần Chọn Danh Mục */}
        <TouchableOpacity style={styles.sectionLink}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Chọn Danh Mục</Text>
            <Text style={styles.requiredStar}> *</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#888" />
        </TouchableOpacity>

        {/* Phần Tên sản phẩm */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Tên sản phẩm</Text>
            <Text style={styles.requiredStar}> *</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Tiêu đề"
            placeholderTextColor="#999"
          />
        </View>

        {/* Phần Tình trạng */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Tình trạng</Text>
            <Text style={styles.requiredStar}> *</Text>
          </View>
          <View style={styles.conditionContainer}>
            <ConditionButton
              title="Mới"
              description="Hàng mới kèm mác, chưa mở hộp/bao bì, chưa qua sử dụng."
              isSelected={selectedCondition === 'Mới'}
              onPress={() => setSelectedCondition('Mới')}
            />
            <ConditionButton
              title="Tốt"
              description="Đã sử dụng vài lần. Vẫn hoạt động tốt. Có vài vết xước nhỏ."
              isSelected={selectedCondition === 'Tốt'}
              onPress={() => setSelectedCondition('Tốt')}
            />
            <ConditionButton
              title="Như mới"
              description="Hàng mới kèm mác, đã mở bao bì/hộp, chưa qua sử dụng."
              isSelected={selectedCondition === 'Như mới'}
              onPress={() => setSelectedCondition('Như mới')}
            />
            <ConditionButton
              title="Trung bình"
              description="Hàng đã qua sử dụng, đầy đủ chức năng. Nhiều sai sót hoặc lỗi nhỏ."
              isSelected={selectedCondition === 'Trung bình'}
              onPress={() => setSelectedCondition('Trung bình')}
            />
            {/* NÚT MỚI ĐƯỢC THÊM */}
            <ConditionButton
              title="Kém"
              description="Đã qua sử dụng. Có nhiều lỗi và có thể bị hỏng (miêu tả chi tiết chỗ bị lỗi, hỏng)."
              isSelected={selectedCondition === 'Kém'}
              onPress={() => setSelectedCondition('Kém')}
            />
          </View>
        </View>

        {/* --- CÁC PHẦN MỚI BẮT ĐẦU TỪ ĐÂY --- */}

        {/* Phần Số lượng sản phẩm */}
        <View style={[styles.section, styles.rowSection]}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Số lượng sản phẩm</Text>
            <Text style={styles.requiredStar}> *</Text>
          </View>
          <View style={styles.quantityStepper}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color={quantity <= 1 ? '#ccc' : '#555'} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(1)}
            >
              <Ionicons name="add" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Phần Giá sản phẩm */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Giá sản phẩm</Text>
            <Text style={styles.requiredStar}> *</Text>
          </View>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="Tối thiểu 20,000 VNĐ"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              editable={!isZeroDongProduct} // Không cho nhập nếu là sản phẩm 0đ
            />
            <Text style={styles.currencyLabel}>VNĐ</Text>
          </View>
        </View>

        {/* Phần Sản phẩm 0đ */}
        <View style={[styles.section, styles.rowSection]}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Sản phẩm 0đ</Text>
            <TouchableOpacity style={{ marginLeft: 4 }}>
              <Ionicons name="help-circle-outline" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          <Switch
            trackColor={{ false: '#ccc', true: '#f9d3bf' }}
            thumbColor={isZeroDongProduct ? colors.accent : '#f4f3f4'}
            onValueChange={handleZeroDongSwitch} 
            value={isZeroDongProduct}
          />
        </View>

        {/* Phần Màu sắc - ĐÃ CẬP NHẬT */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.textInput, styles.pickerButton]}>
            <Text style={styles.pickerPlaceholder}>Chọn màu sắc</Text>
            <Ionicons name="chevron-down" size={20} color="#888" />
          </TouchableOpacity>
          <Text style={styles.inputLabel}>Màu sắc</Text>
        </View>

        {/* Phần Kích cỡ */}
        <View style={styles.section}>
          <TextInput
            style={styles.textInput}
            placeholder="Loại..."
            placeholderTextColor="#999"
          />
          <Text style={styles.inputLabel}>Kích cỡ</Text>
        </View>

        {/* Phần Thương hiệu */}
        <View style={styles.section}>
          <TextInput
            style={styles.textInput}
            placeholder="Loại..."
            placeholderTextColor="#999"
          />
          <Text style={styles.inputLabel}>Thương hiệu</Text>
        </View>
        
        {/* PHẦN MÔ TẢ MỚI */}
        <View style={styles.section}>
          <TextInput
            style={[styles.textInput, styles.descriptionInput]}
            placeholder="Mô tả chi tiết sản phẩm..."
            placeholderTextColor="#999"
            multiline={true}
            numberOfLines={5} // Gợi ý số dòng
          />
          <Text style={styles.inputLabel}>Mô tả</Text>
        </View>

        {/* --- KẾT THÚC CÁC PHẦN MỚI --- */}

      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} activeOpacity={0.8} onPress={()=> navigation.navigate("ShippingDetailScreen")}>
          <Text style={styles.nextButtonText}>TIẾP THEO</Text>
        </TouchableOpacity>
        <View style={styles.bottomBarPlaceholder} />
      </View>
    </SafeAreaView>
  );
}

// === STYLESHEET ===

const styles = StyleSheet.create({
  screen: {
    paddingTop: StatusBar.currentHeight || 0,
    flex: 1,
    backgroundColor: '#111', // nền dark
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
  progressBarContainer: {
    height: 3,
    backgroundColor: '#222',
  },
  progressBar: {
    height: 3,
    width: '30%',
    backgroundColor: colors.accent,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollContent: {
    paddingBottom: 100,
    backgroundColor: '#111',
  },
  section: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
  },
  rowSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  requiredStar: {
    color: "red",
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButtonText: {
    marginLeft: 4,
    color: '#aaa',
    fontSize: 14,
  },
  imageUploadContainer: {
    flexDirection: 'row',
  },
  imagePreviewBox: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 10,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  coverLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  coverLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addMediaButton: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  addMediaText: {
    color: colors.accent,
    fontSize: 11,
    marginTop: 4,
  },
  sectionLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 10,
    backgroundColor: '#222',
    color: '#fff',
  },
  inputLabel: {
    position: 'absolute',
    top: 8,
    left: 28,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 4,
    color: '#aaa',
    fontSize: 12,
  },
  conditionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  conditionButton: {
    width: '48%',
    backgroundColor: '#222',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    padding: 12,
    marginBottom: 10,
  },
  conditionButtonSelected: {
    borderColor: colors.accent,
    backgroundColor: '#333',
  },
  conditionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  conditionTitleSelected: {
    color: colors.accent,
  },
  conditionDesc: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 4,
  },
  conditionDescSelected: {
    color: colors.accent,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 4,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#222',
  },
  quantityText: {
    fontSize: 16,
    color: '#fff',
    paddingHorizontal: 16,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#555',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#222',
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#fff',
  },
  currencyLabel: {
    fontSize: 16,
    color: '#fff',
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderColor: '#555',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#aaa',
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 10,
    backgroundColor: '#222',
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  nextButton: {
    backgroundColor: colors.accent,
    margin: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomBarPlaceholder: {
    height: 10,
    backgroundColor: '#111',
  },
});
