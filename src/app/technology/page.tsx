import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Scan, Radar, Gauge, Box, Layers, Activity } from "lucide-react";
import LightRays from "@/components/ui/LightRays";
import BlurText from "@/components/ui/blur-text";

export default function TechnologyPage() {
  const technologies = [
    {
      icon: Radar,
      title: "LiDAR Depth Mapping",
      description: "Light Detection and Ranging technology provides comprehensive 3D depth information and surface topology capture. Multiple laser points create a dense point cloud for precise volumetric analysis with sub-millimeter accuracy.",
      features: [
        "360° coverage scanning",
        "High-resolution point clouds",
        "Depth accuracy ±0.5mm",
        "Fast acquisition (< 5 seconds)",
        "Non-contact measurement",
        "Real-time data capture"
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
                SEISMORA combines cutting-edge LiDAR scanning, pressure sensing, and 3D modeling technologies to revolutionize prosthetic socket design and manufacturing with precision and efficiency.
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
                    className={`flex flex-col gap-8 lg:flex-row lg:items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""
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

        {/* System Usefulness */}
        <section className="bg-gradient-to-b from-background to-muted/30 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <BlurText
                text="Real-World Impact & Usefulness"
                delay={450}
                animateBy="words"
                direction="top"
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              />
              <p className="mt-4 text-lg text-muted-foreground">
                How SEISMORA transforms prosthetic care delivery and patient outcomes
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Clinical Efficiency</h3>
                <p className="text-muted-foreground mb-4">
                  Reduces socket fitting time from 3-4 weeks to just 3-5 days, enabling faster patient recovery and improved clinic throughput.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>80% reduction in fitting appointments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>95% first-fit success rate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>Serve 3x more patients per month</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Patient Comfort</h3>
                <p className="text-muted-foreground mb-4">
                  Precision-fit sockets eliminate pressure points and discomfort, dramatically improving quality of life for amputees.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>90% reduction in pressure sores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>Extended daily wear time (12+ hours)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>Improved mobility and confidence</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Cost Effectiveness</h3>
                <p className="text-muted-foreground mb-4">
                  Digital workflow reduces material waste and labor costs while improving outcomes and patient satisfaction.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>60% reduction in material waste</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>Lower revision and remake rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>ROI achieved within 6-8 months</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Monitoring Capabilities */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <BlurText
                text="Advanced Monitoring & Analytics"
                delay={500}
                animateBy="words"
                direction="top"
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              />
              <p className="mt-4 text-lg text-muted-foreground">
                Real-time tracking and data-driven insights for optimal prosthetic care
              </p>
            </div>

            <div className="space-y-8">
              <div className="rounded-lg border border-border bg-card p-8">
                <h3 className="text-2xl font-semibold text-card-foreground mb-4">Real-Time Pressure Monitoring</h3>
                <p className="text-muted-foreground mb-6">
                  FSR sensor arrays continuously monitor pressure distribution across the socket interface during fitting and daily use. Live heatmap visualization allows clinicians to identify and address pressure points instantly, ensuring optimal fit before the patient leaves the clinic.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-primary mb-2">32</div>
                    <div className="text-sm text-muted-foreground">Pressure sensors per socket</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-primary mb-2">100Hz</div>
                    <div className="text-sm text-muted-foreground">Real-time sampling rate</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-primary mb-2">0-200kPa</div>
                    <div className="text-sm text-muted-foreground">Pressure measurement range</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-8">
                <h3 className="text-2xl font-semibold text-card-foreground mb-4">Patient Progress Tracking</h3>
                <p className="text-muted-foreground mb-6">
                  Comprehensive dashboard tracks patient adaptation over time, monitoring wear duration, gait patterns, and comfort levels. Historical data comparison enables clinicians to identify trends and proactively address issues before they become problems.
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Daily wear time and activity levels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Pressure distribution evolution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Comfort ratings and feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Limb volume changes over time</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-8">
                <h3 className="text-2xl font-semibold text-card-foreground mb-4">Quality Assurance & Documentation</h3>
                <p className="text-muted-foreground mb-4">
                  Every scan, measurement, and adjustment is automatically logged and timestamped. Complete digital records ensure regulatory compliance, enable remote consultations, and provide valuable data for insurance claims and clinical research.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Continuous Improvement */}
        <section className="bg-muted/50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <BlurText
                text="Continuous Improvement & Future Development"
                delay={550}
                animateBy="words"
                direction="top"
                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              />
              <p className="mt-4 text-lg text-muted-foreground">
                How SEISMORA evolves and improves over time to deliver better outcomes
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Machine Learning Integration</h3>
                <p className="text-muted-foreground">
                  Our AI algorithms learn from every socket created, continuously refining design parameters based on patient outcomes. The system identifies patterns in successful fits and automatically suggests optimizations for future designs. With each scan processed, the platform becomes smarter and more accurate.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Data-Driven Optimization</h3>
                <p className="text-muted-foreground">
                  Aggregated anonymized data from thousands of patients enables population-level insights. The system identifies optimal socket geometries for different limb shapes, activity levels, and patient demographics. Clinics benefit from collective knowledge while maintaining patient privacy.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Regular Software Updates</h3>
                <p className="text-muted-foreground mb-4">
                  Cloud-based platform receives automatic updates with new features, algorithm improvements, and bug fixes. No hardware upgrades required—your system gets better over time through software alone.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">Monthly</div>
                    <div className="text-sm text-muted-foreground">Feature updates</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">Weekly</div>
                    <div className="text-sm text-muted-foreground">Algorithm refinements</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                    <div className="text-sm text-muted-foreground">Cloud support</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-xl font-semibold text-card-foreground mb-3">Future Enhancements Roadmap</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">Q1</span>
                    </div>
                    <div>
                      <div className="font-semibold text-card-foreground">AI-Powered Predictive Fitting</div>
                      <div className="text-sm text-muted-foreground">Predict optimal socket design before fabrication</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">Q2</span>
                    </div>
                    <div>
                      <div className="font-semibold text-card-foreground">Remote Monitoring App</div>
                      <div className="text-sm text-muted-foreground">Patients track comfort and clinicians monitor remotely</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">Q3</span>
                    </div>
                    <div>
                      <div className="font-semibold text-card-foreground">Advanced Material Recommendations</div>
                      <div className="text-sm text-muted-foreground">AI suggests optimal materials based on patient needs</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">Q4</span>
                    </div>
                    <div>
                      <div className="font-semibold text-card-foreground">Integration with Gait Analysis</div>
                      <div className="text-sm text-muted-foreground">Combine socket fit with biomechanical assessment</div>
                    </div>
                  </div>
                </div>
              </div>
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
                { step: "01", title: "Scan", desc: "LiDAR captures precise limb geometry" },
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
