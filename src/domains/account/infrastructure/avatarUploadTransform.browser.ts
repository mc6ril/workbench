import { APP_LIMITS } from "@/shared/constants/app";
import { createAppError } from "@/shared/errors/appError";
import { INFRA_ERROR_CODE } from "@/shared/errors/appErrorCodes";
import { prepareWebpImageUploadFile } from "@/shared/infrastructure/media/prepareWebpImageUploadFile.browser";

export const prepareAvatarUploadFile = async (file: File): Promise<File> => {
  try {
    return await prepareWebpImageUploadFile(file, {
      maxDimensionPx: APP_LIMITS.AVATAR.MAX_DIMENSION_PX,
      outputMimeType: APP_LIMITS.AVATAR.OUTPUT_MIME_TYPE,
      outputQuality: APP_LIMITS.AVATAR.OUTPUT_QUALITY,
      outputFilename: "avatar.webp",
    });
  } catch {
    throw createAppError(INFRA_ERROR_CODE.AVATAR_PROCESSING_FAILED, {
      debugMessage: "Avatar image could not be processed",
    });
  }
};
