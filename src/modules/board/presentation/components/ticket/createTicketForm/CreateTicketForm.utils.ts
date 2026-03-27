import type {
  CreateTicketFormValues,
} from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.types";

export const extractSelectedOptionValues = (
  selectedOptions: HTMLCollectionOf<HTMLOptionElement>
): string[] => {
  return Array.from(selectedOptions, (option) => option.value).filter(Boolean);
};

export const buildCreateTicketFormValues = ({
  title,
  description,
  status,
  labelIds,
}: {
  title: string;
  description: string;
  status: string;
  labelIds: string[];
}): CreateTicketFormValues => {
  return {
    title,
    description: description || undefined,
    status,
    labelIds,
  };
};
