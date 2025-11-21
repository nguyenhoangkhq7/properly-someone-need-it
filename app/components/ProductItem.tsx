import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import colors from "../config/color";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigator/HomeNavigator";
import type { Item } from "../types/Item";
import { getLocationLabelAsync, getLocationLabel } from "../utils/locationLabel";

const { width } = Dimensions.get("window");
const cardWidth = (width - 40) / 2;

interface Props {
  product: Item & { distanceKm?: number };
  horizontal?: boolean;
}

export default function ProductItem({ product, horizontal = false }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const [locationLabel, setLocationLabel] = useState(
    getLocationLabel(product.location)
  );
  const hasDistance = Number.isFinite(product.distanceKm);

  useEffect(() => {
    let mounted = true;
    getLocationLabelAsync(product.location).then((label) => {
      if (mounted) setLocationLabel(label);
    });
    return () => {
      mounted = false;
    };
  }, [product.location]);

  const locationText = locationLabel;

  return (
    <TouchableOpacity
      style={[styles.card, { width: horizontal ? 170 : cardWidth }]}
      onPress={() => navigation.navigate("ProductDetail", { product })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>

      <View style={styles.priceRow}>
        <View style={styles.priceTag}>
          <Text style={styles.price} numberOfLines={1} ellipsizeMode="tail">
            {product.price.toLocaleString()} d
          </Text>
        </View>
      </View>

      {hasDistance && (
        <View style={styles.distancePill}>
          <Ionicons
            name="navigate-outline"
            size={14}
            color={colors.primary}
            style={styles.distanceIcon}
          />
          <Text style={styles.distanceText} numberOfLines={1}>
            {`Cach ban ~${product.distanceKm} km`}
          </Text>
        </View>
      )}

      <View style={styles.metaRow}>
        <Ionicons
          name="location-outline"
          size={14}
          color={colors.muted}
          style={styles.metaIcon}
        />
        <Text style={styles.locationText} numberOfLines={1}>
          {locationText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 6,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#0f100f",
  },
  image: { width: "100%", height: "100%" },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10,
    minHeight: 42,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    minHeight: 30,
  },
  priceTag: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  price: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 14,
    maxWidth: 150,
  },
  distancePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#141511",
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceIcon: {
    marginRight: 6,
  },
  distanceText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  metaIcon: {
    marginRight: 6,
  },
  locationText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
});
