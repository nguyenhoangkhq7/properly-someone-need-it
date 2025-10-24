import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Divider, List, TouchableRipple } from "react-native-paper";
import colors from "../../config/color"; // Giả định đường dẫn này
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const finalColors = {
    ...colors,
    warning: "#FF9800",
    contact: "#00FFFF",
};

interface OptionItem {
  label: string;
  icon: string;
  rightText?: string;
  isSeller?: boolean;
  isVerification?: boolean;
  isWarning?: boolean;
  isContact?: boolean;
}

interface MenuOptionListProps {
  title?: string;
  list: OptionItem[];
}

export default function MenuOptionList({ title, list }: MenuOptionListProps) {
  return (
    <View style={styles.listSection}>
      {title ? <Text style={styles.listTitle}>{title}</Text> : null}
      <Card style={styles.optionCard}>
        {list.map((item, i) => (
          <View key={i}>
            <TouchableRipple onPress={() => console.log(item.label)} style={styles.listItemRipple}>
              <List.Item
                title={item.label}
                titleStyle={{ color: finalColors.text, fontWeight: item.isWarning ? "700" : "400" }}
                left={() => (
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22} 
                    color={
                      item.isContact
                        ? finalColors.contact
                        : item.isWarning
                        ? finalColors.warning
                        : finalColors.primary
                    }
                    style={styles.listIcon}
                  />
                )}
                right={() => (
                  <View style={styles.rightContainer}>
                    {item.rightText && (
                      <Text
                        style={[
                          styles.rightText,
                          item.isVerification && styles.verificationText,
                          item.isSeller && styles.sellerText,
                        ]}
                      >
                        {item.rightText}
                      </Text>
                    )}
                    <Feather
                      name="chevron-right"
                      size={20}
                      color={finalColors.textSecondary}
                    />
                  </View>
                )}
                style={{ paddingLeft: 0 }}
              />
            </TouchableRipple>
            {i < list.length - 1 && <Divider style={styles.divider} />}
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  listSection: {
    marginHorizontal: 12,
  },
  listTitle: {
    color: finalColors.textSecondary,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 10,
    marginTop: 25,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  optionCard: {
    backgroundColor: finalColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: finalColors.border,
  },
  listItemRipple: {
    borderRadius: 20,
  },
  divider: {
    backgroundColor: finalColors.border,
    height: 1,
    marginLeft: 60,
    opacity: 0.6,
  },
  listIcon: {
    marginRight: 12,
    paddingLeft: 16,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  rightText: {
    fontSize: 14,
    marginRight: 8,
    color: finalColors.textSecondary,
  },
  verificationText: {
    color: finalColors.warning,
    fontWeight: "600",
  },
  sellerText: {
    color: finalColors.primary,
    fontWeight: "600",
  },
});