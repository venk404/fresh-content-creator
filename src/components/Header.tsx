import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-[hsl(14_100%_57%)] bg-clip-text text-transparent">
            SkillCraft Academy
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#courses" className="text-foreground/80 hover:text-primary transition-colors">
            Courses
          </a>
          <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">
            Features
          </a>
          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin">
                  <Button variant="outline" size="sm">Admin Dashboard</Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">My Dashboard</Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button onClick={logout} variant="outline" size="sm">Logout</Button>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
