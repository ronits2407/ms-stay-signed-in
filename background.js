// Microsoft's sign-in server keeps you signed in with a cookie called ESTSAUTH.
// It is a "session cookie" (no expiry date), so the browser throws it away on
// exit. Some organisations' sign-in servers ignore the long-lived companion
// cookie (ESTSAUTHPERSISTENT), so losing ESTSAUTH means typing the password
// again after every browser restart.
//
// This extension gives those session cookies an expiry date so they survive a
// restart. It never reads, logs or sends the cookie anywhere: it only rewrites
// the same cookie, in the same browser, with an expiry attached.

const LOGIN_URL = 'https://login.microsoftonline.com/';
const LOGIN_DOMAIN = 'login.microsoftonline.com';
const COOKIE_NAMES = new Set(['ESTSAUTH', 'ESTSAUTHLIGHT']);
const KEEP_DAYS = 30;

function isTarget(cookie) {
  const domain = cookie.domain.replace(/^\./, '');
  return cookie.session && COOKIE_NAMES.has(cookie.name) && domain === LOGIN_DOMAIN;
}

async function persist(cookie) {
  if (!isTarget(cookie)) return;
  const details = {
    url: LOGIN_URL,
    name: cookie.name,
    value: cookie.value,
    path: cookie.path,
    secure: cookie.secure,
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    storeId: cookie.storeId,
    expirationDate: Math.floor(Date.now() / 1000) + KEEP_DAYS * 24 * 60 * 60,
  };
  if (!cookie.hostOnly) details.domain = cookie.domain;
  if (cookie.partitionKey) details.partitionKey = cookie.partitionKey;
  try {
    await chrome.cookies.set(details);
  } catch (err) {
    console.warn('Could not persist', cookie.name, err);
  }
}

async function sweep() {
  const cookies = await chrome.cookies.getAll({ domain: LOGIN_DOMAIN, session: true });
  await Promise.all(cookies.map(persist));
}

// Fires whenever Microsoft sets or refreshes the cookie. Our own rewrite also
// fires this, but by then the cookie is no longer a session cookie, so it is
// ignored and there is no loop.
chrome.cookies.onChanged.addListener(({ removed, cookie }) => {
  if (!removed) persist(cookie);
});

chrome.runtime.onInstalled.addListener(sweep);
chrome.runtime.onStartup.addListener(sweep);
