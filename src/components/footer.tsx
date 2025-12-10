import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                S
              </div>
              <span className="text-xl font-bold text-foreground">SEISMORA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Advanced prosthetic technology platform using LiDAR mapping, FSR pressure sensing, and 3D modeling.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/technology" className="text-muted-foreground hover:text-foreground">
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/viewer" className="text-muted-foreground hover:text-foreground">
                  3D Viewer
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-foreground">
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/knowledge" className="text-muted-foreground hover:text-foreground">
                  Knowledge Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <a href="mailto:info@seismora.com" className="text-muted-foreground hover:text-foreground">
                  info@seismora.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <a href="tel:+911234567890" className="text-muted-foreground hover:text-foreground">
                  +91 123 456 7890
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Prosthetic Clinic, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SEISMORA. All rights reserved. | Smart India Hackathon Project</p>
        </div>
      </div>
    </footer>
  );
};
