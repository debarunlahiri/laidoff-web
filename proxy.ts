import { NextResponse, type NextRequest } from "next/server";

// Sends phones to the mobile app (m.laidoffcircle.com) in production.
// Tablets and desktops stay here. Visitors can opt out with ?desktop=1, which
// is remembered for 30 days in the `view` cookie.
//
// MOBILE_SITE_ORIGIN overrides the target. MOBILE_REDIRECT=on forces the
// redirect outside production (to test it locally); =off disables it.
const mobileOrigin = (
  process.env.MOBILE_SITE_ORIGIN ?? "https://m.laidoffcircle.com"
).replace(/\/$/, "");

const phone =
  /iPhone|iPod|Android.+Mobile|Windows Phone|IEMobile|BlackBerry|BB10|Opera Mini|Opera Mobi|webOS|Mobile Safari|SamsungBrowser.+Mobile|\bSM-F\d|Pixel Fold|Surface Duo/i;
const bot = /bot|crawler|spider|crawling|facebookexternalhit|preview|slurp/i;

function isEnabled() {
  const flag = process.env.MOBILE_REDIRECT;
  if (flag === "off") return false;
  return flag === "on" || process.env.NODE_ENV === "production";
}

function isPhone(request: NextRequest) {
  const hint = request.headers.get("sec-ch-ua-mobile");
  if (hint === "?1") return true;
  const agent = request.headers.get("user-agent") ?? "";
  // iPadOS and Android tablets are treated as desktop-class screens.
  if (/iPad|Tablet/i.test(agent)) return false;
  return phone.test(agent);
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request;

  if (nextUrl.searchParams.get("desktop") === "1") {
    const clean = nextUrl.clone();
    clean.searchParams.delete("desktop");
    const response = NextResponse.redirect(clean);
    response.cookies.set("view", "desktop", {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }
  if (nextUrl.searchParams.get("mobile") === "1") {
    const clean = nextUrl.clone();
    clean.searchParams.delete("mobile");
    const response = NextResponse.redirect(clean);
    response.cookies.delete("view");
    return response;
  }

  const response = NextResponse.next();
  // The answer depends on who is asking; keep CDNs from mixing them up.
  response.headers.append("Vary", "User-Agent, Sec-CH-UA-Mobile");
  response.headers.set("Accept-CH", "Sec-CH-UA-Mobile");

  if (!isEnabled()) return response;
  if (request.cookies.get("view")?.value === "desktop") return response;
  const agent = request.headers.get("user-agent") ?? "";
  if (bot.test(agent) || !isPhone(request)) return response;

  const target = new URL(
    `${nextUrl.pathname}${nextUrl.search}`,
    mobileOrigin,
  );
  const redirect = NextResponse.redirect(target, 307);
  redirect.headers.set("Vary", "User-Agent, Sec-CH-UA-Mobile");
  redirect.headers.set("Cache-Control", "private, no-store");
  return redirect;
}

export const config = {
  // Pages only: API routes, Next internals, Firebase auth helpers, the admin
  // console (desktop-only) and static files are never redirected.
  matcher: [
    "/((?!api|admin|_next|__|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
