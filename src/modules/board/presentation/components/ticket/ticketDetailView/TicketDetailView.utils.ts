import type { TicketPriority } from "@/modules/board/core/domain/schema/ticket.schema";

type TranslateFn = (key: string) => string;

type SelectOption = {
  value: string;
  label: string;
};

const PRIORITY_VALUES: TicketPriority[] = [
  "highest",
  "high",
  "medium",
  "low",
  "lowest",
];

export const buildPriorityOptions = (t: TranslateFn): SelectOption[] => {
  return [
    { value: "", label: t("fields.none") },
    ...PRIORITY_VALUES.map((value) => ({
      value,
      label: t(`priority.${value}`),
    })),
  ];
};
