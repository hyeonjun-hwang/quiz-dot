// --- 1. Supabase 'users' 테이블 기반 사용자 정보 구조 ---
export interface UserProfile {
  id: string; // auth.users.id와 1:1 매핑
  email: string;
  nickname?: string;
  subscription_plan: "free" | "pro";
  quiz_limit_daily: number; // 일일 퀴즈 생성 한도
  quiz_count_today: number; // 오늘 생성한 퀴즈 수
  is_admin: boolean; // 어드민 계정 여부
}

export interface AuthState {
  // --- 상태 (State) ---
  user: UserProfile | null; // 로그인한 유저 정보 (public.users 연동)
  session: any | null; // Supabase Auth 세션
  isLoading: boolean; // 로딩 상태
  isInitializing: boolean; // 초기화 상태
  error: string | null;

  // --- 액션 (Actions) ---
  initialize: () => Promise<void>; // 앱 초기화 및 세션 체크
  refreshUserProfile: () => Promise<void>; // 유저 한도 정보 갱신

  // 일반 로그인/회원가입
  signUpWithEmail: (
    email: string,
    password: string,
    nickname?: string
  ) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;

  // 소셜 로그인
  signInWithGoogle: () => Promise<void>;
  signInWithKakao: () => Promise<void>;

  // 로그아웃
  signOut: () => Promise<void>; // 로그아웃 및 상태 초기화

  // 에러 상태 설정
  setError: (error: string | null) => void;
}
