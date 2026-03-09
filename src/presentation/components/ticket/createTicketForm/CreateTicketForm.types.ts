export type Option = {
  value: string;
  label: string;
};

export type CreateTicketFormValues = {
  title: string;
  description?: string;
  status: string;
  epicId?: string;
  labelIds?: string[];
};
