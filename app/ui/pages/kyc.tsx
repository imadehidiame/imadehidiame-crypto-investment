'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as z from 'zod';
import { UserPayload } from '@/lib/auth';
import { FormElement, FormWrapper, GenerateFormdata, useFormState } from '@imadehidiame/react-form-validation';
import SectionWrapper from '../components/section-wrapper';
import { Toasting } from '../lib/loader/loading-anime';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';




const stage1Schema = z.object({
  address: z.string().min(2, { message: 'Please enter your address'}),
  zip: z.string().min(4,{ message: 'Please enter your zip code' }),
  city: z.string().min(3, { message: 'Please enter your city of residence' }),
  state: z.string().min(3, { message: 'Please enter your state of residence'}),
  country: z.string().min(3, { message: 'Please enter country of residence' }),
});

/*const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(8, { message: 'Your new password must be at least 8 characters' }),
  confirmNewPassword: z.string().min(1, { message: 'Please re-enter your password' }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});*/


//type ProfileFormValues = z.infer<typeof profileSchema>;
//type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

interface PageProps {
  user:UserPayload
}

const {address,city,country,state,zip} = stage1Schema.shape;

const Kyc: React.FC<PageProps> = ({user}) => {
    //const { user } = useLoaderData<typeof loader>();
     //const actionData = useActionData();
     const navigation = useFormState();
     const loading = navigation === 'submit';
     const router = useRouter();
     //const submit = useSubmit();
     //const json_action = useState<ActionData>(null);

     const [form_data, set_form_data] = useState<FormElement<any>[]>([
         (new GenerateFormdata)
         .set_class_names('w-full')
         .set_label('Address Line')
         //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
         .set_label_class_names('text-amber-300 mb-4')
         .set_name('address')
         .set_disabled(loading)
         //.set_disabled(is_submitting)
         .set_placeholder('Enter your address')
         .set_type('text')
         .set_validation(address)
         .set_value('')
         /*.set_field_class_names(
           'bg-white text-gray-900 border-green-300 focus:border-green-500 px-3 py-2 rounded-lg shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400'
         )*/
         .set_field_class_names(
           'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
         )
         .set_error_field_class_names('text-red-500 text-sm mt-1')
         .build(),
           new GenerateFormdata()
             .set_class_names('w-full')
             .set_label('Zip Code')
             //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
             .set_label_class_names('text-amber-300 mb-4')
             .set_name('zip')
             .set_disabled(loading)
             //.set_disabled(is_submitting)
             .set_placeholder('Enter your zip code')
             .set_type('integer')
             .set_validation(zip)
             .set_value('')
             /*.set_field_class_names(
               'bg-white text-gray-900 border-green-300 focus:border-green-500 px-3 py-2 rounded-lg shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400'
             )*/
             .set_field_class_names(
               'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
             )
             .set_error_field_class_names('text-red-500 text-sm mt-1')
             .build(),
           new GenerateFormdata()
             .set_class_names('w-full')
             .set_label('City of Residence')
             .set_label_class_names('text-amber-300 mb-4')
             .set_name('city')
             .set_disabled(loading)
             .set_placeholder('Enter your city of residence')
             .set_type('text')
             //.set_show_password_icon(true)
             .set_validation(city)
             .set_value('')
             .set_field_class_names(
               'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
             )
             .set_error_field_class_names('text-red-500 text-sm mt-1')
             .build(),
             new GenerateFormdata()
             .set_class_names('w-full')
             .set_label('State of Residence')
             .set_label_class_names('text-amber-300 mb-4')
             .set_name('state')
             .set_disabled(loading)
             .set_placeholder('Enter your state of residence')
             .set_type('text')
             //.set_show_password_icon(true)
             .set_validation(state)
             .set_value('')
             .set_field_class_names(
               'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
             )
             .set_error_field_class_names('text-red-500 text-sm mt-1')
             .build(),
             new GenerateFormdata()
             .set_class_names('w-full')
             .set_label('Country of Residence')
             .set_label_class_names('text-amber-300 mb-4')
             .set_name('country')
             .set_disabled(loading)
             .set_placeholder('Enter your country of residence')
             .set_type('text')
             //.set_show_password_icon(true)
             .set_validation(country)
             .set_value('')
             .set_field_class_names(
               'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
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


   

    
    

  return (
    <SectionWrapper animationType='slideInLeft' padding='4' md_padding='4'>
    <div className="space-y-8">
      {/*<h1 className="text-3xl md:text-4xl font-bold text-amber-300">My Profile</h1>*/}
      <CardTitle className="text-3xl font-medium text-amber-300">KYC</CardTitle>

      {/* Profile Information Card */}
      <Card className="bg-gray-800 p-6 border border-amber-300/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-amber-300">KYC Information</CardTitle>
        </CardHeader>
        <CardContent>

          <FormWrapper
                                                  action="/api/kyc"
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
                                                  class_names="space-y-6"
                                                  notify={(error)=>{
                                                    Toasting.error(error,10000,'bottom-center');
                                                  }}
                                                  after_submit_action={(message,data)=>{
                                                     //console.log(data);
                                                     //console.log(message);
                                                     Toasting.success('Your KYC has been updated successfully',
                                                      10000,'bottom-center'
                                                     );
                                                     router.replace('/dashboard');
                                                    /*if(data){
                                                      if(data.url){
                                                        if(typeof data.url === 'string'){
                                                          //router.replace(data.url);
                                                        }
                                                      }
                                                    }*/
                                                  }}
                      
                                              >
                                                
                   <Button variant="outline" className={"border-gold-500 border-amber-300 text-amber-300 hover:border-amber-50 hover:text-amber-50 cursor-pointer"} disabled={loading}>
                        {loading  ? 'Saving...' : 'Save Changes'}
                   </Button>
                                                  
                          </FormWrapper>

            
        </CardContent>
      </Card>

      
    </div>
    </SectionWrapper>
  );
};

export default Kyc;