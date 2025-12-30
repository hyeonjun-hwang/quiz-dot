// 1. 구독 및 퀴즈 사용 제한 상태 인터페이스

export interface Subscription {
  plan: "free" | "pro"; // 구독 플랜 (subscription_plan)
  quizLimitDaily: number; // 일일 생성 가능한 최대 횟수 (quiz_limit_daily)
  quizCountToday: number; // 오늘 생성한 횟수 (quiz_count_today)
}

export interface SubscriptionState {
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
