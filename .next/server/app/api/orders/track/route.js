"use strict";(()=>{var e={};e.id=5433,e.ids=[5433],e.modules={2934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5694:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>h,patchFetch:()=>x,requestAsyncStorage:()=>d,routeModule:()=>c,serverHooks:()=>m,staticGenerationAsyncStorage:()=>l});var s={};t.r(s),t.d(s,{GET:()=>p});var o=t(3278),a=t(5002),n=t(4877),i=t(1309),u=t(6660);async function p(e){let{searchParams:r}=new URL(e.url),t=r.get("orderNumber")?.trim(),s=r.get("phone")?.trim();if(!t)return i.NextResponse.json({error:"Order reference number is required."},{status:400});let o=(0,u.e)().from("orders").select(`
      id,
      order_number,
      status,
      created_at,
      total_paisa,
      guest_name,
      guest_phone,
      shipping_address,
      order_items (
        id,
        name_snapshot,
        size_snapshot,
        frame_snapshot,
        quantity,
        subtotal_paisa
      )
    `).eq("order_number",t);s&&(o=o.eq("guest_phone",s));let{data:a,error:n}=await o.single();return n||!a?i.NextResponse.json({error:"Order not found. Please double check your order number."},{status:404}):i.NextResponse.json(a)}let c=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/orders/track/route",pathname:"/api/orders/track",filename:"route",bundlePath:"app/api/orders/track/route"},resolvedPagePath:"C:\\affordable-decoration\\app\\api\\orders\\track\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:d,staticGenerationAsyncStorage:l,serverHooks:m}=c,h="/api/orders/track/route";function x(){return(0,n.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:l})}},6660:(e,r,t)=>{t.d(r,{e:()=>a});var s=t(7084),o=t(2845);function a(){let e=(0,o.cookies)();return(0,s.createServerClient)("https://placeholder-project.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder",{cookies:{get:r=>e.get(r)?.value,set(r,t,s){try{e.set({name:r,value:t,...s})}catch{}},remove(r,t){try{e.set({name:r,value:"",...t})}catch{}}}})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[7285,8485,4833],()=>t(5694));module.exports=s})();