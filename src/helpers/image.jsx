import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Animated from "react-native-reanimated";
import { Image } from "expo-image";

export const CachedImage = (props) => {
  const { uri } = props;

  // For Android, use direct image loading
  // Why ? due to the storage space limitations inherent to AsyncStorage on Android Devices (6MBs)
  if (Platform.OS === "android") {
    return <Image source={{ uri }} {...props} />;
  }

  // For iOS, use AsyncStorage-based caching
  const [cachedSource, setCachedSource] = useState(null);

  useEffect(() => {
    const getCachedImage = async () => {
      try {
        const cachedImageData = await AsyncStorage.getItem(uri);
        if (cachedImageData) {
          setCachedSource({ uri: cachedImageData });
        } else {
          const response = await fetch(uri);
          const imageBlob = await response.blob();
          const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(imageBlob);
            reader.onloadend = () => {
              resolve(reader.result);
            };
          });
          await AsyncStorage.setItem(uri, base64Data);
          setCachedSource({ uri: base64Data });
        }
      } catch (error) {
        console.error("Error caching image:", error);
        setCachedSource({ uri });
      }
    };

    getCachedImage();
  }, [uri]);

  return <Animated.Image source={cachedSource} {...props} />;
};
