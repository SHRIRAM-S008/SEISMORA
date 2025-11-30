"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import LightRays from "@/components/ui/LightRays";
import BlurText from "@/components/ui/blur-text";

export default function ProductsPage() {
  const [cart, setCart] = useState<string[]>([]);

  const products = [
    {
      id: "ethaflex-sheets",
      name: "Ethaflex Sheets",
      price: "₹2,500",
      image: "🔲",
      description: "High-quality EVA foam sheets for prosthetic inserts. Durable, flexible, and comfortable.",
      features: [
        "Medical-grade EVA material",
        "Multiple density options",
        "Size: 30cm x 40cm x 5mm",
        "Heat-moldable"
      ]
    },
    {
      id: "foam-inserts",
      name: "Custom Foam Inserts",
      price: "₹3,800",
      image: "📦",
      description: "Pre-shaped foam inserts designed from pressure mapping data. Ready to use or customize.",
      features: [
        "Pressure-optimized design",
        "Antimicrobial coating",
        "3 density zones",
        "Custom-fit available"
      ]
    },
    {
      id: "protective-padding",
      name: "Protective Padding",
      price: "₹1,200",
      image: "🛡️",
      description: "Soft gel padding for high-pressure zones. Reduces friction and enhances comfort.",
      features: [
        "Medical-grade silicone gel",
        "Washable and reusable",
        "Self-adhesive backing",
        "Multiple sizes"
      ]
    },
    {
      id: "toolkit",
      name: "Prosthetic Toolkit",
      price: "₹8,500",
      image: "🧰",
      description: "Complete toolkit for prosthetic technicians. Includes measurement tools, cutters, and adhesives.",
      features: [
        "15+ professional tools",
        "Precision measurement devices",
        "Carrying case included",
        "Training manual"
      ]
    },
    {
      id: "scanner-kit",
      name: "Scanner Kit (Coming Soon)",
      price: "₹45,000",
      image: "📡",
      description: "Complete IR + LiDAR scanning system. Portable, battery-powered, and easy to use.",
      features: [
        "Dual IR + LiDAR sensors",
        "Bluetooth connectivity",
        "Cloud data sync",
        "Mobile app included"
      ],
      comingSoon: true
    },
    {
      id: "calibration-kit",
      name: "FSR Calibration Kit",
      price: "₹6,200",
      image: "⚙️",
      description: "Pressure sensor calibration and testing equipment. Ensures accurate readings.",
      features: [
        "Reference pressure standards",
        "Calibration software",
        "Testing protocols",
        "Certification included"
      ]
    }
  ];

  const toggleCart = (productId: string) => {
    setCart(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 px-4 py-12 sm:px-6 lg:px-8">
          {/* LightRays Background Effect */}
          <div className="absolute inset-0 z-0">
            <LightRays
              raysOrigin="top-center"
              raysColor="#4f46e5"
              raysSpeed={1.2}
              lightSpread={1.0}
              rayLength={1.5}
              followMouse={true}
              mouseInfluence={0.08}
              noiseAmount={0.05}
              distortion={0.03}
              className="opacity-40"
            />
          </div>
          
          <div className="mx-auto max-w-7xl relative z-10 w-full">
            <div className="text-center flex flex-col items-center justify-center space-y-6 py-8">
              <BlurText
                text="Products & Materials"
                delay={100}
                animateBy="words"
                direction="top"
                className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
              />
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Professional-grade materials and tools for prosthetic socket manufacturing
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg border border-border bg-card overflow-hidden flex flex-col"
                >
                  {/* Product Image Placeholder */}
                  <div className="aspect-square bg-muted/30 flex items-center justify-center text-8xl">
                    {product.image}
                  </div>

                  {/* Product Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-card-foreground">
                        {product.name}
                      </h3>
                      <span className="text-xl font-bold text-primary">
                        {product.price}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {product.description}
                    </p>

                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                        Features
                      </h4>
                      <ul className="space-y-1">
                        {product.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => !product.comingSoon && toggleCart(product.id)}
                      disabled={product.comingSoon}
                      className={`mt-auto w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        product.comingSoon
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : cart.includes(product.id)
                          ? "bg-primary/10 text-primary border border-primary"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.comingSoon
                        ? "Coming Soon"
                        : cart.includes(product.id)
                        ? "Added to Cart"
                        : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <BlurText
              text="Need Bulk Orders or Custom Materials?"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-2xl font-bold tracking-tight text-foreground mb-4"
            />
            <p className="text-muted-foreground mb-6">
              We offer special pricing for clinics and hospitals. Contact our sales team for custom material specifications and volume discounts.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
