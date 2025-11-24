import { useState, useEffect, useCallback, useRef } from "react";
import * as Location from "expo-location";
import { useAuth } from "../context/AuthContext";
import { getUserLatLng } from "../utils/distance";

const FALLBACK_COORDS = { lat: 21.0285, lng: 105.8542 }; // Hồ Gươm

export const useLocation = () => {
  const { user } = useAuth();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Lấy thông tin từ user để so sánh
  const userStoredCoords = getUserLatLng(user);
  const userLat = userStoredCoords?.lat;
  const userLng = userStoredCoords?.lng;

  const isMounted = useRef(true);

  // Tách logic lấy toạ độ ra riêng
  const getCoordsLogic = async () => {
    // 1. Ưu tiên địa chỉ đã lưu trong Profile User
    if (userLat && userLng) {
      return { lat: userLat, lng: userLng };
    }

    // 2. Lấy GPS thực tế
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      let finalStatus = status;
      if (status !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync();
        finalStatus = req.status;
      }

      if (finalStatus !== "granted") {
        return FALLBACK_COORDS;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch (error) {
      return FALLBACK_COORDS;
    }
  };

  // Hàm này dùng để gọi lại mỗi khi cần reload (vd: kéo refresh)
  const refreshLocation = useCallback(async () => {
    setLoading(true);
    const location = await getCoordsLogic();
    if (isMounted.current) {
      setCoords(location); // <--- QUAN TRỌNG: Phải cập nhật state
      setLoading(false);
    }
    return location;
  }, [userLat, userLng]);

  useEffect(() => {
    isMounted.current = true;
    refreshLocation();
    return () => {
      isMounted.current = false;
    };
  }, [refreshLocation]);

  return { coords, refreshLocation, loading };
};
