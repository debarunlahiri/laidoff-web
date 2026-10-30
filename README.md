# LayoffCircle

A responsive Next.js App Router prototype of a global professional community for career recovery, connections, referrals, and workforce transparency.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run typecheck` for TypeScript validation and `npm run build` for a production build.

## Included

- Email/password and Firebase Google authentication with an HttpOnly application session.
- API-backed feed search/filters, posting with image uploads, likes/dislikes, comments, reposts, bookmarks, hidden posts, and reviewed community context.
- Company autocomplete, people discovery, following, connection requests, and acceptance/decline.
- Referral creation, open/closed status, requests, and owner decisions.
- Private conversation creation from the network, message history, sending, read receipts, and inbox polling.
- Notifications and unread counts, with mark-read actions.
- Workforce dashboard using actual submitted backend reports and explicit unverified-data labels.
- Loading, failure, empty states, and pagination. Failed writes preserve composer input.

Data comes from the Node.js/MySQL backend at `BACKEND_API_URL`, default `http://127.0.0.1:9090/api/v1`. Copy `.env.example` to `.env.local` and configure that server-only URL when needed. The browser calls same-origin `/api/backend/*`; the Next.js server attaches the HttpOnly session token. Uploaded images are served through `/api/media/*`. Neither the bearer token nor backend credentials are exposed to browser JavaScript.

The files in `data/` remain historical fixtures and are not imported by the connected screens. Empty databases show empty states rather than fictional results. Google sign-in still needs the Firebase configuration described below. Runtime integration has not been verified under the instruction not to build or run either app.

## Project structure

| Directory                     | Responsibility                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `app/(platform)/`             | Next.js route pages and the shared platform layout                                                 |
| `components/layout/`          | App shell, sidebar, topbar, page heading, and discovery rail                                       |
| `components/feed/`            | Feed, post cards, comments, composer, and welcome banner                                           |
| `components/explore/`         | Search/discovery view and trending topics                                                          |
| `components/network/`         | Network view, person cards, and connection suggestions                                             |
| `components/referrals/`       | Referral view, opportunity cards, and suggestions                                                  |
| `components/insights/`        | Workforce view, chart, and company table                                                           |
| `components/messages/`        | Conversation view                                                                                  |
| `components/community-notes/` | Community Note display and proposal dialog                                                         |
| `components/profile/`         | Profile dialog                                                                                     |
| `components/ui/`              | Shared avatar, accessible dialog, and toast                                                        |
| `hooks/`                      | API fetching and mutations for feed, network, composer, messaging, notes, navigation, and feedback |
| `providers/`                  | Shared authenticated API state composition across routes                                           |
| `config/`                     | Navigation paths, page headings, and feed/topic options                                            |
| `data/`                       | Fictional posts, people, referrals, messages, trends, and workforce datasets                       |
| `types/`                      | Shared domain types                                                                                |
| `styles/`                     | Base, layout, feed, discovery, feature, dialog, and responsive styles                              |

## Routes

| URL          | Screen                 |
| ------------ | ---------------------- |
| `/`          | Global feed            |
| `/explore`   | Search and discovery   |
| `/network`   | Connections            |
| `/referrals` | Referral opportunities |
| `/insights`  | Workforce insights     |
| `/messages`  | Demo conversation      |
| `/bookmarks` | Saved posts            |

The protected route-group layout mounts one shared provider. Feature hooks fetch persisted data through authenticated server routes and refresh affected resources after mutations.

Use `npm run format` to format the source, or `npm run format:check` to check formatting.

## Authentication

Copy `.env.example` to `.env.local` and set the server-only `BACKEND_API_URL`. Start the Node.js backend with its MySQL database migrated. Open `/register` to create an email/password account, or `/login` to sign in. The app uses an HttpOnly session cookie through its own server routes, restores sessions after refresh, and includes sign-out in the account menu.

Google sign-in uses Firebase. Fill the four `NEXT_PUBLIC_FIREBASE_*` fields from your Firebase web app, enable the Google provider/authorized domains, and configure the same project ID plus Admin credentials in the backend environment. Restart/rebuild after changing public environment values. Google stays unavailable until configured. Existing email/password accounts link Google explicitly from the account menu. Keep service-account JSON and private keys out of this frontend.

For deployments behind a proxy, set `AUTH_APP_ORIGIN` to the public frontend origin if required. The backend's `AUTHENTICATION.md` documents the full setup. Feature screens now use the authenticated backend proxy.
