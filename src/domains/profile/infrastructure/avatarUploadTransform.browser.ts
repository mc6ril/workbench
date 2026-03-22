import { APP_LIMITS } from "@/shared/constants/app";

const resizeDimensions = (width: number, height: number) => {
  const maxDimension = Math.max(width, height);

  if (maxDimension <= APP_LIMITS.AVATAR.MAX_DIMENSION_PX) {
    return { width, height };
  }

  const scale = APP_LIMITS.AVATAR.MAX_DIMENSION_PX / maxDimension;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

const loadImage = async (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Avatar image could not be processed"));
    };

    image.src = objectUrl;
  });
};

const canvasToWebpBlob = async (
  canvas: HTMLCanvasElement
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Avatar image could not be processed"));
          return;
        }

        resolve(blob);
      },
      APP_LIMITS.AVATAR.OUTPUT_MIME_TYPE,
      APP_LIMITS.AVATAR.OUTPUT_QUALITY
    );
  });
};

export const prepareAvatarUploadFile = async (file: File): Promise<File> => {
  const image = await loadImage(file);
  const { width, height } = resizeDimensions(image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Avatar image could not be processed");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToWebpBlob(canvas);

  return new File([blob], "avatar.webp", {
    type: APP_LIMITS.AVATAR.OUTPUT_MIME_TYPE,
    lastModified: Date.now(),
  });
};
