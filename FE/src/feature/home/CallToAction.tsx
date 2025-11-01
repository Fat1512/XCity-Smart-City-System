import Button from "@mui/material/Button";
import { FiArrowRight } from "react-icons/fi";

export default function CallToAction() {
  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary/80 opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />

          <div className="relative p-12 md:p-20 text-center border border-primary/20 rounded-2xl backdrop-blur">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Ready to Build Your Smart City?
            </h2>
            <p className="text-xl text-foreground/70 mb-8 text-balance">
              Join thousands of cities transforming urban infrastructure with
              our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                Start Free Trial <FiArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button>Schedule Demo</Button>
            </div>
            <p className="text-sm text-foreground/50 mt-8">
              No credit card required. Get instant access to all features.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
