import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const MESSAGES_DIR = path.resolve("src/shared/i18n/messages");
// Convention: fr.json is the source of truth for translation keys.
// All other locales must contain exactly the same key paths.
const BASE_LOCALE = "fr";
const TARGET_LOCALES = ["en", "es"];

/**
 * Flattens a nested object into dot-separated key paths.
 */
const flattenKeys = (value, prefix = "") => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, nested]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return flattenKeys(nested, nextPrefix);
  });
};

const readLocaleFile = (locale) => {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
};

const baseMessages = readLocaleFile(BASE_LOCALE);
const baseKeys = new Set(flattenKeys(baseMessages));

let hasErrors = false;

for (const locale of TARGET_LOCALES) {
  const localeMessages = readLocaleFile(locale);
  const localeKeys = new Set(flattenKeys(localeMessages));

  const missingKeys = [...baseKeys].filter((key) => !localeKeys.has(key));
  const extraKeys = [...localeKeys].filter((key) => !baseKeys.has(key));

  if (missingKeys.length > 0 || extraKeys.length > 0) {
    hasErrors = true;
    console.error(`\n[${locale}] Key mismatch detected`);

    if (missingKeys.length > 0) {
      console.error(`- Missing keys (${missingKeys.length}):`);
      for (const key of missingKeys) {
        console.error(`  - ${key}`);
      }
    }

    if (extraKeys.length > 0) {
      console.error(`- Extra keys (${extraKeys.length}):`);
      for (const key of extraKeys) {
        console.error(`  - ${key}`);
      }
    }
  } else {
    console.log(`[${locale}] OK`);
  }
}

if (hasErrors) {
  process.exitCode = 1;
} else {
  console.log("\nAll locale files are aligned with fr.json.");
}
