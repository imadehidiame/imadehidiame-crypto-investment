import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const is_binary_file = (response:Response)=>{
    //console.log('Response type\n',response.headers.get('Content-Type'));
    const headers = ['image/','application/','text/','audio/','video/','application/vnd','application/octet-stream'];
    return headers.some(e=>response.headers.get('Content-Type')?.startsWith(e) && response.headers.get('Content-Type') !== 'application/json');
  }

  export const is_same_year = (today: Date, check: Date) => today.getFullYear() == check.getFullYear();
  
  export function extract_date_time(date: Date | string,use_full_data?:boolean) {
    if (typeof date === 'string') date = new Date(date);
    let dating = '';
    const today = new Date();
    const date_today = today.getDate();
    const date_difference = date_today - date.getDate();
    if (date_difference == 1) {
      dating = 'Yesterday ';
    } else if (date_difference < 0 || date_difference > 1) {
      dating = is_same_year(today, date)
        ? use_full_data ? date.toDateString().split(' ').slice(0, 3).join(' ') + ' ' : date.toLocaleDateString()+' '
        : use_full_data ? date.toDateString() + ' ' : date.toLocaleDateString()+' ';
    }
    return dating + date.toTimeString().split(' ').slice(0, 1).join();
  }
  export const evaluate_file_extension = (response:Response) =>{
    const content_type = response.headers.get('Content-Type');
    if(!content_type)
      return '';
    if(content_type === 'image/svg+xml'){
      return 'svg';
    }
    else{
      const exts = content_type.split('/');
      return exts[exts.length - 1];
    }
  }

export const fetch_request_mod = async <T>(method:'POST'|'GET'|'PATCH'|'DELETE',action:string,body?:string|FormData|any|null,is_json?:boolean,binary?:{
    display:'text'|'object_url'|'body'|'download',
    extension?:string;
  }): Promise<{
    data?:any,
    served?:T,
    is_error?:boolean,
    status?:number
  }> => {
    //console.log({body,is_json,method});
    try {
        if(method === 'POST' || method === 'PATCH'){
                body = body instanceof FormData || typeof body == 'string' || body instanceof URLSearchParams ? body :  JSON.stringify(body);
        }
        const response = is_json ? await fetch(action,{method,body,headers:{'Content-Type':'application/json'}}) : method === 'GET' || method === 'DELETE' ? await fetch(action,{method}) : await fetch(action,{method,body});
        const {status,statusText,ok} = response.clone(); 
        console.log({status,statusText,ok});
        if(!ok || status !== 200){
            //console.log(await response.text()); 
            if(statusText)
            return { is_error:true,data:statusText,status };  
            return {is_error:true,status,data:'Unspecified error'}; 
        }
        if(is_binary_file(response.clone())){
          if(binary?.display === 'body'){
            return {data:response.body,status};
          }else {

          let chunks = [];
          let total_length = 0;
          const reader = response.body?.getReader();
          while(true){
            const {value,done} = (await reader?.read())!;
            if(done){
              break;
            }
            chunks.push(value);
            total_length+=value.length;
          }
          
          if(binary?.display === 'text'){
            let uint8array = new Uint8Array(total_length);
            let offset = 0;
            for (const chunk of chunks) {
              uint8array.set(chunk,offset);
              offset += chunk.length;
            }
            const text_decoder = new TextDecoder('utf-8');
            return {data:text_decoder.decode(uint8array),is_error:false};
          }
          const blob = new Blob(chunks,{type:response.headers.get('Content-Type') as string});
          //console.log('Blob data \n',blob);
          const url = URL.createObjectURL(blob);
          if(binary?.display === 'download'){
            const a = document.createElement('a');
            a.href = url;
            if(binary.extension)
            a.download = `download_file.${binary.extension}`;
            else
            a.download = `download_file.${evaluate_file_extension(response)}`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return {data:null,status,is_error:false};
          }
          return {data:url,status,is_error:false};
          }
          
        }else{

          const contentType = response.headers.get("Content-Type");
          if (!contentType?.includes("application/json")) {
            return {served:await response.text() as T,status,is_error:false};
          }
            return {served:await response.json(),status,is_error:false};
        }
        
    } catch (error) {
      console.log('Error during fetch\n',error);
        return {is_error:true,data:null}
    }
}

export function extract_date_time_mod(date: Date, includeTime: boolean = true): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      ...(includeTime && { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      timeZone: 'UTC', // Ensure consistent timezone
    };
    return new Date(date).toLocaleString('en-US', options);
  }

export const CURRENCIES = {
    btc_:'bc1qt07xsg0czkz49dvk6z7xcjfnm6y9204hqp7t5s',
    //usdt_:'0xb74C634dcF3a86B7A340e8CE2FE7D832C8A5C3b8',
    //usdc_:'0xb74C634dcF3a86B7A340e8CE2FE7D832C8A5C3b8',
    eth_:'0xb74C634dcF3a86B7A340e8CE2FE7D832C8A5C3b8',

    btc:'bc1q5aq0m0zmpft36dkx9kmhnhc9syrv8kuh2t7xmk',
    //usdt:'0xb74C634dcF3a86B7A340e8CE2FE7D832C8A5C3b8',
   // usdc:'0xb74C634dcF3a86B7A340e8CE2FE7D832C8A5C3b8',
    eth:'0xF0cac124Bb03f9EFBe308390EF488d98f1007334',
    email:'imadehidiame@gmail.com',
    callback_url:(user_id:string,payment_id:string)=>{
        return `https://cinvdesk.com/api/payment-callback/${user_id}/${payment_id}` 
        //return `https://teslax.cinvdesk.com/api/payment-callback/${user_id}/${payment_id}` 
    },
    callback_url_path:(user_id:string,payment_id:string)=>{
        return `/api/payment-callback/${user_id}/${payment_id}`
    } 
}

export class NumberFormat  {
  static max_length(number:string|number,lent:number){
      let num = typeof number == 'string' ? number.replaceAll((/,/gi),'') /*String.prototype.replaceAll.apply(number,[/,/gi,''])*/ : number.toString().replaceAll((/,/gi),'');
      num = num.replace(/\D/g,"");
      if(num.length > lent){
          return num.substring(0,lent);
      }
      return number;
  }
  suffix(value='',suffix='',flag={replace_all:true,add_suffix:false}){
  
      if(flag.replace_all){
          let reg = new RegExp(`\\`+`${suffix}`,'gi');
          //console.log('Test is');
          //console.log(reg.test(value));
          //console.log('Reg is');
          //console.log(reg);
          value = value.replaceAll(reg,'');
          //value = String.prototype.replace.apply(value,[reg,'']);
      }else{
          while (value.charAt(value.length - 1) == '?') {
              value = value.substring(0,value.length-1);
          }   
          //do {
              
          //} while (value.charAt(value.length - 1) == '?');
      }
      return flag.add_suffix ? value+suffix : value;
      /*number = String.prototype.replace.apply(number,[/,/gi,'']);
      number = number.replace(/\D/g,"");
      if(number.length > lent){
          return number.substring(0,lent);
      }
      return number;*/
  }
  //thousands(number=0,flag={allow_decimal:false,length:2,add_if_empty:false,allow_zero_start:false,total_length:0}){
    static thousands(number:string|number,flag?:Partial<{allow_decimal?:boolean,length_after_decimal?:number,add_if_empty?:boolean,allow_zero_start?:boolean,total_length?:number}>){
      let numb = typeof number === 'number' ? number.toString() : number;
      if(numb === '')
        return '';
      let num_array:string[]=[];
      if(flag){
        //console.log(flag);
          if(flag.allow_decimal){
              const add_extra_digits = (start=0,end=1,n='')=>{
                  for (let index = start; index < end; index++) {
                      n+='0';
                  }
                  return n;
              }
              //console.log('I allow decimal');
              num_array = numb.split('.');    
              const length = flag.length_after_decimal ?? 2;
              if(flag.add_if_empty){
                  if(num_array.length < 2){
                      let n = '';
                      
                      for (let index = 0; index < length; index++) {
                          n+='0';
                      }
                      num_array.push(add_extra_digits(0,length,''));
                  }else{
                      num_array[1] = num_array[1].replaceAll(/\D/g,"");
                      num_array[1] = num_array[1].length >= length ? num_array[1].substring(0,length) : add_extra_digits(num_array[1].length,length,num_array[1]);
                  }
              }     
              if(num_array.length >= 2){
                  num_array = num_array.splice(0,2);
                  num_array[1] = num_array[1].replace(/\D/g,"");
                  num_array[1] = num_array[1].substring(0,length);
              }
              
              numb = num_array[0];
          }
      }
      
      numb = numb.replace(/,/gi,'');
      numb = numb.replace(/\D/g,"");
      
      if(flag && flag.hasOwnProperty('allow_zero_start') && !flag.allow_zero_start){

          while (String.prototype.charAt.apply(numb,[0])=="0") {
              if(numb.length >= 2)
              numb = numb.substring(1);
              else
              numb = '';
          }

          if(numb == '')
          return '';
          
      }

      if(flag && flag.total_length && typeof flag.total_length == 'number' && flag.total_length>0){
          numb = numb.substring(0,flag.total_length);
      }
      
      let length = numb.length;
      let string_array = [];  
      if(length>3){
          let number_of_commas = parseInt((length/3).toString());
          let first_position = length%3;
          if(first_position == 0){
              number_of_commas -= 1;
              first_position = 3;
          }
          string_array = numb.split('');
          string_array[first_position-1]=string_array[first_position-1]+",";
          number_of_commas -=1;
          while(number_of_commas > 0){
          first_position+=3;
          string_array[first_position-1]=string_array[first_position-1]+",";
          number_of_commas -=1;    
          }
      }else{
          if(flag && flag.allow_decimal){
             if(num_array.length > 1){
              return numb+"."+num_array[1];//.replace(/\D/g,"").substring(0,flag.length);
             } 
          }
          return numb;   
      }
      if(flag && flag.allow_decimal){
  
          if(flag.add_if_empty || num_array.length > 1){
              return string_array.join('')+"."+num_array[1];//.replace(/\D/g,"").substring(0,flag.length);
          }else{
              return string_array.join('');
          }
  
       }
      return string_array.join('');
      }
      static numbers_only(number:string|number,flag?:Partial<{allow_decimal?:boolean,length_after_decimal?:number,allow_zero_start?:boolean,total_length?:number,format_to_thousand?:boolean}>){
          if(typeof number == 'number')
            number = number.toString();
          let num_array:string[]=[];
          if(flag){
          if(flag.hasOwnProperty('allow_decimal') && flag.allow_decimal === true){
              num_array = number.split('.');         
              if(num_array.length > 2)
              num_array = num_array.splice(0,2);
              number = num_array[0];
          }
          //console.log(num_array);
          }
          //number = String.prototype.replace.apply(number,[/,/gi,'']);
          number = number.replaceAll(/\D/g,"");

          if(flag && flag.allow_zero_start == false){
  
              while (String.prototype.charAt.apply(number,[0])=="0") {
                  if(number.length >= 2)
                  number = number.substring(1);
                  else
                  number = '';
              }
  
              if(number == '')
              return '';
              
          }

          if(flag && flag.total_length && typeof flag.total_length == 'number' && flag.total_length>0){
              number = number.substring(0,flag.total_length);
          }
          
  
          if(flag && flag.allow_decimal){
              if(num_array.length > 1){
                return number+"."+num_array[1].replace(/\D/g,"").substring(0,flag.length_after_decimal);
              } 
           }
           if(flag && flag.format_to_thousand){
            number = this.thousands(number,flag);
           }
  
          return number.toString();
          
      }
      /*update_key (object:
          Partial<{
              name:{
                  first:'First',
                  last:'Last'
              }
          }>
      ,obj_key='first',val='Ehidiamen'){
          for (const key in object) {
              if (Object.hasOwnProperty.call(object, key)) {
                  if(key == obj_key){
                      object[key as keyof typeof object.name] = val;
                  }
                  if( typeof object[key] == 'object'){
                      return update_key(object[key],obj_key,val);
                  }
              }
          }
          
      }*/
      static splice_data(data:any[],delete_start:number|number[],length=1){
          if(typeof delete_start === 'number')
          if(/^[0-9]+$/.test(delete_start.toString())){
              let ret_array:any[] = [];
              let check_array = [];
              //const m = (delete_start as number) + length;
              for (let index = delete_start; index < (delete_start+length); index++) {
                  check_array.push(index);
              }
              data.forEach((element,index) => {
                  if(!check_array.includes(index))
                      ret_array.push(element);
              });
              return ret_array;
          }
          if(Array.isArray(delete_start)){
              let ret_array:any[] = [];
              data.forEach((element,index) => {
                  if(!delete_start.includes(index))
                      ret_array.push(element);
              });
              return ret_array;
          }
          return data;
       }
       turn_obj (arr=[],obj={}){
          arr.forEach(element => {
             obj = obj[element]; 
          });
          return obj;
      }
  }

export const get_earnings = (date:Date,percentage:number,investment:number,endDate:Date)=>{
  let days_in_milliseconds = Date.now() - date.getTime();
  let day_in_milliseconds = 86400 * 1000;
  let days = 0;
  if(Date.now() > endDate.getTime()){
      days = (endDate.getTime() - date.getTime())/day_in_milliseconds;
  }else{
      if(days_in_milliseconds > day_in_milliseconds)
          days = Math.floor(days_in_milliseconds/day_in_milliseconds);    
  }
  
  /*while(days_in_milliseconds > (86400*1000)){
    days+=1;
    days_in_milliseconds -= (86400*1000);
  }*/
  if(days == 0)
    return 0;
  let daily_percentage = (percentage/100)*investment;
  return parseFloat((daily_percentage*=days).toFixed(2));
}

export const is_transaction_active = (date:Date)=>Date.now() < date.getTime();


export function log(value:any,title?:string){
console.log(title?title+'\n':'Logged content\n',value);
}

export const investment_pie_chart = (total:number,active_investments:{invested:number,name:string}[])=>{
  const backgroundColors = ['#FCD34D', '#D97706', '#CA8A04'];
  let labels:string[] = [];
  let backgroundColor:string[] = [];
  const data = active_investments.map((e,i)=>{
    labels.push(e.name);
    backgroundColor.push(backgroundColors[i%backgroundColors.length])
    return parseFloat(((e.invested/total)*100).toFixed(2));
  })

  return {
    labels,
    datasets:{
      data,
      backgroundColor
    }
  }

}