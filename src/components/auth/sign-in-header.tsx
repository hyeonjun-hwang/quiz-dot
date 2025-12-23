import { Logo } from "@/components/ui/Logo";
import { Sparkles, FileText } from "lucide-react";

export function SigninHeader() {
  return (
    <div className="text-center space-y-4">
      <Logo className="text-4xl justify-center mx-auto" />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">AI 기반 맞춤형 퀴즈 학습</h1>
        <p className="text-sm text-muted-foreground px-4">
          텍스트와 PDF를 업로드하면 AI가 자동으로 퀴즈와 요약을 생성합니다
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4">
        <FeatureItem
          icon={<Sparkles className="h-5 w-5 text-primary" />}
          text="AI 퀴즈 생성"
        />
        <FeatureItem
          icon={<FileText className="h-5 w-5 text-primary" />}
          text="AI 요약 생성"
        />
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background border shadow-sm">
      {icon}
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
}
