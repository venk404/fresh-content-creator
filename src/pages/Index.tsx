import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedCourses from "@/components/FeaturedCourses";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeaturedCourses />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
