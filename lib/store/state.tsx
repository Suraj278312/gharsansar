'use client';
import React,{createContext,useContext,useEffect,useState} from 'react';
import {findProduct} from './catalog';
import {toast} from 'sonner';
export type CartLine={id:string;variant:string;qty:number};
export type Address={name:string;email?:string;phone:string;house:string;street:string;landmark:string;city:string;state:string;pin:string};
export type Order={id:string;date:string;items:CartLine[];total:number;address:Address;method:string;status:number};
export type User={name:string;email:string;phone:string};
type Data={remember:boolean;cart:CartLine[];wishlist:string[];orders:Order[];user:User|null;addresses:Address[];recent:string[]};
const initial:Data={remember:true,cart:[],wishlist:[],orders:[],user:null,addresses:[],recent:[]};
const Context=createContext<any>(null);
export function StoreProvider({children}:{children:React.ReactNode}){
  const [data,setData]=useState<Data>(initial);
  const [ready,setReady]=useState(false);
  const [cartOpen,setCartOpen]=useState(false);

  useEffect(()=>{
    try{
      const saved=localStorage.getItem('ghar-sansar-demo-v1');
      if(saved)setData({...initial,...JSON.parse(saved)});
    }catch{
      toast.error('Saved demo data could not be loaded.');
    }
    setReady(true);
  },[]);

  useEffect(()=>{
    if(ready)try{
      localStorage.setItem('ghar-sansar-demo-v1',JSON.stringify({...data,user:data.remember?data.user:null}));
    }catch{
      toast.error('Browser storage is unavailable. Changes may not be saved.');
    }
  },[data,ready]);

  const update=(patch:Partial<Data>)=>setData(prev=>({...prev,...patch}));
  const add=(id:string,variant='Original',qty=1)=>{
    const p=findProduct(id);
    if(!p||p.stock<qty||qty<1)return false;
    setData(prev=>{
      const old=prev.cart.find(x=>x.id===id&&x.variant===variant);
      return {...prev,cart:old?prev.cart.map(x=>x===old?{...x,qty:Math.min(p.stock,x.qty+qty)}:x):[...prev.cart,{id,variant,qty}]};
    });
    toast.success('Added to cart');
    return true;
  };
  const toggleWish=(id:string)=>setData(prev=>({...prev,wishlist:prev.wishlist.includes(id)?prev.wishlist.filter(x=>x!==id):[...prev.wishlist,id]}));
  return <Context.Provider value={{...data,ready,update,setData,add,toggleWish,cartOpen,setCartOpen,openCart:()=>setCartOpen(true),closeCart:()=>setCartOpen(false)}}>{children}</Context.Provider>;
}
export const useStore=()=>useContext(Context);
// Demo account adapter. Stores salted password hashes, never plaintext passwords.
export const demoAuth={async digest(password:string,salt:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+password));return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('')},async register(user:User,password:string){const users=JSON.parse(localStorage.getItem('gs-demo-accounts')||'[]');if(users.some((u:any)=>u.email===user.email.toLowerCase()||u.phone===user.phone))throw new Error('An account with these details already exists in this browser.');const salt=crypto.randomUUID();users.push({...user,email:user.email.toLowerCase(),salt,hash:await this.digest(password,salt)});localStorage.setItem('gs-demo-accounts',JSON.stringify(users));return user},async login(identity:string,password:string){const users=JSON.parse(localStorage.getItem('gs-demo-accounts')||'[]');const u=users.find((x:any)=>x.email===identity.toLowerCase()||x.phone===identity);if(!u||u.hash!==await this.digest(password,u.salt))throw new Error('Email / phone or password does not match.');return {name:u.name,email:u.email,phone:u.phone}},async reset(identity:string,password:string){const users=JSON.parse(localStorage.getItem('gs-demo-accounts')||'[]');const u=users.find((x:any)=>x.email===identity.toLowerCase()||x.phone===identity);if(!u)throw new Error('No demo account found in this browser.');u.salt=crypto.randomUUID();u.hash=await this.digest(password,u.salt);localStorage.setItem('gs-demo-accounts',JSON.stringify(users))}};
