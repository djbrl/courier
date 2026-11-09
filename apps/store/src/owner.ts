import { createHmac, timingSafeEqual } from "node:crypto";
import { config, findShop, type Shop } from "@courier/shared";
import type { NextFunction, Request, Response } from "express";

/*
 * A shop owner's sign-in to their desk. The demo has no passwords: picking a shop signs you in as its owner, and the
 * cookie only opens that shop's desk. A real shop would put its own sign-in here; the desk checks the same cookie.
 */

const COOKIE = "desk_owner";
const SECURE = config.store.url.startsWith("https://");
const DAYS = 30;

/** The demo opens on the burger place: its desk always has something going on. */
export const DEFAULT_OWNER_SHOP = "floor-dash";

const sign = (slug: string) =>
  createHmac("sha256", config.sessionSecret).update(`${COOKIE}:${slug}`).digest("base64url");

function cookie(req: Request<any>): string | undefined {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const at = part.indexOf("=");
    if (at > 0 && part.slice(0, at).trim() === COOKIE) return decodeURIComponent(part.slice(at + 1).trim());
  }
  return undefined;
}

/** The shop whose owner is signed in here, if any. */
export function ownerShop(req: Request<any>): Shop | undefined {
  const raw = cookie(req);
  const at = raw?.lastIndexOf(".") ?? -1;
  if (!raw || at < 0) return undefined;
  const slug = raw.slice(0, at);
  const expected = Buffer.from(sign(slug));
  const given = Buffer.from(raw.slice(at + 1));
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return undefined;
  return findShop(slug);
}

export function signInOwner(res: Response, shop: Shop): void {
  res.append(
    "Set-Cookie",
    `${COOKIE}=${encodeURIComponent(`${shop.slug}.${sign(shop.slug)}`)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DAYS * 86400}${SECURE ? "; Secure" : ""}`,
  );
}

export function signOutOwner(res: Response): void {
  res.append("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${SECURE ? "; Secure" : ""}`);
}

export const ownsShop = (req: Request<any>, slug: string) => ownerShop(req)?.slug === slug;

/** For a desk page: anyone else is sent to sign in, with the shop already picked. */
export function ownerPage(req: Request<any>, res: Response, next: NextFunction): void {
  const slug = String(req.params.slug ?? "");
  // The data has its own guard, which answers in JSON rather than with a sign-in page.
  if (!findShop(slug) || ownsShop(req, slug) || req.params.view === "api") {
    next();
    return;
  }
  res.redirect(302, `/desk/sign-in?shop=${encodeURIComponent(slug)}`);
}

/** For the desk's data and buttons: only the owner. */
export function ownerApi(req: Request<{ slug: string }>, res: Response, next: NextFunction): void {
  const slug = String(req.params.slug ?? "");
  if (!findShop(slug) || ownsShop(req, slug)) {
    next();
    return;
  }
  res.status(401).json({ error: "sign_in", message: "Sign in as this shop's owner first." });
}
