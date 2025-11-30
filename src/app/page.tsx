import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowRight, Scan, Box, Layers, Zap } from "lucide-react";
import LightRays from "@/components/ui/LightRays";
import BlurText from "@/components/ui/blur-text";

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
                Revolutionizing prosthetic care with IR scanning, LiDAR depth mapping, and 3D model reconstruction for perfect-fit socket inserts.
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
                  Complete breakdown of IR scanning, LiDAR, FSR sensing, and 3D reconstruction
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