import k from"./Icon.638ccaf9.js";import{n as u,r as d,_ as x,o as h,q as _,w as v,a as o,b as C,s as f,v as y,u as S,T as w,p as $,e as M,x as P,y as L,z as F,A as N,B as g,C as I,D as j,E as A,P as T,F as c,G as B,H as R,I as O,S as V,J as E,L as Y,K as z}from"./entry.df75395e.js";import"./config.1db93110.js";const D="661f609d-7c79-4cfd-8325-9da6c4b4d14e",H=u({emits:["close"],setup(){let e=d(""),t=d(""),s=d("");async function a(){const l=await(await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({access_key:D,name:e.value,email:t.value,message:s.value})})).json();l.success&&console.debug(l)}return{fullName:e,email:t,message:s,submitForm:a}}});const m=e=>($("data-v-f49cf2b1"),e=e(),M(),e),U={class:"modal-overlay bg-white rounded-3xl p-4 shadow-2xl"},J={class:"flex justify-end"},K=m(()=>o("div",{class:"mt-4"},[o("h2",{class:"text-3xl text-[#F2664A]"},"Let's talk"),o("p",{class:"font-extralight mt-4 text-justify"}," If you would like to schedule a meeting for a conversation, whether it's for a coffee or any other purpose, please don't hesitate to get in touch with me directly or fill out the form below. I will be delighted to get in touch with you as soon as possible. ")],-1)),q={class:"mt-6"},G={class:"mt-6"},W=m(()=>o("label",{for:"fullName",class:"block text-lg text-primary-dark font-extralight"},"Your Name",-1)),Q={class:"mt-6"},X=m(()=>o("label",{for:"email",class:"block text-lg text-primary-dark font-extralight"},"Your Email",-1)),Z={class:"mt-6"},ee=m(()=>o("label",{for:"message",class:"block text-lg text-primary-dark font-extralight"},"Your Message",-1)),te={class:"mt-6"};function oe(e,t,s,a,r,l){const i=k;return h(),_(w,{name:"modal-fade"},{default:v(()=>[o("div",U,[o("div",J,[C(i,{name:"uil:x",color:"#dc2626",size:"30px",class:"cursor-pointer brightness-100 hover:brightness-125",onClick:t[0]||(t[0]=n=>e.$emit("close"))})]),K,o("div",q,[o("form",{onSubmit:t[5]||(t[5]=n=>n.preventDefault)},[o("div",G,[W,f(o("input",{name:"fullName",type:"text",class:"w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md","onUpdate:modelValue":t[1]||(t[1]=n=>e.fullName=n)},null,512),[[y,e.fullName]])]),o("div",Q,[X,f(o("input",{name:"email",type:"text",class:"w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md","onUpdate:modelValue":t[2]||(t[2]=n=>e.email=n)},null,512),[[y,e.email]])]),o("div",Z,[ee,f(o("textarea",{name:"message",cols:"14",rows:"6","aria-label":"Message",class:"w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md","onUpdate:modelValue":t[3]||(t[3]=n=>e.message=n)},null,512),[[y,e.message]])]),o("div",te,[o("button",{type:"submit",title:"Send Message","aria-label":"Send Message",class:"px-12 py-2.5 text-white tracking-wider bg-[#F2664A] hover:bg-orange-400 focus:ring-1 focus:ring-indigo-900 rounded-3xl duration-500 shadow-xl",onClick:t[4]||(t[4]=(...n)=>e.submitForm&&e.submitForm(...n))},"Send Message")])],32)]),o("div",{onClick:t[6]||(t[6]=S(()=>{},["stop"]))})])]),_:1})}const se=x(H,[["render",oe],["__scopeId","data-v-f49cf2b1"]]),ae=u({name:"LayoutLoader",inheritAttrs:!1,props:{name:String,layoutProps:Object},async setup(e,t){const s=await g[e.name]().then(a=>a.default||a);return()=>c(s,e.layoutProps,t.slots)}}),ne=u({name:"NuxtLayout",inheritAttrs:!1,props:{name:{type:[String,Boolean,Object],default:null}},setup(e,t){const s=A(),a=P(T),r=a===L()?F():a,l=N(()=>B(e.name)??r.meta.layout??"default"),i=d();t.expose({layoutRef:i});const n=s.deferHydration();return()=>{const p=l.value&&l.value in g,b=r.meta.layoutTransition??I;return j(w,p&&b,{default:()=>c(V,{suspensible:!0,onResolve:()=>{O(n)}},{default:()=>c(le,{layoutProps:R(t.attrs,{ref:i}),key:l.value,name:l.value,shouldProvide:!e.name,hasTransition:!!b},t.slots)})}).default()}}}),le=u({name:"NuxtLayoutProvider",inheritAttrs:!1,props:{name:{type:[String,Boolean]},layoutProps:{type:Object},hasTransition:{type:Boolean},shouldProvide:{type:Boolean}},setup(e,t){const s=e.name;return e.shouldProvide&&E(Y,{isCurrent:a=>s===(a.meta.layout??"default")}),()=>{var a,r;return!s||typeof s=="string"&&!(s in g)?(r=(a=t.slots).default)==null?void 0:r.call(a):c(ae,{key:s,layoutProps:e.layoutProps,name:s},t.slots)}}}),re=u({setup(){let e=d(!1);function t(){e.value=!1}function s(){e.value=!0}return{showContactFormModal:e,handleClose:t,openContactFormModal:s}}});const ie={id:"home",class:"h-full flex items-center justify-center"},de={class:"w-1/2"},ue=o("h1",{class:"font-bold text-4xl title text-center mb-6 hover:"},"Hi I'm Ilmar Lopez",-1),ce=o("p",{class:"lead-paragraph text-center mb-8"}," I'm a dedicated full-stack developer focused on crafting innovative digital solutions. My passion is pushing boundaries, embracing new challenges, and continually expanding my knowledge. ",-1),me={class:"text-center"};function pe(e,t,s,a,r,l){const i=se,n=ne;return h(),_(n,null,{default:v(()=>[o("section",ie,[o("div",de,[ue,o("div",null,[ce,o("div",me,[o("button",{class:"btn-contact shadow-2xl text-white px-10 py-4 uppercase",onClick:t[0]||(t[0]=(...p)=>e.openContactFormModal&&e.openContactFormModal(...p))}," Say hi ")])])])]),e.showContactFormModal?(h(),_(i,{key:0,onClose:e.handleClose},null,8,["onClose"])):z("",!0)]),_:1})}const _e=x(re,[["render",pe]]);export{_e as default};
