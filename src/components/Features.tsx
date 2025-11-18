import { Zap, Trophy, HeadphonesIcon } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Learn at Your Own Pace",
      description: "Access course materials anytime, anywhere. Learn on your schedule with lifetime access.",
    },
    {
      icon: Trophy,
      title: "Industry-Recognized Certificates",
      description: "Earn certificates upon completion to showcase your new skills to employers.",
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Expert Support",
      description: "Get help whenever you need it with our dedicated support team and community forums.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-accent/20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose SkillCraft Academy?</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-xl p-8 text-center space-y-4 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
