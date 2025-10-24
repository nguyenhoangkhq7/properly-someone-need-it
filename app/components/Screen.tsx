import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import Constants from "expo-constants";
import React from "react"; // Cần import React để dùng React.ReactNode

// 1. Định nghĩa kiểu dữ liệu cho props
type ScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>; // 'style' nên là tùy chọn (optional) và có kiểu là StyleProp<ViewStyle>
};

// 2. Áp dụng kiểu 'ScreenProps' cho function
function Screen({ children, style }: ScreenProps) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
  },
});

export default Screen;
