import { create } from "zustand";
import { supabase } from "@/utils/supabase";
import type { AuthState, UserProfile } from "@/types/auth";
import { toast } from "sonner";

// 1. 스토어 상태 및 액션 정의
export const useAuthStore = create<AuthState>((set, get) => ({
  // --- 초기 상태 설정 ---
  user: null,
  session: null,
  isLoading: false,
  isInitializing: true,
  error: null,

  // 1. 앱 초기화: 세션 확인 및 DB 유저 정보 결합
  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) throw error;

        // 프로필이 있으면 저장, 없으면(인증전/탈퇴직후 등) null 유지
        set({
          session,
          user: profile ? (profile as UserProfile) : null,
          isInitializing: false,
        });
      } else {
        set({ session: null, user: null, isInitializing: false });
      }
    } catch (err) {
      console.error("Auth 초기화 실패:", err);
      set({ isInitializing: false, session: null, user: null });
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
      .maybeSingle();

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
      set({ isLoading: false });
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
      set({ isLoading: false });
      // 성공 토스트 메시지 store에서 처리
      toast.success("로그인 성공!", { id: "auth-status" });
    } catch (err: any) {
      let errorMessage = "로그인 정보가 일치하지 않습니다.";

      if (err.message.includes("Invalid login credentials")) {
        errorMessage = "아이디 또는 비밀번호를 다시 확인해주세요.";
      } else if (err.message.includes("Email not confirmed")) {
        errorMessage = "이메일 인증이 완료되지 않았습니다.";
      }
      toast.error(errorMessage, { id: "auth-status" });
      set({ isLoading: false, error: errorMessage });
    }
  },
  // 4-1. 구글 소셜 로그인
  signInWithGoogle: async () => {
    set({ isLoading: true });
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
    set({ isLoading: true });
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
