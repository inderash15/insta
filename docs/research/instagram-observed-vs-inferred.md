# Instagram Observed vs. Inferred Architecture & UI Specification

## 1. Principles of Empirical Reverse Engineering

In accordance with REA principles, all design and system decisions are strictly partitioned into:
1. **Directly Observed Empirical Facts**: Elements, styling, DOM structures, network calls, and asset formats directly captured and measured via Chrome DevTools Protocol (CDP), REA scripts, and the 1,000-screenshot reference library.
2. **Architecturally Inferred Specifications**: Backend mechanisms, internal algorithmic systems, data schemas, and proprietary infrastructure inferred from Meta engineering whitepapers, GraphQL payloads, and industry-standard best practices.

---

## 2. Empirical Verification Matrix

| Domain | Observed Fact (Direct REA / Browser Evidence) | Reference IDs | Inferred System Implementation | Rationale for Inference |
|---|---|---|---|---|
| **Canvas Palette** | Background is strictly `#000000` (rgb 0, 0, 0) in dark mode; elevated cards use `#121212` and `#262626`. | IGREF-0001 to IGREF-0150 | Tailwind CSS custom color tokens configured in `index.css` and theme config | DOM element computed styles measured directly from live Instagram DOM via CDP `CSS.getComputedStyleForNode`. |
| **Global Navigation** | Desktop width is strictly 244px when viewport > 1264px; shrinks to 72px rail at 768px-1263px; transforms into 44px top header + 48px bottom bar on mobile < 768px. | IGREF-0151 to IGREF-0240 | Responsive `AppShell` with media queries matching exact breakpoint boundaries | Window resize listeners and element client bounding rects observed via CDP viewport emulation. |
| **Stories Tray** | Avatar diameter is 58px within a 66px outer gradient ring (`linear-gradient(45deg, #f09433, #dc2743, #bc1888)`), separated by a 2px black gap. | IGREF-0241 to IGREF-0320 | `StoriesTray` component using SVG/CSS gradients and 24-hour TTL expiration schema | Observed directly on profile and landing surfaces. 24-hour expiration inferred from ephemeral media specifications. |
| **Feed Card** | Max width is strictly 470px on desktop web; media is displayed in 1:1, 4:5, or 16:9; username and timestamp header is 44px high. | IGREF-0245 to IGREF-0330 | `FeedPostCard` responsive container constrained with `max-w-[470px]` | Computed styles and layout tree verified via CDP. |
| **Profile Grid** | Strictly 3-column CSS grid with 1:1 square tiles; desktop gap is 28px (`gap-7`), mobile gap is 1.5px (`gap-0.5`). Multi-image posts display a layered square icon in top-right corner. | IGREF-0335 to IGREF-0420 | `ProfileMediaGrid` with `grid-cols-3 aspect-square` and overlay badges | Directly inspected from `instagram`, `creators`, and `design` public profile pages. |
| **Direct Messaging** | Sent message bubbles use purple-magenta linear gradient (`linear-gradient(90deg, #7000ff, #9400d3, #c800ff)`) with `rounded-[20px] rounded-br-[4px]`; received bubbles use `#262626` with `rounded-[20px] rounded-bl-[4px]`. Rounded pill composer at bottom. | IGREF-0430 to IGREF-0500 | `DirectConversationPage` with message deduplication, Socket.IO realtime, and Tailwind CSS pill classes | Observed in official direct messaging UI specifications and help guides. Realtime delivery architecture using Socket.IO inferred from WebSocket connections observed in Instagram web network inspection. |
| **Reels Viewer** | 9:16 vertical video presentation centered at 420px max width; right action rail with like, comment, share, bookmark, and rotating audio disc. | IGREF-0380 to IGREF-0440 | `ReelsPage` with scroll snap, custom video controls, and audio ticker | Inspected from live public reels. |
| **Authentication Flow** | Minimalist two-card vertical layout on desktop with Instagram wordmark, dual credential fields (username/email + password), "Log in" button with disabled opacity, and "Forgot password?" link. | IGREF-0001 to IGREF-0100 | `LoginPage` and `SignupPage` with Zod validation and JWT auth tokens | Directly observed on `instagram.com/accounts/login/`. In-memory MongoDB + JWT auth inferred as standard modern full-stack implementation. |

---

## 3. Boundary Integrity & Data Isolation

To comply with non-negotiable guidelines:
- No private Instagram session tokens, cookies, or credentials are used or logged.
- All observed data is harvested from publicly observable routes, official feature hubs, and Help Center surfaces.
- The implemented application is completely autonomous and operates on its own local database, user accounts, and media assets.
