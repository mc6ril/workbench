import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_ROOT = join(process.cwd(), "supabase", "migrations");

const resolveMigrationPath = (filename: string): string => {
  const directPath = join(MIGRATIONS_ROOT, filename);

  if (existsSync(directPath)) {
    return directPath;
  }

  const directories = [MIGRATIONS_ROOT];

  while (directories.length > 0) {
    const currentDirectory = directories.pop();

    if (!currentDirectory) {
      continue;
    }

    const entries = readdirSync(currentDirectory, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(currentDirectory, entry.name);

      if (entry.isDirectory()) {
        directories.push(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name === filename) {
        return entryPath;
      }
    }
  }

  throw new Error(`Could not find migration file: ${filename}`);
};

export const loadNormalizedMigrationSql = (filename: string): string => {
  return readFileSync(resolveMigrationPath(filename), "utf8")
    .replace(/\s+/g, " ")
    .trim();
};
