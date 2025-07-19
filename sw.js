// public/sw.js - Service Worker basique
const CACHE_NAME = "ecowatch-v1";
const urlsToCache = [
  "/",
  "/locales/fr/common.json",
  "/locales/en/common.json",
  "/locales/mor/mor.json",
];

// Installation du service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache ouvert");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activation du service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Suppression du cache obsolète:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercepter les requêtes
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retourner la ressource depuis le cache si elle existe
      if (response) {
        return response;
      }

      // Sinon, aller chercher sur le réseau
      return fetch(event.request).then((response) => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Cloner la réponse
        const responseToCache = response.clone();

        // Mettre en cache pour la prochaine fois
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
