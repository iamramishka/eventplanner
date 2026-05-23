# Bug Log - Sprint 9

| ID | Module | Issue | Status | Resolution |
|---|---|---|---|---|
| BUG-001 | Vendors | `SyntaxError: Unexpected end of JSON input` in `[id]/route.ts` when parsing empty body. | ✅ Resolved | Added `try/catch` and fallback to `{}` for empty request bodies during vendor patching. |
| BUG-002 | Notifications | `findMany` called without predicate in `notifications.ts` causing 500 error. | ✅ Resolved | Updated to pass explicit predicate `(g: any) => g.id === options.guestId`. |
| BUG-003 | Notifications | Unescaped template literals in `notifications.ts` causing syntax compilation error. | ✅ Resolved | Fixed template literal syntax by removing stray backslashes. |
| BUG-004 | Admin | "Under Construction" placeholder showed instead of actual PlansModule. | ✅ Resolved | Handled `activeModule === 'plans'` by wiring up `PlansModule` correctly in `SuperAdminClient.tsx`. |
| BUG-005 | API Tests | Tests randomly failing due to IPv6 resolution of `localhost` on Node 18+. | ✅ Resolved | Forcibly bound test scripts to use `127.0.0.1` instead of `localhost`. |
