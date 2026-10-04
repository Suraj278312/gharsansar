export type Product = {id:string;slug:string;name:string;brand:string;category:string;description:string;price:number;mrp:number;discount:number;images:string[];rating:number;reviewCount:number;stock:number;variants:string[];specifications:Record<string,string>};
export const categories=['Kitchen & Dining','Water Bottles','Storage & Containers','Cleaning Supplies','Home Utility','Plastic Products','Bathroom Essentials','Lunch Boxes','Thermoware','Daily Essentials'];
export const categorySlug=(s:string)=>s.toLowerCase().replace(/ & /g,'-').replace(/ /g,'-');
const groups=[
 ['Water Bottles','Milton','bottle',['Stainless Steel Water Bottle','Insulated Water Bottle','Everyday Water Bottle','Kids School Bottle'],['500 ml','750 ml'],349,'Stainless steel'],
 ['Lunch Boxes','Milton','lunch',['Insulated Lunch Box','Three Container Lunch Set','Compact Tiffin Box','Office Lunch Set'],['Small','Large'],499,'Food-grade plastic'],
 ['Storage & Containers','Boss','storage',['Airtight Storage Container','Kitchen Storage Jar Set','Multipurpose Storage Box','Stackable Pantry Container'],['1 L','2 L'],179,'Food-grade plastic'],
 ['Thermoware','Milton','casserole',['Insulated Casserole','Hot Meal Casserole','Family Casserole','Everyday Hot Pot'],['1 L','1.5 L'],599,'Insulated plastic / steel'],
 ['Kitchen & Dining','Milton','jar',['Kitchen Jar Set','Dry Fruit Container','Serving Container','Pantry Storage Set'],['Set of 2','Set of 3'],249,'Food-grade plastic'],
 ['Plastic Products','Boss','bucket',['Plastic Bucket','Household Water Bucket','Utility Bucket','Everyday Bath Bucket'],['10 L','16 L'],199,'Plastic'],
 ['Cleaning Supplies','Boss','cleaning',['Dustpan & Brush Set','Floor Cleaning Brush','Household Cleaning Set','Utility Scrub Brush'],['Standard','Large'],129,'Plastic / synthetic bristles'],
 ['Bathroom Essentials','Boss','bathroom',['Bathroom Mug','Bath Utility Set','Bathroom Storage Caddy','Multipurpose Bath Mug'],['Standard','Large'],79,'Plastic'],
 ['Home Utility','Boss','organizer',['Home Storage Organizer','Utility Storage Basket','Household Organizer','Multipurpose Basket'],['Medium','Large'],229,'Plastic'],
 ['Daily Essentials','Boss','dustbin',['Swing Lid Dustbin','Compact Waste Bin','Household Dustbin','Everyday Waste Basket'],['5 L','10 L'],249,'Plastic']
] as const;
const secondaryMap: Record<string, string> = {
  bottle: '/images/hero.jpg',
  lunch: '/images/jar.jpg',
  storage: '/images/organizer.jpg',
  casserole: '/images/lunch.jpg',
  jar: '/images/storage.jpg',
  bucket: '/images/bathroom.jpg',
  cleaning: '/images/dustbin.jpg',
  bathroom: '/images/bucket.jpg',
  organizer: '/images/storage.jpg',
  dustbin: '/images/cleaning.jpg'
};
export const products:Product[]=groups.flatMap((g,gi)=>g[3].flatMap((name,ni)=>g[4].map((size,si)=>{const i=gi*8+ni*2+si;const price=g[5]+ni*40+si*90;const mrp=Math.ceil(price*1.24/10)*10;const full=`${name} — ${size}`;return {id:`gs-${i+1}`,slug:`${g[1].toLowerCase()}-${categorySlug(name)}-${categorySlug(size)}`,name:full,brand:g[1],category:g[0],description:`A practical ${name.toLowerCase()} for an organised, everyday home. Choose the size that fits your routine. This is a sample catalog item; imagery, specifications and prices are illustrative.`,price,mrp,discount:Math.round((mrp-price)/mrp*100),images:[`/images/${g[2]}.jpg`,secondaryMap[g[2]]||'/images/hero.jpg'],rating:Math.round((4.1+(i%8)/10)*10)/10,reviewCount:18+i*3,stock:i%19===18?0:8+i%12,variants:['Original','Alternate colour'],specifications:{Material:g[6],Capacity:size,Dimensions:'Confirm with store',Care:'Wash gently. Follow the actual product label.',Origin:'Confirm with store'}}}))) ;
export const findProduct=(id:string)=>products.find(p=>p.id===id||p.slug===id);
export const categoryImage=(cat:string)=>products.find(p=>p.category===cat)?.images[0]||'/images/storage.jpg';
