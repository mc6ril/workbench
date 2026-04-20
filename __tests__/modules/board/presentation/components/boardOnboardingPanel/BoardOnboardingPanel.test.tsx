import { fireEvent, render, screen } from "@testing-library/react";

import BoardOnboardingPanel from "@/modules/board/presentation/components/boardOnboardingPanel/BoardOnboardingPanel";
import { type OnboardingStep } from "@/modules/board/presentation/components/boardOnboardingPanel/onboarding.types";

describe("BoardOnboardingPanel", () => {
  const steps: OnboardingStep[] = [
    {
      id: "create-ticket",
      title: "Creer un ticket",
      description:
        "Creez votre premiere tache pour voir comment le board organise le travail.",
      status: "complete",
    },
    {
      id: "assign-ticket",
      title: "Ouvrir et assigner un ticket",
      description:
        "Ouvrez un ticket puis assignez-le a une personne pour clarifier qui prend le sujet en charge.",
      status: "current",
      actionLabel: "Ouvrir le ticket",
      actionAriaLabel: "Ouvrir un ticket pour l'assigner",
      onAction: jest.fn(),
    },
    {
      id: "comment-ticket",
      title: "Commenter un ticket",
      description:
        "Ajoutez un commentaire dans le ticket pour centraliser le contexte et les decisions.",
      status: "blocked",
      actionLabel: "Ouvrir les commentaires",
      actionAriaLabel: "Ouvrir un ticket pour ajouter un commentaire",
      onAction: jest.fn(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the compact review state and reopens the guide", () => {
    const onReviewGuide = jest.fn();

    render(
      <BoardOnboardingPanel
        isExpanded={false}
        steps={steps}
        onReviewGuide={onReviewGuide}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Revoir le guide",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Relancez a tout moment le parcours complet pour revoir la creation d'un ticket, l'assignation et les commentaires."
      )
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Revoir le guide d'onboarding du board",
      })
    );

    expect(onReviewGuide).toHaveBeenCalledTimes(1);
  });

  it("renders all steps in expanded mode and triggers the available actions", () => {
    const onHideGuide = jest.fn();
    const onSkipOnboarding = jest.fn();

    render(
      <BoardOnboardingPanel
        isExpanded
        steps={steps}
        onReviewGuide={jest.fn()}
        onHideGuide={onHideGuide}
        onSkipOnboarding={onSkipOnboarding}
        errorMessage="Impossible de charger l'onboarding."
      />
    );

    expect(
      screen.getByText("Prenez vos reperes sur le board")
    ).toBeInTheDocument();
    expect(screen.getByText("Creer un ticket")).toBeInTheDocument();
    expect(
      screen.getByText("Ouvrir et assigner un ticket")
    ).toBeInTheDocument();
    expect(screen.getByText("Commenter un ticket")).toBeInTheDocument();
    expect(screen.getByText("Fait")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.queryByText("A venir")).not.toBeInTheDocument();
    expect(
      screen.getByText("Impossible de charger l'onboarding.")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ouvrir un ticket pour l'assigner",
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Ouvrir un ticket pour ajouter un commentaire",
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Masquer le guide d'onboarding du board",
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Ne plus ouvrir automatiquement l'onboarding",
      })
    );

    expect(steps[1].onAction).toHaveBeenCalledTimes(1);
    expect(steps[2].onAction).toHaveBeenCalledTimes(1);
    expect(onHideGuide).toHaveBeenCalledTimes(1);
    expect(onSkipOnboarding).toHaveBeenCalledTimes(1);
  });

  it("hides the status badge and action for blocked steps", () => {
    const blockedSteps: OnboardingStep[] = [
      {
        id: "create-ticket",
        title: "Creer un ticket",
        description: "Creez votre premiere tache.",
        status: "current",
        actionLabel: "Creer un ticket",
        actionAriaLabel: "Ouvrir la creation d'un ticket",
        onAction: jest.fn(),
      },
      {
        id: "assign-ticket",
        title: "Ouvrir et assigner un ticket",
        description:
          "Créez d'abord un premier ticket. Vous pourrez ensuite l'ouvrir et l'assigner a une personne.",
        status: "blocked",
      },
      {
        id: "comment-ticket",
        title: "Commenter un ticket",
        description:
          "Créez d'abord un premier ticket. Vous pourrez ensuite l'ouvrir et y ajouter un commentaire.",
        status: "blocked",
      },
    ];

    render(
      <BoardOnboardingPanel
        isExpanded
        steps={blockedSteps}
        onReviewGuide={jest.fn()}
      />
    );

    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.queryByText("A venir")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Créez d'abord un premier ticket. Vous pourrez ensuite l'ouvrir et l'assigner a une personne."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Créez d'abord un premier ticket. Vous pourrez ensuite l'ouvrir et y ajouter un commentaire."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Ouvrir un ticket pour l'assigner",
      })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Ouvrir un ticket pour ajouter un commentaire",
      })
    ).not.toBeInTheDocument();
  });
});
