import type { Epic } from "@/core/domain/schema/epic.schema";
import type { Sprint } from "@/core/domain/schema/sprint.schema";
import type { TicketPriority } from "@/core/domain/schema/ticket.schema";

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

export const buildSprintOptions = (
  sprints: Sprint[],
  t: TranslateFn
): SelectOption[] => {
  return [
    { value: "", label: t("fields.none") },
    ...sprints.map((sprint) => ({ value: sprint.id, label: sprint.name })),
  ];
};

export const buildEpicOptions = (
  epics: Epic[],
  t: TranslateFn
): SelectOption[] => {
  return [
    { value: "", label: t("fields.none") },
    ...epics.map((epic) => ({ value: epic.id, label: epic.name })),
  ];
};
