'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { KycPayload, UserPayload } from '@/lib/auth';
import { FormElement, FormWrapper, GenerateFormdata, useFormState } from '@imadehidiame/react-form-validation';
import SectionWrapper from '../components/section-wrapper';
import { Toasting } from '../lib/loader/loading-anime';




const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  user_password: z.string().min(1, { message: 'Please enter current password to update' }),
});

const {name,email,user_password} = profileSchema.shape;

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(8, { message: 'Your new password must be at least 8 characters' }),
  //confirmNewPassword: z.string().min(1, { message: 'Please re-enter your password' }),
})/*.refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
})*/;

const { currentPassword,newPassword } = passwordChangeSchema.shape;



const stage1Schema = z.object({
  address: z.string().min(2, { message: 'Please enter your address'}),
  zip: z.string().min(4,{ message: 'Please enter your zip code' }),
  city: z.string().min(3, { message: 'Please enter your city of residence' }),
  state: z.string().min(3, { message: 'Please enter your state of residence'}),
  country: z.string().min(3, { message: 'Please enter country of residence' }),
  kycPassword: z.string().min(1, { message: 'Please enter current password to update' }),
});

const {address,city,country,state,zip,kycPassword} = stage1Schema.shape;

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

interface PageProps {
  user:UserPayload,
  kyc:KycPayload
}

type ActionData = {
    error?:string;
    formType?:string;
    message?:string
} | null


const DashboardProfile: React.FC<PageProps> = ({user,kyc}) => {
    //const { user } = useLoaderData<typeof loader>();
     //const actionData = useActionData();
     const navigation = useFormState();
     const loading = navigation === 'submit';
     const [userState,setUserState] = useState<UserPayload>(user);
     const [kycState,setKycState] = useState<KycPayload>(kyc);
     //const submit = useSubmit();
     console.log({kyc});
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
              .set_value(kyc.address)
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
                  .set_value(kyc.zip)
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
                  .set_value(kyc.city)
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
                  .set_value(kyc.state)
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
                  .set_value(kyc.country)
                  .set_field_class_names(
                    'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                  )
                  .set_error_field_class_names('text-red-500 text-sm mt-1')
                  .build(),
                  new GenerateFormdata()
                  .set_class_names('w-full')
                  .set_label('Account Password')
                  .set_label_class_names('text-amber-300 mb-4')
                  .set_name('kyc_password')
                  .set_disabled(loading)
                  .set_placeholder('Enter your password')
                  .set_type('password')
                  .set_show_password_icon(true)
                  .set_validation(kycPassword)
                  .set_value('')
                  .set_field_class_names(
                    'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                  )
                  .set_error_field_class_names('text-red-500 text-sm mt-1')
                  .build(),
              ]);

              const [bioForm, setBioForm] = useState<FormElement<any>[]>([
                (new GenerateFormdata)
                .set_class_names('w-full')
                .set_label('Name')
                //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
                .set_label_class_names('text-amber-300 mb-4')
                .set_name('name')
                .set_disabled(loading)
                //.set_disabled(is_submitting)
                .set_placeholder('Enter your full name')
                .set_type('text')
                .set_validation(name)
                .set_value(user.name)
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
                    .set_label('Email Address')
                    //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
                    .set_label_class_names('text-amber-300 mb-4')
                    .set_name('email')
                    .set_disabled(loading)
                    //.set_disabled(is_submitting)
                    .set_placeholder('Enter your email address')
                    .set_type('text')
                    .set_validation(email)
                    .set_value(user.email)
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
                    .set_label('Account Password')
                    .set_label_class_names('text-amber-300 mb-4')
                    .set_name('user_password')
                    .set_disabled(loading)
                    .set_placeholder('Enter your password')
                    .set_type('password')
                    .set_show_password_icon(true)
                    .set_validation(user_password)
                    .set_value('')
                    .set_field_class_names(
                      'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                    )
                    .set_error_field_class_names('text-red-500 text-sm mt-1')
                    .build(),
                ]);


              const [passwordForm, setPasswordForm] = useState<FormElement<any>[]>([
                
                    new GenerateFormdata()
                    .set_class_names('w-full')
                    .set_label('Account Password')
                    .set_label_class_names('text-amber-300 mb-4')
                    .set_name('password_password')
                    .set_disabled(loading)
                    .set_placeholder('Enter your password')
                    .set_type('password')
                    .set_show_password_icon(true)
                    .set_validation(currentPassword)
                    .set_value('')
                    .set_field_class_names(
                      'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                    )
                    .set_error_field_class_names('text-red-500 text-sm mt-1')
                    .build(),

                    new GenerateFormdata()
                    .set_class_names('w-full')
                    .set_label('New Password')
                    .set_label_class_names('text-amber-300 mb-4')
                    .set_name('_password_password')
                    .set_disabled(loading)
                    .set_placeholder('Enter your password')
                    .set_type('password')
                    .set_show_password_icon(true)
                    .set_validation(newPassword)
                    .set_value('')
                    .set_field_class_names(
                      'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                    )
                    .set_error_field_class_names('text-red-500 text-sm mt-1')
                    .build(),

                ]);
     

   
   /*const profileForm = useForm<ProfileFormValues>({
     resolver: zodResolver(profileSchema),
     defaultValues: {
       name: user?.name || '',
       email: user?.email || '',
       user_password:''
     },
     mode:'all',
     resetOptions: {
           keepDirtyValues: true, 
           keepErrors: true,
       },
   });

   
    const passwordChangeForm = useForm<PasswordChangeFormValues>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },

        mode:'onChange',
         
          resetOptions: {
              keepDirtyValues: true,
              keepErrors: true,
          },
    });*/

    // Reset forms on successful action submission
    /*React.useEffect(() => {
        // {"formType":"updateProfile","name":"Ehidiamen Imadegbo","email":"imadehidiame@gmail.com"}
        if(actionData){
        //const json_action_data = JSON.parse(actionData);
        //console.log({actionData:json_action_data});
        if(actionData?.error){
            console.log(actionData?.error);
            Toasting.error(actionData.error,10000,'top-center');
        }else{ 
        if (actionData?.message) {
            //profileForm.reset(profileForm.getValues()); 
            Toasting.success(actionData.message,10000,'top-center');
        }
        if (actionData?.formType === 'changePassword' && actionData?.message) {
            passwordChangeForm.reset(); // Clear password fields
            
        }
         if (actionData?.error) {
             console.error('Profile Action Error:', actionData.error);
         }
        }
     }
        
    }, [actionData, profileForm, passwordChangeForm]);*/

    /*useEffect(()=>{
        //console.log(navigation.formData);
        //console.log(navigation.formAction);
        //console.log(navigation.location);
        console.log(navigation.formData?.get('formType'))
    },[navigation.formData]);*/

  return (
    <SectionWrapper animationType='slideInLeft' padding='4' md_padding='4'>
    <div className="space-y-8">
      {/*<h1 className="text-3xl md:text-4xl font-bold text-amber-300">My Profile</h1>*/}
      <CardTitle className="text-3xl font-medium text-amber-300">My Profile</CardTitle>

      {/* Profile Information Card */}
      <Card className="bg-gray-800 p-6 border border-amber-300/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-amber-300">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
            <FormWrapper
                                                              action="/api/profile"
                                                              method="POST"
                                                              form_components={bioForm}
                                                              set_form_elements={setBioForm}
                                                              is_json={true}
                                                              request_headers={{
                                                                  //[CSRF_HEADER]: csrf_header!
                                                              }}
                                                              //fetch_options={/*{ credentials: 'include' }*/}
                                                              pre_submit_action={(value) => {
                                                                  //value['role'] = 'admin'; 
                                                                  //value[FORM_BODY_NAME] = csrf_header;
                                                                  value['flag'] = 'bio';
                                                                  return value;
                                                              }}
                                                              redefine={(value)=>{
                                                                if(value['name'] === userState.name && 
                                                                  value['email'] === userState.email)
                                                                  return {
                                                                    valid:false,
                                                                    path:'user_password',
                                                                    error:'Please update at least one of the fields in addition to the password to effect an update'
                                                                  }
                                                                  return {
                                                                    valid:true,
                                                                    path:'user_password',
                                                                    error:''
                                                                  }
                                                                  //return undefined
                                                              }}
                                                              validation_mode="onChange"
                                                              class_names="space-y-6"
                                                              notify={(error)=>{
                                                                Toasting.error(error,10000,'bottom-center');
                                                              }}
                                                              after_submit_action={(message,data)=>{
                                                                 //console.log(data);
                                                                 //console.log(message);
                                                                 Toasting.success(message,
                                                                  10000,'bottom-center'
                                                                 );
                                                                 setBioForm(f_data=>f_data.map(e=>e.name === 'user_password' 
                                                                    ? Object.assign({},e,{value:''}) 
                                                                    : e 
                                                                ));
                                                                setUserState(user_state=>Object.assign({}
                                                                  ,user_state,{name:data.name,email:data.email}));
                                                                 
                                                                  //router.replace('/dashboard');
                                                                /*if(data){
                                                                  if(data.url){
                                                                    if(typeof data.url === 'string'){
                                                                      //router.replace(data.url);
                                                                    }
                                                                  }
                                                                }*/
                                                              }}
                                  
                                                          >
                                                            
                               <Button variant="outline" className={"ml-auto border-gold-500 border-amber-300 text-amber-300 hover:border-amber-50 hover:text-amber-50 cursor-pointer"} disabled={loading}>
                                    {loading  ? 'Saving...' : 'Save Changes'}
                               </Button>
                                                              
            </FormWrapper>
        </CardContent>
      </Card>

      {/* Change Password Card */}
       <Card className="bg-gray-800 p-6 border border-amber-300/50">
         <CardHeader>
           <CardTitle className="text-xl font-bold text-amber-300">Update KYC</CardTitle>
         </CardHeader>
         <CardContent>
         <FormWrapper
                                                              action="/api/profile"
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
                                                                  value['flag'] = 'kyc';
                                                                  return value;
                                                              }}
                                                              validation_mode="onChange"
                                                              class_names="space-y-6"
                                                              notify={(error)=>{
                                                                Toasting.error(error,10000,'bottom-center');
                                                              }}
                                                              redefine={(value)=>{
                                                                if(value['address'] === kycState.address && 
                                                                  value['zip']!.toString() === kycState.zip &&
                                                                  value['city'] === kycState.city &&
                                                                  value['state'] === kycState.state &&
                                                                  value['country'] === kycState.country
                                                                )
                                                                  return {
                                                                    valid:false,
                                                                    path:'kyc_password',
                                                                    error:'Please update at least one of the fields in addition to the password to effect an update'
                                                                  }
                                                                  return {
                                                                    valid:true,
                                                                    path:'kyc_password',
                                                                    error:''
                                                                  }
                                                                  //return undefined
                                                              }}
                                                              after_submit_action={(message,data)=>{
                                                                 //console.log(data);
                                                                 //console.log(message);
                                                                 Toasting.success(message,
                                                                  10000,'bottom-center'
                                                                 );
                                                                 set_form_data(f_data=>f_data.map(e=>e.name === 'kyc_password' 
                                                                    ? Object.assign({},e,{value:''}) 
                                                                    : e 
                                                                ));
                                                                setKycState(kyc_state=>Object.assign({}
                                                                  ,kyc_state,{address:data.address,
                                                                    zip:data.zip,city:data.city,state:data.state,
                                                                  country:data.country}));
                                                                 //router.replace('/dashboard');
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


       <Card className="bg-gray-800 p-6 border border-amber-300/50">
         <CardHeader>
           <CardTitle className="text-xl font-bold text-amber-300">Change Password</CardTitle>
         </CardHeader>
         <CardContent>
         <FormWrapper
                                                              action="/api/profile"
                                                              method="POST"
                                                              form_components={passwordForm}
                                                              set_form_elements={setPasswordForm}
                                                              is_json={true}
                                                              request_headers={{
                                                                  //[CSRF_HEADER]: csrf_header!
                                                              }}
                                                              is_clear_form={true}
                                                              //fetch_options={/*{ credentials: 'include' }*/}
                                                              pre_submit_action={(value) => {
                                                                  //value['role'] = 'admin'; 
                                                                  //value[FORM_BODY_NAME] = csrf_header;
                                                                  value['flag'] = 'password';
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
                                                                 Toasting.success(message,
                                                                  10000,'bottom-center'
                                                                 );
                                                                 //router.replace('/dashboard');
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

export default DashboardProfile;