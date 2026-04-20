import { create } from "zustand";

export type RecipesQuickListFeedbackAnimation = {
  id: string;
  sequence: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  targetCount: number;
};

type RecipesQuickListFeedbackState = {
  animations: RecipesQuickListFeedbackAnimation[];
  displayedCount: number | null;
  badgePulseKey: number;
  nextSequence: number;
  lastCommittedSequence: number;
};

type RecipesQuickListFeedbackActions = {
  syncDisplayedCount: (count: number) => void;
  commitAnimatedCount: (targetCount: number) => void;
  getProjectedCount: (fallbackCount: number) => number;
  enqueueAnimation: (
    input: Omit<RecipesQuickListFeedbackAnimation, "id" | "sequence">
  ) => RecipesQuickListFeedbackAnimation;
  completeAnimation: (animationId: string) => void;
};

type RecipesQuickListFeedbackStore = RecipesQuickListFeedbackState &
  RecipesQuickListFeedbackActions;

const initialState: RecipesQuickListFeedbackState = {
  animations: [],
  displayedCount: null,
  badgePulseKey: 0,
  nextSequence: 0,
  lastCommittedSequence: 0,
};

export const useRecipesQuickListFeedbackStore =
  create<RecipesQuickListFeedbackStore>((set, get) => ({
    ...initialState,

    syncDisplayedCount: (count) => {
      set((state) => {
        if (state.animations.length > 0 && state.displayedCount !== null) {
          return state;
        }

        if (state.displayedCount === count) {
          return state;
        }

        return {
          displayedCount: count,
        };
      });
    },

    commitAnimatedCount: (targetCount) => {
      set((state) => {
        const nextSequence = state.nextSequence + 1;

        return {
          displayedCount: targetCount,
          badgePulseKey: state.badgePulseKey + 1,
          nextSequence,
          lastCommittedSequence: nextSequence,
        };
      });
    },

    getProjectedCount: (fallbackCount) => {
      const latestAnimation =
        get().animations.reduce<RecipesQuickListFeedbackAnimation | null>(
          (currentLatest, animation) => {
            if (!currentLatest || animation.sequence > currentLatest.sequence) {
              return animation;
            }

            return currentLatest;
          },
          null
        );

      return (
        latestAnimation?.targetCount ?? get().displayedCount ?? fallbackCount
      );
    },

    enqueueAnimation: (input) => {
      const sequence = get().nextSequence + 1;
      const animation: RecipesQuickListFeedbackAnimation = {
        id: `recipes-quick-list-feedback-${sequence}`,
        sequence,
        ...input,
      };

      set((state) => ({
        animations: [...state.animations, animation],
        nextSequence: sequence,
      }));

      return animation;
    },

    completeAnimation: (animationId) => {
      set((state) => {
        const animation = state.animations.find(
          (item) => item.id === animationId
        );

        if (!animation) {
          return state;
        }

        if (animation.sequence <= state.lastCommittedSequence) {
          return {
            animations: state.animations.filter(
              (item) => item.id !== animationId
            ),
          };
        }

        return {
          animations: state.animations.filter(
            (item) => item.id !== animationId
          ),
          displayedCount: animation.targetCount,
          badgePulseKey: state.badgePulseKey + 1,
          lastCommittedSequence: animation.sequence,
        };
      });
    },
  }));
