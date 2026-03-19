/**
 * Row type for the labels table.
 */
export type LabelRow = {
  id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
};

/**
 * Row type for the ticket_labels join table.
 */
export type TicketLabelRow = {
  ticket_id: string;
  label_id: string;
  created_at: string;
};
