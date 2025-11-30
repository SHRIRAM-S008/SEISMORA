import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Scan, Radar, Gauge, Box, Layers, Activity } from "lucide-react";
import LightRays from "@/components/ui/LightRays";
import BlurText from "@/components/ui/blur-text";

export default function TechnologyPage() {
  const technologies = [
    {
      icon: Scan,
      title: "IR Scanning",
      description: "Infrared scanning captures detailed surface topology of the residual limb with millimeter precision. Our advanced IR sensors map contours in real-time, creating accurate digital representations.",
      features: [
        "Sub-millimeter accuracy",
        "Non-contact measurement",
        "Real-time data capture",
        "Temperature-compensated readings"
      ]
    },
    {
      icon: Radar,
      title: "LiDAR Depth Mapping",
      description: "Light Detection and Ranging technology provides comprehensive 3D depth information. Multiple laser points create a dense point cloud for precise volumetric analysis.",
      features: [
        "360° coverage scanning",
        "High-resolution point clouds",
        "Depth accuracy ±0.5mm",
        "Fast acquisition (< 5 seconds)"
      ]
    },
    {
      icon: Gauge,
      title: "FSR Pressure Sensing",
      description: "Force-Sensitive Resistors measure pressure distribution across the socket interface. Real-time pressure mapping ensures optimal fit and identifies high-stress areas.",
      features: [
        "Multi-point pressure array",
        "Dynamic load monitoring",
        "Pressure range: 0-200 kPa",
        "Live heatmap visualization"
      ]
    },
    {
      icon: Box,
      title: "3D Model Reconstruction",
      description: "Advanced algorithms combine IR and LiDAR data to create accurate 3D models. Mesh processing and optimization produce production-ready CAD files.",
      features: [
        "Automatic mesh generation",
        "Surface smoothing algorithms",
        "STL/OBJ export formats",
        "CAD software compatible"
      ]
    },
    {
      icon: Layers,
      title: "Insert Shaping Workflow",
      description: "AI-powered design system generates custom insert geometries based on pressure data and limb topology. Optimized for comfort and load distribution.",
      features: [
        "Automated design generation",
        "Pressure-based optimization",
        "Material-specific toolpaths",
        "Manufacturing-ready outputs"
      ]
    },
    {
      icon: Activity,
      title: "Heatmap Visualization",
      description: "Real-time pressure visualization through color-coded heatmaps. Clinicians can instantly identify pressure points and adjust fit accordingly.",
      features: [
        "Live pressure monitoring",
        "Color-coded intensity scale",
        "Historical data comparison",
        "Export for documentation"
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
                text="Our Technology"
                delay={100}
                animateBy="words"
                direction="top"
                className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
              />
              <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                SEISMORA combines cutting-edge scanning, sensing, and modeling technologies to revolutionize prosthetic socket design and manufacturing.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Details */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="space-y-16">
              {technologies.map((tech, index) => {
                const Icon = tech.icon;
                return (
                  <div
                    key={tech.title}
                    className={`flex flex-col gap-8 lg:flex-row lg:items-center ${
                      index % 2 === 1 ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-7 w-7" />
                        </div>
                        <BlurText
                          text={tech.title}
                          delay={150 + index * 50}
                          animateBy="words"
                          direction="top"
                          className="text-3xl font-bold tracking-tight text-foreground"
                        />
                      </div>
                      <p className="text-lg text-muted-foreground mb-6">
                        {tech.description}
                      </p>
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          Key Features
                        </h3>
                        <ul className="space-y-2">
                          {tech.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="rounded-lg border border-border bg-muted/50 p-8 aspect-video flex items-center justify-center">
                        <Icon className="h-32 w-32 text-muted-foreground/30" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="bg-muted/50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <BlurText
                text="Complete Workflow"
                delay={400}
                animateBy="words"
                direction="top"
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              />
              <p className="mt-4 text-lg text-muted-foreground">
                From scanning to manufacturing in a streamlined digital process
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "01", title: "Scan", desc: "IR + LiDAR capture limb geometry" },
                { step: "02", title: "Analyze", desc: "FSR sensors measure pressure distribution" },
                { step: "03", title: "Model", desc: "Generate 3D socket and insert design" },
                { step: "04", title: "Manufacture", desc: "Export CAD files for production" }
              ].map((item) => (
                <div key={item.step} className="rounded-lg border border-border bg-card p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{item.step}</div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
