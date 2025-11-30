import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Target, Eye, Award, Users, Lightbulb, Heart } from "lucide-react";
import LightRays from "@/components/ui/LightRays";
import BlurText from "@/components/ui/blur-text";

export default function AboutPage() {
  const achievements = [
    {
      title: "Smart India Hackathon 2024",
      description: "Selected among top innovative healthcare solutions",
      year: "2024"
    },
    {
      title: "Medical Technology Innovation",
      description: "Recognized for advancing prosthetic care accessibility",
      year: "2024"
    },
    {
      title: "Digital Healthcare Award",
      description: "Excellence in medical device digitalization",
      year: "2024"
    }
  ];

  const team = [
    { name: "Research & Development", role: "Engineering innovation and technology integration" },
    { name: "Clinical Advisory", role: "Prosthetic expertise and patient care guidance" },
    { name: "Software Engineering", role: "3D modeling and visualization systems" },
    { name: "Manufacturing", role: "Material science and production workflows" }
  ];

  const values = [
    {
      icon: Heart,
      title: "Patient-Centered",
      description: "Every innovation focuses on improving patient comfort and quality of life"
    },
    {
      icon: Lightbulb,
      title: "Innovation-Driven",
      description: "Continuously advancing prosthetic technology through research and development"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Working closely with clinics, technicians, and healthcare providers"
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
                text="About SEISMORA"
                delay={100}
                animateBy="words"
                direction="top"
                className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
              />
              <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                Revolutionizing prosthetic care through advanced scanning technology, 3D modeling, and data-driven design
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div className="flex gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <Target className="h-7 w-7" />
                </div>
                <div>
                  <BlurText
                    text="Our Mission"
                    delay={150}
                    animateBy="words"
                    direction="top"
                    className="text-2xl font-bold tracking-tight text-foreground mb-4"
                  />
                  <p className="text-muted-foreground leading-relaxed">
                    To make high-quality, precisely-fitted prosthetic sockets accessible to everyone by combining cutting-edge scanning technology with intelligent design automation. We empower prosthetic technicians with tools that reduce manufacturing time, improve accuracy, and enhance patient outcomes.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <Eye className="h-7 w-7" />
                </div>
                <div>
                  <BlurText
                    text="Our Vision"
                    delay={200}
                    animateBy="words"
                    direction="top"
                    className="text-2xl font-bold tracking-tight text-foreground mb-4"
                  />
                  <p className="text-muted-foreground leading-relaxed">
                    A future where every prosthetic user receives a perfectly-fitted, comfortable socket designed with precision engineering and individualized care. We envision a fully digital prosthetic workflow that eliminates traditional limitations and brings advanced care to underserved communities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <BlurText
                text="Our Core Values"
                delay={250}
                animateBy="words"
                direction="top"
                className="text-3xl font-bold tracking-tight text-foreground mb-4"
              />
              <p className="text-lg text-muted-foreground">
                Principles that guide our innovation and service
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="rounded-lg border border-border bg-card p-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <BlurText
              text="Our Story"
              delay={300}
              animateBy="words"
              direction="top"
              className="text-3xl font-bold tracking-tight text-foreground mb-6 text-center"
            />
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                SEISMORA was born from a simple observation: traditional prosthetic socket fitting is time-consuming, imprecise, and often results in uncomfortable devices that require multiple adjustments. This challenge affects millions of prosthetic users worldwide, limiting their mobility and quality of life.
              </p>
              <p>
                Our team of engineers, clinicians, and researchers came together during the Smart India Hackathon 2024 with a vision to digitalize the entire prosthetic workflow. By combining infrared scanning, LiDAR depth mapping, and force-sensitive resistor technology, we created a comprehensive system that captures accurate 3D limb geometry and pressure distribution in seconds.
              </p>
              <p>
                Today, SEISMORA represents more than just technology—it's a platform that bridges the gap between traditional craftsmanship and modern engineering. We work closely with prosthetic clinics, technicians, and healthcare providers to continuously improve our system based on real-world feedback and clinical outcomes.
              </p>
              <p>
                Our commitment extends beyond innovation. We believe in making advanced prosthetic care accessible to underserved communities through affordable technology, comprehensive training programs, and ongoing support for healthcare professionals.
              </p>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="bg-muted/50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <BlurText
                text="Achievements & Recognition"
                delay={350}
                animateBy="words"
                direction="top"
                className="text-3xl font-bold tracking-tight text-foreground mb-4"
              />
              <p className="text-lg text-muted-foreground">
                Milestones in our journey to transform prosthetic care
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {achievements.map((achievement) => (
                <div key={achievement.title} className="rounded-lg border border-border bg-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="h-6 w-6 text-primary" />
                    <span className="text-sm font-semibold text-primary">{achievement.year}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <BlurText
                text="Our Team"
                delay={400}
                animateBy="words"
                direction="top"
                className="text-3xl font-bold tracking-tight text-foreground mb-4"
              />
              <p className="text-lg text-muted-foreground">
                Multidisciplinary experts working together for innovation
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <div key={member.name} className="rounded-lg border border-border bg-card p-6 text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-card-foreground mb-2">
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Future Roadmap */}
        <section className="bg-muted/50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <BlurText
              text="Future Roadmap"
              delay={450}
              animateBy="words"
              direction="top"
              className="text-3xl font-bold tracking-tight text-foreground mb-6"
            />
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We're continuously expanding SEISMORA's capabilities. Upcoming developments include AI-powered design optimization, real-time gait analysis integration, cloud-based collaboration tools for remote consultations, and mobile scanning solutions for field clinics.
              </p>
              <p>
                Our goal is to establish SEISMORA as the global standard for digital prosthetic workflows, making precision-fitted devices accessible to every patient, regardless of their location or economic circumstances.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
