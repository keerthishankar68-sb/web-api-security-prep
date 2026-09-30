# Top 50 Web and API Security Interview Questions

An interactive, pure static interview prep web application built with **React**, **TypeScript**, and **@tanstack/react-query**, inspired by the **NH Prep "Interview Lab"** design.

Features 50 comprehensive, interview-grade web and API security questions with step-by-step animated diagrams, architectural flow visualizations, and concise, high-impact takeaways for candidates.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/web-api-security-interview-questions/](http://localhost:5173/web-api-security-interview-questions/) in your browser.

### 3. Build for Static Production
```bash
npm run build
```
Generates a static, deployable bundle in the `dist/` directory.

---

## 🏗️ Architecture & Tech Stack

- **Framework**: Vite + React + TypeScript
- **Data Fetching**: `@tanstack/react-query`
  - Fetches `/data/questions.json` using `useQuery`
  - `staleTime: Infinity` and `gcTime: Infinity` (data is static and immutable)
- **Routing**: `react-router-dom`
  - Configured with `basename: "/web-api-security-interview-questions"`
  - Deep-linking per question: `/:slug`
- **Styling**: Vanilla CSS design system with custom properties, GPU-accelerated keyframe animations, and responsive layout. Zero heavy animation library dependencies.
- **Design Pattern**: NH Prep "Interview Lab":
  - **Header**: Logo badge + global live search filter.
  - **Sidebar**: Sticky, scrollable list of 50 questions numbered `01`–`50`, active blue selection highlight, and `localStorage` viewed checkmarks.
  - **Step Timeline**: Horizontal progression pill trail color-coded by status (`normal` = blue, `attack` = red/amber, `defense` = green).
  - **Interactive Diagram**: SVG and CSS node canvas with moving packet animations, Play/Pause, Step Prev/Next, Replay, and Speed toggle (1x, 1.5x, 2x). Respects `prefers-reduced-motion`.
  - **Two-Card Section**: "What is happening?" deep dive and "Interview takeaway" quote block.

---

## 📚 Topic Coverage (50 Questions)

1. **HTTP Fundamentals (01–06)**: Same-Origin Policy (SOP), CORS, HTTP methods & idempotency, 401 vs 403, security headers (HSTS, CSP, nosniff), TLS 1.3 handshake, CORS preflight.
2. **Cookies & State (07–11)**: Secure, HttpOnly, SameSite (Strict/Lax/None), Domain & Path scopes, third-party cookies & CHIPS, cookies vs localStorage, `__Host-` and `__Secure-` prefixes.
3. **Sessions & Authentication (12–17)**: Session fixation, session hijacking, stateful sessions vs stateless JWTs, password storage (Argon2id, bcrypt), MFA (TOTP vs WebAuthn/FIDO2 vs SMS), brute-force & credential stuffing defense.
4. **Access Control & Authorization (18–23)**: Authentication vs Authorization (AuthN vs AuthZ), BOLA / IDOR, Vertical vs Horizontal privilege escalation, RBAC vs ABAC, forced browsing, BFLA, multi-tenant data isolation.
5. **Injection Attacks (24–29)**: SQL Injection & Prepared Statements, NoSQL Injection, OS Command Injection, Server-Side Request Forgery (SSRF) & IMDSv2, XML External Entity (XXE), Path Traversal.
6. **Cross-Site Scripting (XSS) (30–34)**: Stored XSS, Reflected XSS, DOM-Based XSS (sources & sinks), contextual output encoding vs DOMPurify, Content Security Policy (nonces & strict-dynamic).
7. **Cross-Site Request Forgery (CSRF) (35–38)**: CSRF mechanisms, Anti-CSRF Synchronizer Tokens, Double-Submit Cookie pattern, CSRF in SPAs with custom headers.
8. **API Security & Authorization (39–44)**: OAuth 2.0 Authorization Code Flow with PKCE, OpenID Connect (OIDC) vs OAuth 2.0, JWT pitfalls (`alg: none`, key confusion), API keys vs Bearer tokens, rate limiting algorithms (Token Bucket, Sliding Window), Mass Assignment.
9. **Secure Configuration & Defense (45–50)**: Security misconfigurations, secrets management (Vault/KMS), software supply chain & SBOM/SCA, HSTS Preloading, Clickjacking defense (X-Frame-Options vs frame-ancestors), secure error handling & information leakage prevention.

---

## ➕ How to Add a New Question

Add a new JSON object to `public/data/questions.json`:

```json
{
  "id": 51,
  "slug": "new-question-slug",
  "title": "Question Title?",
  "subtitle": "One-line subtitle summary.",
  "category": "HTTP Fundamentals",
  "nodes": [
    { "id": "browser", "label": "Client Browser", "sub": "Origin A", "iconType": "browser" },
    { "id": "api", "label": "API Server", "sub": "Origin B", "iconType": "api" }
  ],
  "steps": [
    {
      "id": 1,
      "label": "Step 1 Label",
      "from": "browser",
      "to": "api",
      "packet": "GET /api/example",
      "caption": "Detailed explanation of what happens at this step.",
      "status": "normal"
    }
  ],
  "whatIsHappening": "2-3 sentences explaining the underlying architectural mechanics.",
  "interviewTakeaway": "1-2 sentence high-impact summary for the candidate to say in interviews.",
  "keywords": ["Keyword1", "Keyword2"]
}
```
