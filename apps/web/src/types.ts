export type MenuItem = {_id:string; name:string; description:string; price:number; category:string; imageUrl?:string; isAvailable:boolean};
export type Restaurant = {_id:string; name:string; description:string; cuisine:string[]; deliveryTime:string; deliveryFee:number; rating:number; imageUrl:string; isOpen:boolean; menu:MenuItem[]};
export type CartLine = {item:MenuItem; quantity:number};
export type User = {id:string; name:string; email:string; role:'customer'|'admin'};
