'use client';
import React,{useState,useEffect,useMemo,useRef} from 'react';
function Link(props:React.AnchorHTMLAttributes<HTMLAnchorElement>){return <a {...props}/>}
import {usePathname,useRouter,useSearchParams} from 'next/navigation';
import {Search,ShoppingBag,UserRound,Heart,Menu,MapPin,Truck,ShieldCheck,Headphones,PackageCheck,Plus,Minus,X,SlidersHorizontal,Star,Check,ChevronRight,Home,Grid2X2,LogOut,Package,Clock,Leaf} from 'lucide-react';
import {Toaster,toast} from 'sonner';
import {useStoreMotion} from './use-store-motion';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {Skeleton} from '@/components/ui/skeleton';
import {Empty,EmptyHeader,EmptyTitle,EmptyDescription} from '@/components/ui/empty';
import {products,categories,categorySlug,categoryImage,findProduct,Product} from '@/lib/store/catalog';
import {calculateTotals,deliveryAvailable,money,checkoutConfig} from '@/lib/store/config';
import {StoreProvider,useStore,demoAuth,Address,CartLine,Order} from '@/lib/store/state';
const statuses=['Placed','Confirmed','Packed','Out for Delivery','Delivered'];
const defaultAddress:Address={name:'',phone:'',house:'',street:'',landmark:'',city:'Bhuj',state:'Gujarat',pin:''};
function Choose({value,onChange,options,label}:{value:string;onChange:(v:string)=>void;options:string[];label:string}){return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label}><SelectValue/></SelectTrigger><SelectContent>{options.map(x=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select>}
function Blank({title,copy}:{title:string;copy:string}){return <Empty className="blank"><EmptyHeader><ShoppingBag/><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{copy}</EmptyDescription></EmptyHeader><Link className="btn" href="/shop">Continue shopping</Link></Empty>}
function Quantity({value,onChange,max=99}:{value:number;onChange:(n:number)=>void;max?:number}){return <div className="quantity"><button aria-label="Decrease quantity" disabled={value<=1} onClick={()=>onChange(value-1)}><Minus size={14}/></button><span>{value}</span><button aria-label="Increase quantity" disabled={value>=max} onClick={()=>onChange(value+1)}><Plus size={14}/></button></div>}

function useMagnetic(strength=0.22){
  const ref=useRef<any>(null);
  const onMouseMove=(e:React.MouseEvent<HTMLElement>)=>{
    if(!ref.current)return;
    const rect=ref.current.getBoundingClientRect();
    const x=(e.clientX-rect.left-rect.width/2)*strength;
    const y=(e.clientY-rect.top-rect.height/2)*strength;
    ref.current.style.transform=`translate(${x}px, ${y}px)`;
  };
  const onMouseLeave=()=>{
    if(!ref.current)return;
    ref.current.style.transform='translate(0px, 0px)';
  };
  return {ref,onMouseMove,onMouseLeave};
}
function MagneticButton({children,className="",onClick,disabled,type, ...props}:any){
  const {ref,onMouseMove,onMouseLeave}=useMagnetic(0.22);
  return <button ref={ref} type={type} className={`magnetic-interactive ${className}`} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} onClick={onClick} disabled={disabled} {...props}>{children}</button>;
}
function MagneticLink({children,className="",href,...props}:any){
  const {ref,onMouseMove,onMouseLeave}=useMagnetic(0.22);
  return <Link ref={ref} className={`magnetic-interactive ${className}`} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} href={href} {...props}>{children}</Link>;
}

function RollingPrice({amount,className=""}:{amount:number;className?:string}){
  const [val,setVal]=useState(amount);
  const prev=useRef(amount);
  useEffect(()=>{
    if(prev.current===amount)return;
    const start=prev.current;
    const end=amount;
    const startTime=performance.now();
    const duration=360;
    let frameId:number;
    const step=(now:number)=>{
      const progress=Math.min(1,(now-startTime)/duration);
      const ease=1-Math.pow(1-progress,3);
      setVal(Math.round(start+(end-start)*ease));
      if(progress<1){
        frameId=requestAnimationFrame(step);
      }else{
        prev.current=end;
      }
    };
    frameId=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(frameId);
  },[amount]);
  return <span className={`rolling-price ${className}`}>{money(val)}</span>;
}

function triggerFlyToCart(e:React.MouseEvent,img?:string){
  if(typeof window==='undefined')return;
  const rect=(e.currentTarget as HTMLElement).getBoundingClientRect();
  const x=e.clientX||(rect.left+rect.width/2);
  const y=e.clientY||(rect.top+rect.height/2);
  window.dispatchEvent(new CustomEvent('fly-to-cart',{detail:{x,y,img}}));
}

function FlyingCartLayer(){
  const [particles,setParticles]=useState<{id:number;startX:number;startY:number;targetX:number;targetY:number;img?:string}[]>([]);
  useEffect(()=>{
    const handler=(e:any)=>{
      const bagEl=document.querySelector('.bag')||document.querySelector('.header-actions');
      let targetX=window.innerWidth-80;
      let targetY=50;
      if(bagEl){
        const rect=bagEl.getBoundingClientRect();
        targetX=rect.left+rect.width/2;
        targetY=rect.top+rect.height/2;
      }
      const id=Date.now()+Math.random();
      setParticles(prev=>[...prev,{id,startX:e.detail.x,startY:e.detail.y,targetX,targetY,img:e.detail.img}]);
      setTimeout(()=>{
        const bag=document.querySelector('.bag');
        if(bag){
          bag.classList.remove('bag-wobble');
          void (bag as HTMLElement).offsetWidth;
          bag.classList.add('bag-wobble');
        }
      },650);
      setTimeout(()=>{
        setParticles(prev=>prev.filter(p=>p.id!==id));
      },900);
    };
    window.addEventListener('fly-to-cart' as any,handler);
    return()=>window.removeEventListener('fly-to-cart' as any,handler);
  },[]);
  return <div className="flying-cart-layer" aria-hidden="true">{particles.map(p=><div key={p.id} className="flying-cart-particle" style={{'--start-x':`${p.startX}px`,'--start-y':`${p.startY}px`,'--target-x':`${p.targetX}px`,'--target-y':`${p.targetY}px`} as React.CSSProperties}>{p.img?<img src={p.img} alt="" className="flying-particle-img"/>:<div className="flying-particle-dot"/>}</div>)}</div>;
}

function WishlistButton({productId,productName}:{productId:string;productName:string}){
  const s=useStore();
  const [bursting,setBursting]=useState(false);
  const isSelected=s.wishlist.includes(productId);
  const handleClick=(e:React.MouseEvent<HTMLButtonElement>)=>{
    if(!isSelected){
      setBursting(true);
      setTimeout(()=>setBursting(false),700);
    }
    s.toggleWish(productId);
  };
  return <button className={`wish icon ${isSelected?'selected':''} ${bursting?'bursting':''}`} aria-label={(isSelected?'Remove from':'Add to')+' wishlist: '+productName} onClick={handleClick}><Heart size={18} fill={isSelected?'currentColor':'none'} className="wish-heart-icon"/>{bursting&&<span className="sparkle-burst-wrap" aria-hidden="true">{[0,60,120,180,240,300].map((deg,i)=><span key={i} className={`sparkle-dot sparkle-${i%2===0?'emerald':'gold'}`} style={{'--angle':`${deg}deg`,'--dist':`${20+(i%3)*6}px`,'--delay':`${i*30}ms`} as React.CSSProperties}/>)}</span>}</button>;
}

function CursorFollower(){
  const followerRef=useRef<HTMLDivElement>(null);
  const [text,setText]=useState('');
  const [visible,setVisible]=useState(false);

  useEffect(()=>{
    let targetX=-100;
    let targetY=-100;
    let currentX=-100;
    let currentY=-100;
    let lastX=-100;
    let rafId:number;

    const onPointerMove=(e:PointerEvent)=>{
      targetX=e.clientX;
      targetY=e.clientY;

      let el=e.target as HTMLElement|null;
      let label:string|null=null;
      while(el&&el!==document.body){
        if(el.getAttribute&&el.getAttribute('data-cursor-pill')){
          label=el.getAttribute('data-cursor-pill');
          break;
        }
        el=el.parentElement;
      }
      if(label){
        setText(label);
        setVisible(true);
      }else{
        setVisible(false);
      }
    };

    const loop=()=>{
      const dx=targetX-currentX;
      currentX+=(targetX-currentX)*0.22;
      currentY+=(targetY-currentY)*0.22;
      const speed=currentX-lastX;
      lastX=currentX;
      const tilt=Math.max(-14,Math.min(14,speed*1.8));

      if(followerRef.current){
        followerRef.current.style.transform=`translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      }
      rafId=requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove',onPointerMove,{passive:true});
    rafId=requestAnimationFrame(loop);

    return()=>{
      window.removeEventListener('pointermove',onPointerMove);
      cancelAnimationFrame(rafId);
    };
  },[]);

  return (
    <div
      ref={followerRef}
      className={`cursor-follower-pill ${visible?'is-visible':''}`}
      aria-hidden="true"
    >
      <span>{text}</span>
    </div>
  );
}

function ProductCard({product:p}:{product:Product}){
  const s=useStore();
  const added=s.cart.some((x:CartLine)=>x.id===p.id);
  const cardRef=useRef<HTMLElement>(null);

  const handleMouseMove=(e:React.MouseEvent<HTMLElement>)=>{
    if(!cardRef.current)return;
    const rect=cardRef.current.getBoundingClientRect();
    const x=(e.clientX-rect.left)/rect.width-0.5;
    const y=(e.clientY-rect.top)/rect.height-0.5;
    cardRef.current.style.setProperty('--card-tilt-x',`${-y*9}deg`);
    cardRef.current.style.setProperty('--card-tilt-y',`${x*9}deg`);
    cardRef.current.style.setProperty('--card-glare-x',`${(x+0.5)*100}%`);
    cardRef.current.style.setProperty('--card-glare-y',`${(y+0.5)*100}%`);
    cardRef.current.style.setProperty('--card-glare-opacity','0.7');
  };

  const handleMouseLeave=()=>{
    if(!cardRef.current)return;
    cardRef.current.style.setProperty('--card-tilt-x','0deg');
    cardRef.current.style.setProperty('--card-tilt-y','0deg');
    cardRef.current.style.setProperty('--card-glare-opacity','0');
  };

  return (
    <article
      ref={cardRef}
      className="product-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="product-image">
        <Link href={'/product/'+p.slug} data-cursor-pill="Quick View">
          <div className="product-image-swap">
            <img src={p.images[0]} alt={p.name+' — illustrative product photo'} className="product-img-primary" loading="lazy" width="450" height="450"/>
            {p.images[1]&&<img src={p.images[1]} alt={p.name+' — alternate angle'} className="product-img-secondary" loading="lazy" width="450" height="450"/>}
            <div className="product-card-glare" aria-hidden="true"/>
          </div>
        </Link>
        <span className="discount">{p.discount}% OFF</span>
        <WishlistButton productId={p.id} productName={p.name}/>
      </div>
      <div className="product-content">
        <span className="eyebrow">{p.brand}</span>
        <Link className="product-name" href={'/product/'+p.slug}>{p.name}</Link>
        <span className="rating"><Star size={12} fill="currentColor"/>{p.rating.toFixed(1)} <span>({p.reviewCount} sample ratings)</span></span>
        <div className="price"><strong><RollingPrice amount={p.price}/></strong><del>{money(p.mrp)}</del></div>
        {added?<Link href="/cart" className="card-add added"><Check size={16}/>Go to cart</Link>:<button className="card-add" disabled={!p.stock} onClick={(e)=>{triggerFlyToCart(e,p.images[0]);s.add(p.id)}}>{p.stock?<><Plus size={16}/>Add to cart</>:'Out of stock'}</button>}
      </div>
    </article>
  );
}

function ProductGrid({items}:{items:Product[]}){return <div className="product-grid">{items.map(p=><ProductCard key={p.id} product={p}/>)}</div>}
function Section({title,kicker,items,href='/shop'}:{title:string;kicker:string;items:Product[];href?:string}){return <section className="section wrap reveal"><div className="section-heading"><div><span className="eyebrow">{kicker}</span><h2>{title}</h2></div><Link className="text-link" href={href}>View all products</Link></div><ProductGrid items={items}/></section>}
function SearchOverlay({open,onClose}:{open:boolean;onClose:()=>void}){const s=useStore();const router=useRouter();const [q,setQ]=useState('');const result=products.filter(p=>q.toLowerCase().split(/\s+/).every(w=>(p.name+' '+p.brand+' '+p.category).toLowerCase().includes(w))).slice(0,5);const search=(v:string)=>{s.update({recent:[v,...s.recent.filter((x:string)=>x!==v)].slice(0,5)});router.push('/shop?q='+encodeURIComponent(v));onClose()};return <Dialog open={open} onOpenChange={v=>!v&&onClose()}><DialogContent className="search-dialog"><DialogTitle>Find something for your home</DialogTitle><DialogDescription>Search products, brands and categories.</DialogDescription><form className="search-field" onSubmit={e=>{e.preventDefault();search(q)}}><Search/><input aria-label="Search products" placeholder="Try ‘Milton bottle’" value={q} onChange={e=>setQ(e.target.value)} autoFocus/><button className="btn" type="submit">Search</button></form>{!q?<><h4>Popular searches</h4><div className="chips">{['Milton Bottle','Lunch Box','Storage','Thermoware','Boss'].map(v=><button key={v} onClick={()=>search(v)}>{v}</button>)}</div>{s.recent.length>0&&<><h4>Recent searches</h4><div className="chips">{s.recent.map((v:string)=><button key={v} onClick={()=>search(v)}><Clock size={14}/>{v}</button>)}</div></>}</>:<div className="search-results">{result.length?result.map(p=><Link href={'/product/'+p.slug} onClick={onClose} key={p.id}><img src={p.images[0]} alt=""/><span>{p.brand}<strong>{p.name}</strong></span><b>{money(p.price)}</b></Link>):<p>No matches. Try a category or a shorter search.</p>}<button className="text-link" onClick={()=>search(q)}>See all results</button></div>}</DialogContent></Dialog>}
function AnnouncementMarquee(){const messages=['DELIVERING ACROSS BHUJ','FREE LOCAL DEMO DELIVERY ON ORDERS ₹799+','AUTHENTIC MILTON & BOSS ESSENTIALS','THOUGHTFUL HOUSEHOLD & KITCHEN UTILITIES','YOUR NEIGHBOURHOOD STORE · NOW ONLINE'];return <div className="announcement-marquee" role="region" aria-label="Store Announcements"><div className="marquee-track"><div className="marquee-content">{messages.map((text,i)=><span key={i} className="marquee-item"><span>{text}</span><span className="marquee-separator">✦</span></span>)}</div><div className="marquee-content" aria-hidden="true">{messages.map((text,i)=><span key={'dup-'+i} className="marquee-item"><span>{text}</span><span className="marquee-separator">✦</span></span>)}</div></div></div>}
function ArtisanStamp(){return <div className="hero-stamp-wrapper" aria-hidden="true"><div className="hero-stamp"><svg viewBox="0 0 160 160" className="hero-stamp-svg"><path id="stampPath" d="M 80, 80 m -50, 0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0" fill="none"/><text className="hero-stamp-text"><textPath href="#stampPath" startOffset="0%">GHAR SANSAR • BHUJ HOUSEHOLD • EST. 2026 • </textPath></text></svg><div className="hero-stamp-badge"><Leaf size={18} className="hero-stamp-leaf"/></div></div></div>}
function HeroPhoto(){const containerRef=useRef<HTMLDivElement>(null);const handleMouseMove=(e:React.MouseEvent<HTMLDivElement>)=>{if(!containerRef.current)return;const rect=containerRef.current.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width-0.5;const y=(e.clientY-rect.top)/rect.height-0.5;containerRef.current.style.setProperty('--mouse-tilt-x',`${-y*7}deg`);containerRef.current.style.setProperty('--mouse-tilt-y',`${x*7}deg`);containerRef.current.style.setProperty('--glare-x',`${(x+0.5)*100}%`);containerRef.current.style.setProperty('--glare-y',`${(y+0.5)*100}%`)};const handleMouseLeave=()=>{if(!containerRef.current)return;containerRef.current.style.setProperty('--mouse-tilt-x','0deg');containerRef.current.style.setProperty('--mouse-tilt-y','0deg')};return <div ref={containerRef} className="hero-photo" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}><div className="hero-photo-glare"/><img src="/images/hero.jpg" alt="A considered arrangement of kitchen jars and everyday pantry essentials" fetchPriority="high"/><ArtisanStamp/><span className="photo-credit">GOOD THINGS. SIMPLE LIVING.</span></div>}
function MiniCartDrawer(){
  const s=useStore();
  const lines:CartLine[]=s.cart;
  const totals=calculateTotals(lines.map(l=>({...findProduct(l.id)!,qty:l.qty})));
  const change=(l:CartLine,qty:number)=>s.update({cart:s.cart.map((x:CartLine)=>x.id===l.id&&x.variant===l.variant?{...x,qty}:x)});
  const remove=(l:CartLine)=>s.update({cart:s.cart.filter((x:CartLine)=>!(x.id===l.id&&x.variant===l.variant))});

  const freeThreshold=799;
  const neededForFree=Math.max(0,freeThreshold-totals.subtotal);
  const freeProgress=Math.min(100,Math.round((totals.subtotal/freeThreshold)*100));

  useEffect(()=>{
    const handleKeyDown=(e:KeyboardEvent)=>{
      if(e.key==='Escape'&&s.cartOpen)s.closeCart();
    };
    window.addEventListener('keydown',handleKeyDown);
    return()=>window.removeEventListener('keydown',handleKeyDown);
  },[s.cartOpen]);

  return (
    <div className={`mini-cart-root ${s.cartOpen?'is-open':''}`} aria-hidden={!s.cartOpen}>
      <div className="mini-cart-backdrop" onClick={s.closeCart}/>
      <aside className="mini-cart-drawer" role="dialog" aria-label="Shopping Bag">
        <div className="mini-cart-header">
          <div>
            <span className="eyebrow">YOUR SHOPPING BAG</span>
            <h2>Cart ({lines.reduce((a,b)=>a+b.qty,0)})</h2>
          </div>
          <button className="icon mini-cart-close" aria-label="Close cart" onClick={s.closeCart}>
            <X size={20}/>
          </button>
        </div>

        <div className="mini-cart-free-meter">
          <div className="meter-label">
            <Truck size={16}/>
            <span>{neededForFree===0?'🎉 You have unlocked FREE Bhuj Delivery!':`Add ₹${neededForFree} more for FREE Bhuj delivery`}</span>
          </div>
          <div className="meter-track">
            <div className={`meter-fill ${neededForFree===0?'is-unlocked':''}`} style={{width:`${freeProgress}%`}}/>
          </div>
        </div>

        <div className="mini-cart-body">
          {!lines.length?(
            <div className="mini-cart-blank">
              <ShoppingBag size={42}/>
              <h3>Your bag is waiting.</h3>
              <p>Add kitchen, storage, or cleaning essentials for your home.</p>
              <button className="btn" onClick={s.closeCart}>Start shopping</button>
            </div>
          ):(
            <div className="mini-cart-list">
              {lines.map((l,idx)=>{
                const p=findProduct(l.id)!;
                return (
                  <article className="mini-cart-item" key={l.id+l.variant} style={{animationDelay:`${idx*50}ms`}}>
                    <Link href={'/product/'+p.slug} onClick={s.closeCart} className="mini-cart-item-img">
                      <img src={p.images[0]} alt={p.name}/>
                    </Link>
                    <div className="mini-cart-item-details">
                      <span className="eyebrow">{p.brand}</span>
                      <Link href={'/product/'+p.slug} onClick={s.closeCart}>
                        <h4>{p.name}</h4>
                      </Link>
                      <small className="variant-tag">{l.variant}</small>
                      <div className="mini-cart-item-footer">
                        <Quantity value={l.qty} onChange={n=>change(l,n)} max={p.stock}/>
                        <div className="mini-cart-item-price">
                          <strong><RollingPrice amount={p.price*l.qty}/></strong>
                        </div>
                      </div>
                    </div>
                    <button className="icon mini-cart-item-remove" aria-label={`Remove ${p.name}`} onClick={()=>remove(l)}>
                      <X size={16}/>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {lines.length>0&&(
          <div className="mini-cart-footer">
            <div className="mini-cart-subtotal">
              <div>
                <span>Estimated Subtotal</span>
                <small>Taxes and demo delivery calculated at checkout</small>
              </div>
              <strong><RollingPrice amount={totals.total}/></strong>
            </div>
            <MagneticLink className="btn btn-shimmer full" href="/checkout" onClick={s.closeCart}>
              <span>PROCEED TO CHECKOUT</span>
              <span className="btn-arrow">→</span>
            </MagneticLink>
            <div className="mini-cart-links">
              <Link href="/cart" className="text-link" onClick={s.closeCart}>View Full Cart Details</Link>
            </div>
            <p className="mini-cart-note"><ShieldCheck size={15}/>Demo checkout · No real payment collected</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Header(){
  const s=useStore();
  const path=usePathname();
  const [search,setSearch]=useState(false);
  const [menu,setMenu]=useState(false);
  const [compact,setCompact]=useState(false);

  useEffect(()=>{
    const f=()=>setCompact(window.scrollY>45);
    window.addEventListener('scroll',f,{passive:true});
    return()=>window.removeEventListener('scroll',f);
  },[]);

  return (
    <>
      <AnnouncementMarquee/>
      <header className={compact?'compact':''}>
        <div className="header-main wrap">
          <button className="icon mobile-only" aria-label="Open menu" onClick={()=>setMenu(true)}><Menu/></button>
          <Link className="wordmark" href="/">GHAR SANSAR<span>BHUJ · HOUSEHOLD & PLASTICS</span></Link>
          <nav>{[['Shop','/shop'],['Categories','/categories'],['About','/about'],['Contact','/contact']].map(([t,h])=><Link className={path===h?'active':''} href={h} key={h}>{t}</Link>)}</nav>
          <div className="header-actions">
            <button className="header-search" aria-label="Search" onClick={()=>setSearch(true)}><Search size={18}/><span>Search</span></button>
            <Link className="icon desktop-only" href="/account" aria-label="My account"><UserRound size={19}/></Link>
            <button className="bag" aria-label="Open Cart Bag" onClick={()=>s.openCart()}>
              <ShoppingBag size={19}/>
              <span>({s.cart.reduce((a:number,b:CartLine)=>a+b.qty,0)})</span>
            </button>
          </div>
        </div>
      </header>
      <nav className="mobile-bottom">
        {[[Home,'Home','/'],[Grid2X2,'Shop','/shop'],[Search,'Search',''],[ShoppingBag,'Cart','cart-drawer'],[UserRound,'Account','/account']].map(([Icon,label,href]:any)=>(
          href==='cart-drawer'?(
            <button key={label} onClick={()=>s.openCart()} aria-label="Open Cart"><Icon size={20}/>{label}</button>
          ):href?(
            <Link key={label} href={href}><Icon size={20}/>{label}</Link>
          ):(
            <button key={label} onClick={()=>setSearch(true)}><Icon size={20}/>{label}</button>
          )
        ))}
      </nav>
      <SearchOverlay open={search} onClose={()=>setSearch(false)}/>
      <Dialog open={menu} onOpenChange={setMenu}>
        <DialogContent className="menu-dialog">
          <DialogTitle>GHAR SANSAR</DialogTitle>
          <DialogDescription>Bhuj · Household & plastics</DialogDescription>
          {[['Shop','/shop'],['Categories','/categories'],['About','/about'],['Contact','/contact'],['My account','/account']].map(([t,h])=><Link key={h} href={h} onClick={()=>setMenu(false)}>{t}<ChevronRight size={18}/></Link>)}
        </DialogContent>
      </Dialog>
    </>
  );
}
function Footer(){return <footer><div className="wrap footer-grid"><div><Link className="wordmark" href="/">GHAR SANSAR<span>BHUJ · HOUSEHOLD & PLASTICS</span></Link><p>Everyday essentials. Thoughtfully chosen.<br/>Your neighbourhood store in Bhuj,<br/>now a little closer.</p><span className="location"><MapPin size={15}/> Bhuj, Gujarat, India</span></div>{[['Shop',['All products','/shop'],['Categories','/categories'],['Best sellers','/shop?sort=Popular'],['New arrivals','/shop?sort=Newest']],['Customer care',['Contact us','/contact'],['FAQs','/faq'],['Delivery & returns','/delivery'],['Track your order','/tracking']],['About Ghar Sansar',['Our story','/about'],['Privacy policy','/privacy'],['Terms & conditions','/terms'],['My account','/account']]].map((col:any)=><div key={col[0]}><h4>{col[0]}</h4>{col.slice(1).map(([t,h]:string[])=><Link key={h} href={h}>{t}</Link>)}</div>)}</div><div className="wrap footer-bottom"><span>© 2026 Ghar Sansar. All rights reserved.</span><span>Demo store · No real orders or payments</span><span>Instagram / Facebook — coming soon</span></div></footer>}

function ProductRail({items}:{items:Product[]}){
  const rail=useRef<HTMLDivElement>(null);
  const [progress,setProgress]=useState(0);
  const [isDragging,setIsDragging]=useState(false);
  const stateRef=useRef({
    isDown:false,
    startX:0,
    startScrollLeft:0,
    lastX:0,
    lastTime:0,
    velX:0,
    hasMoved:false,
    animId:0
  });

  const updateProgress=()=>{
    if(!rail.current)return;
    const max=rail.current.scrollWidth-rail.current.clientWidth;
    if(max>0){
      setProgress(Math.min(100,Math.max(0,(rail.current.scrollLeft/max)*100)));
    }
  };

  useEffect(()=>{
    const el=rail.current;
    if(!el)return;
    el.addEventListener('scroll',updateProgress,{passive:true});
    updateProgress();
    return()=>el.removeEventListener('scroll',updateProgress);
  },[]);

  const onMouseDown=(e:React.MouseEvent<HTMLDivElement>)=>{
    if(!rail.current)return;
    cancelAnimationFrame(stateRef.current.animId);
    stateRef.current.isDown=true;
    stateRef.current.hasMoved=false;
    stateRef.current.startX=e.pageX-rail.current.offsetLeft;
    stateRef.current.startScrollLeft=rail.current.scrollLeft;
    stateRef.current.lastX=e.pageX;
    stateRef.current.lastTime=performance.now();
    stateRef.current.velX=0;
    setIsDragging(true);
  };

  const onMouseMove=(e:React.MouseEvent<HTMLDivElement>)=>{
    if(!stateRef.current.isDown||!rail.current)return;
    e.preventDefault();
    const x=e.pageX-rail.current.offsetLeft;
    const walk=(x-stateRef.current.startX)*1.25;
    if(Math.abs(walk)>5)stateRef.current.hasMoved=true;
    rail.current.scrollLeft=stateRef.current.startScrollLeft-walk;
    const now=performance.now();
    const dt=Math.max(1,now-stateRef.current.lastTime);
    stateRef.current.velX=((e.pageX-stateRef.current.lastX)/dt)*16;
    stateRef.current.lastX=e.pageX;
    stateRef.current.lastTime=now;
    updateProgress();
  };

  const endDrag=()=>{
    if(!stateRef.current.isDown)return;
    stateRef.current.isDown=false;
    setIsDragging(false);
    const decay=()=>{
      if(Math.abs(stateRef.current.velX)>0.3&&rail.current){
        rail.current.scrollLeft-=stateRef.current.velX;
        stateRef.current.velX*=0.94;
        updateProgress();
        stateRef.current.animId=requestAnimationFrame(decay);
      }
    };
    stateRef.current.animId=requestAnimationFrame(decay);
  };

  const onClickCapture=(e:React.MouseEvent)=>{
    if(stateRef.current.hasMoved){
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div className="product-rail-wrapper">
      <div className="rail-controls">
        <div className="rail-drag-hint"><span>Grab & drag to explore</span></div>
        <div className="rail-nav-buttons">
          <button aria-label="Previous products" onClick={()=>rail.current?.scrollBy({left:-550,behavior:'smooth'})}>←</button>
          <button aria-label="Next products" onClick={()=>rail.current?.scrollBy({left:550,behavior:'smooth'})}>→</button>
        </div>
      </div>
      <div
        className={`product-rail ${isDragging?'is-dragging':''}`}
        ref={rail}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onClickCapture={onClickCapture}
      >
        {items.map(p=><ProductCard key={p.id} product={p}/>)}
      </div>
      <div className="rail-progress-bar" aria-hidden="true">
        <div className="rail-progress-track">
          <div className="rail-progress-pill" style={{left:`${progress}%`}}/>
        </div>
      </div>
    </div>
  );
}

function HomePage(){return <main className="editorial-home"><section className="hero wrap"><div className="hero-copy"><div className="hero-eyebrow-wrap"><span className="hero-pulse-dot"/><span className="eyebrow">GHAR SANSAR · BHUJ</span></div><h1 className="hero-split-title"><span className="hero-split-line"><span className="hero-split-word" style={{animationDelay:'0.1s'}}>Everything</span></span><span className="hero-split-line"><span className="hero-split-word" style={{animationDelay:'0.24s'}}>your home</span></span><span className="hero-split-line"><span className="hero-split-word" style={{animationDelay:'0.38s'}}><em>needs.</em></span></span></h1><p className="hero-desc">Thoughtfully selected household, kitchen, storage and everyday essentials — now available online across Bhuj.</p><div className="hero-actions"><MagneticLink className="btn btn-shimmer" href="/shop"><span>SHOP COLLECTION</span><span className="btn-arrow">→</span></MagneticLink><Link className="text-link" href="/categories">EXPLORE CATEGORIES</Link></div><div className="hero-index-wrap"><span className="hero-index-line"/><span className="hero-index">01 — THE EVERYDAY COLLECTION</span></div></div><HeroPhoto/></section><section className="section wrap reveal"><div className="section-heading"><div><span className="eyebrow">01 / FIND YOUR EVERYDAY</span><h2>A place for everything.</h2><p>Everyday essentials for every corner of your home.</p></div><Link className="text-link" href="/categories">ALL CATEGORIES</Link></div><div className="category-grid home-categories">{[categories[0],categories[2],categories[1],categories[7],categories[8],categories[3],categories[6],categories[4]].map((c,i)=><Link className="category-card" key={c} href={'/category/'+categorySlug(c)} data-cursor-pill="Explore →"><div><img src={categoryImage(c)} alt={c} loading="lazy"/></div><span className="category-number">0{i+1}</span><strong>{c.replace('Storage & Containers','Storage').replace('Cleaning Supplies','Cleaning').replace('Bathroom Essentials','Bathroom')}</strong><span className="category-arrow">↗</span></Link>)}</div></section><Section title="Everyday, beautifully simple." kicker="02 / WELL CHOSEN, WELL USED" items={[products[0],products[32],products[8],products[24]]}/><section className="brand-showcase milton reveal"><div className="wrap"><div className="brand-showcase-heading"><div><span className="eyebrow">03 / THE MILTON-INSPIRED COLLECTION</span><h2>MILTON</h2></div><div><p>Designed for everyday moments.</p><Link className="text-link" href="/shop?brand=Milton">EXPLORE COLLECTION</Link></div></div><div className="brand-products">{[products[0],products[8],products[24],products[32]].map(p=><Link key={p.id} href={'/product/'+p.slug} data-cursor-pill="View Milton ↗"><img src={p.images[0]} alt={p.name} loading="lazy"/><span>{p.category}</span></Link>)}</div><p className="collection-note">Illustrative demo collection. Product details and availability to be confirmed.</p></div></section><section className="brand-showcase boss wrap reveal"><div className="boss-image"><img src="/images/organizer.jpg" alt="Practical containers for everyday home organisation" loading="lazy"/></div><div className="boss-copy"><span className="eyebrow">04 / A MORE ORGANISED EVERYDAY</span><h2>BOSS</h2><h3>Small things.<br/>A home that works.</h3><p>Storage, plastic utility and practical household essentials. A little order makes a lot of difference.</p><MagneticLink className="btn btn-shimmer" href="/shop?brand=Boss" data-cursor-pill="Discover Boss ↗">DISCOVER BOSS</MagneticLink><small>Boss-inspired demo catalog. Photography is illustrative.</small></div></section><section className="local-story wrap reveal"><div className="story-photo"><img src="/images/story.jpg" alt="A quiet light-filled kitchen, ready for everyday life" loading="lazy"/></div><div><span className="eyebrow">05 / YOUR NEIGHBOURHOOD, ONLINE</span><h2>From our store<br/>to your home.</h2><p>Ghar Sansar brings the convenience of local shopping online — making everyday household essentials easier to discover and order across Bhuj.</p><Link className="text-link" href="/about">OUR STORY</Link></div></section><section className="why-section wrap reveal"><div className="section-heading"><span className="eyebrow">THE LITTLE THINGS THAT MATTER</span><h2>The Ghar Sansar difference.</h2></div><div className="why-list">{[['Local Bhuj delivery','Starting with the city we call home.'],['Household essentials','Useful collections for everyday living.'],['Simple ordering','From discovery to checkout in a few steps.'],['Cash on delivery','Explore cash on delivery in our demo checkout.']].map(([t,d],i)=><div key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></div>)}</div></section><section className="popular-section wrap reveal"><div className="section-heading"><div><span className="eyebrow">06 / EVERYDAY FAVOURITES</span><h2>Well loved. Well used.</h2></div><Link className="text-link" href="/shop?sort=Popular">SHOP ALL</Link></div><ProductRail items={[products[0],products[16],products[24],products[40],products[64],products[72]]}/></section><section className="delivery-editorial wrap reveal"><div><span className="eyebrow">CLOSER TO HOME</span><h2>Built around<br/><em>Bhuj.</em></h2><p>We're starting local — bringing everyday essentials closer to your home.</p></div><div className="delivery-locations"><div><span className="eyebrow">CURRENT DEMO AREA</span><h3>Bhuj, Gujarat</h3><p>PIN 370001</p></div><div><span className="eyebrow">COMING SOON</span><h3>More cities.</h3><p>One neighbourhood at a time.</p></div><Link className="text-link" href="/delivery">DELIVERY DETAILS</Link></div></section><section className="final-cta reveal"><span className="eyebrow">USEFUL PRODUCTS. EVERYDAY LIVING.</span><h2>Make home<br/><em>a little easier.</em></h2><p>Discover practical products for everyday living.</p><MagneticLink className="btn btn-shimmer" href="/shop">SHOP GHAR SANSAR</MagneticLink></section><div className="demo-note wrap">A demonstration store. Products, prices, ratings and popularity are sample data. No real orders or payments. Product imagery is illustrative.</div></main>}
function ShopPage({category}:{category?:string}){const params=useSearchParams();const [query,setQuery]=useState(params.get('q')||'');const [cat,setCat]=useState(category||'All categories');const [brand,setBrand]=useState(params.get('brand')||'All brands');const [price,setPrice]=useState('Any price');const [rating,setRating]=useState('All ratings');const [stock,setStock]=useState(false);const [sort,setSort]=useState(params.get('sort')||'Popular');const [show,setShow]=useState(false);useEffect(()=>{setQuery(params.get('q')||'');setBrand(params.get('brand')||'All brands');setSort(params.get('sort')||'Popular');setCat(category||'All categories')},[params,category]);const items=useMemo(()=>products.filter(p=>{const words=query.toLowerCase().split(/\s+/);return words.every(w=>(p.name+' '+p.brand+' '+p.category).toLowerCase().includes(w))&&(cat==='All categories'||p.category===cat)&&(brand==='All brands'||p.brand===brand)&&(!stock||p.stock>0)&&(price==='Any price'||(price==='Under ₹300'?p.price<300:price==='₹300 – ₹600'?p.price>=300&&p.price<=600:p.price>600))&&(rating==='All ratings'||p.rating>=4.5)}).sort((a,b)=>sort==='Price: Low to high'?a.price-b.price:sort==='Price: High to low'?b.price-a.price:sort==='Rating'?b.rating-a.rating:sort==='Newest'?Number(b.id.slice(3))-Number(a.id.slice(3)):b.reviewCount-a.reviewCount),[query,cat,brand,stock,price,rating,sort]);const reset=()=>{setCat('All categories');setBrand('All brands');setPrice('Any price');setRating('All ratings');setStock(false);setQuery('')};const filters=<><div className="filter-title"><h3>Filters</h3><button className="text-link" onClick={reset}>Clear all</button></div><label>Category<Choose label="Category" value={cat} onChange={setCat} options={['All categories',...categories]}/></label><label>Brand<Choose label="Brand" value={brand} onChange={setBrand} options={['All brands','Milton','Boss']}/></label><label>Price<Choose label="Price" value={price} onChange={setPrice} options={['Any price','Under ₹300','₹300 – ₹600','Above ₹600']}/></label><label>Sample rating<Choose label="Rating" value={rating} onChange={setRating} options={['All ratings','4.5 & above']}/></label><label className="check-label"><Checkbox checked={stock} onCheckedChange={v=>setStock(v===true)}/>In stock only</label><div className="filter-note"><Truck/><strong>Local makes it easier.</strong><p>Demo delivery in Bhuj.<br/>Free over ₹799.</p></div></>;return <main className="wrap page"><div className="breadcrumb"><Link href="/">Home</Link><ChevronRight/>{category||'Shop'}</div><div className="page-heading"><span className="eyebrow">USEFUL THINGS. EVERYDAY VALUE.</span><h1>{category||'SHOP ALL'}</h1><p>Find a little something for every corner of your home.</p></div><div className="shop-layout"><aside className="filters desktop-only">{filters}</aside><div><div className="shop-toolbar"><div className="inline-search"><Search size={18}/><input aria-label="Search catalog" placeholder="Search essentials…" value={query} onChange={e=>setQuery(e.target.value)}/></div><button className="outline mobile-only" onClick={()=>setShow(true)}><SlidersHorizontal size={16}/>Filters</button><Choose label="Sort products" value={sort} onChange={setSort} options={['Popular','Newest','Price: Low to high','Price: High to low','Rating']}/></div><p className="results-count">Showing {items.length} products <span>· Sample catalog</span></p>{items.length?<ProductGrid items={items}/>:<div className="blank"><h2>No products found</h2><p>Try fewer filters or another search.</p><button className="btn" onClick={reset}>Clear filters</button></div>}</div></div><Dialog open={show} onOpenChange={setShow}><DialogContent className="filter-dialog"><DialogTitle>Refine your search</DialogTitle><DialogDescription>Find the essentials that fit your home.</DialogDescription><div className="filters">{filters}</div><button className="btn" onClick={()=>setShow(false)}>Show {items.length} products</button></DialogContent></Dialog></main>}
function Detail({slug}:{slug:string}){const p=findProduct(slug);const s=useStore();const router=useRouter();const [qty,setQty]=useState(1);const [variant,setVariant]=useState('Original');const [pin,setPin]=useState('');const [checked,setChecked]=useState(false);const [zoom,setZoom]=useState(false);const [imageIndex,setImageIndex]=useState(0);if(!p)return <Blank title="Product not found" copy="This item is not in the demo catalog."/>;return <main className="wrap page"><div className="breadcrumb"><Link href="/shop">Shop</Link><ChevronRight/><Link href={'/category/'+categorySlug(p.category)}>{p.category}</Link><ChevronRight/>{p.brand}</div><div className="detail-grid"><div><button className="main-product" onClick={()=>setZoom(true)} aria-label="Enlarge product image"><img src={p.images[imageIndex]} alt={p.name}/><span>Click to take a closer look</span></button><div className="thumbnails"><button aria-label="Product photo" onClick={()=>setImageIndex(0)}><img src={p.images[0]} alt="Product view"/></button><small>Illustrative photo · colours may vary</small></div></div><div className="detail-info"><span className="eyebrow">{p.brand} / {p.category}</span><h1>{p.name}</h1><span className="rating"><Star size={15} fill="currentColor"/>{p.rating} · {p.reviewCount} sample ratings</span><div className="detail-price"><strong><RollingPrice amount={p.price}/></strong><del>{money(p.mrp)}</del><span>{p.discount}% off</span></div><p className="small">Inclusive of taxes · Demo price</p><p>{p.description}</p><span className={p.stock?'stock':'error'}>{p.stock?'In stock · Ready for your demo order':'Out of stock'}</span><label className="variant-label">Colour option<Choose value={variant} onChange={setVariant} options={p.variants} label="Colour option"/></label><div className="purchase-row"><Quantity value={qty} onChange={setQty} max={p.stock}/><MagneticButton className="btn btn-shimmer" disabled={!p.stock} onClick={(e:React.MouseEvent)=>{triggerFlyToCart(e,p.images[0]);s.add(p.id,variant,qty)}}>Add to cart</MagneticButton><WishlistButton productId={p.id} productName={p.name}/></div><MagneticButton className="outline full" disabled={!p.stock} onClick={()=>{s.add(p.id,variant,qty);router.push('/checkout')}}>Buy now</MagneticButton><div className="delivery-check"><strong><Truck size={18}/>Delivering to Bhuj</strong><form onSubmit={e=>{e.preventDefault();setChecked(true)}}><input aria-label="Delivery PIN code" placeholder="Enter PIN code" maxLength={6} pattern="[0-9]{6}" required value={pin} onChange={e=>{setPin(e.target.value);setChecked(false)}}/><button className="text-link">Check</button></form>{checked&&<p className={deliveryAvailable('Bhuj',pin)?'stock':'error'}>{deliveryAvailable('Bhuj',pin)?'Available in this demo. Estimated delivery: tomorrow.':"Ghar Sansar currently delivers only within Bhuj. We're expanding soon!"}</p>}<small>Demo service area: Bhuj 370001. Free delivery over ₹799.</small></div></div></div><section className="product-details"><h2>The useful details</h2><div className="details-columns"><div><h3>Made for your everyday</h3><p>{p.description}</p><h3>Delivery & returns</h3><p>Demo delivery costs ₹40, or is free on product totals of ₹799 or more. No real dispatch occurs. The store’s returns policy will be confirmed before launch.</p></div><dl>{Object.entries(p.specifications).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div><details><summary>Customer reviews</summary><p>Ratings are sample data for this demo. No verified customer reviews have been published.</p></details></section><div className="section-heading"><h2>You may also like</h2></div><ProductGrid items={products.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4)}/><Dialog open={zoom} onOpenChange={setZoom}><DialogContent className="zoom-dialog"><DialogTitle>{p.name}</DialogTitle><DialogDescription>Illustrative product image</DialogDescription><img src={p.images[0]} alt={p.name}/></DialogContent></Dialog></main>}
function Summary({lines,children}:{lines:CartLine[];children?:React.ReactNode}){const totals=calculateTotals(lines.map(l=>({...findProduct(l.id)!,qty:l.qty})));return <aside className="summary"><h3>Order summary</h3><div><span>Subtotal (MRP)</span><b><RollingPrice amount={totals.subtotal}/></b></div><div className="stock"><span>Product savings</span><b>−<RollingPrice amount={totals.discount}/></b></div><div><span>Delivery fee</span><b>{totals.delivery?money(totals.delivery):'FREE'}</b></div><div><span>Platform fee</span><b>{money(totals.platform)}</b></div><div className="grand-total"><strong>Grand total</strong><strong><RollingPrice amount={totals.total}/></strong></div><small>Inclusive of taxes. Demo prices.</small>{children}<p className="summary-note"><ShieldCheck size={17}/>Demo checkout. No payment collected.</p></aside>}
function Cart(){const s=useStore();const change=(l:CartLine,qty:number)=>s.update({cart:s.cart.map((x:CartLine)=>x.id===l.id&&x.variant===l.variant?{...x,qty}:x)});const remove=(l:CartLine)=>s.update({cart:s.cart.filter((x:CartLine)=>!(x.id===l.id&&x.variant===l.variant))});if(!s.ready)return <Skeleton className="loading-skeleton"/>;return <main className="wrap page"><div className="page-heading"><span className="eyebrow">A FEW GOOD THINGS</span><h1>YOUR CART <small>({s.cart.length})</small></h1></div>{!s.cart.length?<Blank title="Your cart is waiting." copy="Add something useful for your home."/>:<div className="cart-layout"><div><div className="delivery-banner"><Truck size={19}/>Free demo delivery on product totals of ₹799 or more</div>{s.cart.map((l:CartLine)=>{const p=findProduct(l.id)!;return <article className="cart-item" key={l.id+l.variant}><Link href={'/product/'+p.slug}><img src={p.images[0]} alt={p.name}/></Link><div><span className="eyebrow">{p.brand}</span><Link href={'/product/'+p.slug}><h3>{p.name}</h3></Link><small>{l.variant}</small><div className="cart-item-actions"><Quantity value={l.qty} onChange={n=>change(l,n)} max={p.stock}/><button className="text-link" onClick={()=>{if(!s.wishlist.includes(p.id))s.toggleWish(p.id);remove(l);toast.success('Saved to wishlist')}}>Save for later</button></div></div><div className="cart-item-end"><button className="icon" aria-label={'Remove '+p.name} onClick={()=>remove(l)}><X size={18}/></button><strong><RollingPrice amount={p.price*l.qty}/></strong><del>{money(p.mrp*l.qty)}</del></div></article>})}<Link className="text-link" href="/shop">Continue shopping</Link></div><Summary lines={s.cart}><MagneticLink className="btn btn-shimmer full" href="/checkout">Proceed to checkout</MagneticLink></Summary></div>}</main>}
function AddressFields({address,setAddress}:{address:Address;setAddress:(a:Address)=>void}){return <div className="form-grid">{([['name','Full name'],['phone','Phone number'],['house','House / flat number'],['street','Street / area'],['landmark','Landmark (optional)'],['city','City'],['state','State'],['pin','PIN code']] as const).map(([k,label])=><label key={k}>{label}<input value={address[k]} required={k!=='landmark'} onChange={e=>setAddress({...address,[k]:e.target.value})} autoComplete={{name:'name',phone:'tel',house:'address-line1',street:'address-line2',city:'address-level2',state:'address-level1',pin:'postal-code',landmark:'off'}[k]} type={k==='phone'?'tel':'text'} pattern={k==='phone'?'[6-9][0-9]{9}':k==='pin'?'[0-9]{6}':undefined} maxLength={k==='phone'?10:k==='pin'?6:150}/></label>)}</div>}
function Checkout(){const s=useStore();const router=useRouter();const [step,setStep]=useState(0);const [address,setAddress]=useState<Address>(defaultAddress);const [method,setMethod]=useState('Cash on Delivery');const [error,setError]=useState('');const [busy,setBusy]=useState(false);useEffect(()=>{if(s.user)setAddress(a=>({...a,name:s.user.name,phone:s.user.phone}))},[s.user]);if(!s.cart.length)return <main className="wrap page"><Blank title="Nothing to check out yet" copy="Add an essential to your bag to begin."/></main>;const place=async()=>{if(busy)return;if(!deliveryAvailable(address.city,address.pin,address.state)){setError("Ghar Sansar currently delivers only within Bhuj. We're expanding soon!");setStep(0);return}setBusy(true);try{await new Promise(r=>setTimeout(r,250));const order:Order={id:`GS-${new Date().getFullYear()}-${Array.from(crypto.getRandomValues(new Uint8Array(6))).map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase()}`,date:new Date().toISOString(),items:[...s.cart],total:calculateTotals(s.cart.map((l:CartLine)=>({...findProduct(l.id)!,qty:l.qty}))).total,address,method,status:0};s.update({orders:[order,...s.orders],cart:[],addresses:s.addresses.some((a:Address)=>a.house===address.house&&a.pin===address.pin)?s.addresses:[address,...s.addresses]});router.push('/confirmation/'+order.id)}catch{toast.error('The demo order could not be saved. Please try again.')}finally{setBusy(false)}};return <main className="wrap page"><div className="page-heading"><span className="eyebrow">JUST A FEW SIMPLE STEPS</span><h1>Checkout</h1></div><ol className="checkout-steps">{['Delivery address','Order summary','Payment','Confirmation'].map((x,i)=><li key={x} className={i===step?'current':i<step?'done':''}><span>{i<step?<Check size={16}/>:i+1}</span>{x}</li>)}</ol><div className="cart-layout"><div className="checkout-panel">{step===0?<><h2>Where should we deliver?</h2><p>Bhuj delivery · Demo PIN: 370001</p>{s.addresses.length>0&&<div className="saved-options">{s.addresses.map((a:Address,i:number)=><button className="outline" key={i} onClick={()=>setAddress(a)}>Use saved address: {a.house}, {a.street}</button>)}</div>}<form onSubmit={e=>{e.preventDefault();if(!deliveryAvailable(address.city,address.pin,address.state)){setError("Ghar Sansar currently delivers only within Bhuj. We're expanding soon!");return}setError('');setStep(1)}}><AddressFields address={address} setAddress={setAddress}/>{error&&<p role="alert" className="error">{error}</p>}<MagneticButton type="submit" className="btn btn-shimmer" disabled={!address.name.trim()||!address.house.trim()||!address.street.trim()||!address.phone||!address.pin}>Continue to summary</MagneticButton></form></>:step===1?<><h2>Looking good?</h2><div className="address-card"><strong>{address.name} · {address.phone}</strong><p>{address.house}, {address.street}<br/>{address.city}, {address.state} {address.pin}</p><button className="text-link" onClick={()=>setStep(0)}>Edit delivery address</button></div>{s.cart.map((l:CartLine)=>{const p=findProduct(l.id)!;return <div className="checkout-line" key={l.id+l.variant}><img src={p.images[0]} alt=""/><span>{p.name}<small>{l.variant} · Quantity {l.qty}</small></span><b>{money(p.price*l.qty)}</b></div>})}<MagneticButton className="btn btn-shimmer" onClick={()=>setStep(2)}>Continue to payment</MagneticButton></>:<><span className="badge">DEMO PAYMENT</span><h2>How would you like to pay?</h2><p>No payment is collected. Please do not enter bank, card or UPI details.</p><div className="payment-options">{['Cash on Delivery','UPI','Card','Net Banking'].map(m=><button key={m} className={m===method?'chosen':''} onClick={()=>setMethod(m)}><span>{m}</span>{method===m?<Check size={18}/>:<span className="radio-dot"/>}</button>)}</div><div className="notice">{method==='Cash on Delivery'?'Cash on Delivery is simulated. No delivery or collection will take place.':`${method} is simulated. No payment gateway will open and no money will be charged.`}</div><MagneticButton className="btn btn-shimmer full" disabled={busy} onClick={place}>{busy?'Creating your demo order…':'Place demo order'}</MagneticButton><button className="text-link" onClick={()=>setStep(1)}>Back to order summary</button></>}</div><Summary lines={s.cart}/></div></main>}
function CelebrationCanvas(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    if(!ctx)return;
    let width=canvas.width=window.innerWidth;
    let height=canvas.height=window.innerHeight;
    const onResize=()=>{
      if(!canvas)return;
      width=canvas.width=window.innerWidth;
      height=canvas.height=window.innerHeight;
    };
    window.addEventListener('resize',onResize);
    const colors=['#234E3E','#3D735C','#D4AF37','#E5C158','#4A7C59','#8FAF78','#F7E7CE'];
    interface Particle{
      x:number;y:number;vx:number;vy:number;size:number;color:string;rotation:number;vRot:number;shape:'leaf'|'rect'|'circle';opacity:number;decay:number;
    }
    const particles:Particle[]=[];
    const count=65;
    for(let i=0;i<count;i++){
      const angle=(Math.random()*0.8+0.1)*Math.PI;
      const speed=Math.random()*11+5;
      particles.push({
        x:width*0.5+(Math.random()-0.5)*180,
        y:height*0.4,
        vx:Math.cos(angle)*speed*(Math.random()>0.5?1:-1),
        vy:-Math.sin(angle)*speed-Math.random()*4,
        size:Math.random()*7+5,
        color:colors[Math.floor(Math.random()*colors.length)],
        rotation:Math.random()*360,
        vRot:(Math.random()-0.5)*5,
        shape:Math.random()>0.4?'leaf':(Math.random()>0.5?'rect':'circle'),
        opacity:1,
        decay:Math.random()*0.002+0.003
      });
    }
    let animId:number;
    const startTime=performance.now();
    const render=(now:number)=>{
      ctx.clearRect(0,0,width,height);
      let alive=false;
      for(let i=0;i<particles.length;i++){
        const p=particles[i];
        if(p.opacity<=0.01)continue;
        alive=true;
        p.x+=p.vx;
        p.y+=p.vy;
        p.vy+=0.22;
        p.vx*=0.98;
        p.rotation+=p.vRot;
        p.opacity-=p.decay;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate((p.rotation*Math.PI)/180);
        ctx.globalAlpha=Math.max(0,p.opacity);
        ctx.fillStyle=p.color;
        if(p.shape==='leaf'){
          ctx.beginPath();
          ctx.moveTo(0,-p.size);
          ctx.quadraticCurveTo(p.size*0.8,0,0,p.size);
          ctx.quadraticCurveTo(-p.size*0.8,0,0,-p.size);
          ctx.fill();
        }else if(p.shape==='rect'){
          ctx.fillRect(-p.size/2,-p.size/3,p.size,p.size*0.6);
        }else{
          ctx.beginPath();
          ctx.arc(0,0,p.size/2,0,Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
      }
      if(alive&&now-startTime<5500){
        animId=requestAnimationFrame(render);
      }
    };
    animId=requestAnimationFrame(render);
    return()=>{
      window.removeEventListener('resize',onResize);
      cancelAnimationFrame(animId);
    };
  },[]);
  return <canvas ref={canvasRef} className="celebration-canvas" aria-hidden="true"/>;
}

function Confirmation({id}:{id:string}){
  const s=useStore();
  const o=s.orders.find((o:Order)=>o.id===id);
  if(!s.ready)return <Skeleton className="loading-skeleton"/>;
  return (
    <main className="wrap page confirmation">
      {o&&<CelebrationCanvas/>}
      <div className="confirmation-badge-wrap">
        <span className="success-icon confirmation-pulse-icon"><Check size={30}/></span>
        <div className="confirmation-ripple-ring"/>
        <div className="confirmation-ripple-ring ring-delay"/>
      </div>
      <span className="eyebrow">THANK YOU FOR TRYING GHAR SANSAR</span>
      <h1>{o?'Demo order placed successfully':'Order not found'}</h1>
      {o?(
        <>
          <p>Your demo order has been received.<br/>No payment was processed and no real delivery will occur.</p>
          <div className="confirmation-card">
            <span>ORDER NUMBER<strong>{o.id}</strong></span>
            <span>DEMO ESTIMATED DELIVERY<strong>Tomorrow</strong></span>
            <span>TOTAL<strong><RollingPrice amount={o.total}/></strong></span>
          </div>
          <div className="confirmation-actions">
            <MagneticLink className="btn btn-shimmer" href={'/tracking/'+o.id}>
              <span>Track order</span>
              <span className="btn-arrow">→</span>
            </MagneticLink>
            <Link className="text-link" href="/shop">Continue shopping</Link>
          </div>
        </>
      ):(
        <MagneticLink className="btn btn-shimmer" href="/orders">View orders</MagneticLink>
      )}
    </main>
  );
}

function Tracking({id}:{id?:string}){
  const s=useStore();
  const [value,setValue]=useState(id||'');
  const [lookup,setLookup]=useState(id||'');
  const order=s.orders.find((o:Order)=>o.id.toLowerCase()===lookup.toLowerCase().trim());
  const currentStep=order?Math.min(order.status,statuses.length-1):0;
  const progressPercent=order?(currentStep/(statuses.length-1))*100:0;

  return (
    <main className="wrap page narrow">
      <div className="page-heading">
        <span className="eyebrow">FROM OUR STORE TO YOUR DOOR</span>
        <h1>Track your order</h1>
        <p>Follow your demo order, one step at a time.</p>
      </div>
      <form className="search-field" onSubmit={e=>{e.preventDefault();setLookup(value)}}>
        <input aria-label="Order ID" placeholder="Enter your GS order number" required value={value} onChange={e=>setValue(e.target.value)}/>
        <MagneticButton className="btn btn-shimmer" type="submit">Track order</MagneticButton>
      </form>
      {lookup&&(order?(
        <div className="tracking-card">
          <div className="section-heading">
            <div>
              <h3>{order.id}</h3>
              <p>{new Date(order.date).toLocaleDateString('en-IN')} · {money(order.total)}</p>
            </div>
            <span className="badge">DEMO ORDER</span>
          </div>
          <div className="tracking-timeline-container">
            <div className="tracking-line-bg">
              <div className="tracking-line-fill" style={{height:`${progressPercent}%`}}/>
            </div>
            <ol className="timeline animated-timeline">
              {statuses.map((x,i)=>{
                const isDone=i<=order.status;
                const isCurrent=i===order.status;
                return (
                  <li className={`${isDone?'done':''} ${isCurrent?'is-current':''}`} key={x}>
                    <div className="timeline-node-wrap">
                      <span className="timeline-node">
                        {isDone?<Check size={16}/>:i+1}
                      </span>
                      {isCurrent&&<span className="timeline-node-pulse" aria-hidden="true"/>}
                    </div>
                    <div className="timeline-info">
                      <h3>{x}</h3>
                      <p>{isCurrent?'Current demo status':i<order.status?'Completed in this simulation':'Waiting for the next step'}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="notice">This timeline is a simulation. Use the button below to preview the next delivery stage.</div>
          <MagneticButton className="outline full" disabled={order.status===4} onClick={()=>s.update({orders:s.orders.map((o:Order)=>o.id===order.id?{...o,status:o.status+1}:o)})}>
            {order.status===4?'Demo delivery completed 🎉':'Preview next stage →'}
          </MagneticButton>
        </div>
      ):<p className="notice">No order with that ID was found in this browser. Check your order history.</p>)}
      <Link className="text-link" href="/orders">View order history</Link>
    </main>
  );
}
function Auth({register=false,reset=false}:{register?:boolean;reset?:boolean}){const s=useStore();const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState('');return <main className="auth-page wrap"><div className="auth-story"><span className="eyebrow">YOUR NEIGHBOURHOOD, ONLINE</span><h1>A home for<br/>your everyday<br/><em>essentials.</em></h1><img src="/images/jar.jpg" alt="Kitchen storage jars"/><p>A little convenience. A familiar local store.</p></div><div className="auth-form"><span className="eyebrow">GHAR SANSAR</span><h2>{reset?'Reset demo password':register?'Make yourself at home.':'Welcome back.'}</h2><p>{reset?'Reset an account stored in this browser. No email is sent.':register?'Create a demo account for an easier checkout.':'Sign in to your demo account.'}</p><div className="notice small">Demo only · Accounts and orders stay in this browser. Use a sample password, never a real one.</div><form onSubmit={async e=>{e.preventDefault();setError('');setBusy(true);const f=new FormData(e.currentTarget);const password=String(f.get('password'));try{if((register||reset)&&password!==f.get('confirm'))throw new Error('Passwords do not match.');if(reset){await demoAuth.reset(String(f.get('identity')),password);toast.success('Demo password reset');router.push('/login')}else{const user=register?await demoAuth.register({name:String(f.get('name')),email:String(f.get('email')),phone:String(f.get('phone'))},password):await demoAuth.login(String(f.get('identity')),password);s.update({user,remember:register||f.get('remember')==='on'});router.push('/account');toast.success(register?'Demo account created':'Welcome back')}}catch(err){setError((err as Error).message)}finally{setBusy(false)}}}>{register?<><label>Full name<input name="name" required autoComplete="name"/></label><label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Phone<input name="phone" type="tel" required pattern="[6-9][0-9]{9}" maxLength={10} autoComplete="tel"/></label></>:<label>Email / phone<input name="identity" required autoComplete="username"/></label>}<label>{reset?'New demo password':'Password'}<input name="password" type="password" minLength={8} required autoComplete={register||reset?'new-password':'current-password'}/></label>{(register||reset)&&<label>Confirm password<input name="confirm" type="password" minLength={8} required autoComplete="new-password"/></label>}{!register&&!reset&&<div className="login-options"><label className="check-label"><Checkbox name="remember" defaultChecked/>Remember me on this browser</label><Link className="text-link" href="/forgot-password">Forgot password?</Link></div>}{error&&<p className="error" role="alert">{error}</p>}<button className="btn full" disabled={busy}>{busy?'Please wait…':reset?'Reset demo password':register?'Create demo account':'Sign in'}</button></form><p>{register?'Already have an account?':'New to Ghar Sansar?'} <Link className="text-link" href={register?'/login':'/register'}>{register?'Sign in':'Create an account'}</Link></p><Link className="outline full" href="/shop">Continue as guest</Link></div></main>}
function Account({ordersOnly=false,wishlistOnly=false}:{ordersOnly?:boolean;wishlistOnly?:boolean}){const s=useStore();const [tab,setTab]=useState(ordersOnly?'Orders':wishlistOnly?'Wishlist':'Profile');const [address,setAddress]=useState<Address>(defaultAddress);const [adding,setAdding]=useState(false);useEffect(()=>setTab(ordersOnly?'Orders':wishlistOnly?'Wishlist':'Profile'),[ordersOnly,wishlistOnly]);return <main className="wrap page"><div className="page-heading"><span className="eyebrow">YOUR GHAR SANSAR</span><h1>{s.user?'Hello, '+s.user.name.split(' ')[0]+'.':'Make yourself at home.'}</h1><p>All your essentials, saved in one place on this browser.</p></div><div className="account-layout"><aside className="account-nav">{['Profile','Saved addresses','Orders','Wishlist','Account settings'].map(t=><button className={tab===t?'active':''} key={t} onClick={()=>setTab(t)}>{t}<ChevronRight size={16}/></button>)}{s.user?<button onClick={()=>{s.update({user:null});toast.success('Signed out')}}>Logout<LogOut size={16}/></button>:<Link className="btn" href="/login">Sign in / Register</Link>}</aside><div className="account-content"><h2>{tab}</h2>{tab==='Profile'?s.user?<form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);s.update({user:{...s.user,name:f.get('name'),phone:f.get('phone')}});toast.success('Profile updated')}}><label>Name<input name="name" defaultValue={s.user.name} required/></label><label>Email<input value={s.user.email} readOnly/></label><label>Phone<input name="phone" defaultValue={s.user.phone} required pattern="[6-9][0-9]{9}"/></label><button className="btn">Save profile</button></form>:<div className="notice"><p>You’re shopping as a guest. Your cart and demo orders are saved on this browser.</p><Link className="text-link" href="/register">Create a demo account</Link></div>:tab==='Wishlist'?s.wishlist.length?<ProductGrid items={products.filter(p=>s.wishlist.includes(p.id))}/>:<Blank title="Save the things you love." copy="Tap the heart on any product to keep it here."/>:tab==='Orders'?s.orders.length?<div className="orders-list">{s.orders.map((o:Order)=><article key={o.id}><div><h3>{o.id}</h3><p>{new Date(o.date).toLocaleDateString('en-IN')} · {o.items.reduce((a,l)=>a+l.qty,0)} items · {money(o.total)}</p><span className="badge">{statuses[o.status]}</span></div><Link className="outline" href={'/tracking/'+o.id}>Track order</Link></article>)}</div>:<Blank title="Your first order starts here." copy="Your demo orders will appear here after checkout."/>:tab==='Saved addresses'?<><div className="addresses">{s.addresses.map((a:Address,i:number)=><div className="address-card" key={i}><strong>{a.name}</strong><p>{a.house}, {a.street}<br/>{a.city}, {a.state} {a.pin}<br/>{a.phone}</p><button className="text-link" onClick={()=>s.update({addresses:s.addresses.filter((_:Address,j:number)=>i!==j)})}>Remove</button></div>)}</div><button className="outline" onClick={()=>setAdding(!adding)}>{adding?'Cancel':'Add an address'}</button>{adding&&<form onSubmit={e=>{e.preventDefault();if(!deliveryAvailable(address.city,address.pin,address.state)){toast.error('Demo delivery is available in Bhuj 370001 only.');return}s.update({addresses:[...s.addresses,address]});setAdding(false);setAddress(defaultAddress);toast.success('Address saved')}}><AddressFields address={address} setAddress={setAddress}/><button className="btn">Save address</button></form>}</>:<><div className="notice">This is a browser-local demonstration. No real account, payment or delivery service is connected.</div><Link className="outline" href="/forgot-password">Reset demo password</Link><p>For information about saved data, read our <Link className="text-link" href="/privacy">privacy notice</Link>.</p></>}</div></div></main>}
function Info({page}:{page:string}){if(page==='categories')return <main className="wrap page"><div className="page-heading"><span className="eyebrow">EVERY ROOM. EVERY ROUTINE.</span><h1>Find your everyday essentials.</h1></div><div className="category-grid">{categories.map(c=><Link className="category-card" key={c} href={'/category/'+categorySlug(c)}><div><img src={categoryImage(c)} alt={c}/></div><h3>{c}</h3><span>8 demo products</span></Link>)}</div></main>;if(page==='about')return <main className="wrap page"><section className="about-hero"><div><span className="eyebrow">GHAR SANSAR · BHUJ</span><h1>Your local store.<br/><em>Now online.</em></h1><p>Useful products. Fair prices. Local delivery.</p><p>Ghar Sansar is a household and utility products store in Bhuj. This online-store concept brings the familiarity of local shopping to a convenient digital experience.</p><MagneticLink className="btn btn-shimmer" href="/shop">Explore the store</MagneticLink></div><img src="/images/hero.jpg" alt="Kitchen storage essentials"/></section><div className="local-story"><span className="story-mark">gs.</span><h2>Serving Bhuj,<br/>one home at a time.</h2><p>From everyday kitchen essentials to practical household products, Ghar Sansar brings the convenience of local shopping online.</p></div><p className="demo-note">Store story and business details will be confirmed with the owner before launch. This website is a demonstration.</p></main>;const title:Record<string,string>={contact:'Let’s keep it local.',delivery:'Delivery & returns',faq:'A little help, right here.',privacy:'Privacy notice',terms:'Terms & conditions'};return <main className="wrap page narrow"><div className="page-heading"><span className="eyebrow">HERE TO HELP</span><h1>{title[page]||'Page not found'}</h1></div>{page==='contact'?<><h2>Ghar Sansar</h2><p>Bhuj, Gujarat, India</p><div className="contact-details">{['Phone','WhatsApp','Email','Store address','Opening hours'].map(x=><div key={x}><strong>{x}</strong><span>To be confirmed by the store</span></div>)}</div><div className="map-placeholder"><MapPin size={35}/><h3>Find us in Bhuj</h3><p>The exact store location will be added before launch.</p><button className="outline" onClick={()=>toast.info('The store’s exact address is not available yet.')}>Get directions</button></div></>:page==='faq'?<>{[['Where do you deliver?','The demo accepts Bhuj, Gujarat, PIN 370001. The real service area will be confirmed by the store.'],['How much is delivery?','Demo delivery is ₹40. It is free when the product total after discounts is ₹799 or more. The platform fee is ₹0.'],['Can I place a real order?','No. This is a demonstration. Orders and payment methods are simulated; no money is collected and nothing is dispatched.'],['Are the products and ratings real?','The catalog is illustrative. Names, prices, specifications, stock and ratings are sample data; images may differ from the final inventory.'],['Can I shop without an account?','Yes, continue as a guest. Demo orders and your bag are saved in this browser.'],['What is the returns policy?','The owner will confirm the real returns policy before launch. No real purchases or returns take place in this demo.'],['Why can’t I see my order on another device?','This demo stores data in your browser only. Cross-device accounts and orders require a production backend.']].map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</>:page==='delivery'?<div className="prose"><h2>Currently delivering in Bhuj</h2><p>This demo supports Bhuj, Gujarat, PIN 370001. Other addresses cannot proceed to payment. The actual delivery boundaries must be confirmed before launch.</p><h3>Clear, simple charges</h3><p>Delivery: ₹40. Free delivery on product totals of ₹799 or more after discounts. Platform fee: ₹0.</p><h3>Delivery estimate</h3><p>Tomorrow is shown as a sample estimate. No real dispatch, delivery or cash collection takes place.</p><h3>Returns</h3><p>The store’s final returns, replacement and cancellation policy is awaiting confirmation. No real return requests are accepted through this demonstration.</p></div>:page==='privacy'?<div className="prose"><p>Demo notice · Not a final legal policy</p><h2>What this demo saves</h2><p>Your shopping bag, wishlist, sample account profile, salted demo password hash, saved addresses, recent searches and demo orders are stored in this browser. Use fictional details when testing.</p><h3>Your control</h3><p>Remove saved addresses in My Account. Clearing this site’s browser storage removes its locally saved demo data. Data does not sync across devices.</p><h3>Payments & contact</h3><p>No payment information is collected. Store contact details and a reviewed privacy policy will be added before the real store launches. Hosting infrastructure may process routine access logs under its own policies.</p></div>:page==='terms'?<div className="prose"><p>Demo terms · Not a final legal agreement</p><h2>A preview of an online store</h2><p>This website demonstrates a potential Ghar Sansar shopping experience. Catalog details, stock, discounts, ratings, popularity labels, prices, orders and delivery timelines are illustrative.</p><h3>No sales or payments</h3><p>Placing a demo order does not create a real purchase or delivery commitment. No payment is charged. Do not enter real banking details.</p><h3>Before launch</h3><p>The owner must confirm inventory, product imagery, service areas, support details, payment services and the final policies before this store accepts real customers.</p></div>:<Link className="btn" href="/">Return home</Link>}</main>}
function App(){const path=usePathname()||'/';const parts=path.split('/').filter(Boolean);const s=useStore();useStoreMotion(path);useEffect(()=>{const context=(document as any).modelContext;if(!context?.registerTool)return;const controller=new AbortController();Promise.resolve(context.registerTool({name:'search_catalog',title:'Search Ghar Sansar catalog',description:'Read matching demo products by keyword.',inputSchema:{type:'object',properties:{query:{type:'string'}},required:['query'],additionalProperties:false},annotations:{readOnlyHint:true},execute:(input:any)=>{if(typeof input.query!=='string')throw new Error('query must be a string');return products.filter(p=>(p.name+' '+p.brand+' '+p.category).toLowerCase().includes(input.query.toLowerCase())).map(p=>({id:p.id,name:p.name,price:p.price,stock:p.stock})).slice(0,20)}},{signal:controller.signal})).catch(()=>{});return()=>controller.abort()},[]);let content;switch(parts[0]){case undefined:content=<HomePage/>;break;case 'shop':content=<ShopPage/>;break;case 'category':content=<ShopPage category={categories.find(c=>categorySlug(c)===parts[1])}/>;break;case 'product':content=<Detail key={parts[1]} slug={parts[1]}/>;break;case 'cart':content=<Cart/>;break;case 'checkout':content=<Checkout/>;break;case 'confirmation':content=<Confirmation id={parts[1]}/>;break;case 'tracking':content=<Tracking id={parts[1]}/>;break;case 'login':case 'register':case 'forgot-password':content=<Auth key={parts[0]} register={parts[0]==='register'} reset={parts[0]==='forgot-password'}/>;break;case 'account':case 'orders':case 'wishlist':content=<Account ordersOnly={parts[0]==='orders'} wishlistOnly={parts[0]==='wishlist'}/>;break;default:content=<Info page={parts[0]}/>;}return <><a className="skip-link" href="#main">Skip to content</a><CursorFollower/><FlyingCartLayer/><MiniCartDrawer/><Header/><div id="main" tabIndex={-1}>{content}</div><Footer/><Toaster position="bottom-right"/></>}
export default function Storefront(){return <StoreProvider><App/></StoreProvider>}

