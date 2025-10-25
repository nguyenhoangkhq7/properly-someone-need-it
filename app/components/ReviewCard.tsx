import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../config/color";

const STAR_COLOR = colors.accent;

type ReviewCardProps = {
  avatar: any; // có thể là require hoặc URI online
  name: string;
  date: string;
  productImage: any; // có thể là require hoặc URI online
  productName: string;
  reviewText?: string;
  tags?: string[];
};

export default function ReviewCard({
  avatar,
  name,
  date,
  productImage,
  productName,
  reviewText,
  tags,
}: ReviewCardProps) {
  return (
    <View style={styles.reviewCard}>
      <Image source={avatar} style={styles.reviewAvatar} />
      <View style={styles.reviewContent}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewName}>{name}</Text>
          <Text style={styles.reviewDate}>{date}</Text>
        </View>

        <View style={styles.reviewStars}>
          {[...Array(5)].map((_, i) => (
            <Icon key={i} name="star" size={14} color={STAR_COLOR} />
          ))}
        </View>

        <View style={styles.reviewProduct}>
          <Image source={productImage} style={styles.reviewProductImage} />
          <View>
            <Text style={styles.reviewProductName}>{productName}</Text>
            <Text style={styles.reviewProductQty}>x1</Text>
          </View>
        </View>

        {reviewText && <Text style={styles.reviewText}>{reviewText}</Text>}

        {tags && (
          <View style={styles.reviewTagContainer}>
            {tags.map((tag) => (
              <View key={tag} style={styles.reviewTag}>
                <Text style={styles.reviewTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reviewCard: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewContent: { flex: 1 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between" },
  reviewName: { color: colors.text, fontSize: 14, fontWeight: "bold" },
  reviewDate: { color: colors.textSecondary, fontSize: 12 },
  reviewStars: { flexDirection: "row", marginVertical: 4 },
  reviewProduct: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  reviewProductImage: { width: 50, height: 50, borderRadius: 5, marginRight: 10 },
  reviewProductName: { color: colors.text, fontSize: 13 },
  reviewProductQty: { color: colors.textSecondary, fontSize: 12 },
  reviewText: { color: colors.text, fontSize: 14, marginTop: 10, lineHeight: 20 },
  reviewTagContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  reviewTag: {
    backgroundColor: colors.border,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  reviewTagText: { color: colors.textSecondary, fontSize: 12 },
});
