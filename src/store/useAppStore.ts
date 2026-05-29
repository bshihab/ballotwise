import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildProfile } from '@/services/matching';
import { QUESTIONS } from '@/data/questions';
import type { Address, AnswerValue, Answers, Election, StanceMap } from '@/types';

interface AppState {
  // Location
  address: Address | null;
  setAddress: (a: Address | null) => void;

  // Elections
  selectedElection: Election | null;
  selectElection: (e: Election | null) => void;

  // Questionnaire
  answers: Answers;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  resetAnswers: () => void;
  profile: StanceMap | null;
  finalizeProfile: () => StanceMap;

  // Ballot selections: contestId -> candidateId the user has marked.
  selections: Record<string, string>;
  setSelection: (contestId: string, candidateId: string) => void;

  // Progress helpers
  answeredCount: () => number;
  isComplete: () => boolean;

  // Full reset (used by "start over")
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      address: null,
      setAddress: (address) => set({ address }),

      selectedElection: null,
      selectElection: (selectedElection) => set({ selectedElection }),

      answers: {},
      setAnswer: (questionId, value) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: value } })),
      resetAnswers: () => set({ answers: {}, profile: null }),

      profile: null,
      finalizeProfile: () => {
        const profile = buildProfile(get().answers);
        set({ profile });
        return profile;
      },

      selections: {},
      setSelection: (contestId, candidateId) =>
        set((s) => ({ selections: { ...s.selections, [contestId]: candidateId } })),

      answeredCount: () => Object.keys(get().answers).length,
      isComplete: () => Object.keys(get().answers).length >= QUESTIONS.length,

      reset: () =>
        set({ address: null, selectedElection: null, answers: {}, profile: null, selections: {} }),
    }),
    {
      name: 'ballotwise-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        address: s.address,
        selectedElection: s.selectedElection,
        answers: s.answers,
        profile: s.profile,
        selections: s.selections,
      }),
    },
  ),
);
