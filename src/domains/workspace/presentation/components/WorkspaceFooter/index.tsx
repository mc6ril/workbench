"use client";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import Link from "@/shared/design-system/link";
import { useTranslations } from "@/shared/i18n";

import styles from "./styles.module.scss";

type WorkspaceFooterProps = {
  isBillingVisible?: boolean;
  legal: string;
  pricing: string;
};

const WorkspaceFooter = ({
  isBillingVisible,
  legal,
  pricing,
}: WorkspaceFooterProps) => {
  const t = useTranslations("pages.workspace");

  return (
    <footer className={styles.footer} aria-label={t("footer.ariaLabel")}>
      <nav className={styles["footer__nav"]}>
        <Link
          href={PAGE_ROUTES.ACCOUNT}
          className={styles["footer__link"]}
          ariaLabel={t("footer.account")}
        >
          {t("footer.account")}
        </Link>
        <Link
          href={legal}
          className={styles["footer__link"]}
          ariaLabel={t("footer.legal")}
        >
          {t("footer.legal")}
        </Link>
        {isBillingVisible && (
          <Link
            href={pricing}
            className={styles["footer__link"]}
            ariaLabel={t("footer.subscriptions")}
          >
            {t("footer.subscriptions")}
          </Link>
        )}
      </nav>
    </footer>
  );
};

export default WorkspaceFooter;
