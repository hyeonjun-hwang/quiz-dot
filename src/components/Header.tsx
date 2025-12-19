import { Menu } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";

interface HeaderProps {
  onMenuClick: () => void;
  showMenu?: boolean;
}

function Header({ onMenuClick, showMenu = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Logo className="text-xl" />
        {showMenu && (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
        )}
      </div>
    </header>
  )
}

export {Header};