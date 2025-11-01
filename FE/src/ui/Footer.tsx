"use client";
import {
  FiMail,
  FiPhone,
  FiTwitter,
  FiLinkedin,
  FiFacebook,
} from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-gradient-to-b from-card to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Top section */}
        <div className="grid md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-base">SC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SmartCity
              </span>
            </div>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Empowering urban innovation through smart, sustainable, and
              connected technology.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              {[FiTwitter, FiLinkedin, FiFacebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-foreground">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              {["Features", "Pricing", "Documentation", "API"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-foreground">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-foreground">
              Contact
            </h4>
            <div className="space-y-3 text-sm text-foreground/60">
              <a
                href="mailto:info@smartcity.com"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <FiMail className="w-4 h-4" />
                info@smartcity.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <FiPhone className="w-4 h-4" />
                +1 (234) 567-890
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-foreground/60">
          <p className="text-center md:text-left mb-4 md:mb-0">
            © 2025 SmartCity. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
