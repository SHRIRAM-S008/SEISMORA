"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BookOpen, Video, FileText, HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import LightRays from "@/components/ui/LightRays";
import BlurText from "@/components/ui/blur-text";

export default function KnowledgePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How accurate is the IR + LiDAR scanning?",
      a: "Our scanning system achieves sub-millimeter accuracy (±0.3mm). The combination of IR surface scanning and LiDAR depth mapping provides highly detailed 3D models suitable for prosthetic manufacturing."
    },
    {
      q: "What file formats do you export?",
      a: "We support all standard CAD formats including STL, OBJ, STEP, and IGES. Files are compatible with major CAD software like SolidWorks, Fusion 360, and Rhino."
    },
    {
      q: "How long does the scanning process take?",
      a: "A complete scan takes less than 5 seconds. The entire workflow from scanning to receiving the 3D model and pressure data typically takes 10-15 minutes including setup and calibration."
    },
    {
      q: "Can the system work with different limb types?",
      a: "Yes, SEISMORA supports all major amputation levels including transtibial, transfemoral, and upper limb amputations. The scanning system automatically adjusts parameters based on limb type."
    },
    {
      q: "What training is required to use the system?",
      a: "Basic operation can be learned in 2-3 hours. We offer comprehensive 2-day workshops covering advanced features, troubleshooting, and best practices. Online tutorials and documentation are also available."
    },
    {
      q: "How is pressure data collected and visualized?",
      a: "Force-Sensitive Resistors (FSR) embedded in the test socket measure pressure at multiple points. Data is displayed as a real-time color-coded heatmap showing pressure distribution from 0-200 kPa."
    },
    {
      q: "What materials are compatible with your designs?",
      a: "Our designs work with all standard prosthetic materials including Ethaflex (EVA), silicone, polyurethane foam, and thermoplastics. Material recommendations are provided based on pressure analysis."
    },
    {
      q: "Do you offer technical support?",
      a: "Yes, we provide email and phone support during business hours. Premium support packages include priority response, on-site assistance, and remote troubleshooting via video call."
    }
  ];

  const guides = [
    {
      title: "Getting Started with 3D Scanning",
      type: "PDF Guide",
      icon: FileText,
      description: "Step-by-step guide to performing your first scan"
    },
    {
      title: "Pressure Mapping Tutorial",
      type: "Video (12 min)",
      icon: Video,
      description: "Learn to interpret FSR heatmaps and optimize fit"
    },
    {
      title: "CAD Export Workflow",
      type: "Documentation",
      icon: BookOpen,
      description: "Export formats and integration with CAD software"
    },
    {
      title: "Troubleshooting Common Issues",
      type: "PDF Guide",
      icon: FileText,
      description: "Solutions for scanning errors and calibration problems"
    },
    {
      title: "Advanced Design Techniques",
      type: "Video (25 min)",
      icon: Video,
      description: "Custom insert shaping and pressure optimization"
    },
    {
      title: "Material Selection Guide",
      type: "Documentation",
      icon: BookOpen,
      description: "Choosing the right materials for different applications"
    }
  ];

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
                text="Knowledge Center"
                delay={100}
                animateBy="words"
                direction="top"
                className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
              />
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Tutorials, guides, and support resources for prosthetic technicians
              </p>
            </div>
          </div>
        </section>

        {/* Guides & Tutorials */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <BlurText
                text="Guides & Tutorials"
                delay={150}
                animateBy="words"
                direction="top"
                className="text-2xl font-bold tracking-tight text-foreground mb-2"
              />
              <p className="text-muted-foreground">
                Comprehensive resources to help you master SEISMORA technology
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <div
                    key={guide.title}
                    className="rounded-lg border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground mb-1">
                          {guide.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">{guide.type}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {guide.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <BlurText
                text="Frequently Asked Questions"
                delay={200}
                animateBy="words"
                direction="top"
                className="text-2xl font-bold tracking-tight text-foreground mb-2"
              />
              <p className="text-muted-foreground">
                Common questions about SEISMORA technology and services
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-card overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-medium text-card-foreground">{faq.q}</span>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 py-4 border-t border-border bg-muted/30">
                        <p className="text-muted-foreground">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <BlurText
              text="Need Additional Support?"
              delay={250}
              animateBy="words"
              direction="top"
              className="text-2xl font-bold tracking-tight text-foreground mb-4"
            />
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help with technical questions, troubleshooting, and training.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
