import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, TouchableRipple } from "react-native-paper";
import colors from "../../config/color"; // Giả định đường dẫn này

const finalColors = {
    ...colors,
    warning: "#FF9800",
    contact: "#00FFFF",
};

export default function ProfileHeader() {
  return (
    <>
      <View style={styles.topSpacer} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>H</Text>
            <TouchableRipple style={styles.editButton} onPress={() => {}}>
              <Text style={styles.editText}>Chỉnh sửa</Text>
            </TouchableRipple>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>Hoàng Phạm Tăng</Text>
            <Button
              mode="contained"
              buttonColor={finalColors.accent}
              textColor="#000"
              style={styles.shopButton}
              labelStyle={{ fontWeight: "700", fontSize: 12 }}
              onPress={() => {}}
            >
              XEM SHOP
            </Button>
          </View>
        </View>
        <TouchableRipple style={styles.settingsIcon} onPress={() => {}}>
          <Text style={styles.editText}>Chỉnh sửa</Text>
        </TouchableRipple>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topSpacer: {
    height: 20,
    backgroundColor: finalColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: finalColors.surface,
    borderRadius: 20,
    marginHorizontal: 12,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: finalColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  avatarText: { fontSize: 28, fontWeight: "bold", color: finalColors.background },
  editButton: {
    position: "absolute",
    bottom: -4,
    right: -8,
    backgroundColor: finalColors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: finalColors.textSecondary,
  },
  editText: {
    color: finalColors.text,
    fontSize: 10,
  },
  userInfo: {
    justifyContent: "center",
  },
  name: { color: finalColors.text, fontSize: 20, fontWeight: "600" },
  shopButton: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  settingsIcon: {
    opacity: 0,
  },
});