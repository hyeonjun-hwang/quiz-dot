import { create } from "zustand";
import { supabase } from "@/utils/supabase";

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

interface AuthState {
  // --- 상태 (State) ---
  user: UserProfile | null; // 로그인한 유저 정보 (public.users 연동)
  session: any | null; // Supabase Auth 세션
  isLoading: boolean; // 로딩 상태
  error: string | null;

  // --- 액션 (Actions) ---
  initialize: () => Promise<void>; // 앱 초기화 및 세션 체크
  refreshUserProfile: () => Promise<void>; // 유저 한도 정보 갱신

  // 일반 로그인/회원가입
  signUpWithEmail: (
    email: string,
    password: string
    // nickname: string
  ) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;

  // 소셜 로그인
  signInWithGoogle: () => Promise<void>;
  signInWithKakao: () => Promise<void>;

  // 로그아웃
  signOut: () => Promise<void>; // 로그아웃 및 상태 초기화
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // --- 초기 상태 설정 ---
  user: null,
  session: null,
  isLoading: true,
  error: null,

  // 1. 앱 초기화: 세션 확인 및 DB 유저 정보 결합
  initialize: async () => {
    set({ isLoading: true, error: null });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!error && profile) {
        set({ session, user: profile as UserProfile, isLoading: false });
      } else {
        set({ session, isLoading: false, error: "프로필 조회 실패" });
      }
    } else {
      set({ session: null, user: null, isLoading: false });
    }
  },

  // 2. 최신 유저 정보 갱신 (퀴즈 생성 후 호출)
  refreshUserProfile: async () => {
    const userId = get().user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from("users")
      .select("quiz_count_today, quiz_limit_daily, subscription_plan")
      .eq("id", userId)
      .single();

    if (!error && data) {
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      }));
    }
  },

  // 3-1. 일반 회원가입
  signUpWithEmail: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        //options: { data: { nickname } }, //닉네임 저장
      });
      if (error) throw error;
      alert("가입 확인 이메일이 발송되었습니다!");
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  // 닉네임 추가시 주석 해제 및 signWithEmail 함수 내 nicnkname 파라미터 추가

  // 3-2. 일반 로그인
  signInWithEmail: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // 로그인 성공 시 세션 정보를 바탕으로 초기화 실행
      await get().initialize();
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // 4-1. 구글 소셜 로그인
  signInWithGoogle: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/auth/callback" },
      });
      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // 4-2. 카카오 소셜 로그인
  signInWithKakao: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: { redirectTo: window.location.origin + "/auth/callback" },
      });
      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // 5. 로그아웃 (상태 초기화 통합)
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, error: null });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
