import type { CreateTicketFormValues } from "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm.types";

export const buildCreateTicketFormValues = ({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: string;
}): CreateTicketFormValues => {
  return {
    title,
    description: description || undefined,
    status,
  };
};
