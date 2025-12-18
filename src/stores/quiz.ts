import { create } from "zustand";



  //1. UI 및 API 통신에서 공통으로 사용할 데이터 규격 (Interface)

// 각 퀴즈 문제의 상세 콘텐츠
export interface QuizQuestionContent {
  id: string; // 문제 고유 ID
  questionText: string; // 문제 텍스트
  options: string[]; // 객관식 선택지 배열 (단답형인 경우 빈 배열)
  correctAnswer: string; // 정답 텍스트
  explanation: string; // 정답 해설
  type: "multiple_choice" | "short_answer"; // 퀴즈 타입
}

// 현재 활성화된 퀴즈 전체 정보
export interface ActiveQuiz {
  quizId: string; // 퀴즈 세션 고유 ID
  title: string; // 퀴즈 제목
  summary: string; // 퀴즈 요약 설명
  type: string; // 퀴즈 유형
  difficulty: string; // 난이도
  questions: QuizQuestionContent[]; // 문제 리스트
}

// 사용자가 실시간으로 입력하는 답변 정보 (배열 형태로 관리)
export interface SessionAnswer {
  questionId: string; // 문제 고유 ID
  userSelectedAnswer: string; // 사용자가 선택/입력한 답변
  isCorrect: boolean; // 정답 여부
}

// 2. 스토어 상태 및 액션 정의
 
interface QuizState {
  // --- 상태 (State) ---
  activeQuiz: ActiveQuiz | null;      // 현재 진행 중인 퀴즈
  sessionAnswers: SessionAnswer[];    // 사용자의 현재 풀이 기록
  records: any[];                     // 불러온 과거 학습 기록 리스트
  
  isGenerating: boolean;              // 생성 로딩 상태
  isSubmitting: boolean;              // 제출 로딩 상태
  error: string | null;               // UI에 표시할 에러 메시지

  // --- 액션 (Actions) ---
  
  // API 함수에서 결과물을 받아 스토어에 저장

  // 퀴즈 데이터 전역 상태 저장 
  setActiveQuiz: (quiz: ActiveQuiz) => void;

  // 사용자의 답변을 세션에 업데이트 (이미 존재하면 교체)
  submitAnswer: (questionId: string, answer: string, isCorrect: boolean) => void;

  // API에서 불러온 기록 데이터를 스토어에 저장 
  setRecords: (records: any[]) => void;

  // 로딩 및 에러 상태 제어
  setIsGenerating: (status: boolean) => void; // 퀴즈 생성 로딩 상태
  setIsSubmitting: (status: boolean) => void; // 퀴즈 제출 로딩 상태
  setError: (message: string | null) => void; // 에러 메시지 설정

  /** 퀴즈 세션 초기화 (종료 혹은 페이지 이탈 시) */
  resetQuizSession: () => void;
}


 // 3. 스토어 생성
 
export const useQuizStore = create<QuizState>((set) => ({
  activeQuiz: null, // 현재 진행 중인 퀴즈
  sessionAnswers: [], // 사용자의 현재 풀이
  records: [], // 불러온 과거 학습 기록 리스트
  isGenerating: false, // 생성 로딩 상태
  isSubmitting: false, // 제출 로딩 상태
  error: null, // UI에 표시할 에러 메시지

  // 액션  

  // 퀴즈 데이터 전역 상태 저장
  setActiveQuiz: (quiz) => set({ 
    activeQuiz: quiz, // 새로운 퀴즈 설정 
    sessionAnswers: [],  // 풀이 기록 초기화
    isGenerating: false, // 생성 로딩 해제
    error: null //  에러 초기화
  }),

  // 사용자의 답변을 세션에 업데이트
  submitAnswer: (questionId, answer, isCorrect) =>
    set((state) => {
      // 기존에 해당 문제에 대한 답변이 있다면 제거하고 새로운 답변 추가
      const filteredAnswers = state.sessionAnswers.filter(
        (a) => a.questionId !== questionId
      );
      // 새로운 답변을 추가하여 상태 업데이트
      return {
        sessionAnswers: [
          ...filteredAnswers,
          { questionId, userSelectedAnswer: answer, isCorrect },
        ],
      };
    }),

    // 불러온 기록 데이터를 스토어에 저장
  setRecords: (records) => set({ 
    records, 
    isSubmitting: false,
    error: null 
  }),

  // 로딩 및 에러 상태 제어
  setIsGenerating: (status) => set({ isGenerating: status }),
  
  // 제출 로딩 상태
  setIsSubmitting: (status) => set({ isSubmitting: status }),

  // 에러 메시지 설정
  setError: (message) => set({ error: message }),

  // 퀴즈 세션 초기화
  resetQuizSession: () => set({ 
    activeQuiz: null, 
    sessionAnswers: [], 
    error: null 
  }),
}));