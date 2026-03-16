import { createConstraintError } from "@/core/domain/repositoryError";

import { getErrorMessage } from "@/shared/i18n/errorMessages";

const createTranslator = (messages: Record<string, string>) => {
  return (key: string) => messages[key] ?? key;
};

describe("getErrorMessage", () => {
  it("maps LAST_ADMIN_REQUIRED constraint to its domain translation", () => {
    const tErrors = createTranslator({
      "domain.LAST_ADMIN_REQUIRED":
        "Le projet doit conserver au moins un administrateur",
      "repository.CONSTRAINT_VIOLATION": "Une contrainte a été violée",
      generic: "Une erreur s'est produite",
    });

    const error = createConstraintError("LAST_ADMIN_REQUIRED");

    expect(getErrorMessage(error, tErrors)).toBe(
      "Le projet doit conserver au moins un administrateur"
    );
  });

  it("maps invitation expiry constraint to its domain translation", () => {
    const tErrors = createTranslator({
      "domain.INVITATION_EXPIRED": "Ce lien d'invitation a expiré",
      "repository.CONSTRAINT_VIOLATION": "Une contrainte a été violée",
      generic: "Une erreur s'est produite",
    });

    const error = createConstraintError("INVITATION_EXPIRED");

    expect(getErrorMessage(error, tErrors)).toBe(
      "Ce lien d'invitation a expiré"
    );
  });
});
