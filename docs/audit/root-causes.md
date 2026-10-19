# Root Cause Analysis & Diagnostic Breakdown

## 1. Primary Bug: Missing Heart Icon Import in MessagesPage
- **Location**: `frontend/src/pages/messages/MessagesPage.jsx` (lines 489-493)
- **Root Cause**: The component rendered `<Heart className="w-5 h-5..." />` in the instant heart response button inside the pill composer, but `Heart` was omitted from the `lucide-react` import list on line 1.
- **Impact**: Any direct visit to `http://localhost:5173/direct` threw an uncaught `ReferenceError: Heart is not defined` and crashed React rendering.
- **Resolution**: Added `Heart` to the named import list from `lucide-react`.

## 2. Primary Bug: Route Shadowing in Direct Messaging Subroutes
- **Location**: `frontend/src/AppRoutes.jsx`
- **Root Cause**: The parameterized route `<Route path="/direct/:conversationId" ... />` was placed before static routes `/direct/new`, `/direct/requests`, `/direct/archived`, `/direct/starred`, and `/direct/settings`. Consequently, requests to `/direct/settings` or `/direct/inbox` matched `:conversationId` as "settings" or "inbox".
- **Impact**: `DirectConversationPage` attempted to fetch `/api/conversations/inbox/messages`, failing with a CastError.
- **Resolution**: Reordered routes in `AppRoutes.jsx` to place all static direct messaging subroutes (`/direct/inbox`, `/direct/new`, `/direct/requests`, `/direct/archived`, `/direct/starred`, `/direct/settings`) BEFORE the dynamic parameter `/direct/:conversationId`. Added an explicit guard in `DirectConversationPage` redirecting `inbox` to `/direct`.

## 3. Canonical Instagram Aliases
- **Root Cause**: Users and deep links often navigate to canonical Instagram URLs like `/accounts/login`, `/accounts/emailsignup`, `/accounts/password/reset`, `/direct/inbox`, `/p/:postId`, and `/profile/:username`.
- **Resolution**: Added first-class aliases and declarative redirects in `AppRoutes.jsx` so all standard URL patterns resolve without 404 errors.
