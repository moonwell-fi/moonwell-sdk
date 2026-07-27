---
"@moonwell-fi/moonwell-sdk": patch
---

Security: bump `axios` to `^1.18.1` to resolve GHSA-gcfj-64vw-6mp9 (high — Node HTTP adapter can use an inherited proxy after interceptor config cloning) and eight moderate advisories fixed in axios 1.18.x. Raising the dependency floor ensures consumers cannot resolve a vulnerable axios version.
