import { create } from "zustand";
import { supabase } from "@/utils/supabase";
import type { AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>((set, get) => ({
  // --- 초기 상태 설정 ---
  user: null,
  session: null,
  isLoading: false,
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
  signUpWithEmail: async (email, password, nickname) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname } }, //닉네임 저장
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
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
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
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  // 에러 상태 설정
  setError: (error) => set({ error }),

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
