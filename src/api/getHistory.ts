import { supabase } from "@/utils/supabase";

export interface HistoryItem {
  id: string; // 제출 ID
  quiz_id: string; // 퀴즈 ID
  score: number;
  correct_count: number;
  total_count: number;
  created_at: string;
  quizzes: {
    title: string | null;
    is_shared: boolean;
    shared_token: string | null;
  } | null;
}

export async function getHistory(): Promise<HistoryItem[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("quiz_submissions")
    .select(
      `
      id,
      quiz_id,
      score,
      correct_count,
      total_count,
      created_at,
      quizzes (
        title,
        is_shared,
        shared_token
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching history:", error);
    throw new Error("Could not fetch history data.");
  }

  return (data as unknown as HistoryItem[]) || [];
}
