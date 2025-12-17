import { useState } from "react";

import { Header } from "../components/Header";

import { SideMenu } from "../components/SideMenu";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

import { Button } from "../components/ui/button";

import { Badge } from "../components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import { Clock, Award, Share2, Copy } from "lucide-react";

import { toast } from "sonner";

import { KakaoIcon } from "../components/icons/KakaoIcon";

import { InstagramIcon } from "../components/icons/InstagramIcon";

const historyData = [
  {
    quizId: "quiz-1",
    score: 85,
    totalQuestions: 10,
    correctCount: 8,
    questions: [],
    submittedAt: "2024-12-09T10:30:00",
  },
  {
    quizId: "quiz-2",
    score: 70,
    totalQuestions: 5,
    correctCount: 3,
    questions: [],
    submittedAt: "2024-12-08T15:20:00",
  },
  {
    quizId: "quiz-3",
    score: 90,
    totalQuestions: 15,
    correctCount: 13,
    questions: [],
    submittedAt: "2024-12-07T09:15:00",
  },
];

export function HistoryPage() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const handleCopyUrl = (quizId: string) => {
    const url = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("URL이 클립보드에 복사되었습니다!");
    }).catch(() => {
      toast.error("URL 복사에 실패했습니다.");
    });
  };

  const handleKakaoShare = (quizId: string) => {
    const url = `${window.location.origin}/quiz/${quizId}`;
    
    // 1. URL을 클립보드에 복사
    navigator.clipboard.writeText(url).then(() => {
      toast.success("URL이 클립보드에 복사되었습니다! 카카오톡을 열어주세요.");
      
      // 2. 카카오톡 열기 시도 (약간의 지연을 두어 드롭다운이 먼저 닫히도록 함)
      setTimeout(() => {
        // 모바일 감지
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // 모바일: 카카오톡 앱 열기 시도
          const kakaoAppUrl = `kakaotalk://`;
          window.location.href = kakaoAppUrl;
        } else {
          // 데스크톱: 카카오톡 데스크톱 앱 열기 시도
          // Windows에서 카카오톡 데스크톱 앱이 설치되어 있다면 열림
          try {
            // 카카오톡 프로토콜로 앱 열기 시도
            window.location.href = `kakaotalk://`;
            
            // 앱이 열리지 않을 경우를 대비해 사용자에게 안내
            setTimeout(() => {
              toast.info("카카오톡 데스크톱 앱이 열리지 않으면, 카카오톡을 직접 열어주세요.");
            }, 500);
          } catch (error) {
            toast.info("카카오톡을 직접 열어주세요. URL이 클립보드에 복사되었습니다.");
          }
        }
      }, 100);
    }).catch(() => {
      toast.error("URL 복사에 실패했습니다.");
    });
  };

  const handleInstagramShare = (quizId: string) => {
    const url = `${window.location.origin}/quiz/${quizId}`;
    
    // 1. URL을 클립보드에 복사
    navigator.clipboard.writeText(url).then(() => {
      toast.success("URL이 클립보드에 복사되었습니다!");
      
      // 2. 인스타그램 창 열기 (약간의 지연을 두어 드롭다운이 먼저 닫히도록 함)
      setTimeout(() => {
        // 모바일: 인스타그램 앱 열기, 데스크톱: 인스타그램 웹 열기
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const instagramUrl = isMobile 
          ? `instagram://` // 모바일에서는 인스타그램 앱 열기
          : `https://www.instagram.com/`; // 데스크톱에서는 인스타그램 웹 열기
        
        if (isMobile) {
          // 모바일: 인스타그램 앱 열기 시도
          window.location.href = instagramUrl;
          // 앱이 없을 경우를 대비해 웹 링크로 폴백
          setTimeout(() => {
            window.open(`https://www.instagram.com/`, "_blank");
          }, 500);
        } else {
          // 데스크톱: 새 창으로 인스타그램 웹 열기
          const newWindow = window.open(instagramUrl, "_blank", "noopener,noreferrer");
          if (!newWindow) {
            toast.error("팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.");
          }
        }
      }, 100);
    }).catch(() => {
      toast.error("URL 복사에 실패했습니다.");
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSideMenuOpen(true)} />

      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <div>
          <h1>학습 기록</h1>
          <p className="text-muted-foreground mt-1">
            지금까지의 학습 결과를 확인하세요
          </p>
        </div>

        <div className="space-y-4">
          {historyData.map((result, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    퀴즈 결과
                  </CardTitle>
                  <Badge variant={result.score >= 80 ? "default" : "secondary"}>
                    {result.score}점
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {result.correctCount} / {result.totalQuestions} 정답
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(result.submittedAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        공유하기
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleCopyUrl(result.quizId)}>
                        <Copy className="h-4 w-4 mr-2" />
                        URL 복사
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleKakaoShare(result.quizId)}>
                        <KakaoIcon className="h-4 w-4 mr-2" />
                        카카오톡 공유
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleInstagramShare(result.quizId)}>
                        <InstagramIcon className="h-4 w-4 mr-2" />
                        인스타그램 공유
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <SideMenu
        open={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        onLogout={() => {
          toast.success("로그아웃 되었습니다!");
        }}
        userName="디자인 데모"
        subscription={{
          tier: "FREE",
          remainingQuizzes: 5,
        }}
        onNavigate={(page) => {
          toast.info(`${page} 페이지로 이동합니다.`);
        }}
      />
    </div>
  );
}
