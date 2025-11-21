import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Star, Clock, Users } from "lucide-react";

interface CourseCardProps {
  product_id: string;
  image: string;
  title: string;
  description: string;
  price: string;
  originalPrice: string | null;
  discount: string | null;
  rating: number;
  reviews: number;
  duration: string;
  students: string;
  type: string;                                      // <-- ADDED
  onEnroll: (product_id: string, type: string) => void;
}

const CourseCard = ({
  product_id,
  image,
  title,
  description,
  price,
  originalPrice,
  discount,
  rating,
  reviews,
  duration,
  students,
  type,
  onEnroll,
}: CourseCardProps) => {

  // Determine button label based on pricing type
  const getButtonText = () => {
    if (type === "recurring_price") return "Subscribe";
    if (type === "usage_based_price") return "Usage Based";
    return "Buy Now"; // default for one-time
  };

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-1">

      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {discount && (
          <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
            {discount} OFF
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">

        {/* Rating */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="font-semibold">{rating}</span>
          </div>
          <span className="text-muted-foreground">({reviews} reviews)</span>
        </div>

        <h3 className="text-xl font-bold">{title}</h3>

        <p className="text-muted-foreground line-clamp-2">{description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{students}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{price}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {originalPrice}
              </span>
            )}
          </div>

          {/* Button changes ONLY based on type */}
          <Button
            variant="default"
            onClick={() => onEnroll(product_id, type)}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
