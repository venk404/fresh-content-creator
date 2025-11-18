import { Button } from "./ui/button";
import { Star, Users, Award } from "lucide-react";
import heroImage from "@/assets/hero-learning.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-accent/30 to-background py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="text-sm font-medium text-foreground">Rated 4.9/5 by 10,000+ students</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Unlock Your Potential with{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(14_100%_57%)] bg-clip-text text-transparent">
                Expert-Led Courses
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Master in-demand skills with comprehensive online courses designed by industry professionals. Start learning today and transform your career.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg">
                Explore Courses
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
            
            <div className="flex gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">50K+</p>
                  <p className="text-sm text-muted-foreground">Active Learners</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">200+</p>
                  <p className="text-sm text-muted-foreground">Expert Instructors</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl blur-3xl"></div>
            <img 
              src={heroImage} 
              alt="Students learning together"
              className="relative rounded-2xl shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
