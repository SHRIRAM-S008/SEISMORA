import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowRight, Scan, Box, Layers, Zap } from "lucide-react";
import LightRays from "@/components/ui/LightRays";
import BlurText from "@/components/ui/blur-text";
import TeamSection from "@/components/team-section";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32 min-h-[calc(100vh-80px)] flex items-center">
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
            <div className="text-center flex flex-col items-center justify-center space-y-6">
              <BlurText
                text="Advanced Prosthetic Technology Platform"
                delay={100}
                animateBy="words"
                direction="top"
                className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
              />
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Revolutionizing prosthetic care with LiDAR depth mapping, FSR pressure sensing, and advanced 3D model reconstruction for perfect-fit socket inserts.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/viewer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Try 3D Viewer
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/technology"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12 flex items-center justify-center min-h-[100px]">
              <BlurText
                text="Complete Digital Platform"
                delay={150}
                animateBy="words"
                direction="top"
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              />
              <p className="mt-4 text-lg text-muted-foreground">
                Eight major functionalities in one comprehensive solution
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Scan className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Technology Explained</h3>
                <p className="text-sm text-muted-foreground">
                  Complete breakdown of LiDAR scanning, FSR sensing, and 3D reconstruction technology
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Box className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Interactive 3D Models</h3>
                <p className="text-sm text-muted-foreground">
                  Rotate, zoom, and inspect socket models with depth and pressure visualization
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Products & Services</h3>
                <p className="text-sm text-muted-foreground">
                  E-commerce platform for materials and professional prosthetic services
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Knowledge Hub</h3>
                <p className="text-sm text-muted-foreground">
                  FAQs, tutorials, documentation, and support for prosthetic technicians
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Equipment Showcase */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <BlurText
                text="Our Equipment & Technology"
                delay={200}
                animateBy="words"
                direction="top"
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              />
              <p className="mt-4 text-lg text-muted-foreground">
                State-of-the-art tools and technology for precision prosthetic manufacturing
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Hot Air Gun */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:scale-105">
                <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                  <img
                    src="/hot-air-gun.png"
                    alt="Hot Air Gun"
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">Hot Air Gun</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Professional thermoplastic molding equipment. We use this to heat and shape thermoplastic materials for socket fabrication and adjustments.
                </p>
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">Temperature: 50-650°C</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">Digital display & control</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">Ergonomic design</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">₹3,500</span>
                    <span className="text-xs text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Professional grade equipment</p>
                </div>
              </div>

              {/* LiDAR Scanner */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:scale-105">
                <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center">
                  <img
                    src="/lidar-sensor.png"
                    alt="LiDAR Scanner"
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">LiDAR Scanner</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Advanced depth mapping technology. We use this to capture precise 3D limb geometry in under 5 seconds with sub-millimeter accuracy.
                </p>
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">±0.5mm accuracy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">360° scanning coverage</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">USB-C connectivity</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">₹11,000</span>
                    <span className="text-xs text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Includes software & calibration</p>
                </div>
              </div>
            </div>

            {/* Total Package Pricing */}
            <div className="mt-12 max-w-3xl mx-auto">
              <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Complete SEISMORA Setup</h3>
                <p className="text-muted-foreground mb-6">Get everything you need to start digital prosthetic manufacturing</p>
                <div className="flex items-baseline justify-center gap-3 mb-4">
                  <span className="text-sm text-muted-foreground line-through">₹51,500</span>
                  <span className="text-4xl font-bold text-primary">₹10,000</span>
                  <span className="text-sm text-muted-foreground">one-time setup</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Includes: LiDAR Sensor + 3D Printer + Hot Air Gun + Software License + Training + 1 Year Support
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="bg-background/50 rounded-lg px-4 py-2 text-sm">
                    <span className="font-semibold text-foreground">₹8,000</span>
                    <span className="text-muted-foreground"> per socket thereafter</span>
                  </div>
                  <div className="bg-background/50 rounded-lg px-4 py-2 text-sm">
                    <span className="font-semibold text-foreground">ROI</span>
                    <span className="text-muted-foreground"> in 6-8 months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <TeamSection />

        {/* Key Stats */}
        <section className="bg-muted/50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">3D</div>
                <div className="mt-2 text-sm text-muted-foreground">Scanning Technologies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">8</div>
                <div className="mt-2 text-sm text-muted-foreground">Core Functions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">100%</div>
                <div className="mt-2 text-sm text-muted-foreground">Digital Workflow</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">SIH</div>
                <div className="mt-2 text-sm text-muted-foreground">Innovation Project</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center flex items-center justify-center min-h-[150px]">
            <BlurText
              text="Ready to Transform Prosthetic Care?"
              delay={200}
              animateBy="words"
              direction="top"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            />
            <p className="mt-4 text-lg text-muted-foreground">
              Explore our technology, view 3D models, or get in touch with our team
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                Browse Products
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-medium text-foreground hover:bg-accent transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}