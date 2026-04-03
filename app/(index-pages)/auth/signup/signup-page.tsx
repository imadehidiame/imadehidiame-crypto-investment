'use client';
// pages/AuthPage.tsx
import React, { useEffect, useReducer, useState } from 'react';
//import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { FormElement, FormProvider, FormWrapper, GenerateFormdata, useFormState } from "@imadehidiame/react-form-validation";
//import SectionWrapper from '@/components/shared/section-wrapper';
//import { useNavigate, useNavigation, useSubmit } from 'react-router';
//import { GenerateFormdata, RRFormDynamic, type FormElement } from '@/components/rr-form-mod-test';
//import { Toasting } from '@/components/loader/loading-anime';
//import { log } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import SectionWrapper from '@/app/ui/components/section-wrapper';
import { Toasting } from '@/app/ui/lib/loader/loading-anime';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const signupSchema = z.object({
    name: z.string().trim().min(2, { message: 'Please enter your name' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string().min(8, { message: 'Confirm Password is required' }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const SignupPage: React.FC = () => {
  //const submit = useSubmit();
  //const navigate = useNavigate();
  //const navigation = useNavigation();
  const router = useRouter();
  const {email,name,confirmPassword,password} = signupSchema.shape;
  const form_state = useFormState();
  const loading = form_state === 'submit';
  //const loading = navigation.state === 'submitting'; 
  const [search,set_search] = useState<string|null>('');
  useEffect(()=>{
    //console.log(new URLSearchParams(location.search).get('no_route'));
    //set_search(new URLSearchParams(location.search).get('no_route'))
  },[]);
  
  
  //const { username,password } = loginSchema.shape;

  const form_dataa = [
    /*(new GenerateFormdata).set_classnames('w-full').set_field_classnames('w-full border-amber-300 text-white focus:border-amber-300').set_label('Email Address').set_label_classnames('text-amber-300 mb-4').set_name('username').set_disabled(loading).set_id('username').set_placeholder('Email address').set_validation(username).set_value('').build(),
    (new GenerateFormdata).set_classnames('w-full').set_disabled(loading).set_field_classnames('w-full border-amber-300 text-white focus:border-amber-300').set_id('password').set_label('Password').set_label_classnames('text-amber-300 mb-4').set_name('password').set_placeholder('Password').set_type('password').set_validation(password).set_value('').build(),
    /*get_form_data('text','username','',username,'Email Address','Email Address',undefined,undefined,undefined,undefined,'w-full','border-amber-300 text-white focus:border-amber-300'),
    get_form_data('password','password','',password,'Password','Password',undefined,undefined,undefined,undefined,'w-full','border-amber-300 text-white focus:border-amber-300')*/
  ];

  const [form_data, set_form_data] = useState<FormElement<any>[]>([
    new GenerateFormdata()
    .set_class_names('w-full')
    .set_label('Full Name')
    //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
    .set_label_class_names('text-amber-300 mb-4')
    .set_name('name')
    .set_disabled(loading)
    //.set_disabled(is_submitting)
    .set_placeholder('Enter your full name')
    .set_type('text')
    .set_validation(name)
    .set_value('')
    /*.set_field_class_names(
      'bg-white text-gray-900 border-green-300 focus:border-green-500 px-3 py-2 rounded-lg shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400'
    )*/
    .set_field_class_names(
      'w-full border-amber-300 text-white focus:border-amber-300'
    )
    .set_error_field_class_names('text-red-500 text-sm mt-1')
    .build(),
      new GenerateFormdata()
        .set_class_names('w-full')
        .set_label('Email Address')
        //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
        .set_label_class_names('text-amber-300 mb-4')
        .set_name('email')
        .set_disabled(loading)
        //.set_disabled(is_submitting)
        .set_placeholder('Enter your email address')
        .set_type('text')
        .set_validation(email)
        .set_value('')
        /*.set_field_class_names(
          'bg-white text-gray-900 border-green-300 focus:border-green-500 px-3 py-2 rounded-lg shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400'
        )*/
        .set_field_class_names(
          'w-full border-amber-300 text-white focus:border-amber-300'
        )
        .set_error_field_class_names('text-red-500 text-sm mt-1')
        .build(),
      new GenerateFormdata()
        .set_class_names('w-full')
        .set_label('Password')
        .set_label_class_names('text-amber-300 mb-4')
        .set_name('password')
        .set_disabled(loading)
        .set_placeholder('Enter your password')
        .set_type('password')
        .set_show_password_icon(true)
        .set_validation(password)
        .set_value('')
        .set_field_class_names(
          'w-full border-amber-300 text-white focus:border-amber-300'
        )
        .set_error_field_class_names('text-red-500 text-sm mt-1')
        .build(),
        /*new GenerateFormdata()
        .set_class_names('w-full')
        .set_label('Confirm Password')
        .set_label_class_names('text-amber-300 mb-4')
        .set_name('confirmPassword')
        .set_disabled(loading)
        .set_placeholder('Confirm your password')
        .set_type('text')
        .set_validation(confirmPassword)
        .set_value('')
        .set_field_class_names(
          'w-full border-amber-300 text-white focus:border-amber-300'
        )
        .set_error_field_class_names('text-red-500 text-sm mt-1')
        .build(),*/
    ]);

  //const [form_state,set_form_state] = useState(form_data);
  /*const [task,dispatch] = useReducer((state,action:{type:'add'|'update'|'delete',data:FormElement})=>{
    switch (action) {
      case 'add':
        
        break;
    
      default:
        break;
    }
    return state;
  },form_data)*/
  
  /*const on_submit = async (form_values:any)=>{
    //console.log(form_values);
    submit(form_values,{
      action:'/auth'+search ? '?no_route=1' : '',
      encType:'application/json',
      method:'POST',
      replace:true,
    });
  }*/
   

  return (
    <SectionWrapper>
      <section className="py-2 flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md text-white border border-amber-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-amber-300">
            Sign Up for CoinInvestX 
            </CardTitle>
          </CardHeader>
          <CardContent>
            
            <FormWrapper
                                        action="/api/auth/signup"
                                        method="POST"
                                        form_components={form_data}
                                        set_form_elements={set_form_data}
                                        is_json={true}
                                        request_headers={{
                                            //[CSRF_HEADER]: csrf_header!
                                        }}
                                        //fetch_options={/*{ credentials: 'include' }*/}
                                        pre_submit_action={(value) => {
                                            //value['role'] = 'admin'; 
                                            //value[FORM_BODY_NAME] = csrf_header;
                                            return value;
                                        }}
                                        validation_mode="onChange"
                                        class_names="space-y-4 p-0 md:p-0 flex flex-wrap gap-4 items-center justify-between"
                                        notify={(error)=>{
                                          Toasting.error(error,10000,'bottom-center');
                                        }}
                                        after_submit_action={(message,data)=>{
                                           //console.log(data);
                                           //console.log(message);
                                           Toasting.success('Your account has been created successfully. You can now login',
                                            10000,'bottom-center'
                                           );
                                           router.push('/auth');
                                          /*if(data){
                                            if(data.url){
                                              if(typeof data.url === 'string'){
                                                //router.replace(data.url);
                                              }
                                            }
                                          }*/
                                        }}
            
                                    >
                                      <a href="#" className="text-gold-500 mt-3 hover:underline">Forgot Password?</a>
                                        <Button variant="outline" className={"border-gold-500 border-amber-300 text-amber-300 hover:border-amber-50 hover:text-amber-50 cursor-pointer"} disabled={loading}>
                      
                                            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                                            {loading ? 'Checking' : 'Sign up'}
                                        </Button>

                                      {/*<Button variant="outline" type='submit' className="w-full border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black">
                                        { loading &&  <Loader2 className='mr-2 h-5 w-5' />}
                                        {loading ? "Sending" : "Send Message"}
                                    </Button>*/}
                </FormWrapper>

            
            
            <div className="mt-6 text-center text-gray-300">
              
                <p>
                  Already have an account?{' '}
                  <Link href={'/auth'} className="text-gold-500 hover:underline focus:outline-none">
                    Login
                  </Link> 
                </p>
              
            </div>
          </CardContent>
        </Card>
      </section>
    </SectionWrapper>
  );
};

export default SignupPage;