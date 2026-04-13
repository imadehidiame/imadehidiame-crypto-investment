import 'server-only';

type APP_TYPE = 'manual'|'auto'

export const APPLICATION_TYPE:APP_TYPE = 'manual';

export interface IPlans {
    name:string;
    min:number;
    max:number;
    durationFlag:'Days'|'Hours';
    duration:number;
    packages?:string[];
}

export const Plans:IPlans[] = [
    {
        name:'Basic',
        duration:24,
        durationFlag:'Hours',
        min:500,
        max:4999,
        packages:['Referral Bonus','Mutiple Accounts Allowed','24/7 Customer Care'],
    },
    {
        name:'Silver',
        duration:72,
        durationFlag:'Hours',
        min:5000,
        max:9999,
        packages:['Referral Bonus','Mutiple Accounts Allowed','24/7 Customer Care'],
    },
    {
        name:'Gold',
        duration:7,
        durationFlag:'Days',
        min:10000,
        max:49999,
        packages:['Referral Bonus','Mutiple Accounts Allowed','24/7 Customer Care'],
    },
    {
        name:'Platinum',
        duration:14,
        durationFlag:'Days',
        min:50000,
        max:100000,
        packages:['Referral Bonus','Mutiple Accounts Allowed','24/7 Customer Care'],
    }
]