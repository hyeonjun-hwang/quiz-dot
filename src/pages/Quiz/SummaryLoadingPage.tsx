import { useEffect } from "react";
import { useNavigate } from "react-router";
import { SummaryLoader } from "@/components/SummaryLoader";

export function SummaryLoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // 5초 후 요약 결과 페이지로 이동
    const timer = setTimeout(() => {
      navigate("/summary-result");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SummaryLoader />
    </div>
  );
}
