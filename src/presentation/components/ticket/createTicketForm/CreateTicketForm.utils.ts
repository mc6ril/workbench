import type {
  CreateTicketFormValues,
  Option,
} from "@/presentation/components/ticket/createTicketForm/CreateTicketForm.types";

export const buildEpicOptions = (epicOptions: Option[]): Option[] => {
  return [{ value: "", label: "" }, ...epicOptions];
};

export const extractSelectedOptionValues = (
  selectedOptions: HTMLCollectionOf<HTMLOptionElement>
): string[] => {
  return Array.from(selectedOptions, (option) => option.value).filter(Boolean);
};

export const buildCreateTicketFormValues = ({
  title,
  description,
  status,
  epicId,
  labelIds,
  showEpicField,
}: {
  title: string;
  description: string;
  status: string;
  epicId: string;
  labelIds: string[];
  showEpicField: boolean;
}): CreateTicketFormValues => {
  return {
    title,
    description: description || undefined,
    status,
    epicId: showEpicField ? epicId || undefined : undefined,
    labelIds,
  };
};
