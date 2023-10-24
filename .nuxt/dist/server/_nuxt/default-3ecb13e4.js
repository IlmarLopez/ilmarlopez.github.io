import { _ as __nuxt_component_1 } from "./nuxt-link-fd71f487.js";
import __nuxt_component_1$1 from "./Icon-8e406d8d.js";
import { mergeProps, withCtx, createVNode, useSSRContext, createTextVNode } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrInterpolate } from "vue/server-renderer";
import { _ as _export_sfc } from "../server.mjs";
import "ufo";
import "hookable";
import "destr";
import "devalue";
import "defu";
import "./config-2330fa1a.js";
import "klona";
import "@iconify/vue/dist/offline";
import "@iconify/vue";
import "ofetch";
import "#internal/nitro";
import "unctx";
import "unhead";
import "@unhead/shared";
import "vue-router";
import "h3";
import "axios";
const _sfc_main$1 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_1;
  const _component_Icon = __nuxt_component_1$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_NuxtLink, { to: "https://github.com/IlmarLopez" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="mr-2 rounded-full p-2 border border-gray-700 hover:border-[#F2664A]"${_scopeId}>`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "uil:github-alt",
          color: "#6C757D",
          size: "25px"
        }, null, _parent2, _scopeId));
        _push2(`</div>`);
      } else {
        return [
          createVNode("div", { class: "mr-2 rounded-full p-2 border border-gray-700 hover:border-[#F2664A]" }, [
            createVNode(_component_Icon, {
              name: "uil:github-alt",
              color: "#6C757D",
              size: "25px"
            })
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, { to: "https://mx.linkedin.com/in/ilmarlopez" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="mr-2 rounded-full p-2 border border-gray-700 hover:border-[#F2664A]"${_scopeId}>`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "uil:linkedin-alt",
          color: "#6C757D",
          size: "25px"
        }, null, _parent2, _scopeId));
        _push2(`</div>`);
      } else {
        return [
          createVNode("div", { class: "mr-2 rounded-full p-2 border border-gray-700 hover:border-[#F2664A]" }, [
            createVNode(_component_Icon, {
              name: "uil:linkedin-alt",
              color: "#6C757D",
              size: "25px"
            })
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, { to: "https://www.facebook.com/ilmar.lopezr" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="mr-2 rounded-full p-2 border border-gray-700 hover:border-[#F2664A]"${_scopeId}>`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "uil:facebook-f",
          color: "#6C757D",
          size: "25px"
        }, null, _parent2, _scopeId));
        _push2(`</div>`);
      } else {
        return [
          createVNode("div", { class: "mr-2 rounded-full p-2 border border-gray-700 hover:border-[#F2664A]" }, [
            createVNode(_component_Icon, {
              name: "uil:facebook-f",
              color: "#6C757D",
              size: "25px"
            })
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, { to: "https://wa.me/526647291355" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<div class="mr-2 rounded-full p-2 border border-gray-700 hover:border-[#F2664A]"${_scopeId}>`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "uil:whatsapp",
          color: "#6C757D",
          size: "25px"
        }, null, _parent2, _scopeId));
        _push2(`</div>`);
      } else {
        return [
          createVNode("div", { class: "mr-2 rounded-full p-2 border border-gray-700 hover:border-[#F2664A]" }, [
            createVNode(_component_Icon, {
              name: "uil:whatsapp",
              color: "#6C757D",
              size: "25px"
            })
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SocialInfo.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1]]);
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_SocialInfo = __nuxt_component_0;
  const _component_NuxtLink = __nuxt_component_1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid grid-rows-[1fr,auto] min-h-screen bg-[#F5F3EB]" }, _attrs))}><main class="container mx-auto z-0 px-4 py-6 lg:px-0">`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(ssrRenderComponent(_component_SocialInfo, { class: "fixed bottom-2 left-2" }, null, _parent));
  _push(`</main><footer class="flex justify-items-start p-3"><div class="flex justify-end w-full"><div>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "mailto:me@ilmarlopez.com",
    class: "lead-paragraph"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`me@ilmarlopez.com`);
      } else {
        return [
          createTextVNode("me@ilmarlopez.com")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<p class="font-extralight text-xs"> Porfolio ©${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} <span class="text-red-600">♥️</span></p></div></div></footer></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  _default as default
};
//# sourceMappingURL=default-3ecb13e4.js.map
