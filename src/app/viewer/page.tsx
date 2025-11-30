"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useState } from "react";
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Info } from "lucide-react";
import LightRays from "@/components/ui/LightRays";
import BlurText from "@/components/ui/blur-text";

export default function ViewerPage() {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showInfo, setShowInfo] = useState(true);

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
                text="3D Model Viewer"
                delay={100}
                animateBy="words"
                direction="top"
                className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
              />
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Inspect prosthetic socket models with interactive rotation, zoom, and pressure visualization
              </p>
            </div>
          </div>
        </section>

        {/* Viewer Section */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Viewer */}
              <div className="lg:col-span-2">
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  {/* Viewer Canvas */}
                  <div 
                    className="relative aspect-video bg-muted/30 flex items-center justify-center"
                    style={{ transform: `rotate(${rotation}deg) scale(${zoom / 100})` }}
                  >
                    <div className="text-center">
                      <div className="w-48 h-48 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Maximize2 className="h-24 w-24 text-primary/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Interactive 3D prosthetic socket model
                      </p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="border-t border-border p-4 bg-card">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRotation(r => r - 90)}
                          className="rounded-lg border border-border bg-background p-2 hover:bg-accent transition-colors"
                          aria-label="Rotate left"
                        >
                          <RotateCw className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setRotation(0)}
                          className="rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
                        >
                          Reset
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setZoom(z => Math.max(50, z - 10))}
                          className="rounded-lg border border-border bg-background p-2 hover:bg-accent transition-colors"
                          aria-label="Zoom out"
                        >
                          <ZoomOut className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-medium min-w-[4rem] text-center">
                          {zoom}%
                        </span>
                        <button
                          onClick={() => setZoom(z => Math.min(200, z + 10))}
                          className="rounded-lg border border-border bg-background p-2 hover:bg-accent transition-colors"
                          aria-label="Zoom in"
                        >
                          <ZoomIn className="h-5 w-5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setShowInfo(!showInfo)}
                        className={`ml-auto rounded-lg border border-border px-3 py-2 text-sm transition-colors ${
                          showInfo ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"
                        }`}
                      >
                        <Info className="h-4 w-4 inline mr-1" />
                        Info
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {showInfo && (
                  <>
                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="text-lg font-semibold text-card-foreground mb-4">
                        Model Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Patient ID:</span>
                          <span className="font-medium">PT-2024-001</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Scan Date:</span>
                          <span className="font-medium">Nov 28, 2024</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Socket Type:</span>
                          <span className="font-medium">Transtibial</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vertices:</span>
                          <span className="font-medium">12,458</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Accuracy:</span>
                          <span className="font-medium">±0.3mm</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="text-lg font-semibold text-card-foreground mb-4">
                        Pressure Heatmap
                      </h3>
                      <div className="space-y-3">
                        <div className="h-8 rounded bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Low (0 kPa)</span>
                          <span>Medium (100 kPa)</span>
                          <span>High (200 kPa)</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Color-coded pressure distribution shows optimal load zones (blue/green) and high-stress areas (yellow/red).
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="text-lg font-semibold text-card-foreground mb-4">
                        Depth Analysis
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Depth:</span>
                          <span className="font-medium">245mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Volume:</span>
                          <span className="font-medium">1,850 cm³</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Surface Area:</span>
                          <span className="font-medium">620 cm²</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-8">
              <BlurText
                text="Viewer Features"
                delay={150}
                animateBy="words"
                direction="top"
                className="text-2xl font-bold tracking-tight text-foreground"
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "360° Rotation", desc: "View from any angle" },
                { title: "Zoom Controls", desc: "Inspect fine details" },
                { title: "Mesh Display", desc: "See topology structure" },
                { title: "Export Options", desc: "Download STL/OBJ files" }
              ].map((feature) => (
                <div key={feature.title} className="rounded-lg border border-border bg-card p-6 text-center">
                  <h3 className="font-semibold text-card-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
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
