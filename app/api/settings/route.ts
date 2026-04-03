//import { update_single_document } from "@/lib/app-write-server-query";
//import useInitAppwrite from "@/lib/config/appwrite-server";
//import type { Route } from "./+types/product-update";

//import { getSess } from "@/layouts/app-layout";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
//import type { Route } from "./+types/settings-update";
//import { extract_body, log } from "@/lib/utils";
//import type { Route } from "./+types/settings-update";
//import type { Route } from "./+types/settings-update";


export async function PATCH (request:NextRequest){
    //console.log(request)
    //console.log(await request.json());
    const user = await getCurrentUser();
    //console.log({user});
    
    if(!user?.userId){
        return NextResponse.json({error:'Access denied',message:'Access to request denied'},{status:403,statusText:'Forbidden'});
        //return new Response(null,{status:403,statusText:'Access to request denied as a result of an invalid request'})
    }
    const userId = new Types.ObjectId(user.userId);
    if(request.method === 'PATCH'){
        try {
        //const { AppwriteServerConfig } = await useInitAppwrite();
        //const document = await get_single_document(AppwriteServerConfig.categories_collection_id,params.product);
        //const cloned_request1 = request.clone();
        //const cloned_request2 = request.clone();

        //const extract_data = await extract_body(cloned_request1);
        //const request_text = await cloned_request2.text();
        //const buff = Buffer.from(request_text,'utf-8');
        
        
        //log(extract_data,'Extract Body');
        //log(request_text,'Request Text');

        //log(JSON.parse(extract_data),'Extract');
        //log(JSON.parse(request_text),'Texxt');


        let form_data;
        let settings;
        await connectToDatabase();
        if(request.headers.has('Content-Type') && request.headers.get('Content-Type') == 'application/json'){
            form_data = await request.json();
            console.log({form_data});
            if(form_data.hasOwnProperty('emailNotifications')){
                settings = await Setting.findOneAndUpdate({userId},{$set:{'notifications.emailNotifications':form_data.emailNotifications}},{new:true});
                //await update_single_document(AppwriteServerConfig.products_collection_id,params.product,{is_archived:form_data.is_archived});
            }else if(form_data.hasOwnProperty('smsNotifications')){
                //await update_single_document(AppwriteServerConfig.products_collection_id,params.product,{is_featured:form_data.is_featured});
                settings = await Setting.findOneAndUpdate({userId},{$set:{'notifications.smsNotifications':form_data.smsNotifications}},{new:true});
            }else if(form_data.hasOwnProperty('notifyOnLogin')){
                //await update_single_document(AppwriteServerConfig.products_collection_id,params.product,{is_featured:form_data.is_featured});
                settings = await Setting.findOneAndUpdate({userId},{$set:{'notifications.notifyOnLogin':form_data.notifyOnLogin}},{new:true});
            }
            else if(form_data.hasOwnProperty('twofa_auth')){
                //await update_single_document(AppwriteServerConfig.products_collection_id,params.product,{is_featured:form_data.is_featured});
                settings = await Setting.findOneAndUpdate({userId},{$set:{'notifications.twofa_auth':form_data.twofa_auth}},{new:true});
            }
            else{
                return NextResponse.json({error:'Access denied for invalid request',message:'Access to request denied'},{status:403,statusText:'Forbidden'});
                //return new Response(null,{status:403,statusText:'Access to request denied as a result of an invalid request'})
            }
        }else{

            //const cloned_request1 = request.clone();
            //const cloned_request2 = request.clone();

            //const extract_data = await extract_body(cloned_request1);
            //const request_text = await cloned_request2.text();
            //log(request_text,'Request text in form data');
            //log(extract_data,'Request  body text in form data');

            

            let serve_data = await request.formData();
            let form_data = Object.fromEntries(serve_data);
            //log(form_data,'Form data value');
            //log(request.headers.get('content-type'),'Content type header');
            if(serve_data.get('emailNotifications'))
            settings = await Setting.findOneAndUpdate({userId},{$set:{'notifications.emailNotifications':serve_data.get('emailNotifications') == 'true'}},{new:true});
            else if(form_data.hasOwnProperty('smsNotifications')){
                //await update_single_document(AppwriteServerConfig.products_collection_id,params.product,{is_featured:form_data.is_featured});
                settings = await Setting.findOneAndUpdate({userId},{$set:{'notifications.smsNotifications':form_data.smsNotifications == 'true' }},{new:true});
            }else if(form_data.hasOwnProperty('notifyOnLogin')){
                //await update_single_document(AppwriteServerConfig.products_collection_id,params.product,{is_featured:form_data.is_featured});
                settings = await Setting.findOneAndUpdate({userId},{$set:{'notifications.notifyOnLogin':form_data.notifyOnLogin == 'true'}},{new:true});
            }
            else if(form_data.hasOwnProperty('twofa_auth')){
                //await update_single_document(AppwriteServerConfig.products_collection_id,params.product,{is_featured:form_data.is_featured});
                settings = await Setting.findOneAndUpdate({userId},{$set:{'notifications.twofa_auth':form_data.twofa_auth == 'true'}},{new:true});
            }
            else{
                return NextResponse.json({error:'Access denied for invalid request',message:'Access to request denied'},{status:403,statusText:'Forbidden'});
                //return new Response(null,{status:403,statusText:'Access to request denied as a result of an invalid request'})
            }

            /*form_data = await request.formData();
            if(form_data.get('is_archived')){
                //await update_single_document(AppwriteServerConfig.products_collection_id,params.product,{is_archived:form_data.get('is_archived')==='true'});
            }else if(form_data.get('is_featured')){
                //await update_single_document(AppwriteServerConfig.products_collection_id,params.product,{is_featured:form_data.get('is_featured')==='true'});
            }else{
                return new Response(null,{status:403,statusText:'Access to request denied as a result of an invalid request'})
            }
            const headers = {
                'Content-Type':'application/json'
            }*/
            
        }
        console.log("Settings data");
        console.log(settings);
        return NextResponse.json({data:{logged:true,settings}});
        //return Response.json({data:{logged:true,settings}});
        //return new Response(JSON.stringify({data:{logged:true}}),{headers,status:200});
        //return {data:{logged:true}};
        
        } catch (error) {  
          console.log(error);
          /*const headers = {
            'Location':(new URL(request.url)).origin+'/adm_priv/'+params.store+'/products'
           }*/
          return new Response(null,{status:500,statusText:'An error occured on the server'});
        }
      }
      return NextResponse.json({error:'Access denied for invalid request',message:'Access to request denied'},{status:403,statusText:'Forbidden'});
      //return new Response(null,{status:403,statusText:'Access to request denied as a result of an invalid request'})
    
}

