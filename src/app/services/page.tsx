"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Scan, Box, Wrench, GraduationCap, Users, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import LightRays from "@/components/ui/LightRays";
import BlurText from "@/components/ui/blur-text";

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const services = [
    {
      id: "scanning",
      icon: Scan,
      title: "Socket Scanning Service",
      description: "Professional 3D scanning of residual limbs using our IR + LiDAR technology. Fast, accurate, and non-invasive.",
      pricing: "₹1,500 per scan",
      turnaround: "Same day results",
      includes: [
        "High-resolution 3D model",
        "Pressure mapping data",
        "CAD file exports (STL/OBJ)",
        "Digital archive storage"
      ]
    },
    {
      id: "modeling",
      icon: Box,
      title: "3D Modeling & Design",
      description: "Custom socket and insert design based on scan data and pressure analysis. Optimized for comfort and function.",
      pricing: "₹2,800 per design",
      turnaround: "2-3 business days",
      includes: [
        "Custom socket design",
        "Insert geometry optimization",
        "Pressure distribution analysis",
        "Manufacturing-ready files"
      ]
    },
    {
      id: "manufacturing",
      icon: Wrench,
      title: "Insert Manufacturing",
      description: "Complete fabrication of custom prosthetic inserts using precision equipment. Made from medical-grade materials.",
      pricing: "₹4,500 per insert",
      turnaround: "5-7 business days",
      includes: [
        "Custom-shaped insert",
        "Material selection consultation",
        "Quality testing & certification",
        "Fitting support"
      ]
    },
    {
      id: "training",
      icon: GraduationCap,
      title: "Workshops & Training",
      description: "Professional training for prosthetic technicians on scanning technology, design software, and manufacturing workflows.",
      pricing: "₹15,000 per session",
      turnaround: "2-day workshop",
      includes: [
        "Hands-on equipment training",
        "Software tutorials",
        "Best practices documentation",
        "Certificate of completion"
      ]
    },
    {
      id: "consultation",
      icon: Users,
      title: "Clinical Consultation",
      description: "Expert consultation for clinics implementing digital prosthetic workflows. Technology selection and integration support.",
      pricing: "₹8,000 per session",
      turnaround: "Flexible scheduling",
      includes: [
        "Workflow analysis",
        "Equipment recommendations",
        "ROI assessment",
        "Implementation roadmap"
      ]
    },
    {
      id: "assessment",
      icon: ClipboardCheck,
      title: "Quality Assessment",
      description: "Independent evaluation of prosthetic sockets and inserts. Pressure testing, fit analysis, and improvement recommendations.",
      pricing: "₹2,200 per assessment",
      turnaround: "1-2 business days",
      includes: [
        "Comprehensive fit analysis",
        "Pressure distribution report",
        "Adjustment recommendations",
        "Follow-up consultation"
      ]
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
                text="Professional Services"
                delay={100}
                animateBy="words"
                direction="top"
                className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
              />
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Comprehensive prosthetic services for clinics, technicians, and healthcare providers
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {services.map((service) => {
                const Icon = service.icon;
                const isSelected = selectedService === service.id;

                return (
                  <div
                    key={service.id}
                    className={`rounded-lg border bg-card p-8 transition-all ${
                      isSelected 
                        ? "border-primary shadow-lg" 
                        : "border-border hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-card-foreground mb-1">
                          {service.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-primary font-medium">{service.pricing}</span>
                          <span className="text-muted-foreground">• {service.turnaround}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6">
                      {service.description}
                    </p>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3">
                        Includes:
                      </h4>
                      <ul className="space-y-2">
                        {service.includes.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => setSelectedService(isSelected ? null : service.id)}
                      className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      {isSelected ? "Selected" : "Request Service"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <BlurText
              text="Custom Service Packages Available"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-3xl font-bold tracking-tight text-foreground mb-4"
            />
            <p className="text-lg text-muted-foreground mb-8">
              Need multiple services or ongoing support? We offer customized packages for clinics and hospitals with special pricing and priority service.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Custom Quote
              </a>
              <a
                href="/knowledge"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-medium text-foreground hover:bg-accent transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
