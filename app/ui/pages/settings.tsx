'use client';
import React, { useState, useEffect, useRef } from 'react'; 
//import { Form, useActionData, useNavigation, useSubmit } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as z from 'zod';
//import SectionWrapper from '@/components/shared/section-wrapper';
import { Trash2, Edit, PlusCircle, CreditCard, Loader2 } from 'lucide-react'; 
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
//import { get_form_data, RRFormDynamic } from '@/components/rr-form-mod-test';
//import { Toasting } from '@/components/loader/loading-anime';
//import SwitchComponent from '@/components/switch-component';
import { fetch_request_mod, log } from '@/lib/utils';
import { FormWrapper, GenerateFormdata, useFormState } from '@imadehidiame/react-form-validation';
import { Toasting } from '../lib/loader/loading-anime';
import SectionWrapper from '../components/section-wrapper';
import SwitchComponent from '../layouts/switch-component';



interface WalletAddress {
    _id: string; 
    address: string;
    currency: string;
    label: string;
    createdAt: string; 
}

interface SettingsData {
    notifications: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        notifyOnLogin?: boolean;
        twofa_auth?: boolean;
    };
    general: {
        language: string;
    };
    wallets: WalletAddress[]; 
    currencies?: { name: string, value: string }[]
}

interface PageProps {
    settings: SettingsData;
    //session?:string|null
}


// --- Zod Schemas ---
const notificationSettingsSchema = z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    notifyOnLogin: z.boolean().optional(),
    twofa_auth: z.boolean().optional()
});

const generalSettingsSchema = z.object({
    language: z.string(),
});

// Define schema for adding a new wallet address
const addWalletSchema = z.object({
    address: z.string().min(10, { message: 'Wallet address is required' }), // Basic validation
    currency: z.string().min(1, { message: 'Currency is required' }),
    label: z.string().min(1, { message: 'Label is required' }), 
});

// Define schema for updating an existing wallet address
const updateWalletSchema = z.object({
    _id: z.string(), // Wallet ID is required for update
    label: z.string().min(1, { message: 'Label is required' }),
    currency: z.string().min(1, { message: 'Currency is required' }),
    address: z.string().min(10, { message: 'Wallet address is required' }), // Basic validation
});




const SettingsPage: React.FC<PageProps> = ({ settings}) => {

    const [settings_state, set_settings_state] = useState(settings);
    const [submitMethod,setSubmitMethod] = useState<'POST'|'PATCH'>('POST');
    //const [flash_session,set_flash_session] = useState('page_loaded');
      const { general, notifications, wallets } = settings_state;
      const [inLoading,setInLoading] = useState<boolean>(false);
      //const submit = useSubmit();
      const navigation = useFormState();
      /*const actionData = useActionData<{
        data: { logged: boolean; data?: WalletAddress; message?: string; error?: string; formType?: string };
      }>();*/
      const loading = navigation === 'submit';
      //const submittingFormType = isSubmitting ? navigation.formData?.get('formType') : null;
      const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
      const [deleteWalletId, setDeleteWalletId] = useState<string | null>(null);
      const [deleteLoading,setDeleteLoading] = useState<boolean>(false);
      const [openDialog,setOpenDialog] = useState<boolean>(false);
      const editingWallet = wallets.find(w => w._id === editingWalletId);
      const lastSubmissionRef = useRef<string | null>(null);

    useEffect(() => {
        //log(settings, 'Settings From server');
        set_settings_state(settings);
      }, [settings]);
    
      
      
      

      /*useEffect(() => {
        //set_flash_session(session);
        if(navigation.state === 'loading' && navigation.formAction?.includes('api/delete-wallet') && navigation.formMethod === 'DELETE'){
            Toasting.success('Wallet has been deleted successfully',10000);
        }
        
      }, [navigation.state]);*/

      
    
      const { label, currency, address } = addWalletSchema.shape;
      const [deleteForm,setDeleteForm] = useState([]);

      const form_data = [
                (new GenerateFormdata)
                 .set_class_names('w-full')
                 .set_label('Label')
                 //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
                 .set_label_class_names('text-amber-300 mb-4')
                 .set_name('label')
                 .set_disabled(loading)
                 //.set_disabled(is_submitting)
                 .set_placeholder('e.g, My Bitcoin Wallet')
                 .set_type('text')
                 .set_validation(label)
                 .set_value('')
                 .set_field_class_names(
                   'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                 )
                 .set_error_field_class_names('text-red-500 text-sm mt-1')
                 .build(),
                 (new GenerateFormdata)
                 .set_class_names('w-full')
                 .set_label('Wallet Type')
                 //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
                 .set_label_class_names('text-amber-300 mb-4')
                 .set_name('currency')
                 .set_disabled(loading)
                 .set_selects(settings.currencies || [
                    { name: 'Bitcoin - BTC', value: 'Bitcoin' },
                    { name: 'Ethereum - ETH', value: 'Ethereum' },
                    { name: 'USDT', value: 'USDT' },
                  ])
                 .set_placeholder('Select wallet type')
                 .set_type('select')
                 .set_validation(currency)
                 .set_value('')
                 .set_field_class_names(
                   'w-full bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                 )
                 .set_error_field_class_names('text-red-500 text-sm mt-1')
                 .build(),
                 (new GenerateFormdata)
                 .set_class_names('w-full')
                 .set_label('Wallet Address')
                 //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
                 .set_label_class_names('text-amber-300 mb-4')
                 .set_name('address')
                 .set_disabled(loading)
                 //.set_disabled(is_submitting)
                 .set_placeholder('Enter wallet address')
                 .set_type('text')
                 .set_validation(address)
                 .set_value('')
                 .set_field_class_names(
                   'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
                 )
                 .set_error_field_class_names('text-red-500 text-sm mt-1')
                 .build(),
        /*get_form_data(
          'text',
          'label',
          '',
          label,
          'Label',
          'e.g, My Bitcoin Wallet',
          undefined,
          undefined,
          undefined,
          undefined,
          'w-full',
          'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300',
          undefined,
          navigation.state === 'submitting',
          undefined,
          undefined,
          undefined,
        ),
        get_form_data(
          'select',
          'currency',
          '',
          currency,
          'Currency',
          'Select currency from the list',
          undefined,
          undefined,
          undefined,
          settings.currencies ?? [
            { name: 'Bitcoin - BTC', value: 'Bitcoin' },
            { name: 'Ethereum - ETH', value: 'Ethereum' },
            { name: 'USDT', value: 'USDT' },
          ],
          'w-full',
          'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
        ),
        get_form_data(
          'text',
          'address',
          '',
          address,
          'Wallet Address',
          'Enter wallet address',
          undefined,
          undefined,
          undefined,
          undefined,
          'w-full',
          'bg-gray-700 border-gray-600 text-white focus-visible:ring-amber-300'
        ),*/
      ];
      const [form_state, set_form_state] = useState(form_data);
       useEffect(()=>{
        log(form_state,'Form state value');
       },[form_state])
    
      useEffect(() => {
        if (editingWalletId) {
          const { label, currency, address } = wallets.find(e => e._id === editingWalletId)!;
          set_form_state(prev =>
            prev.map(e => ({
              ...e,
              value: e.name === 'label' ? label : e.name === 'currency' ? currency : address,
            }))
          );
        } else {
          set_form_state(prev => prev.map(e => ({ ...e, value: '' })));
        }
      }, [editingWalletId, wallets]);
    
      const on_form_change = (name: string | number | Symbol, value: any) => {
        set_form_state(prev => prev.map(e => (e.name === name ? { ...e, value } : e)));
      };
    
      const on_submit = async (form_value: any) => {
        const submissionKey = JSON.stringify(form_value);
        if (lastSubmissionRef.current === submissionKey) {
          //log('Duplicate submission prevented', form_value);
          return;
        }
        lastSubmissionRef.current = submissionKey;
    
        if (editingWalletId) {
          form_value._id = editingWalletId;
          form_value.formType = 'updateWallet';
        } else {
          form_value.formType = 'addWallet';
        }
        /*submit(form_value, {
          action: '/dashboard/settings',
          method: editingWalletId ? 'PATCH' : 'POST',
          encType: 'application/json',
          replace: true,
        });*/
      };
    
      const on_delete = async () => {
        if (!editingWalletId) return;
        /*submit(
          { _id: editingWalletId, formType: 'deleteWallet' },
          {
            action: '/dashboard/settings',
            method: 'DELETE',
            encType: 'application/json',
            replace: false,
          }
        );*/
      };

    const after_submit_action = (message: string, data: any) => {
        if(editingWalletId){
            set_settings_state(prev=>({...prev,wallets:prev.wallets.map(e=>(e._id === editingWalletId ? Object.assign({},e,data) : e))}));
            Toasting.success('Wallet has been updated successfully');
        }else{
        //log(data,'Data sent from server');
        //const { wallets } = settings_state;
        set_settings_state(prev=>({...prev,wallets:[...prev.wallets,data]}));
        Toasting.success('Wallet has been added successfully');
        //setEditingWalletId(prev=>data._id);
        }
    }

    async function delete_wallet(){
        if(!deleteWalletId)
            return;
        setDeleteLoading(true);
        const {is_error,status,served,data} = await fetch_request_mod<{logged:boolean}>('DELETE','/api/settings/wallets/'+deleteWalletId
            ,JSON.stringify({deleteWalletId}),true);
        setDeleteLoading(false);
        if(served && !is_error){
            set_settings_state(prev=>({...prev,wallets:prev.wallets.filter(e=>(e._id !== deleteWalletId))}));
            setDeleteWalletId(null);
            setOpenDialog(false);
            Toasting.success('Wallet information has been successfully deleted',10000,'bottom-center');
        }else{
            Toasting.error(data,10000,'bottom-center');
            setDeleteWalletId(null);
            setOpenDialog(false);
        }
      }
    

    return (
        // Assuming SectionWrapper provides padding, removed duplicate padding div
        <SectionWrapper animationType='slideInLeft' padding='6' md_padding='8'>
            <div className="space-y-8 max-sm:px-0">
                {/*<CardTitle className="text-3xl md:text-4xl font-medium text-amber-300">App Settings</CardTitle>*/}
                <CardTitle className="text-xl sm:text-2xl font-medium text-amber-300">App Settings</CardTitle>

                {/* Notification Settings */}
                <Card className="bg-gray-800 max-sm:py-6 max-sm:px-0 p-6  border border-amber-300/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-amber-300">Notification Settings</CardTitle>
                    </CardHeader>
                    <CardContent className='max-sm:px-3'>


                        <div className='space-y-4'>
                            <div className="bg-gray-900 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors duration-200 flex flex-row items-center justify-between p-4">
                                <div>
                                    <label className="text-gray-300">Email Notifications</label>
                                    <div className="text-sm text-gray-500">Receive notifications via email.</div>
                                </div>




                                <SwitchComponent action='/api/settings' form_key='emailNotifications' method='PATCH' served_key='logged' name='emailNotifications' className='data-[state=checked]:bg-amber-300 data-[state=unchecked]:bg-gray-700' value={notifications.emailNotifications} id='emailNotifications' success='Setting has been updated successfully' error='An error occured along the way. Please try again later' after_submit_action={(id, check) => {
                                    set_settings_state(prev=>({...prev,notifications:{...notifications,emailNotifications:check}}));
                                }} use_form_data={false} />


                            </div>

                            {/*<div className="bg-gray-900 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors duration-200 flex flex-row items-center justify-between p-4">
                                <div>
                                    <label className="text-gray-300">SMS Notifications</label>
                                    <div className="text-sm text-gray-500">Receive notifications via sms.</div>
                                </div>




                                <SwitchComponent action='/api/settings-update' form_key='smsNotifications' method='PATCH' served_key='logged' name='smsNotifications' className='data-[state=checked]:bg-amber-300 data-[state=unchecked]:bg-gray-700' value={notifications.smsNotifications} id='smsNotifications' success='Setting has been updated successfully' error='An error occured along the way. Please try again later' after_submit_action={(id, check) => {
                                    set_settings_state(prev=>({...prev,notifications:{...notifications,smsNotifications:check}}));
                                }} use_form_data={true} />


                            </div>*/}

                            <div className="bg-gray-900 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors duration-200 flex flex-row items-center justify-between p-4">
                                <div>
                                    <label className="text-gray-300">Notify on Login</label>
                                    <div className="text-sm text-gray-500">Receive an email notification when you login.</div>
                                </div>




                                <SwitchComponent action='/api/settings' form_key='notifyOnLogin' method='PATCH' served_key='logged' name='notifyOnLogin' className='data-[state=checked]:bg-amber-300 data-[state=unchecked]:bg-gray-700' value={notifications.notifyOnLogin as boolean} id='notifyOnLogin' success='Setting has been updated successfully' error='An error occured along the way. Please try again later' after_submit_action={(id, check) => {
                                    set_settings_state(prev=>({...prev,notifications:{...notifications,notifyOnLogin:check}}));
                                }} use_form_data={false} />


                            </div>

                            {/*<div className="bg-gray-900 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors duration-200 flex flex-row items-center justify-between p-4">
                                <div>
                                    <label className="text-amber-300 font-semibold">Two-Factor Authentication (2FA)</label>
                                    <div className="text-sm text-gray-500">Enable 2FA for added security (Requires separate setup).</div>
                                </div>




                                <SwitchComponent action='/api/settings-update' form_key='twofa_auth' method='PATCH' served_key='logged' name='twofa_auth' className='data-[state=checked]:bg-amber-300 data-[state=unchecked]:bg-gray-700' value={notifications.twofa_auth as boolean} id='twofa_auth' success='Setting has been updated successfully' error='An error occured along the way. Please try again later' after_submit_action={(id, check) => {
                                    set_settings_state(prev=>({...prev,notifications:{...notifications,twofa_auth:check}}));
                                }} />


                            </div>*/}


                        </div>
                    </CardContent>
                </Card>

                
                <Card className="bg-gray-800 p-6 border border-amber-300/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-amber-300">Wallet Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 max-sm:px-0">

                        {/* Add/Edit Wallet Form */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                                {editingWallet ? <Edit className="h-5 w-5 text-amber-300" /> : <PlusCircle className="h-5 w-5 text-amber-300" />}
                                <span>{editingWallet ? 'Edit Wallet Address' : 'Add New Wallet Address'}</span>
                            </h3>
                            {/* Form for adding or editing wallets */}


                           <FormWrapper
                                                                             action="/api/settings/wallets"
                                                                             method={submitMethod}
                                                                             form_components={form_state}
                                                                             set_form_elements={set_form_state}
                                                                             is_json={true}
                                                                             request_headers={{
                                                                                 //[CSRF_HEADER]: csrf_header!
                                                                             }}
                                                                             //fetch_options={/*{ credentials: 'include' }*/}
                                                                             pre_submit_action={(value) => {
                                                                                 //value['role'] = 'admin'; 
                                                                                 //value[FORM_BODY_NAME] = csrf_header;
                                                                                 if(editingWalletId)
                                                                                    value['_id'] = editingWalletId;
                                                                                 return value;
                                                                             }}
                                                                             is_clear_form={true}
                                                                             validation_mode="onChange"
                                                                             class_names="space-y-6"
                                                                             notify={(error)=>{
                                                                               Toasting.error(error,10000,'bottom-center');
                                                                             }}
                                                                             redefine={(data)=>{
                                                                                const {label,address,currency} = data;
                                                                                if(editingWalletId){
                                                                                    let isLabelDirty = true;
                                                                                    let isAddressDirty = true,isCurrencyDirty = true;
                                                                                    wallets.forEach(e=>{
                                                                                        if(e.label.trim() === (label as string).trim())
                                                                                            isLabelDirty = false;
                                                                                        if(e.address.trim() === (address as string).trim())
                                                                                            isAddressDirty = false;
                                                                                        if(e.currency.trim() === (currency as string).trim())
                                                                                            isCurrencyDirty = false;
                                                                                    })
                                                                                    return {
                                                                                        valid:(isLabelDirty || isAddressDirty || isCurrencyDirty),
                                                                                        path:'address',
                                                                                        error:'Please update at least one of the fields before submitting the form'
                                                                                    }
                                                                                }
                                                                                return {valid:wallets.findIndex(e=>e.label.toLocaleLowerCase().trim() === (label as string).trim().toLocaleLowerCase())< 0,error:`${label} has already been registered`,path:'label'}
                                                                            }}
                                                                             after_submit_action={(message,data)=>{
                                                                                console.log(data);
                                                                                console.log(message);
                                                                                Toasting.success(message,
                                                                                 10000,'bottom-center'
                                                                                );
                                                                                const {data:dataa} = data;
                                                                                console.log({dataa});

                                                                                if(editingWalletId){
                                                                                    set_settings_state(prev=>({...prev,wallets:prev.wallets.map(e=>(e._id === editingWalletId ? Object.assign({},e,dataa) : e))}));
                                                                                    //Toasting.success('Wallet has been updated successfully');
                                                                                }else{
                                                                                //log(data,'Data sent from server');
                                                                                //const { wallets } = settings_state;
                                                                                set_settings_state(prev=>({...prev,wallets:[...prev.wallets,dataa]}));
                                                                                //Toasting.success('Wallet has been added successfully');
                                                                                //setEditingWalletId(prev=>data._id);
                                                                                }
                                                                                setEditingWalletId(null);
                                                                                setSubmitMethod('POST');

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
                                {submitMethod === 'PATCH' && (
                                        <Button type="submit" variant="outline" className="ml-auto border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer" disabled={loading || deleteLoading}>
                                            {loading ?   'Updating wallet..' : 'Update Wallet'}
                                        </Button>
                                    )}

                                {submitMethod === 'POST' && (<Button className="bg-amber-300 text-gray-900 hover:bg-amber-400 cursor-pointer" disabled={loading || deleteLoading} type='submit'>
                                    {loading && <Loader2 className="animate-spin" />}
                                    {loading ?  editingWalletId ? 'Updating wallet' : 'Adding wwallet' : editingWallet ? 'Update wallet' : 'Add Wallet'}
                                </Button>)}                           
                                              {/*<Button variant="outline" className={"border-gold-500 border-amber-300 text-amber-300 hover:border-amber-50 hover:text-amber-50 cursor-pointer"} disabled={loading}>
                                                   {loading  ? 'Saving...' : 'Save Changes'}
                                              </Button>*/}
                                                                             
                            </FormWrapper>     

                            {/*<RRFormDynamic
                                form_components={form_state}
                                afterSubmitAction={after_submit_action}
                                redefine={(data)=>{
                                    const {label} = data;
                                    return {valid:wallets.findIndex(e=>e.label.toLocaleLowerCase().trim() === (label as string).trim().toLocaleLowerCase())< 0,error:`${label} has already been registered`,path:'label'}
                                }}
                                submitForm={on_submit}
                                set_form_elements={set_form_state}
                                //on_change={on_form_change}
                                className="space-y-6 p-0 md:p-0 flex flex-wrap gap-4 items-center"
                                notify={(notify) => {
                                    Toasting.error(notify, 10000);
                                }}
                                validateValues={['label','currency','address']}

                            >



                                    {editingWalletId && (
                                        <Button type="button" variant="outline" className="ml-auto border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white cursor-crosshair" onClick={() => setEditingWalletId(null)} disabled={loading}>
                                            Cancel
                                        </Button>
                                    )}

                                <Button className="bg-amber-300 text-gray-900 hover:bg-amber-400 cursor-pointer" disabled={isSubmitting} type='submit'>
                                    {loading && <Loader2 className="animate-spin" />}
                                    {isSubmitting ?  editingWalletId ? 'Updating wallet' : 'Adding wwallet' : editingWallet ? 'Update wallet' : 'Add Wallet'}
                                </Button>



                            </RRFormDynamic>*/}


                            
                        </div>

                        {/* Registered Wallets List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-4 text-white">Registered Wallet Addresses</h3>
                            {wallets.length > 0 ? (
                                <div className="space-y-4"> {/* Use space-y-4 for vertical stacking */}
                                    {wallets.map(wallet => (
                                        // Display wallet info in a responsive card/div structure
                                        <Card key={wallet._id} className="bg-gray-900 rounded-lg border hover:bg-gray-800 transition-colors duration-200 p-4 border-gray-600 flex flex-col sm:flex-row sm:items-center justify-between">
                                            <div className="flex-grow mb-4 sm:mb-0">
                                                <div className="text-amber-300 font-semibold flex items-center space-x-2">
                                                    <CreditCard className="h-5 w-5" /> {/* Icon */}
                                                    <span>{wallet.label} ({wallet.currency})</span>
                                                </div>
                                                <div className="text-gray-300 text-sm break-all">{wallet.address}</div> {/* break-all for long addresses */}
                                                <div className="text-gray-500 text-xs mt-1">Added on: {new Date(wallet.createdAt).toLocaleDateString()}</div> {/* Format date */}
                                            </div>
                                            {/* Action buttons (Edit and Delete) */}
                                            <div className="flex space-x-2 justify-end sm:justify-start">
                                                {/* Edit Button */}
                                                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-amber-300" onClick={() => {
                                                    setEditingWalletId(wallet._id);
                                                    setSubmitMethod('PATCH');
                                                }} disabled={loading}>
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>

                                                {/* Delete Button with Confirmation */}
                                                <Dialog onOpenChange={setOpenDialog} open={openDialog}>
                                                    <DialogTrigger asChild>
                                                        {/* Button to open the AlertDialog */}
                                                        <Button variant="destructive" size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" disabled={loading} onClick={()=>{
                                                        setDeleteWalletId(wallet._id);
                                                        setOpenDialog(true);
                                                        }}>
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </DialogTrigger>
                                                    {deleteWalletId && <DialogContent className="bg-gray-800 text-gray-100 border-amber-300/50">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-white">Are you sure?</DialogTitle>
                                                            <DialogDescription className="text-gray-300">
                                                                This action cannot be undone. This will permanently delete your wallet address: <span className="font-semibold">{wallet.label} ({wallet.currency})</span>.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogFooter>
                                                            {/*<DialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">Cancel</AlertDialogCancel>*/}
                                                            {/* Form to trigger the delete action when confirmed */}
                                                            {/*<Form method="DELETE" action={`/api/delete-wallet/${wallet._id}`} onSubmit={()=>{
                                                                setEditingWalletId(null);
                                                                //set_flash_session('submiting');
                                                            }} preventScrollReset={true}>*/}
                                                                {/*<input type="hidden" name="formType" value="deleteWallet" />*/}
                                                                
                                                                <Button type="button" onClick={delete_wallet} className="bg-red-500 text-white hover:bg-red-600" disabled={deleteLoading}>
                                                                {deleteLoading && <Loader2 className="animate-spin" />}
                                                                    {deleteLoading  ? 'Deleting...' : 'Delete'}
                                                                </Button>
                                                                
                                                            {/*</Form>*/}
                                                        </DialogFooter>
                                                    </DialogContent>}
                                                </Dialog>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400">No wallet addresses registered yet.</p>
                            )}

                            {/* Success/Error message display specifically for wallet actions */}


                        </div>

                    </CardContent>
                </Card>


                {/* Existing General Settings (kept for completeness) */}
                {/* ... existing General Settings Card ... */}



            </div>
        </SectionWrapper>
    );
};

// Change the default export to use the component name
export default SettingsPage;