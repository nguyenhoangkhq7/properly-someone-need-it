import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../config/color";

interface InlineErrorBannerProps {
  message: string;
  iconName?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  testID?: string;
}

export function InlineErrorBanner({
  message,
  iconName = "warning-outline",
  actionLabel,
  onActionPress,
  testID,
}: InlineErrorBannerProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Icon
        name={iconName}
        size={18}
        color={colors.red || "#ff4d4f"}
        style={styles.icon}
      />
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      {actionLabel && onActionPress ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onActionPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: "rgba(244, 63, 94, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.3)",
  },
  icon: { marginRight: 10 },
  message: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "500",
    marginRight: 8,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  actionText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
