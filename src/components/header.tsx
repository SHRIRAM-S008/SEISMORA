"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/analysis/upload", label: "Analysis" },
    { href: "/technology", label: "Technology" },
    { href: "/viewer", label: "3D Viewer" },
    { href: "/products", label: "Products" },
    { href: "/services", label: "Services" },
    { href: "/knowledge", label: "Knowledge Center" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.jpeg"
            alt="SEISMORA Logo"
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="text-xl font-bold text-foreground">SEISMORA</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* SIH Logo */}
        <div className="hidden md:flex items-center">
          <img
            src="/sih-logo.png"
            alt="Smart India Hackathon"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
