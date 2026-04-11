export interface IInvestment {
    _id:string;
    plan:string;
    duration:number;
    durationFlag:string;
    eth?:string;
    btc?:string;
    amount:number;
    isWithdrawalPaid:boolean;
    withdrawalCode:string;
    investmentDate:Date;
    maxUpgrade?:number;
    isActive:boolean;
}

export interface IInvestmentAdmin {
    _id:string;
    plan:string;
    duration:number;
    durationFlag:string;
    eth?:string;
    btc?:string;
    amount:number;
    isWithdrawalPaid:boolean;
    withdrawalCode:string;
    investmentDate:Date;
    maxUpgrade?:number;
    isActive:boolean;
    customer:string;
    email:string;
}

/**
 I want a section on the admin that captures users investment information. I want a button that is used to confirm deposit that only shows when isActive is false. A button that is used to add profits to investment thats only visible for active transactions. A button to confirm if the account upgrade fee has been paid, only visible after transaction period has elasped and another button to confirm if withdrawalCode has been received used
 */