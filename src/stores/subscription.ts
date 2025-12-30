import type { SubscriptionState } from "@/types/subscription";
import { create } from "zustand";

// 1. 스토어 상태 및 액션 정의
export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  isLoading: false,
  error: null,

  // 데이터 저장
  setSubscription: (data) =>
    set({
      subscription: data,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (message) => set({ error: message }),

  // 현재 상태를 가져와(get) 카운트만 1 증가
  incrementQuizCount: () => {
    const sub = get().subscription;
    if (sub) {
      set({
        subscription: {
          ...sub,
          quizCountToday: sub.quizCountToday + 1,
        },
      });
    }
  },

  // 구독 해제 시 상태를 Free 기본값으로 초기화
  cancelSubscription: () => {
    const sub = get().subscription;
    if (sub) {
      set({
        subscription: {
          plan: "free",
          quizLimitDaily: 2, // 무료 버전 기본 제한량
          quizCountToday: sub.quizCountToday, // 해제 전까지 쓴 횟수는 유지
        },
      });
    }
  },

  // 비즈니스 로직따라 퀴즈 생성 가능 여부 판단
  canCreateQuiz: () => {
    const sub = get().subscription;
    if (!sub) return false; // 데이터 로드 전에는 차단
    if (sub.plan === "pro") return true; // Pro 유저는 무조건 허용
    return sub.quizCountToday < sub.quizLimitDaily; // Free 유저는 잔여 횟수 체크
  },
}));
