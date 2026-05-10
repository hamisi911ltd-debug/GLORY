import { Logo } from "./Logo";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4 md:px-8">
        <div className="space-y-3">
          <Logo light />
          <p className="text-sm text-white/60">Kenya's most trusted driving school. Professional instruction across cars, motorcycles and HGVs.</p>
          <div className="flex gap-3 pt-2">
            <a href="#" className="rounded-full bg-white/10 p-2 transition-colors hover:bg-brand"><Facebook className="h-4 w-4" /></a>
            <a href="#" className="rounded-full bg-white/10 p-2 transition-colors hover:bg-brand"><Instagram className="h-4 w-4" /></a>
            <a href="#" className="rounded-full bg-white/10 p-2 transition-colors hover:bg-brand"><Twitter className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-label-sm mb-4 text-white/50">Courses</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><a href="/courses/car" className="hover:text-white">Car (Class B)</a></li>
            <li><a href="/courses/motorcycle" className="hover:text-white">Motorcycle (Class A)</a></li>
            <li><a href="/courses/hgv" className="hover:text-white">HGV / Truck (Class C)</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-label-sm mb-4 text-white/50">Company</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><a href="#about" className="hover:text-white">About us</a></li>
            <li><a href="#branches" className="hover:text-white">Branches</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-label-sm mb-4 text-white/50">Get in touch</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li>Westlands, Nairobi</li>
            <li>+254 700 123 456</li>
            <li>hello@driveschoolpro.co.ke</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-white/50 md:flex-row md:px-8">
          <p>© 2025 DriveSchool Pro. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
