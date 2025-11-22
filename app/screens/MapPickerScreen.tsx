import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraStackParamList } from '../navigator/CameraNavigator';
import type { RouteProp } from '@react-navigation/native';

const VIETNAM_PROVINCES = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Dương',
  'Bình Định',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

type MapPickerRouteProp = RouteProp<CameraStackParamList, 'MapPickerScreen'>;

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MapPress = {
  nativeEvent: { coordinate: { latitude: number; longitude: number } };
};

export default function MapPickerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<MapPickerRouteProp>();
  const mapRef = useRef<any>(null);

  const initialLat = route.params?.latitude;
  const initialLng = route.params?.longitude;

  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<MapRegion | null>(null);
  const [selectedCoord, setSelectedCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [province, setProvince] = useState<string>('TP. Hồ Chí Minh');
  const [street, setStreet] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);

  useEffect(() => {
    const initLocation = async () => {
      try {
        if (initialLat && initialLng) {
          const reg: MapRegion = {
            latitude: initialLat,
            longitude: initialLng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(reg);
          setSelectedCoord({ latitude: initialLat, longitude: initialLng });
          setLoading(false);
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Thông báo',
            'Không có quyền truy cập vị trí. Hãy chọn vị trí thủ công trên bản đồ.'
          );
          const reg: MapRegion = {
            latitude: 10.776389,
            longitude: 106.701139,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setRegion(reg);
          setSelectedCoord({ latitude: reg.latitude, longitude: reg.longitude });
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const reg: MapRegion = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(reg);
        setSelectedCoord({ latitude: reg.latitude, longitude: reg.longitude });
      } catch (e) {
        const reg: MapRegion = {
          latitude: 10.776389,
          longitude: 106.701139,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(reg);
        setSelectedCoord({ latitude: reg.latitude, longitude: reg.longitude });
      } finally {
        setLoading(false);
      }
    };

    initLocation();
  }, [initialLat, initialLng]);

  const handleMapPress = (e: MapPress) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedCoord({ latitude, longitude });
  };

  const handleSearchAddress = async () => {
    if (!street.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số nhà / tên đường.');
      return;
    }

    if (!province) {
      Alert.alert('Thông báo', 'Vui lòng chọn Tỉnh/Thành.');
      return;
    }

    try {
      setSearching(true);
      const fullAddress = `${street}, ${province}, Việt Nam`;

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        fullAddress,
      )}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'properly-someone-need-it-app',
        },
      });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        Alert.alert('Không tìm thấy', 'Không tìm thấy vị trí phù hợp. Hãy thử địa chỉ khác.');
        return;
      }

      const first = data[0];
      const lat = parseFloat(first.lat);
      const lon = parseFloat(first.lon);

      const newRegion: MapRegion = {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setSelectedCoord({ latitude: lat, longitude: lon });
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tìm vị trí. Vui lòng thử lại.');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCoord) return;
    try {
      setResolvingAddress(true);
      const { latitude, longitude } = selectedCoord;

      // Reverse geocode: từ lat/lng -> địa chỉ
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let addressText = '';
      if (results && results.length > 0) {
        const r = results[0];
        // Tuỳ bạn ghép, đây là dạng phổ biến:
        // street + streetNumber, city (subregion), region, country
        const parts = [
          [r.street, r.name].filter(Boolean).join(' '),
          r.subregion,
          r.region,
          r.country,
        ].filter(Boolean);
        addressText = parts.join(', ');
      } else {
        // Fallback nếu không reverse được
        addressText = `Vị trí gần: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      }

      if (!route.params) return;

      navigation.navigate('ShippingDetailScreen', {
        product: route.params.product,
        pickupAddress: addressText,
        latitude,
        longitude,
      });
    } catch (e) {
      Alert.alert('Lỗi', 'Không lấy được địa chỉ từ vị trí. Vui lòng thử lại.');
    } finally {
      setResolvingAddress(false);
    }
  };

  if (loading || !region) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f96d01" />
          <Text style={styles.loadingText}>Đang lấy vị trí của bạn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chọn vị trí giao dịch</Text>
      <Text style={styles.subtitle}>Nhập địa chỉ hoặc chạm lên bản đồ để chọn vị trí</Text>

      <View style={styles.searchContainer}>
        <View style={styles.provinceRow}>
          <Text style={styles.provinceLabel}>Tỉnh/Thành:</Text>
          <TouchableOpacity
            style={styles.provinceSelector}
            onPress={() => setProvinceModalVisible(true)}
          >
            <Text style={styles.provinceSelectorText}>{province}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Số nhà, tên đường..."
          placeholderTextColor="#999"
          value={street}
          onChangeText={setStreet}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchAddress}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Tìm trên bản đồ</Text>
          )}
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        ref={mapRef}
        region={region}
        onPress={handleMapPress}
      >
        {selectedCoord && (
          <Marker
            coordinate={selectedCoord}
            title="Vị trí giao dịch"
          />
        )}
      </MapView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleConfirm}
          disabled={resolvingAddress}
        >
          {resolvingAddress ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xác nhận vị trí này</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal chọn tỉnh/thành */}
      {provinceModalVisible && (
        <View style={styles.provinceModalOverlay}>
          <View style={styles.provinceModalContainer}>
            <Text style={styles.provinceModalTitle}>Chọn tỉnh/thành</Text>
            <ScrollView style={styles.provinceListContainer}>
              {VIETNAM_PROVINCES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.provinceItem,
                    p === province && styles.provinceItemSelected,
                  ]}
                  onPress={() => {
                    setProvince(p);
                    setProvinceModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.provinceItemText,
                      p === province && styles.provinceItemTextSelected,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.provinceModalCloseButton}
              onPress={() => setProvinceModalVisible(false)}
            >
              <Text style={styles.provinceModalCloseText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10 },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#111',
  },
  provinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  provinceLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  provinceSelector: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    marginLeft: 8,
  },
  provinceSelectorText: {
    color: '#fff',
    fontSize: 14,
  },
  provinceModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  provinceModalContainer: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
  },
  provinceModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  provinceListContainer: {
    maxHeight: 300,
  },
  provinceItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  provinceItemSelected: {
    backgroundColor: '#f96d01',
  },
  provinceItemText: {
    color: '#ddd',
    fontSize: 14,
  },
  provinceItemTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  provinceModalCloseButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#444',
    alignItems: 'center',
  },
  provinceModalCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    marginBottom: 8,
  },
  searchButton: {
    backgroundColor: '#f96d01',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  map: { flex: 1 },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#111',
  },
  button: {
    backgroundColor: '#f96d01',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
