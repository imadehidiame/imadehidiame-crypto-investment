'use client';
import React from 'react';
import SectionWrapper from '../components/section-wrapper';
import SubscriptionPlan from '../components/subscription-plan';
//import { Plans } from '@/lib/config';
import FaqPage from '@/app/(index-pages)/faq/faq-page';
import { IPlans } from '@/types';

interface Props {
    plans:IPlans[]
}


const SubscriptionPlansPage: React.FC<Props> = ({plans}) => {
  return (
    <SectionWrapper animationType="fadeInUp">
      <section className="py-2">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gold">Investment Plans</h1>
        <SubscriptionPlan plans={plans} isAuthPage={false} />
        <section className="py-16">
            {/*<h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gold">Frequently Asked Questions</h2>*/}
                <FaqPage />
        </section>
     </section>
      </SectionWrapper>
    
  );
};

export default SubscriptionPlansPage;