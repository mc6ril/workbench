import { APP_LIMITS } from "@/shared/constants/app";
import { prepareWebpImageUploadFile } from "@/shared/infrastructure/media/prepareWebpImageUploadFile.browser";

export const prepareRecipeCoverUploadFile = async (
  file: File
): Promise<File> => {
  return prepareWebpImageUploadFile(file, {
    maxDimensionPx: APP_LIMITS.RECIPE_COVER.MAX_DIMENSION_PX,
    outputMimeType: APP_LIMITS.RECIPE_COVER.OUTPUT_MIME_TYPE,
    outputQuality: APP_LIMITS.RECIPE_COVER.OUTPUT_QUALITY,
    outputFilename: "recipe-cover.webp",
  });
};
