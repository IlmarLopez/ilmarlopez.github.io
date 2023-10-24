import P from"./Icon.37efd418.js";import{f as p,r as c,o as v,g as b,w as C,a as e,b as N,h as k,i as h,j as x,v as g,k as m,T as L,p as I,e as j,l as S,_ as A,m as B,n as F,q as T,s as R,x as w,y as V,z as q,P as z,A as y,B as O,C as $,S as E,D as H,L as U,u as Y,E as D}from"./entry.56d61a3e.js";import"./config.f80aa8f6.js";const f=o=>(I("data-v-22f33a31"),o=o(),j(),o),W={class:"fixed top-6 left-4 right-4 md:top-40 md:left-40 md:right-40 lg:right-1/3 lg:left-1/3 max-w-lg overflow-y-auto bg-white rounded-3xl p-4 shadow-2xl"},G={class:"flex justify-end"},J=f(()=>e("div",{class:"mt-4"},[e("h2",{class:"text-3xl text-[#F2664A]"},"Let's talk"),e("p",{class:"font-extralight mt-4 text-justify"}," If you would like to schedule a meeting for a conversation, whether it's for a coffee or any other purpose, please don't hesitate to get in touch with me directly or fill out the form below. I will be delighted to get in touch with you as soon as possible. ")],-1)),K={class:"mt-6"},Q=["onSubmit"],X={class:"mt-6"},Z=f(()=>e("label",{for:"fullName",class:"block text-lg text-primary-dark font-extralight text-sm"},"Your Name",-1)),ee={class:"mt-6"},te=f(()=>e("label",{for:"email",class:"block text-lg text-primary-dark font-extralight text-sm"},"Your Email",-1)),oe={class:"mt-6"},ae=f(()=>e("label",{for:"message",class:"block text-lg text-primary-dark font-extralight text-sm"},"Your Message",-1)),se=f(()=>e("div",{class:"mt-6"},[e("button",{type:"submit",title:"Send Message","aria-label":"Send Message",class:"px-12 py-2.5 text-white tracking-wider bg-[#F2664A] hover:bg-orange-400 focus:ring-1 focus:ring-indigo-900 rounded-3xl duration-500 shadow-xl"}," Send Message ")],-1)),ne=p({__name:"ContactFormModal",emits:["close"],setup(o,{emit:a}){const{$api:s}=S();let t=c(""),l=c(""),r=c("");function d(){a("close")}function u(){s.post("/contact.php",{fullName:t.value,email:l.value,message:r.value}).then(()=>{console.log("Correo enviado con éxito")}).catch(_=>{console.error("Error al enviar el correo",_)})}return(_,n)=>{const M=P;return v(),b(L,{name:"modal-fade"},{default:C(()=>[e("div",W,[e("div",G,[N(M,{name:"uil:x",color:"#dc2626",size:"30px",class:"cursor-pointer brightness-100 hover:brightness-125",onClick:n[0]||(n[0]=i=>d())})]),J,e("div",K,[e("form",{onSubmit:k(u,["prevent"])},[e("div",X,[Z,h(e("input",{name:"fullName",id:"fullName",type:"text",class:"w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md","onUpdate:modelValue":n[1]||(n[1]=i=>x(t)?t.value=i:t=i),required:""},null,512),[[g,m(t)]])]),e("div",ee,[te,h(e("input",{name:"email",id:"email",type:"text",class:"w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md","onUpdate:modelValue":n[2]||(n[2]=i=>x(l)?l.value=i:l=i),required:""},null,512),[[g,m(l)]])]),e("div",oe,[ae,h(e("textarea",{name:"message",id:"message",cols:"14",rows:"6","aria-label":"Message",class:"w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md","onUpdate:modelValue":n[3]||(n[3]=i=>x(r)?r.value=i:r=i),required:""},null,512),[[g,m(r)]])]),se],40,Q)]),e("div",{onClick:n[4]||(n[4]=k(()=>{},["stop"]))})])]),_:1})}}});const le=A(ne,[["__scopeId","data-v-22f33a31"]]),re=p({name:"LayoutLoader",inheritAttrs:!1,props:{name:String,layoutProps:Object},async setup(o,a){const s=await w[o.name]().then(t=>t.default||t);return()=>y(s,o.layoutProps,a.slots)}}),ie=p({name:"NuxtLayout",inheritAttrs:!1,props:{name:{type:[String,Boolean,Object],default:null}},setup(o,a){const s=S(),t=B(z),l=t===F()?T():t,r=R(()=>m(o.name)??l.meta.layout??"default"),d=c();a.expose({layoutRef:d});const u=s.deferHydration();return()=>{const _=r.value&&r.value in w,n=l.meta.layoutTransition??V;return q(L,_&&n,{default:()=>y(E,{suspensible:!0,onResolve:()=>{$(u)}},{default:()=>y(de,{layoutProps:O(a.attrs,{ref:d}),key:r.value,name:r.value,shouldProvide:!o.name,hasTransition:!!n},a.slots)})}).default()}}}),de=p({name:"NuxtLayoutProvider",inheritAttrs:!1,props:{name:{type:[String,Boolean]},layoutProps:{type:Object},hasTransition:{type:Boolean},shouldProvide:{type:Boolean}},setup(o,a){const s=o.name;return o.shouldProvide&&H(U,{isCurrent:t=>s===(t.meta.layout??"default")}),()=>{var t,l;return!s||typeof s=="string"&&!(s in w)?(l=(t=a.slots).default)==null?void 0:l.call(t):y(re,{key:s,layoutProps:o.layoutProps,name:s},a.slots)}}}),ue=e("h1",{class:"font-bold text-4xl title text-center mb-4 hover:"}," Hi I'm Ilmar Lopez ",-1),ce=e("p",{class:"lead-paragraph text-center mx-auto max-w-lg"}," I'm a dedicated full-stack developer focused on crafting innovative digital solutions. My passion is pushing boundaries, embracing new challenges, and continually expanding my knowledge. ",-1),_e=p({__name:"index",setup(o){Y({title:"Ilmar Lopez | Official Website"});let a=c(!1);function s(){a.value=!1}function t(){a.value=!0}return(l,r)=>{const d=le,u=ie;return v(),b(u,null,{default:C(()=>[e("section",{id:"home",class:"h-full flex justify-center items-center"},[e("div",null,[ue,e("div",null,[ce,e("div",{class:"grid justify-items-center mt-8"},[e("button",{class:"btn-contact shadow-2xl text-white px-10 py-4 uppercase hidden",onClick:t}," Say hi ")])])])]),m(a)?(v(),b(d,{key:0,onClose:s})):D("",!0)]),_:1})}}});export{_e as default};
