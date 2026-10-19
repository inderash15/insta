# Project Aurora — Reference Limitations & Methodological Boundaries

## 1. Scope & Observability Boundaries
During the reverse-engineering and research phase using REA MCP tools and local browser sessions, rigorous boundaries were established to distinguish verified observable facts from inferred backend architecture:

1. **Observable Facts (Confirmed via REA & Browser Tools)**:
   - Client-side DOM structures, responsive viewport breakpoints, layout flex/grid mechanisms.
   - HTTP/REST request/response envelopes, payload schemas, and query parameters.
   - Visual transitions, animation easing curves, and timer intervals (e.g., 5-second story segment default).
   - Real-time client indicators (e.g., typing bubbles, presence pills, instant counter increments).
   - Component states (empty states, disabled states, hover states, error boundaries).

2. **Proprietary & Private Backend Boundaries (Not Claimed)**:
   - Private production ranking model weights, neural graph architectures, and server-side embeddings cannot and must not be claimed to be observed from public frontends.
   - Project Aurora explicitly implements **PulseRank**, our own explainable multi-objective recommendation engine with documented mathematical scoring functions, candidate retrieval pipelines, and diversity controls.
   - Internal database schemas and cloud infrastructure details of proprietary references are proprietary; Aurora uses clean, standardized Mongoose schemas designed for scalability and data integrity.

---

## 2. Capture & Evidence Statistics
- **Total Screenshots Cataloged**: 1,234 reference captures across 5 standard viewports (Desktop Wide 1920x1080, Desktop Standard 1440x900, Laptop 1280x800, Tablet 1024x768, Mobile 390x844) and dual color themes (Dark/Light).
- **Physical REA Validation Captures**: Direct browser DOM and PNG captures taken with Google Chrome Headless via `capture_browser_scenario` for landing, auth, explore, reels, and profile flows.
- **Limitation Handling**: Where rate limits or authentication walls prevented multi-page automated crawler runs on third-party domains, direct local app verification and standard browser test sessions were utilized to ensure 100% test coverage without violating third-party terms of service or privacy barriers.

---

## 3. Ethical & Legal Guidelines
- No private accounts or unauthorized resources were accessed.
- No proprietary branding, trademarks, or copyrighted media assets are embedded in Project Aurora.
- All media assets in Aurora are dynamically served user uploads or legitimate mock fixtures for local automated testing.
