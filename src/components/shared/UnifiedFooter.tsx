"use client";
import { footerSections, socialLinks } from "@/lib/constant";
import { motion } from "framer-motion";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function UnifiedFooter() {


  return (
    <footer className="bg-[#282828] text-white pt-20 pb-10 mt-20">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Main Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-w-[250px]"
          >
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-2xl font-extrabold">fyteAI</h3>
            </div>

            <p className="text-base opacity-90 leading-relaxed mb-6">
              Your personalized health companion powered by AI. Get custom diet
              and workout plans designed for your unique goals and lifestyle.
            </p>

            {/* Contact Info */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Mail size={16} /> jai.fyteAI@gmail.com
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Phone size={16} /> 1-800-fyteAI
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <MapPin size={16} /> Gurugram, India
              </div>
            </div>
          </motion.div>

          {/* Link Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
            >
              <h4 className="text-lg font-bold mb-6 relative">
                {section.title}
                <div className="absolute -bottom-2 left-0 w-10 h-[3px] bg-white/30 rounded"></div>
              </h4>

              <ul className="flex flex-col gap-4">
                {section.items.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: sectionIndex * 0.1 + index * 0.05,
                    }}
                    whileHover={{ x: 3 }}
                  >
                    <a
                      href={item.href}
                      className="flex items-center gap-2 text-white opacity-80 hover:opacity-100 hover:translate-x-1 transition-all text-sm"
                    >
                      <item.icon size={16} />
                      {item.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-white/10 pt-10 flex items-center justify-between flex-wrap gap-6"
        >
          <div className="text-sm opacity-80">
            © 2025 fyteAI. All rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <social.icon size={20} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 p-5 bg-white/5 border border-white/10 rounded-xl backdrop-blur"
        >
          <p className="text-xs opacity-70 leading-relaxed text-center">
            <strong>Disclaimer:</strong> fyteAI provides personalized
            recommendations for informational purposes only. Always consult with
            healthcare professionals before making significant changes to your
            diet or exercise routine. Our AI-generated plans are not substitutes
            for professional medical advice, diagnosis, or treatment.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
