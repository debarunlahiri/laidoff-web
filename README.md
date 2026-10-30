# LayoffCircle

A responsive Next.js App Router prototype of a global professional community for career recovery, connections, referrals, and workforce transparency.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run typecheck` for TypeScript validation and `npm run build` for a production build.

## Included

- Global feed with For you, Following, Latest, Layoff updates, and Referrals filters.
- Public post creation with optional topic/company and anonymous identity.
- Support reactions, comments, reposts, bookmarks, and following.
- People discovery, connection requests, and referral requests.
- Searchable conversations, demo messaging, notifications, and profile.
- Workforce dashboard with year selection and clearly illustrative figures.
- Community Note proposals with source URLs and review labels.
- Responsive layouts and Lucide SVG icons.

All people, companies, opportunities, messages, and statistics are fictional. Interactions are held in React state and reset on page refresh. Authentication, employment verification, real messaging, backend persistence, uploads, and moderation services are not connected. No résumé or personal information is transmitted by referral requests.

## Project structure

| Directory                     | Responsibility                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `app/(platform)/`             | Next.js route pages and the shared platform layout                                                |
| `components/layout/`          | App shell, sidebar, topbar, page heading, and discovery rail                                      |
| `components/feed/`            | Feed, post cards, comments, composer, and welcome banner                                          |
| `components/explore/`         | Search/discovery view and trending topics                                                         |
| `components/network/`         | Network view, person cards, and connection suggestions                                            |
| `components/referrals/`       | Referral view, opportunity cards, and suggestions                                                 |
| `components/insights/`        | Workforce view, chart, and company table                                                          |
| `components/messages/`        | Conversation view                                                                                 |
| `components/community-notes/` | Community Note display and proposal dialog                                                        |
| `components/profile/`         | Profile dialog                                                                                    |
| `components/ui/`              | Shared avatar, accessible dialog, and toast                                                       |
| `hooks/`                      | Feature state and actions for feed, network, composer, messaging, notes, navigation, and feedback |
| `providers/`                  | Shared demo state composition across routes                                                       |
| `config/`                     | Navigation paths, page headings, and feed/topic options                                           |
| `data/`                       | Fictional posts, people, referrals, messages, trends, and workforce datasets                      |
| `types/`                      | Shared domain types                                                                               |
| `styles/`                     | Base, layout, feed, discovery, feature, dialog, and responsive styles                             |

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

The route-group layout mounts one shared provider so demo actions remain available when navigating between screens. Feature hooks own updates and components render their relevant UI. Refreshing the browser resets the demo state.

Use `npm run format` to format the source, or `npm run format:check` to check formatting.
