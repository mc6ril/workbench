"use client";

import { startTransition, useEffect, useState } from "react";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import Button from "@/shared/design-system/button";
import Container from "@/shared/design-system/container";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import Toggle from "@/shared/design-system/toggle";
import {
  APP_COOKIE_KEYS,
  resetCookie,
  updateCookie,
} from "@/shared/infrastructure/storage/cookies";
import { useAppRouter } from "@/shared/navigation/useAppRouter";

import styles from "./styles.module.scss";

import type { RuntimeConfigEntry } from "@/domains/runtimeConfig/core/domain/runtimeConfig.types";
import {
  getRuntimeConfigBooleanOverride,
  type RuntimeConfigBooleanOverrides,
  serializeRuntimeConfigBooleanOverrides,
  withRuntimeConfigBooleanOverride,
} from "@/domains/runtimeConfig/infrastructure/local/runtimeConfigLocalOverrides";

type Props = {
  entries: RuntimeConfigEntry[];
  initialOverrides: RuntimeConfigBooleanOverrides;
};

const RUNTIME_CONFIG_OVERRIDE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const formatRuntimeConfigValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const persistRuntimeConfigOverrides = (
  overrides: RuntimeConfigBooleanOverrides
): void => {
  if (Object.keys(overrides).length === 0) {
    resetCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES);
    return;
  }

  updateCookie(
    APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES,
    serializeRuntimeConfigBooleanOverrides(overrides),
    {
      maxAgeSeconds: RUNTIME_CONFIG_OVERRIDE_COOKIE_MAX_AGE,
    }
  );
};

const RuntimeConfigLabPage = ({ entries, initialOverrides }: Props) => {
  const router = useAppRouter();
  const [overrides, setOverrides] = useState(initialOverrides);

  useEffect(() => {
    setOverrides(initialOverrides);
  }, [initialOverrides]);

  const booleanEntries = entries.filter(
    (entry): entry is RuntimeConfigEntry & { value: boolean } =>
      typeof entry.value === "boolean"
  );
  const nonBooleanEntries = entries.filter(
    (entry) => typeof entry.value !== "boolean"
  );
  const overrideCount = Object.keys(overrides).length;

  const applyOverrides = (nextOverrides: RuntimeConfigBooleanOverrides) => {
    setOverrides(nextOverrides);
    persistRuntimeConfigOverrides(nextOverrides);

    startTransition(() => {
      router.refresh({ feedback: "none" });
    });
  };

  return (
    <Container as="main" maxWidth="large" className={styles["lab-page"]}>
      <div className={styles["lab-shell"]}>
        <header className={styles["lab-header"]}>
          <div className={styles["lab-header__copy"]}>
            <Text variant="small" className={styles["lab-eyebrow"]}>
              Hidden Runtime Config Lab
            </Text>
            <Title variant="h1" className={styles["lab-title"]}>
              Local runtime config overrides
            </Title>
            <Text className={styles["lab-description"]}>
              This page only changes your local browser cookie. Remote config in
              Supabase stays untouched.
            </Text>
          </div>

          <div className={styles["lab-header__actions"]}>
            <Button
              label="Back to account"
              variant="secondary"
              onClick={() =>
                router.push(PAGE_ROUTES.ACCOUNT, { feedback: "none" })
              }
            />
            <Button
              label="Reset all overrides"
              variant="ghost"
              onClick={() => applyOverrides({})}
              disabled={overrideCount === 0}
            />
          </div>
        </header>

        <section className={styles["lab-summary"]} aria-label="Lab summary">
          <div className={styles["lab-summary__item"]}>
            <Text variant="small" className={styles["lab-summary__label"]}>
              Config keys
            </Text>
            <Text variant="metric" as="div">
              {entries.length}
            </Text>
          </div>

          <div className={styles["lab-summary__item"]}>
            <Text variant="small" className={styles["lab-summary__label"]}>
              Boolean flags
            </Text>
            <Text variant="metric" as="div">
              {booleanEntries.length}
            </Text>
          </div>

          <div className={styles["lab-summary__item"]}>
            <Text variant="small" className={styles["lab-summary__label"]}>
              Active overrides
            </Text>
            <Text variant="metric" as="div">
              {overrideCount}
            </Text>
          </div>
        </section>

        <section className={styles["lab-section"]} aria-labelledby="lab-flags">
          <div className={styles["lab-section__header"]}>
            <Title variant="h2" id="lab-flags" className={styles["lab-section__title"]}>
              Boolean flags
            </Title>
            <Text variant="small" className={styles["lab-section__description"]}>
              Toggle the effective value. Reset removes the local cookie override
              and goes back to the remote value.
            </Text>
          </div>

          <div className={styles["lab-list"]}>
            {booleanEntries.length === 0 ? (
              <div className={styles["lab-empty"]}>
                <Text>No boolean runtime config values were found.</Text>
              </div>
            ) : (
              booleanEntries.map((entry) => {
                const overrideValue = getRuntimeConfigBooleanOverride(
                  overrides,
                  entry.key
                );
                const isOverridden = typeof overrideValue === "boolean";
                const effectiveValue = overrideValue ?? entry.value;

                return (
                  <article
                    key={entry.key}
                    className={`${styles["lab-card"]} ${
                      isOverridden ? styles["lab-card--overridden"] : ""
                    }`}
                  >
                    <div className={styles["lab-card__main"]}>
                      <div className={styles["lab-card__copy"]}>
                        <code className={styles["lab-card__key"]}>
                          {entry.key}
                        </code>
                        <div className={styles["lab-card__meta"]}>
                          <span className={styles["lab-chip"]}>
                            Remote: {String(entry.value)}
                          </span>
                          <span className={styles["lab-chip"]}>
                            Local:{" "}
                            {typeof overrideValue === "boolean"
                              ? String(overrideValue)
                              : "remote"}
                          </span>
                        </div>
                      </div>

                      <div className={styles["lab-card__controls"]}>
                        <Toggle
                          label="Effective value"
                          checked={effectiveValue}
                          onChange={(nextValue) =>
                            applyOverrides(
                              withRuntimeConfigBooleanOverride({
                                overrides,
                                key: entry.key,
                                value: nextValue,
                                remoteValue: entry.value,
                              })
                            )
                          }
                        />
                        <Button
                          label={`Reset ${entry.key}`}
                          variant="ghost"
                          onClick={() =>
                            applyOverrides(
                              withRuntimeConfigBooleanOverride({
                                overrides,
                                key: entry.key,
                                value: entry.value,
                                remoteValue: entry.value,
                              })
                            )
                          }
                          aria-label={`Reset local override for ${entry.key}`}
                          disabled={!isOverridden}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section
          className={styles["lab-section"]}
          aria-labelledby="lab-read-only-values"
        >
          <div className={styles["lab-section__header"]}>
            <Title
              variant="h2"
              id="lab-read-only-values"
              className={styles["lab-section__title"]}
            >
              Read-only values
            </Title>
            <Text variant="small" className={styles["lab-section__description"]}>
              Non-boolean keys are shown here for inspection only.
            </Text>
          </div>

          <div className={styles["lab-list"]}>
            {nonBooleanEntries.length === 0 ? (
              <div className={styles["lab-empty"]}>
                <Text>No non-boolean runtime config values were found.</Text>
              </div>
            ) : (
              nonBooleanEntries.map((entry) => (
                <article key={entry.key} className={styles["lab-card"]}>
                  <div className={styles["lab-card__copy"]}>
                    <code className={styles["lab-card__key"]}>{entry.key}</code>
                    <pre className={styles["lab-card__value"]}>
                      {formatRuntimeConfigValue(entry.value)}
                    </pre>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </Container>
  );
};

export default RuntimeConfigLabPage;
