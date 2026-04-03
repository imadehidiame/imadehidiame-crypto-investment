'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import SectionWrapper from './section-wrapper';

const StepsSection = () => {
  const steps = [
    {
      number: "01",
      title: "Create your account",
      description: "Sign up in less than 60 seconds with your email or phone number."
    },
    {
      number: "02",
      title: "Verify your identity",
      description: "Complete our quick and secure KYC process to unlock full features."
    },
    {
      number: "03",
      title: "Start trading",
      description: "Fund your account and begin trading cryptocurrencies instantly."
    }
  ];

  return (
    <SectionWrapper 
      animationType="fadeInUp" 
      padding="16" 
      md_padding="24"
      className="bg-background overflow-hidden"
    >
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* LEFT SIDE - Animated Image */}
        <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
          <motion.div
            className="relative w-full max-w-[719px]"
            animate={{
              rotate: [-3, 3, -3],        // Swing angle: left → right → left
            }}
            transition={{
              duration: 8,                // Slow and smooth (adjust as needed)
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image
              src="/img/el-img.png"        // ← Replace with your actual image path
              alt="Trading platform steps illustration"
              width={719}
              height={1280}
              priority
              className="rounded-3xl shadow-2xl object-cover"
              style={{ width: '100%', height: 'auto' }}
            />
          </motion.div>
        </div>

        {/* RIGHT SIDE - Content */}
        <div className="space-y-10 order-1 lg:order-2">
          {/* Header */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Open an account in <span className="text-primary">three easy steps</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-md">
              Getting started with CoinInvest X is simple, fast, and secure.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6 group">
                {/* Number Circle */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full border-2 border-primary/20 flex items-center justify-center text-2xl font-semibold text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                    {step.number}
                  </div>
                </div>

                {/* Step Content */}
                <div className="pt-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </SectionWrapper>
  );
};

export default StepsSection;