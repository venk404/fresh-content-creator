import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">SkillCraft Academy</h3>
            <p className="text-sm text-muted-foreground">
              Empowering learners worldwide with quality digital courses and expert instruction.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Courses</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary">Web Development</Link></li>
              <li><Link to="/" className="hover:text-primary">Design</Link></li>
              <li><Link to="/" className="hover:text-primary">Business</Link></li>
              <li><Link to="/" className="hover:text-primary">All Courses</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/" className="hover:text-primary">Careers</Link></li>
              <li><Link to="/" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/" className="hover:text-primary">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-primary">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SkillCraft Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
