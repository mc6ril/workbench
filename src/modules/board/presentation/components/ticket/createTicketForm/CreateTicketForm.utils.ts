import type { CreateTicketFormValues } from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.types";

export const buildCreateTicketFormValues = ({
  title,
  description,
  columnId,
}: {
  title: string;
  description: string;
  columnId: string;
}): CreateTicketFormValues => {
  return {
    title,
    description: description || undefined,
    columnId,
  };
};
