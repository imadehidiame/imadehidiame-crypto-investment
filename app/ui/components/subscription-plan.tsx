'use client';
//import { Plans } from "@/lib/config";
import { IPlans } from "@/types";
import { NumberFormat } from "@imadehidiame/react-form-validation";
import { CheckCircle } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../buttons";

 interface Props {
    isAuthPage:boolean,
    onSelect?:()=>void,
    plans:IPlans[],
    setPlan?:Dispatch<SetStateAction<IPlans | undefined>>
    selectedPlan?:IPlans
 }

export default function ({isAuthPage,onSelect,selectedPlan,plans,setPlan}:Props){
    
    //const [selectedPlan,setSelectedPlan] = useState<IPlans|undefined>(Plans.find(e=>e.name === plan));
    return (
        <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {
                    isAuthPage ?
                    (
                        plans.map((plan) => (
                            <div className={`
                              relative bg-zinc-900 border rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02]
                              ${selectedPlan?.name === plan.name 
                                ? 'border-amber-400 shadow-2xl shadow-amber-400/20' 
                                : 'border-gray-700 hover:border-amber-400/50'
                              }
                            `}
                            key={plan.name}
                            >
                              
                              {/* Popular Badge */}
                              {selectedPlan?.name === plan.name && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-bold px-6 py-1 rounded-full">
                                  SELECTED
                                </div>
                              )}
                        
                              <div className="text-center mb-8">
                                <h3 className="text-3xl font-bold text-white mb-2">{plan.name}</h3>
                                
                                <div className="flex items-baseline justify-center gap-1">
                                  <span className="text-4xl font-bold text-amber-400">
                                    ${NumberFormat.thousands(plan.min,{allow_decimal:true,length_after_decimal:2,add_if_empty:false,allow_zero_start:true})}
                                  </span>
                                  <span className="text-gray-400">—</span>
                                  <span className="text-2xl text-gray-400">
                                  ${NumberFormat.thousands(plan.max,{allow_decimal:true,length_after_decimal:2,add_if_empty:false,allow_zero_start:true})}
                                  </span>
                                </div>
                                
                                <p className="text-gray-400 mt-1">Investment Range</p>
                              </div>
                        
                              {/* Duration */}
                              <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 bg-zinc-800 rounded-full px-5 py-2">
                                  <span className="text-amber-400 font-medium">
                                    {plan.duration} {plan.durationFlag}
                                  </span>
                                  <span className="text-gray-500">duration</span>
                                </div>
                              </div>
                        
                              {/* Features */}
                              {plan.packages && plan.packages.length > 0 && (
                                <div className="mb-10">
                                  <p className="text-gray-400 text-sm mb-4 text-center">What's included:</p>
                                  <ul className="space-y-3">
                                    {plan.packages.map((feature, index) => (
                                      <li key={index} className="flex items-start gap-3 text-gray-300">
                                        <CheckCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                        
                              {/* Subscribe Button */}
                              {/*<Button
                                onClick={() => onSubscribe(plan)}
                                className={`
                                  w-full py-6 text-lg font-semibold transition-all
                                  ${isPopular 
                                    ? 'bg-amber-400 hover:bg-amber-500 text-black' 
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-amber-400/30 hover:border-amber-400'
                                  }
                                `}
                              >
                                Subscribe Now
                              </Button>*/}
                        
                              {/* Subtle footer text */}
                              <p className="text-center text-[10px] text-gray-500 mt-4 mb-4">
                                Flexible • Secure • High Returns
                              </p>
                              <div className="text-center">
                                <Button size="lg" variant="outline" className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black text-lg px-8 py-6 cursor-pointer"
                                onClick={()=>{
                                  setPlan!(plan);
                                  onSelect?.();
                                }}>
                                      Subscribe to {plan.name}
                                </Button>
                              </div>
                            </div>
                            
                          ))  
                    )
                    :
                    (
                        plans.map((plan) => (
                            <div className={`
                              relative bg-zinc-900 border rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] border-gray-700 hover:border-amber-400/50
                            `}
                            key={plan.name}
                            >
                              
                              {/* Popular Badge */}
                              {selectedPlan?.name === plan.name && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-xs font-bold px-6 py-1 rounded-full">
                                  SELECTED
                                </div>
                              )}
                        
                              <div className="text-center mb-8">
                                <h3 className="text-3xl font-bold text-white mb-2">{plan.name}</h3>
                                
                                <div className="flex items-baseline justify-center gap-1">
                                  <span className="text-4xl font-bold text-amber-400">
                                    ${NumberFormat.thousands(plan.min,{allow_decimal:true,length_after_decimal:2,add_if_empty:false,allow_zero_start:true})}
                                  </span>
                                  <span className="text-gray-400">—</span>
                                  <span className="text-2xl text-gray-400">
                                  ${NumberFormat.thousands(plan.max,{allow_decimal:true,length_after_decimal:2,add_if_empty:false,allow_zero_start:true})}
                                  </span>
                                </div>
                                
                                <p className="text-gray-400 mt-1">Investment Range</p>
                              </div>
                        
                              {/* Duration */}
                              <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 bg-zinc-800 rounded-full px-5 py-2">
                                  <span className="text-amber-400 font-medium">
                                    {plan.duration} {plan.durationFlag}
                                  </span>
                                  <span className="text-gray-500">duration</span>
                                </div>
                              </div>
                        
                              {/* Features */}
                              {plan.packages && plan.packages.length > 0 && (
                                <div className="mb-10">
                                  <p className="text-gray-400 text-sm mb-4 text-center">What's included:</p>
                                  <ul className="space-y-3">
                                    {plan.packages.map((feature, index) => (
                                      <li key={index} className="flex items-start gap-3 text-gray-300">
                                        <CheckCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                        
                              {/* Subscribe Button */}
                              {/*<Button
                                onClick={() => onSubscribe(plan)}
                                className={`
                                  w-full py-6 text-lg font-semibold transition-all
                                  ${isPopular 
                                    ? 'bg-amber-400 hover:bg-amber-500 text-black' 
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-amber-400/30 hover:border-amber-400'
                                  }
                                `}
                              >
                                Subscribe Now
                              </Button>*/}
                        
                              {/* Subtle footer text */}
                              <p className="text-center text-[10px] text-gray-500 mt-4 mb-4">
                                Flexible • Secure • High Returns
                              </p>
                              <div className="text-center">
                                <Button size="lg" variant="outline" className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black text-lg px-8 py-6 cursor-pointer"
                                onClick={()=>{
                                  location.href = '/dashboard/subscribe?plan='+plan.name
                                }}>
                                      Subscribe to {plan.name}
                                </Button>
                              </div>
                            </div>
                            
                          ))
                    )

                }
                
              </div>
    )
}