"use client";

import React, { useState } from "react";
import { Twitter, Github, Linkedin, ArrowUpRight } from "lucide-react";

interface SocialLink {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
}

interface ActionButtonProps {
  text: string;
  href: string;
}

interface GlassmorphismProfileCardProps {
  avatarUrl: string;
  name: string;
  title: string;
  bio: string;
  socialLinks?: SocialLink[];
  actionButton: ActionButtonProps;
}

const GlassmorphismProfileCard: React.FC<GlassmorphismProfileCardProps> = ({
  avatarUrl,
  name,
  title,
  bio,
  socialLinks = [],
  actionButton,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div
        className="relative flex flex-col items-center p-8 rounded-3xl border transition-all duration-500 ease-out backdrop-blur-xl bg-card/40 border-white/10"
        style={{
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="w-24 h-24 mb-4 rounded-full p-1 border-2 border-white/20">
          <img
            src={avatarUrl}
            alt={`${name}'s Avatar`}
            className="w-full h-full rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://placehold.co/96x96/6366f1/white?text=${name.charAt(0)}`;
            }}
          />
        </div>

        <h2 className="text-2xl font-bold text-card-foreground">{name}</h2>
        <p className="mt-1 text-sm font-medium text-primary">{title}</p>
        <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">{bio}</p>

        <div className="w-1/2 h-px my-6 rounded-full bg-border" />

        <div className="flex items-center justify-center gap-3">
          {socialLinks.map((item) => (
            <SocialButton
              key={item.id}
              item={item}
              setHoveredItem={setHoveredItem}
              hoveredItem={hoveredItem}
            />
          ))}
        </div>

        <ActionButton action={actionButton} />
      </div>

      <div className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 ease-out blur-2xl opacity-30 bg-gradient-to-r from-indigo-500/50 to-purple-500/50" />
    </div>
  );
};

interface SocialButtonProps {
  item: SocialLink;
  setHoveredItem: (id: string | null) => void;
  hoveredItem: string | null;
}

const SocialButton: React.FC<SocialButtonProps> = ({ item, setHoveredItem, hoveredItem }) => (
  <div className="relative">
    <a
      href={item.href}
      onClick={(e) => e.preventDefault()}
      className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-out group overflow-hidden bg-secondary/50 hover:bg-secondary"
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      aria-label={item.label}
    >
      <div className="relative z-10 flex items-center justify-center">
        <item.icon
          size={20}
          className="transition-all duration-200 ease-out text-secondary-foreground/70 group-hover:text-secondary-foreground"
        />
      </div>
    </a>
    <Tooltip item={item} hoveredItem={hoveredItem} />
  </div>
);

interface ActionButtonComponentProps {
  action: ActionButtonProps;
}

const ActionButton: React.FC<ActionButtonComponentProps> = ({ action }) => (
  <a
    href={action.href}
    onClick={(e) => e.preventDefault()}
    className="flex items-center gap-2 px-6 py-3 mt-8 rounded-full font-semibold text-base backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.03] active:scale-95 group bg-primary text-primary-foreground"
    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
  >
    <span>{action.text}</span>
    <ArrowUpRight size={16} className="transition-transform duration-300 ease-out group-hover:rotate-45" />
  </a>
);

interface TooltipProps {
  item: SocialLink;
  hoveredItem: string | null;
}

const Tooltip: React.FC<TooltipProps> = ({ item, hoveredItem }) => (
  <div
    role="tooltip"
    className={`absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-medium whitespace-nowrap transition-all duration-300 ease-out pointer-events-none bg-popover text-popover-foreground border-border ${hoveredItem === item.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
  >
    {item.label}
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-popover border-b border-r border-border" />
  </div>
);

const teamMembers: GlassmorphismProfileCardProps[] = [
  {
    avatarUrl: "https://placehold.co/96x96/6366f1/white?text=M1",
    name: "Member One",
    title: "Team Lead",
    bio: "Leading SEISMORA with a focus on innovation and user-centric prosthetic solutions.",
    socialLinks: [
      { id: "github", icon: Github, label: "GitHub", href: "#" },
      { id: "linkedin", icon: Linkedin, label: "LinkedIn", href: "#" },
      { id: "twitter", icon: Twitter, label: "Twitter", href: "#" },
    ],
    actionButton: {
      text: "Contact",
      href: "#",
    },
  },
  {
    avatarUrl: "https://placehold.co/96x96/6366f1/white?text=M2",
    name: "Member Two",
    title: "Hardware Engineer",
    bio: "Specialist in IR scanning and LiDAR integration for accurate limb capture.",
    socialLinks: [
      { id: "github", icon: Github, label: "GitHub", href: "#" },
      { id: "linkedin", icon: Linkedin, label: "LinkedIn", href: "#" },
      { id: "twitter", icon: Twitter, label: "Twitter", href: "#" },
    ],
    actionButton: {
      text: "Contact",
      href: "#",
    },
  },
  {
    avatarUrl: "https://placehold.co/96x96/6366f1/white?text=M3",
    name: "Member Three",
    title: "Software Engineer",
    bio: "Building the SEISMORA platform with robust 3D reconstruction pipelines.",
    socialLinks: [
      { id: "github", icon: Github, label: "GitHub", href: "#" },
      { id: "linkedin", icon: Linkedin, label: "LinkedIn", href: "#" },
      { id: "twitter", icon: Twitter, label: "Twitter", href: "#" },
    ],
    actionButton: {
      text: "Contact",
      href: "#",
    },
  },
  {
    avatarUrl: "https://placehold.co/96x96/6366f1/white?text=M4",
    name: "Member Four",
    title: "Clinical Expert",
    bio: "Ensuring SEISMORA aligns with real-world prosthetic clinic workflows.",
    socialLinks: [
      { id: "github", icon: Github, label: "GitHub", href: "#" },
      { id: "linkedin", icon: Linkedin, label: "LinkedIn", href: "#" },
      { id: "twitter", icon: Twitter, label: "Twitter", href: "#" },
    ],
    actionButton: {
      text: "Contact",
      href: "#",
    },
  },
  {
    avatarUrl: "https://placehold.co/96x96/6366f1/white?text=M5",
    name: "Member Five",
    title: "UI/UX Designer",
    bio: "Designing intuitive interfaces for clinicians and patients alike.",
    socialLinks: [
      { id: "github", icon: Github, label: "GitHub", href: "#" },
      { id: "linkedin", icon: Linkedin, label: "LinkedIn", href: "#" },
      { id: "twitter", icon: Twitter, label: "Twitter", href: "#" },
    ],
    actionButton: {
      text: "Contact",
      href: "#",
    },
  },
];

const TeamSection: React.FC = () => {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Team
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Meet the minds behind SEISMORA, working together to transform prosthetic care.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {teamMembers.map((member) => (
            <GlassmorphismProfileCard key={member.name} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
