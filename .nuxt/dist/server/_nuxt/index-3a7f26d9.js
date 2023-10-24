import { defineComponent, inject, computed, unref, ref, h, Suspense, nextTick, mergeProps, Transition, provide, useSSRContext, withCtx, createVNode, openBlock, createBlock, createCommentVNode } from "vue";
import { P as PageRouteSymbol, u as useRoute, a as appLayoutTransition, b as _wrapIf, d as useNuxtApp, L as LayoutMetaSymbol, _ as _export_sfc } from "../server.mjs";
import { useRoute as useRoute$1 } from "vue-router";
import __nuxt_component_1$1 from "./Icon-8e406d8d.js";
import "hookable";
import "destr";
import "devalue";
import "defu";
import "klona";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate } from "vue/server-renderer";
import { u as useHead } from "./index-6a088328.js";
import "ofetch";
import "#internal/nitro";
import "unctx";
import "unhead";
import "@unhead/shared";
import "h3";
import "ufo";
import "axios";
import "./config-2330fa1a.js";
import "@iconify/vue/dist/offline";
import "@iconify/vue";
const layouts = {
  default: () => import("./default-3ecb13e4.js").then((m) => m.default || m)
};
const LayoutLoader = /* @__PURE__ */ defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  async setup(props, context) {
    const LayoutComponent = await layouts[props.name]().then((r) => r.default || r);
    return () => h(LayoutComponent, props.layoutProps, context.slots);
  }
});
const __nuxt_component_0 = /* @__PURE__ */ defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean, Object],
      default: null
    }
  },
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const route = injectedRoute === useRoute() ? useRoute$1() : injectedRoute;
    const layout = computed(() => unref(props.name) ?? route.meta.layout ?? "default");
    const layoutRef = ref();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    return () => {
      const hasLayout = layout.value && layout.value in layouts;
      const transitionProps = route.meta.layoutTransition ?? appLayoutTransition;
      return _wrapIf(Transition, hasLayout && transitionProps, {
        default: () => h(Suspense, { suspensible: true, onResolve: () => {
          nextTick(done);
        } }, {
          default: () => h(
            // @ts-expect-error seems to be an issue in vue types
            LayoutProvider,
            {
              layoutProps: mergeProps(context.attrs, { ref: layoutRef }),
              key: layout.value,
              name: layout.value,
              shouldProvide: !props.name,
              hasTransition: !!transitionProps
            },
            context.slots
          )
        })
      }).default();
    };
  }
});
const LayoutProvider = /* @__PURE__ */ defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        isCurrent: (route) => name === (route.meta.layout ?? "default")
      });
    }
    return () => {
      var _a, _b;
      if (!name || typeof name === "string" && !(name in layouts)) {
        return (_b = (_a = context.slots).default) == null ? void 0 : _b.call(_a);
      }
      return h(
        // @ts-expect-error seems to be an issue in vue types
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ContactFormModal",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit }) {
    let fullName = ref("");
    let email = ref("");
    let message = ref("");
    function handleCloseModal() {
      emit("close");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed top-6 left-4 right-4 md:top-40 md:left-40 md:right-40 lg:right-1/3 lg:left-1/3 max-w-lg overflow-y-auto bg-white rounded-3xl p-4 shadow-2xl" }, _attrs))} data-v-22f33a31><div class="flex justify-end" data-v-22f33a31>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "uil:x",
        color: "#dc2626",
        size: "30px",
        class: "cursor-pointer brightness-100 hover:brightness-125",
        onClick: ($event) => handleCloseModal()
      }, null, _parent));
      _push(`</div><div class="mt-4" data-v-22f33a31><h2 class="text-3xl text-[#F2664A]" data-v-22f33a31>Let&#39;s talk</h2><p class="font-extralight mt-4 text-justify" data-v-22f33a31> If you would like to schedule a meeting for a conversation, whether it&#39;s for a coffee or any other purpose, please don&#39;t hesitate to get in touch with me directly or fill out the form below. I will be delighted to get in touch with you as soon as possible. </p></div><div class="mt-6" data-v-22f33a31><form data-v-22f33a31><div class="mt-6" data-v-22f33a31><label for="fullName" class="block text-lg text-primary-dark font-extralight text-sm" data-v-22f33a31>Your Name</label><input name="fullName" id="fullName" type="text" class="w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md"${ssrRenderAttr("value", unref(fullName))} required data-v-22f33a31></div><div class="mt-6" data-v-22f33a31><label for="email" class="block text-lg text-primary-dark font-extralight text-sm" data-v-22f33a31>Your Email</label><input name="email" id="email" type="text" class="w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md"${ssrRenderAttr("value", unref(email))} required data-v-22f33a31></div><div class="mt-6" data-v-22f33a31><label for="message" class="block text-lg text-primary-dark font-extralight text-sm" data-v-22f33a31>Your Message</label><textarea name="message" id="message" cols="14" rows="6" aria-label="Message" class="w-full px-5 py-2 border border-gray-300 border-opacity-50 text-primary-dark bg-ternary-light rounded-md shadow-sm text-md" required data-v-22f33a31>${ssrInterpolate(unref(message))}</textarea></div><div class="mt-6" data-v-22f33a31><button type="submit" title="Send Message" aria-label="Send Message" class="px-12 py-2.5 text-white tracking-wider bg-[#F2664A] hover:bg-orange-400 focus:ring-1 focus:ring-indigo-900 rounded-3xl duration-500 shadow-xl" data-v-22f33a31> Send Message </button></div></form></div><div data-v-22f33a31></div></div>`);
    };
  }
});
const ContactFormModal_vue_vue_type_style_index_0_scoped_22f33a31_lang = "";
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ContactFormModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-22f33a31"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Ilmar Lopez | Official Website"
    });
    let showContactFormModal = ref(false);
    function handleClose() {
      showContactFormModal.value = false;
    }
    function openContactFormModal() {
      showContactFormModal.value = true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLayout = __nuxt_component_0;
      const _component_ContactFormModal = __nuxt_component_1;
      _push(ssrRenderComponent(_component_NuxtLayout, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section id="home" class="h-full flex justify-center items-center"${_scopeId}><div${_scopeId}><h1 class="font-bold text-4xl title text-center mb-4 hover:"${_scopeId}> Hi I&#39;m Ilmar Lopez </h1><div${_scopeId}><p class="lead-paragraph text-center mx-auto max-w-lg"${_scopeId}> I&#39;m a dedicated full-stack developer focused on crafting innovative digital solutions. My passion is pushing boundaries, embracing new challenges, and continually expanding my knowledge. </p><div class="grid justify-items-center mt-8"${_scopeId}><button class="btn-contact shadow-2xl text-white px-10 py-4 uppercase hidden"${_scopeId}> Say hi </button></div></div></div></section>`);
            if (unref(showContactFormModal)) {
              _push2(ssrRenderComponent(_component_ContactFormModal, { onClose: handleClose }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("section", {
                id: "home",
                class: "h-full flex justify-center items-center"
              }, [
                createVNode("div", null, [
                  createVNode("h1", { class: "font-bold text-4xl title text-center mb-4 hover:" }, " Hi I'm Ilmar Lopez "),
                  createVNode("div", null, [
                    createVNode("p", { class: "lead-paragraph text-center mx-auto max-w-lg" }, " I'm a dedicated full-stack developer focused on crafting innovative digital solutions. My passion is pushing boundaries, embracing new challenges, and continually expanding my knowledge. "),
                    createVNode("div", { class: "grid justify-items-center mt-8" }, [
                      createVNode("button", {
                        class: "btn-contact shadow-2xl text-white px-10 py-4 uppercase hidden",
                        onClick: openContactFormModal
                      }, " Say hi ")
                    ])
                  ])
                ])
              ]),
              unref(showContactFormModal) ? (openBlock(), createBlock(_component_ContactFormModal, {
                key: 0,
                onClose: handleClose
              })) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const index_vue_vue_type_style_index_0_lang = "";
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-3a7f26d9.js.map
