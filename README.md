# Stay Signed In to Microsoft 365

A tiny browser extension that stops Microsoft Teams and Outlook (in a tab or as
an installed PWA) from asking for your password every time you restart the
browser.

Built for IIT Guwahati accounts, where this happens to almost everyone. It
should help with any organisation whose Microsoft sign-in behaves the same way.

Works in Chrome, Brave, Edge and other Chromium browsers.

## Install

1. Download `ms-stay-signed-in.zip` from the
   [latest release](https://github.com/ronits2407/ms-stay-signed-in/releases/latest).
2. Unzip it somewhere permanent. The browser loads the extension from that
   folder, so don't delete it afterwards.
3. Open `chrome://extensions` (or `brave://extensions`, `edge://extensions`).
4. Turn on **Developer mode** (top right).
5. Click **Load unpacked** and pick the `ms-stay-signed-in` folder.
6. Sign in to Teams or Outlook one last time.

After that, closing and reopening the browser keeps you signed in. If you use
more than one browser or profile for Teams and Outlook, install it in each.

## Why you keep getting signed out

Microsoft's sign-in server (`login.microsoftonline.com`) remembers you with two
cookies:

| Cookie | Lifetime | Purpose |
| --- | --- | --- |
| `ESTSAUTH` | Until the browser exits | Your current sign-in session |
| `ESTSAUTHPERSISTENT` | 90 days | "Stay signed in?" across restarts |

The IIT Guwahati sign-in server does not accept `ESTSAUTHPERSISTENT` on its
own. Once the browser exits and `ESTSAUTH` is deleted, the server sees nobody
signed in and asks for the password again, even though the 90-day cookie is
still there.

## What the extension does

Whenever Microsoft sets `ESTSAUTH` or `ESTSAUTHLIGHT`, the extension rewrites
the same cookie with a 30-day expiry so it survives a restart. Each time you
use Teams or Outlook, Microsoft refreshes the cookie and the 30 days start
again.

- It only touches those two cookies on `login.microsoftonline.com`.
- It has no network code. Nothing is sent anywhere.
- It does not store your password and does not bypass MFA.

The whole thing is about 50 lines in [background.js](background.js).

## Limits

- If you don't open Teams or Outlook for a long time, Microsoft may still end
  the session on its side and ask you to sign in.
- Signing out inside Teams or Outlook still signs you out.

## Do not use on shared computers

On a lab or library machine this would leave your account signed in for the
next person. Install it only on your own device.

## Alternative without an extension

Browser Settings → On startup → **Continue where you left off**. The browser
then keeps session cookies for every site across restarts, which has a similar
effect but is less targeted.

## License

[MIT](LICENSE)
