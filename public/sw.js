self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
// No fetch handler — all requests go to the network normally.
// This SW exists only to enable PWA installation and the share_target manifest feature.
