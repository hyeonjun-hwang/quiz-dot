import { QuizCreation } from "@/components/QuizCreation";

export function QuizCreationPage() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onMenuClick={() => setSideMenuOpen(true)} />
      <QuizCreation
        accessToken="demo-token"
        onQuizGenerated={() => {}}
        remainingQuizzes={5}
        onUpgradeNeeded={() => {}}
      />
      
      <SideMenu
        open={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        onLogout={() => {}}
        userName="디자인 데모"
        subscription={{
          tier: "FREE",
          remainingQuizzes: 5,
        }}
        onNavigate={() => {}}
      />
    </div>
  );
}
