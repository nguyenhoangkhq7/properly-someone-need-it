import { getCloudinaryConfig } from "../config/cloudinary";

export type UploadOptions = {
  cloudName?: string;
  uploadPreset?: string;
  folder?: string;
  fileName?: string;
  mimeType?: string;
};

const getDefaultOptions = (): Required<Pick<UploadOptions, "cloudName" | "uploadPreset">> & {
  folder?: string;
} => {
  const config = getCloudinaryConfig();
  return {
    cloudName: config.cloudName,
    uploadPreset: config.uploadPreset,
    folder: config.folder,
  };
};

const buildFormData = (
  uri: string,
  options: UploadOptions,
  timestamp: number
): FormData => {
  const formData = new FormData();

  formData.append("file", {
    uri,
    name: options.fileName ?? `photo-${timestamp}.jpg`,
    type: options.mimeType ?? "image/jpeg",
  } as any);

  formData.append("upload_preset", options.uploadPreset ?? "");

  if (options.folder) {
    formData.append("folder", options.folder);
  }

  return formData;
};

export const uploadImageToCloudinary = async (
  uri: string,
  override?: UploadOptions
): Promise<string> => {
  const defaults = getDefaultOptions();
  const options = {
    cloudName: override?.cloudName ?? defaults.cloudName,
    uploadPreset: override?.uploadPreset ?? defaults.uploadPreset,
    folder: override?.folder ?? defaults.folder,
    fileName: override?.fileName,
    mimeType: override?.mimeType,
  };

  if (!options.cloudName || !options.uploadPreset) {
    throw new Error("Cloudinary configuration is missing.");
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${options.cloudName}/image/upload`;
  const body = buildFormData(uri, options, Date.now());

  const response = await fetch(endpoint, {
    method: "POST",
    body,
  });

  const text = await response.text();
  console.log("Cloudinary response", response.status, text);

  if (!response.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = JSON.parse(text);
  return data.secure_url as string;
};

export const uploadMultipleImages = async (
  uris: string[],
  options?: UploadOptions
): Promise<string[]> => {
  const uploaded: string[] = [];
  for (const uri of uris) {
    const url = await uploadImageToCloudinary(uri, options);
    uploaded.push(url);
  }
  return uploaded;
};
