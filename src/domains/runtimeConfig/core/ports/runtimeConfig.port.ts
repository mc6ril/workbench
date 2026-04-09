export type RuntimeConfigPort = {
  getValue(key: string): Promise<unknown>;
};

