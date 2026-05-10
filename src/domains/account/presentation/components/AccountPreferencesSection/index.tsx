"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";

import { getAccessibilityId } from "@/shared/a11y";
import Select from "@/shared/design-system/select";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import Toggle from "@/shared/design-system/toggle";
import {
  type Locale,
  supportedLocaleOptions,
  supportedLocales,
  useLocalePreference,
  useTranslations,
} from "@/shared/i18n";
import { getErrorMessage } from "@/shared/i18n/errorMessages";
import {
  persistThemeCookie,
  type Theme,
  ThemeValues,
} from "@/shared/theme/config";
import { DEFAULT_USER_PREFERENCES } from "@/shared/user/userPreferences";

import styles from "./styles.module.scss";

import { useUpdatePreferences } from "@/domains/account/presentation/hooks/useUpdatePreferences";
import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";

const LANGUAGE_SELECT_OPTIONS = supportedLocaleOptions.map((locale) => ({
  value: locale.code,
  label: locale.label,
}));

const THEME_OPTIONS_KEYS: Theme[] = ["light", "dark", "system"];

const AccountPreferencesSection = () => {
  const applyLocalePreference = useLocalePreference();
  const { setTheme } = useTheme();

  const t = useTranslations("pages.account");
  const tErrors = useTranslations("errors");

  const { data: identity } = useAuthIdentity();
  const updatePreferencesMutation = useUpdatePreferences();

  const profileEmailNotifications =
    identity?.preferences.emailNotifications ??
    DEFAULT_USER_PREFERENCES.emailNotifications;
  const profileTheme =
    identity?.preferences.theme ?? DEFAULT_USER_PREFERENCES.theme;
  const profileLanguage =
    identity?.preferences.language ?? DEFAULT_USER_PREFERENCES.language;

  const [emailNotifications, setEmailNotifications] = useState<boolean>(
    profileEmailNotifications
  );
  const [themePreference, setThemePreference] = useState<Theme>(profileTheme);
  const [languagePreference, setLanguagePreference] =
    useState<string>(profileLanguage);

  useEffect(() => {
    setEmailNotifications(profileEmailNotifications);
  }, [profileEmailNotifications]);

  useEffect(() => {
    setThemePreference(profileTheme);
  }, [profileTheme]);

  useEffect(() => {
    setLanguagePreference(profileLanguage);
  }, [profileLanguage]);

  const preferencesErrorMessage = useMemo(() => {
    if (!updatePreferencesMutation.error) {
      return null;
    }
    return getErrorMessage(updatePreferencesMutation.error, tErrors);
  }, [tErrors, updatePreferencesMutation.error]);

  const handleEmailNotificationsChange = useCallback(
    (checked: boolean) => {
      setEmailNotifications(checked);
      updatePreferencesMutation.mutate({ emailNotifications: checked });
    },
    [updatePreferencesMutation]
  );

  const handleThemeChange = useCallback(
    (value: string) => {
      if ((ThemeValues as readonly string[]).includes(value)) {
        const nextTheme = value as Theme;
        setThemePreference(nextTheme);
        persistThemeCookie(nextTheme);
        setTheme(nextTheme);
        updatePreferencesMutation.mutate({ theme: nextTheme });
      }
    },
    [setTheme, updatePreferencesMutation]
  );

  const handleLanguageChange = useCallback(
    (value: string) => {
      if (supportedLocales.includes(value as Locale)) {
        const nextLocale = value as Locale;
        setLanguagePreference(nextLocale);
        applyLocalePreference(nextLocale);
      } else {
        setLanguagePreference(value);
      }
      updatePreferencesMutation.mutate({ language: value });
    },
    [applyLocalePreference, updatePreferencesMutation]
  );

  return (
    <section
      className={styles["account-section"]}
      aria-labelledby={getAccessibilityId("account-preferences-title")}
    >
      <div className={styles["section-header"]}>
        <div className={styles["section-header__icon"]} aria-hidden="true">
          {t("preferences.icon")}
        </div>
        <div>
          <Title
            variant="h2"
            id={getAccessibilityId("account-preferences-title")}
            className={styles["section-title"]}
          >
            {t("preferences.title")}
          </Title>
          <p className={styles["section-description"]}>
            {t("preferences.description")}
          </p>
        </div>
      </div>

      <div className={styles["section-content"]}>
        {updatePreferencesMutation.isSuccess && (
          <div
            className={styles["success-message"]}
            role="status"
            aria-live="polite"
          >
            {t("success.preferencesUpdated")}
          </div>
        )}

        {preferencesErrorMessage && (
          <div role="alert" aria-live="assertive">
            <Text variant="small">{preferencesErrorMessage}</Text>
          </div>
        )}

        <div className={styles["preference-item"]}>
          <div className={styles["preference-info"]}>
            <div className={styles["preference-label"]}>
              {t("preferences.emailNotifications.label")}
            </div>
            <div className={styles["preference-description"]}>
              {t("preferences.emailNotifications.description")}
            </div>
          </div>
          <Toggle
            label=""
            checked={emailNotifications}
            onChange={handleEmailNotificationsChange}
            disabled={updatePreferencesMutation.isPending}
            aria-label={t("preferences.emailNotifications.label")}
          />
        </div>

        <div className={styles["preference-item"]}>
          <div className={styles["preference-info"]}>
            <div className={styles["preference-label"]}>
              {t("preferences.theme.label")}
            </div>
            <div className={styles["preference-description"]}>
              {t("preferences.theme.description")}
            </div>
          </div>
          <Select
            label=""
            options={THEME_OPTIONS_KEYS.map((key) => ({
              value: key,
              label: t(`preferences.theme.options.${key}`),
            }))}
            value={themePreference}
            onChange={(e) => {
              handleThemeChange(e.target.value);
            }}
            aria-label={t("preferences.theme.label")}
          />
        </div>

        <div className={styles["preference-item"]}>
          <div className={styles["preference-info"]}>
            <div className={styles["preference-label"]}>
              {t("preferences.language.label")}
            </div>
            <div className={styles["preference-description"]}>
              {t("preferences.language.description")}
            </div>
          </div>
          <Select
            label=""
            options={LANGUAGE_SELECT_OPTIONS}
            value={languagePreference}
            onChange={(e) => {
              handleLanguageChange(e.target.value);
            }}
            aria-label={t("preferences.language.label")}
          />
        </div>
      </div>
    </section>
  );
};

export default React.memo(AccountPreferencesSection);
