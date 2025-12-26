import { create } from "zustand";

// 1. 구독 및 퀴즈 사용 제한 상태 인터페이스

interface Subscription {
  plan: "free" | "pro"; // 구독 플랜 (subscription_plan)
  quizLimitDaily: number; // 일일 생성 가능한 최대 횟수 (quiz_limit_daily)
  quizCountToday: number; // 오늘 생성한 횟수 (quiz_count_today)
}

interface SubscriptionState {
  // 상태 데이터
  subscription: Subscription | null; // 구독 정보 (초기값 null)
  isLoading: boolean; // 로딩 상태
  error: string | null; // 에러 메시지

  // 2. 액션

  // 최신 구독/제한 정보를 스토어에 저장
  setSubscription: (data: Subscription) => void;

  // 로딩 상태 변경
  setLoading: (isLoading: boolean) => void;

  // 에러 상태 변경
  setError: (message: string | null) => void;

  // 퀴즈 생성 API 호출 성공 직후, DB를 다시 조회하기 전 UI에 카운트를 반영

  incrementQuizCount: () => void;

  //Pro에서 Free로 즉시 상태 변경
  cancelSubscription: () => void;

  // 퀴즈 생성이 가능한 상태인지 판별

  canCreateQuiz: () => boolean;
}

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
