import { BookOpen } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-[hsl(14_100%_57%)] bg-clip-text text-transparent">
            SkillCraft Academy
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#courses" className="text-foreground/80 hover:text-primary transition-colors">
            Courses
          </a>
          <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">
            Features
          </a>
          <a href="#about" className="text-foreground/80 hover:text-primary transition-colors">
            About
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
