'use client';
import React, { useState } from 'react'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as z from 'zod';
//import SectionWrapper from '@/components/shared/section-wrapper';
import { PlusCircle, CreditCard, Loader2 } from 'lucide-react'; 
import { FormWrapper, GenerateFormdata, useFormState } from '@imadehidiame/react-form-validation';
import { Toasting } from '../../lib/loader/loading-anime';
import SectionWrapper from '../../components/section-wrapper';

interface IRegisteredWallets {
    type:string;
    address:string;
    createdAt:Date
}

interface PageProps {
    registeredWallets:IRegisteredWallets[]
    //session?:string|null
}
const addWalletSchema = z.object({
    address: z.string().min(10, { message: 'Wallet address is required' }), // Basic validation
    type: z.string().min(1, { message: 'Wallet type is required' }),
});

const { type,address } = addWalletSchema.shape;






const AdminSettingsPage: React.FC<PageProps> = ({registeredWallets}) => {

      const [pageRegisteredWallets,setPageRegisteredWallets] = useState<IRegisteredWallets[]>(registeredWallets);
      const navigation = useFormState();
      const loading = navigation === 'submit';
      const form_data = [
                 (new GenerateFormdata)
                 .set_class_names('w-full')
                 .set_label('Wallet Type')
                 //.set_label_class_names('text-sm font-medium text-green-800 mb-2')
                 .set_label_class_names('text-amber-300 mb-4')
                 .set_name('type')
                 .set_disabled(loading)
                 .set_selects([
                    { name: 'Bitcoin - BTC', value: 'btc' },
                    { name: 'Ethereum - ETH', value: 'eth' },
                    { name: 'USDT', value: 'USDT' },
                  ])
                 .set_placeholder('Select wallet type')
                 .set_type('select')
                 .set_validation(type)
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
      ];
      const [form_state, set_form_state] = useState(form_data);
      

    return (
        
        <SectionWrapper animationType='slideInLeft' padding='6' md_padding='8'>
            <div className="space-y-8 max-sm:px-0">
                {/*<CardTitle className="text-3xl md:text-4xl font-medium text-amber-300">App Settings</CardTitle>*/}
                <CardTitle className="text-xl sm:text-2xl font-medium text-amber-300">App Settings</CardTitle>

                {/* Notification Settings */}
                

                
                <Card className="bg-gray-800 p-6 border border-amber-300/50">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-amber-300">Wallet Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 max-sm:px-0">

                        {/* Add/Edit Wallet Form */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                                <PlusCircle className="h-5 w-5 text-amber-300" />
                                <span>Wallet Address</span>
                            </h3>
                            {/* Form for adding or editing wallets */}


                           <FormWrapper
                                                                             action="/api/settings/adm-wallets"
                                                                             method={'POST'}
                                                                             form_components={form_state}
                                                                             set_form_elements={set_form_state}
                                                                             is_json={true}
                                                                             request_headers={{
                                                                                 //[CSRF_HEADER]: csrf_header!
                                                                             }}
                                                                             //fetch_options={/*{ credentials: 'include' }*/}
                                                                             pre_submit_action={(value) => {
                                                                                 const currentWallet = 
                                                                                 pageRegisteredWallets.find(e=>e.type === value.type);
                                                                                 if(currentWallet)
                                                                                    value['previousWalletType'] = currentWallet.type;
                                                                                 return value;
                                                                             }}
                                                                             is_clear_form={true}
                                                                             validation_mode="onChange"
                                                                             class_names="space-y-6"
                                                                             notify={(error)=>{
                                                                               Toasting.error(error,10000,'bottom-center');
                                                                             }}
                                                                             after_submit_action={(message,data)=>{
                                                                                console.log(data);
                                                                                if(pageRegisteredWallets.length < 1){
                                                                                    setPageRegisteredWallets(e=>[
                                                                                    {
                                                                                        type:data.type,
                                                                                        address:data.address,
                                                                                        createdAt:new Date()
                                                                                    }    
                                                                                ]);
                                                                                }else{
                                                                                let cutWallets = pageRegisteredWallets.slice();
                                                                                let count = 0;
                                                                                cutWallets = cutWallets.map(e=>{
                                                                                  if(e.type === data.type){
                                                                                    count+=1;
                                                                                    e.address = data.address;
                                                                                  }
                                                                                  return e;  
                                                                                });
                                                                                console.log({count});
                                                                                if(cutWallets.length === 0){
                                                                                    cutWallets = [...cutWallets,{
                                                                                        address:data.address,
                                                                                        type:data.type,
                                                                                        createdAt:(new Date)
                                                                                    }];
                                                                                    /*setPageRegisteredWallets(
                                                                                        [
                                                                                            {
                                                                                                address:data.address,
                                                                                                type:data.type,
                                                                                                createdAt:(new Date)
                                                                                            }
                                                                                        ]
                                                                                    );*/
                                                                                }else{
                                                                                    if(count === 0)
                                                                                        cutWallets = [...cutWallets,{
                                                                                            address:data.address,
                                                                                            type:data.type,
                                                                                            createdAt:(new Date)
                                                                                        }];
                                                                                }
                                                                                console.log({cutWallets});
                                                                                setPageRegisteredWallets(e=>cutWallets);
                                                                                }
                                                                                Toasting.success(message,
                                                                                 10000,'bottom-center'
                                                                                );
                                                                                
                                                                             }}
                                                 
                                                                         >
                                <Button className="bg-amber-300 text-gray-900 hover:bg-amber-400 cursor-pointer" disabled={loading} type='submit'>
                                    {loading && <Loader2 className="animate-spin" />}
                                    {loading ? 'Creating wallet..' : 'Create Wallet'}
                                </Button>
                                                           
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
                            {pageRegisteredWallets.length > 0 ? (
                                <div className="space-y-4"> {/* Use space-y-4 for vertical stacking */}
                                    {pageRegisteredWallets.map(wallet => (
                                        // Display wallet info in a responsive card/div structure
                                        <Card key={wallet.type} className="bg-gray-900 rounded-lg border hover:bg-gray-800 transition-colors duration-200 p-4 border-gray-600 flex flex-col sm:flex-row sm:items-center justify-between">
                                            <div className="flex-grow mb-4 sm:mb-0">
                                                <div className="text-amber-300 font-semibold flex items-center space-x-2">
                                                    <CreditCard className="h-5 w-5" /> {/* Icon */}
                                                    <span>{wallet.type === 'btc' ? 'Bitcoin' : 'Ethereum'} ({wallet.address})</span>
                                                </div>
                                                <div className="text-gray-300 text-sm break-all">{wallet.address}</div> {/* break-all for long addresses */}
                                                <div className="text-gray-500 text-xs mt-1">Added on: {new Date(wallet.createdAt).toLocaleDateString()}</div> {/* Format date */}
                                            </div>
                                            {/* Action buttons (Edit and Delete) */}
                                            {/*<div className="flex space-x-2 justify-end sm:justify-start">
                                                
                                                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-amber-300" onClick={() => {
                                                    setEditingWalletId(wallet._id);
                                                    setSubmitMethod('PATCH');
                                                }} disabled={loading}>
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>

                                                
                                            </div>*/}
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
export default AdminSettingsPage;