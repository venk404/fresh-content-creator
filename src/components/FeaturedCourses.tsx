"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "./CourseCard";
import { getProducts } from "@/lib/getproduct";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const products = await getProducts();

      const mapped = products.map((p: any) => ({
        product_id: p.product_id,
        type: p.price_detail.type, // "recurring_price" | "one_time_price" | "usage_based_price"
        image: p.image || "/default-course.jpg",
        title: p.name,
        description: p.description,
        price: `$${(p.price / 100).toFixed(2)}`,
        originalPrice: null,
        discount: null,
        rating: 4.8,
        reviews: 120,
        duration: "12 hours",
        students: "2K+",
      }));

      setCourses(mapped);
    }

    load();
  }, []);

  // Checkout handler with auth gate + overlay for subscriptions
  const handleCheckout = async (product_id: string, type: string) => {
    // Gate: must be logged in
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to continue to checkout.",
      });
      navigate("/signin");
      return;
    }

    // Create checkout session
    const res = await fetch("http://localhost:5000/checkout_sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id }),
    });

    const data = await res.json();
    if (!res.ok || !data?.checkout_url) {
      toast({
        title: "Checkout error",
        description: "Could not create checkout session. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // For subscriptions → open overlay checkout (do not redirect)
    if (type === "recurring_price") {
      setCheckoutUrl(data.checkout_url);
      setOverlayOpen(true);
      return;
    }

    // For other product types → normal redirect is fine
    window.location.href = data.checkout_url;
  };

  return (
    <>
      <section id="courses" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any, index: number) => (
              <CourseCard
                key={index}
                {...course}
                onEnroll={handleCheckout}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Overlay checkout for subscriptions */}
      <Dialog
        open={overlayOpen}
        onOpenChange={(open) => {
          setOverlayOpen(open);
          if (!open) setCheckoutUrl(null);
        }}
      >
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden">
          {checkoutUrl && (
            <iframe
              src={checkoutUrl}
              className="w-full h-full border-0"
              title="Dodo Payments Checkout"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeaturedCourses;
