import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormElement, FormProvider, FormWrapper, GenerateFormdata, useFormState } from "@imadehidiame/react-form-validation";
//import { Input } from '@/components/ui/input';
//import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
//import { Form as ShadcnForm, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
//import SectionWrapper from '@/components/shared/section-wrapper';
//import { Form, useActionData, useNavigation, useSubmit } from 'react-router';
//import { Toasting } from '@/components/loader/loading-anime';
import { Loader2 } from 'lucide-react';
import SectionWrapper from '@/app/ui/components/section-wrapper';
import { Toasting } from '@/app/ui/lib/loader/loading-anime';




const ContactPage: React.FC = () => {
  const contactFormSchema = z.object({
    name: z.string().min(2, { message: 'Please tell us your name' }),
    email: z.string().email({ message: 'Invalid email address' }),
    subject: z.string().trim().min(1, { message: 'Please enter the message subject' }),
    message: z.string().trim().min(10, { message: 'Message must be at least 10 characters' }),
  });



  const form_state = useFormState();
  const is_submitting = form_state === 'submit';

  //const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {name,email,subject,message} = contactFormSchema.shape;

  // Form fields
  const [form_data, set_form_data] = useState<FormElement<any>[]>([
    new GenerateFormdata()
      .set_class_names('w-full')
      .set_label('Name')
      //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
      .set_label_class_names('text-gray-300')
      .set_name('name')
      //.set_disabled(is_submitting)
      .set_placeholder('Enter your name')
      .set_type('text')
      .set_validation(name)
      .set_value('')
      /*.set_field_class_names(
        'bg-white text-gray-900 border-green-300 focus:border-green-500 px-3 py-2 rounded-lg shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400'
      )*/
      .set_field_class_names(
        'bg-gray-700 border-gray-600 text-white focus:border-gold-500'
      )
      .set_error_field_class_names('text-red-500 text-sm mt-1')
      .build(),
    new GenerateFormdata()
      .set_class_names('w-full')
      .set_label('Email')
      .set_label_class_names('text-gray-300')
      .set_name('email')
      //.set_disabled(is_submitting)
      .set_placeholder('Enter your email')
      .set_type('text')
      .set_validation(email)
      .set_value('')
      .set_field_class_names(
        'bg-gray-700 border-gray-600 text-white focus:border-gold-500'
      )
      .set_error_field_class_names('text-red-500 text-sm mt-1')
      .build(),
      new GenerateFormdata()
      .set_class_names('w-full')
      .set_label('Subject')
      .set_label_class_names('text-gray-300')
      .set_name('subject')
      //.set_disabled(is_submitting)
      .set_placeholder('Enter your subject')
      .set_type('text')
      .set_validation(subject)
      .set_value('')
      .set_field_class_names(
        'bg-gray-700 border-gray-600 text-white focus:border-gold-500'
      )
      .set_error_field_class_names('text-red-500 text-sm mt-1')
      .build(),
      new GenerateFormdata()
      .set_class_names('w-full')
      .set_label('Message')
      .set_label_class_names('text-gray-300')
      .set_name('message')
      //.set_disabled(is_submitting)
      .set_placeholder('Enter your message')
      .set_type('textarea')
      .set_validation(message)
      .set_value('')
      .set_field_class_names(
        'bg-gray-700 border-gray-600 text-white focus:border-gold-500'
      )
      .set_error_field_class_names('text-red-500 text-sm mt-1')
      .build(),
    /*new GenerateFormdata()
      .set_class_names('w-full')
      .set_label('Password')
      .set_label_class_names('text-sm font-medium text-green-800 mb-2')
      .set_name('password')
      //.set_disabled(is_submitting)
      .set_placeholder('Enter your password')
      .set_type('password')
      .set_show_password_icon(true)
      .set_validation(password)
      .set_value('')
      .set_field_class_names(
        'bg-white text-gray-900 border-green-300 focus:border-green-500 px-3 py-2 rounded-lg shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400'
      )
      .set_error_field_class_names('text-red-500 text-sm mt-1')
      .build(),*/
  ]);


  //const submit = useSubmit();
  type ContactFormValues = z.infer<typeof contactFormSchema>;
  
     
      const use_form  = useForm<ContactFormValues>({
        mode:'onSubmit',
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
    });

    const {
      register,
      handleSubmit,
      trigger,
      reset,
      control,
      formState:{isSubmitting,errors}
} = use_form;

    /*const onSubmit:SubmitHandler<ContactFormValues> = async (value,event)=>{
        const valid = await trigger();
        if(!valid){
          event?.preventDefault();
          return;
        }
        submit(event?.target,{action:'/contact',method:'POST',encType:'application/x-www-form-urlencoded',replace:true});
    }*/

    /*const navigation = useNavigation();
    const action_data = useActionData<{logged:boolean,data:ContactFormValues}>();*/

    /*useEffect(()=>{
      if(action_data){
        ///console.log("Served data");
        //console.log(action_data.data);
        if(action_data.logged === true){
          Toasting.success('Your message has been sent and you will be contacted',7000);
          reset();
        }else{
          Toasting.error('An error occured along the way',7000);
        }
      }
    },[action_data]);*/

    //const is_submitting = navigation.state === 'submitting';


  return (
    
      <section className="">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gold">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Information */}
          <Card className="p-6 border border-gold-500/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gold">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <div className="flex items-center space-x-2">
                {/* <Mail className="h-5 w-5 text-gold-500" /> */}
                <span>Email: support@cinvdesk.com</span>
              </div>
               <div className="flex items-center space-x-2">
                 {/* <Phone className="h-5 w-5 text-gold-500" /> */}
                 <span>Phone: +1 309 407 190</span> 
               </div>
                
               {/* Social Media Links (Add icons and links) */}
                <div className="flex space-x-4 mt-4">
                    {/* <a href="#" className="hover:text-gold-500"><Twitter className="h-6 w-6" /></a> */}
                    {/* Add other social icons */}
                </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="p-6 border border-gold-500/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gold">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
                    {/*<ShadcnForm {...use_form}>
                     <Form 
                      action={'/contact'}
                      method='POST'
                      onSubmit={(event)=>{
                        handleSubmit(onSubmit)(event);
                      }} className="space-y-4">
                        <FormField
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Your Name</FormLabel>
                                    <FormControl>
                                        <Input className="bg-gray-700 border-gray-600 text-white focus:border-gold-500" {...field} name='name' />
                                    </FormControl>
                                    
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Your Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" className="bg-gray-700 border-gray-600 text-white focus:border-gold-500" {...field} name="email" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                          <FormField
                            control={control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Subject</FormLabel>
                                    <FormControl>
                                        <Input className="bg-gray-700 border-gray-600 text-white focus:border-gold-500" {...field} name="subject" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                           <FormField
                            control={control}
                            name="message" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Message</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} className="bg-gray-700 border-gray-600 text-white focus:border-gold-500" {...field} name="message" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                       
                       <Button variant="outline" type='submit' className="w-full border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black">
                            { is_submitting &&  <Loader2 className='mr-2 h-5 w-5' />}
                            {is_submitting ? "Sending" : "Send Message"}
                        </Button>
                     </Form>
                  </ShadcnForm>*/}

                  <FormWrapper
                            action="/api/auth/signin"
                            method="POST"
                            form_components={form_data}
                            set_form_elements={set_form_data}
                            is_json={true}
                            request_headers={{
                                //[CSRF_HEADER]: csrf_header!
                            }}
                            fetch_options={{ credentials: 'include' }}
                            pre_submit_action={(value) => {
                                //value[FORM_BODY_NAME] = csrf_header;
                                return value;
                            }}
                            validation_mode="onChange"
                            class_names="space-y-4"
                            notify={(error)=>{
                              Toasting.error(error,10000,'top-center');
                            }}
                            after_submit_action={(message,data)=>{
                               console.log(data);
                              if(data){
                                if(data.url){
                                  if(typeof data.url === 'string'){
                                    //router.replace(data.url);
                                  }
                                }
                              }
                            }}

                        >
                          <Button variant="outline" type='submit' className="w-full border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black">
                            { is_submitting &&  <Loader2 className='mr-2 h-5 w-5' />}
                            {is_submitting ? "Sending" : "Send Message"}
                        </Button>
                        </FormWrapper>

            </CardContent>
          </Card>
        </div>
      </section>
    
  );
};

export default ContactPage;