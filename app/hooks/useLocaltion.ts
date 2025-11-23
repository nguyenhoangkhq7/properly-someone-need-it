import { useState, useEffect, useCallback, useRef } from "react";
import * as Location from "expo-location";
import { useAuth } from "../context/AuthContext";
import { getUserLatLng } from "../utils/distance";

// Default: Hồ Gươm, Hà Nội
const FALLBACK_COORDS = { lat: 21.0285, lng: 105.8542 };

export const useLocation = () => {
  const { user } = useAuth();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // 1. Phân rã User Coords để so sánh trong dependency array (Tránh infinite loop)
  const userStoredCoords = getUserLatLng(user);
  const userLat = userStoredCoords?.lat;
  const userLng = userStoredCoords?.lng;

  // Dùng ref để tránh việc request permission chạy lại liên tục nếu state thay đổi
  const isMounted = useRef(true);

  const getCurrentLocation = useCallback(async () => {
    // ƯU TIÊN 1: Nếu user đã lưu địa chỉ trong DB (đã được convert từ [Long, Lat] sang {lat, lng} bởi getUserLatLng)
    // Ta dùng luôn để đỡ tốn pin bật GPS
    if (userLat && userLng) {
      return { lat: userLat, lng: userLng };
    }

    // ƯU TIÊN 2: Lấy GPS thực tế
    try {
      // Kiểm tra quyền nhanh
      const { status } = await Location.getForegroundPermissionsAsync();

      let finalStatus = status;
      // Nếu chưa có quyền thì mới xin, tránh popup hiện liên tục gây khó chịu
      if (status !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync();
        finalStatus = req.status;
      }

      if (finalStatus !== "granted") {
        console.warn("Permission denied, using fallback");
        return FALLBACK_COORDS;
      }

      // Lấy vị trí (Accuracy Balanced là đủ cho thương mại điện tử, High tốn pin)
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Expo trả về: latitude, longitude
      // Ta map về chuẩn chung của App: lat, lng
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch (error) {
      console.warn("GPS Error:", error);
      return FALLBACK_COORDS;
    }
  }, [userLat, userLng]); // Chỉ tạo lại hàm khi địa chỉ lưu trong DB thay đổi

  useEffect(() => {
    isMounted.current = true;

    const initLocation = async () => {
      setLoading(true);
      const location = await getCurrentLocation();
      if (isMounted.current) {
        setCoords(location);
        setLoading(false);
      }
    };

    initLocation();

    return () => {
      isMounted.current = false;
    };
  }, [getCurrentLocation]);

  return { coords, refreshLocation: getCurrentLocation, loading };
};
