import Constants from "expo-constants";

interface CloudinaryExtra {
  cloudName?: string;
  uploadPreset?: string;
  folder?: string;
}

interface ExpoExtra {
  cloudinary?: CloudinaryExtra;
}

const getExtraConfig = (): CloudinaryExtra => {
  const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
  return extra.cloudinary ?? {};
};

export const getCloudinaryConfig = () => {
  const extra = getExtraConfig();

  const cloudName =
    extra.cloudName ?? process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    extra.uploadPreset ?? process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const folder = extra.folder ?? process.env.EXPO_PUBLIC_CLOUDINARY_FOLDER;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Thiếu cấu hình Cloudinary. Vui lòng set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME và EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  return {
    cloudName,
    uploadPreset,
    folder,
  };
};
