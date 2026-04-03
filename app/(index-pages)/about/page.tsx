//import SectionWrapper from '@/components/shared/section-wrapper';
import { Button } from '@/app/ui/buttons';
import SectionWrapper from '@/app/ui/components/section-wrapper';
import { connectToDatabase } from '@/lib/mongodb';
import { ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const AboutUsPage: React.FC = async () => {
  await connectToDatabase();
  return (
    <>
    <SectionWrapper 
      animationType="fadeInUp" 
      padding="16" 
      md_padding="24"
      //className="bg-background"
    >
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* LEFT SIDE - Content */}
        <div className="space-y-8">
          <div className="space-y-6">
          <h1 className="text-[42px] md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-[-2px] leading-[1.05] text-foreground">
                The trading platform of <span className="text-primary">the future</span>
        </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
            Trade stocks & indices. We are an award winning broker, providing trading services and facilities to both retail and institutional clients.
            </p>
          </div>

          {/* Two Buttons Side by Side */}
          <div className="flex flex-wrap gap-4">
          <Button size="lg" variant="outline" className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black text-lg px-8 py-6 cursor-pointer">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button size="lg" variant="outline" className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black text-lg px-8 py-6 cursor-pointer">
              Login
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* RIGHT SIDE - Image */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[716px] mx-auto lg:mx-0">
            <Image
              src="/img/el-img1.png"           
              alt="About us"
              width={716}
              height={1280}
              priority
              className="rounded-2xl shadow-2xl object-cover"
              style={{ 
                width: '100%', 
                height: 'auto' 
              }}
            />
            
            {/* Optional subtle overlay glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl -z-10 blur-3xl" />
          </div>
        </div>

      </div>
    </SectionWrapper>
    <SectionWrapper animationType="fadeInUp">
      <section className="py-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gold">About CoinInvest</h1>

        <div className="max-w-5xl mx-auto text-gray-300 space-y-8">
          <p className='text-gray-400'>
            Welcome to CoinInvest, your trusted partner in cryptocurrency investments.
            Our mission is to provide a secure, transparent, and profitable platform
            for individuals to participate in the exciting world of digital assets.
          </p>
          <p className='text-gray-400'>
            Founded in 2019, CoinInvest was built on the principles of transparency,
            innovation, and accessibility. We believe that everyone should have
            access to the potential of crypto investments, regardless of their
            prior experience.
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-gold">Our Vision</h2>
          <p className='text-gray-400'>
            Our vision is to be a leading global platform for crypto investments,
            empowering our users to achieve financial freedom through smart and
            informed investment decisions.
          </p>

          <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-gold">Why We Are Different</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>AI-driven investment insights for personalized portfolio strategies.</li>
            <li>Low, transparent fees to maximize your returns.</li>
            <li>Diverse investment options, from Bitcoin to emerging altcoins.</li>
          </ul>

          {/* Team Section (Optional) */}
           {/*<h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-gold-500">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <Card className="bg-gray-800 p-6 text-center border border-gold-500/50">
                  <img src="/placeholder-avatar.png" alt="Team Member Name" className="h-24 w-24 rounded-full mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white">Team Member Name</h3>
                  <p className="text-gray-400">Title</p>
              </Card> 

              <Card className="bg-gray-800 p-6 text-center border border-gold-500/50">
                  <img src="/placeholder-avatar.png" alt="Team Member Name" className="h-24 w-24 rounded-full mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white">Team Member Name</h3>
                  <p className="text-gray-400">Title</p>
              </Card> 

              
              
          </div> */}

          <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-gold">Security and Trust</h2>
          <p className='text-gray-400'>
            We prioritize the security of your assets and personal information.
            CoinInvest employs advanced security measures, including end-to-end encryption,
            multi-factor authentication, and cold storage for 95% of assets, to ensure a safe investment
            environment.
          </p>
        </div>
      </section>
    </SectionWrapper>
    </>
  );
};

export default AboutUsPage;