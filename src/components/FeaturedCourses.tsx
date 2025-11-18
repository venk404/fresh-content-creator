import CourseCard from "./CourseCard";
import courseWebDev from "@/assets/course-webdev.jpg";
import courseDesign from "@/assets/course-design.jpg";
import courseBusiness from "@/assets/course-business.jpg";

const FeaturedCourses = () => {
  const courses = [
    {
      image: courseWebDev,
      title: "Complete Web Development Bootcamp",
      description: "Master HTML, CSS, JavaScript, React, and Node.js. Build real-world projects and become a full-stack developer.",
      price: "$49",
      originalPrice: "$149",
      discount: "67%",
      rating: 4.8,
      reviews: 2341,
      duration: "40 hours",
      students: "15K+",
    },
    {
      image: courseDesign,
      title: "Professional Graphic Design Mastery",
      description: "Learn design principles, typography, color theory, and master tools like Figma and Adobe Creative Suite.",
      price: "$39",
      originalPrice: "$99",
      discount: "61%",
      rating: 4.9,
      reviews: 1876,
      duration: "28 hours",
      students: "12K+",
    },
    {
      image: courseBusiness,
      title: "Business Strategy & Growth Hacking",
      description: "Discover proven strategies for scaling businesses, marketing techniques, and data-driven decision making.",
      price: "$59",
      originalPrice: "$129",
      discount: "54%",
      rating: 4.7,
      reviews: 1542,
      duration: "35 hours",
      students: "8K+",
    },
  ];

  return (
    <section id="courses" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Featured <span className="bg-gradient-to-r from-primary to-[hsl(14_100%_57%)] bg-clip-text text-transparent">Premium Courses</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hand-picked courses designed to help you master new skills and advance your career
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <CourseCard key={index} {...course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
