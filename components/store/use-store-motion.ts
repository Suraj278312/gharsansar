'use client';
import {useEffect} from 'react';

/** Progressive motion: content remains usable without JS or with reduced motion. */
export function useStoreMotion(path:string){
  useEffect(()=>{
    window.scrollTo({top:0,behavior:'instant'});
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    if(preference.matches)return;
    const tracked=new WeakSet<Element>();
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){entry.target.classList.add('motion-visible');observer.unobserve(entry.target)}
      }
    },{threshold:.08,rootMargin:'0px 0px -35px 0px'});
    const register=()=>{
      document.querySelectorAll('.section-heading,.category-card,.product-card,.brand-showcase-heading,.boss-copy,.story-photo,.local-story>div:last-child,.why-list>div,.delivery-editorial>div,.final-cta').forEach(el=>{
        if(tracked.has(el))return;
        tracked.add(el);
        const siblings=el.parentElement?Array.from(el.parentElement.children):[];
        const index=siblings.indexOf(el);
        (el as HTMLElement).style.setProperty('--reveal-delay',`${Math.max(0,index%4)*95}ms`);
        el.classList.add('motion-item');
        observer.observe(el);
      });
    };
    register();
    const changes=new MutationObserver(register);
    const main=document.getElementById('main');
    if(main)changes.observe(main,{childList:true,subtree:true});
    let frame=0;
    const update=()=>{
      frame=0;
      document.querySelectorAll<HTMLElement>('.hero-photo,.story-photo').forEach(el=>{
        const rect=el.getBoundingClientRect();
        if(rect.bottom<0||rect.top>window.innerHeight)return;
        const offset=Math.max(-24,Math.min(24,(window.innerHeight/2-rect.top-rect.height/2)*.055));
        el.style.setProperty('--scroll-offset',`${offset}px`);
      });
      document.documentElement.style.setProperty('--scroll-progress',`${window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)}`);
    };
    const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
    window.addEventListener('scroll',onScroll,{passive:true});
    update();
    return()=>{observer.disconnect();changes.disconnect();window.removeEventListener('scroll',onScroll);cancelAnimationFrame(frame);document.querySelectorAll('.motion-item').forEach(el=>el.classList.remove('motion-item','motion-visible'))};
  },[path]);
}
