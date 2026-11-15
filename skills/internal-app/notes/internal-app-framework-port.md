---
id: internal-app-framework-port
topic: internal-app
summary: Port a Next.js, Remix, or Vite single-page app to a new internal app route by route, because a conversion in place does not work.
keywords: [port an app, other framework, next.js, nextjs, remix, vite spa, single-page app, rewrite, new app, side by side, switch traffic, framework doctor row]
related: [internal-app-upgrade, internal-app-migration-map, internal-app-server-functions]
---

# Port An App From Another Framework

Do not convert a Next.js, Remix, or Vite single-page app in place. The routing, the data loading, and the server models are too different for a swap page by page. The `framework` row of `doctor` fails for these apps.

Ask the user before you start this path. It is a project, not a refactor.

## Steps

1. Create a new app with `new`.
2. Port the server logic first. The Effect services, the schemas, and the repositories move with few changes. Wrap their entry points in server functions that call `runServerFn`.
3. Port one route at a time with the kit. Start with the page that people use most. [[internal-app-migration-map]] gives the kit replacement for each legacy component, class, and library.
4. Run the two apps side by side until the new app has each route. Then move the traffic to the new app.
