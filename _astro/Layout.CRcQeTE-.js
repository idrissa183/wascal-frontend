import { e as createAstro, c as createComponent, a as renderTemplate, b as renderScript, f as defineScriptVars, g as renderSlot, h as renderHead, d as addAttribute } from './astro/server.DhtUQlNh.js';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
/* empty css                               */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://idrissa183.github.io");
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title = "EcoWatch - Surveillance Environnementale",
    description = "Plateforme de surveillance environnementale et climatique basée sur Google Earth Engine",
    requireAuth = false,
    requireGuest = false
  } = Astro2.props;
  const isDev = false;
  return renderTemplate(_a || (_a = __template(['<html lang="fr"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"', "><title>", '</title><meta name="description"', '><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:title"', '><meta property="og:description"', '><!-- Twitter --><meta property="twitter:card" content="summary_large_image"><meta property="twitter:url"', '><meta property="twitter:title"', '><meta property="twitter:description"', `><!-- Preconnect to important domains --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><!-- Theme color for mobile browsers --><meta name="theme-color" content="#4f46e5"><!-- React Refresh Preamble pour éviter l'erreur --><script type="module">`, '\n      if (isDev) {\n        // Inject React refresh preamble for development\n        window.__vite_plugin_react_preamble_installed__ = true;\n\n        // Setup React refresh\n        if (typeof window !== "undefined") {\n          window.$RefreshReg$ = () => {};\n          window.$RefreshSig$ = () => (type) => type;\n        }\n      }\n    </script>', '</head> <body> <div id="app"> ', " </div> <!-- Script d'initialisation globale de l'authentification --> ", " <!-- Script pour définir les attributs data sur body --> <script>(function(){", '\n      if (requireAuth) {\n        document.body.dataset.requireAuth = "true";\n      }\n      if (requireGuest) {\n        document.body.dataset.requireGuest = "true";\n      }\n    })();</script> <!-- Script pour gérer les erreurs globales --> ', " </body> </html> "])), addAttribute(Astro2.generator, "content"), title, addAttribute(description, "content"), addAttribute(Astro2.url, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(Astro2.url, "content"), addAttribute(title, "content"), addAttribute(description, "content"), defineScriptVars({ isDev }), renderHead(), renderSlot($$result, $$slots["default"]), renderScript($$result, "/home/idrissa183/Documents/PFE/Idrissa/project/frontend/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts"), defineScriptVars({ requireAuth, requireGuest }), renderScript($$result, "/home/idrissa183/Documents/PFE/Idrissa/project/frontend/src/layouts/Layout.astro?astro&type=script&index=1&lang.ts"));
}, "/home/idrissa183/Documents/PFE/Idrissa/project/frontend/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
