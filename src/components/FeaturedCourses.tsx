"use client";

import { useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import { getProducts } from "@/lib/getproduct";

const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function load() {
      const products = await getProducts();

    const mapped = products.map((p) => ({
      product_id: p.product_id,
      type: p.price_detail.type,   // <-- REQUIRED
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

  // Checkout handler
  const handleCheckout = async (product_id: string) => {
    const res = await fetch("http://localhost:5000/checkout_sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id }),
    });

    const data = await res.json();

    // Redirect to checkout
    window.location.href = data.checkout_url;
  };

  return (
    <section id="courses" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              {...course}
              onEnroll={handleCheckout} // <-- Pass handler
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
