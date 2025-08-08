import React from "react";
import { motion } from "framer-motion";

export interface ParallaxSectionProps {
  backgroundUrl: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  backgroundUrl,
  title,
  subtitle,
  children,
}) => {
  return (
    <section
      aria-label={title}
      className="relative w-full min-h-[60vh] md:min-h-[70vh] overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-center bg-cover md:bg-fixed bg-scroll"
        style={{ backgroundImage: `url('${backgroundUrl}')` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[hsl(var(--scrim)/0.6)]"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto h-full px-6 py-20 md:py-28 flex items-center">
        <div className="w-full">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold text-primary-foreground tracking-tight"
          >
            {title}
          </motion.h2>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 max-w-3xl text-lg md:text-xl text-primary-foreground/90"
            >
              {subtitle}
            </motion.p>
          )}

          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ParallaxSection;
