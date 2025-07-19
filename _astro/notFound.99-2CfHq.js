import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './astro/server.DhtUQlNh.js';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Layout } from './Layout.BMIBwRy1.js';

const $$NotFound = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "404 - Page introuvable" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center py-24 text-center space-y-6"> <h1 class="text-5xl font-bold">404</h1> <p class="text-lg">Désolé, la page que vous cherchez n'existe pas.</p> <a href="/dashboard" class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Retour à l'accueil</a> </div> ` })}`;
}, "/home/idrissa183/Documents/PFE/Idrissa/project/frontend/src/pages/notFound.astro", void 0);

const $$file = "/home/idrissa183/Documents/PFE/Idrissa/project/frontend/src/pages/notFound.astro";
const $$url = "/notFound";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$NotFound,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { $$NotFound as $, _page as _ };
