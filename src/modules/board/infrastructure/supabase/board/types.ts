export type BoardRow = {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
};

export type ColumnRow = {
  id: string;
  board_id: string;
  name: string;
  key: string;
  state: string;
  position: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
};
