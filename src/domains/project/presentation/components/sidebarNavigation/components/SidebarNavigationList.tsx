import { PlusIcon } from "@/shared/design-system/icons";
import NavigationItem from "@/shared/design-system/NavigationItem";
import { isActiveHref } from "@/shared/utils";

import styles from "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation.module.scss";
import type { SidebarItem } from "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation.types";

type Props = {
  items: SidebarItem[];
  pathname: string;
  navListId: string;
  addTabLabel: string;
  addTabAriaLabel: string;
  getLockedAriaLabel: (item: SidebarItem) => string;
  onAddTabClick: () => void;
  onItemClick: (item: SidebarItem) => void;
  onItemPrefetch: (item: SidebarItem) => void;
};

const SidebarNavigationList = ({
  items,
  pathname,
  navListId,
  addTabLabel,
  addTabAriaLabel,
  getLockedAriaLabel,
  onAddTabClick,
  onItemClick,
  onItemPrefetch,
}: Props) => {
  return (
    <div className={styles["sidebar-navigation__nav"]}>
      <ul id={navListId} className={styles["sidebar-navigation__list"]}>
        {items.map((item) => (
          <NavigationItem
            key={item.key}
            href={item.href}
            label={item.label}
            active={
              !item.locked &&
              isActiveHref(pathname, item.href, {
                exactOnly: item.exactOnly,
              })
            }
            locked={item.locked}
            planBadge={item.planBadge}
            onClick={() => {
              onItemClick(item);
            }}
            onMouseEnter={() => {
              onItemPrefetch(item);
            }}
            onFocus={() => {
              onItemPrefetch(item);
            }}
            ariaLabel={item.locked ? getLockedAriaLabel(item) : undefined}
          />
        ))}
      </ul>

      <button
        type="button"
        className={styles["sidebar-navigation__add-tab"]}
        onClick={onAddTabClick}
        aria-label={addTabAriaLabel}
      >
        <PlusIcon
          className={styles["sidebar-navigation__add-tab-icon"]}
          size={16}
        />
        <span className={styles["sidebar-navigation__add-tab-label"]}>
          {addTabLabel}
        </span>
      </button>
    </div>
  );
};

export default SidebarNavigationList;
