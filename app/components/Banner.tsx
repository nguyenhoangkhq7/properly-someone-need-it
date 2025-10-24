import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../config/color";

const Banner: React.FC = () => {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>GIAO MÙA RỒI</Text>
      <Text style={styles.bannerSubtitle}>Tạm biệt đồ cũ thôi!</Text>
      <TouchableOpacity style={styles.bannerButton}>
        <Text style={styles.bannerButtonText}>Khám phá ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.background,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: colors.background,
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bannerButtonText: {
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default Banner;
