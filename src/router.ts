import { Router } from "@vaadin/router";

const router = new Router(document.querySelector(".root"));
router.setRoutes([
  { path: "/", component: "home-page" },
  { path: "/signin", component: "signin-page" },
  { path: "/signup", component: "signup-page" },
  { path: "/chat", component: "chat-page" },
  { path: "/Room", component: "room-page" },
]);
