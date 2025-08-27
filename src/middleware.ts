// src/middleware.ts
export { default } from "next-auth/middleware"

// Пази /admin, НО не /admin/login
export const config = {
  matcher: ["/admin((?!/login).*)"],
}
