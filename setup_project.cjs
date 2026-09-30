const fs = require('fs');
const path = require('path');

// 1. Write src/types/question.ts
const typesTs = `export type StepStatus = 'normal' | 'attack' | 'defense';

export interface DiagramNode {
  id: string;
  label: string;
  sub?: string;
  iconType?: 'browser' | 'attacker' | 'server' | 'api' | 'database' | 'auth' | 'gateway';
}

export interface DiagramStep {
  id: number;
  label: string;
  from: string;
  to: string;
  packet: string;
  caption: string;
  status: StepStatus;
  detail?: string;
}

export type Category = 
  | 'HTTP Fundamentals'
  | 'Cookies & State'
  | 'Sessions & Authentication'
  | 'Access Control'
  | 'Injection Attacks'
  | 'Cross-Site Scripting (XSS)'
  | 'Cross-Site Request Forgery (CSRF)'
  | 'API Security & Authorization'
  | 'Secure Configuration & Defense';

export interface QuestionData {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  category: Category;
  nodes: DiagramNode[];
  steps: DiagramStep[];
  whatIsHappening: string;
  interviewTakeaway: string;
  keywords: string[];
}
`;
fs.writeFileSync('src/types/question.ts', typesTs, 'utf8');

// 2. Write public/data/questions.json
const sampleQuestions = [
  {
    id: 1,
    slug: "what-is-the-same-origin-policy-and-cors",
    title: "What is the Same-Origin Policy (SOP) and how does CORS relax it?",
    subtitle: "Understanding browser origin boundaries (scheme, host, port) and preflighted cross-origin requests.",
    category: "HTTP Fundamentals",
    nodes: [
      { id: "browser", label: "Browser (client.app:443)", sub: "Origin A", iconType: "browser" },
      { id: "attacker", label: "Malicious Site (evil.com)", sub: "Origin C (Untrusted)", iconType: "attacker" },
      { id: "api", label: "Target API (api.app:443)", sub: "Origin B (CORS Protected)", iconType: "api" }
    ],
    steps: [
      {
        id: 1,
        label: "Cross-Origin Preflight",
        from: "browser",
        to: "api",
        packet: "OPTIONS /api/data (Origin: client.app)",
        caption: "Browser initiates a cross-origin request with custom headers. It automatically issues an OPTIONS preflight to verify permissions.",
        status: "normal"
      },
      {
        id: 2,
        label: "CORS Header Check",
        from: "api",
        to: "browser",
        packet: "Access-Control-Allow-Origin: https://client.app",
        caption: "Target API responds with explicit CORS headers permitting 'client.app' to read response data.",
        status: "defense"
      },
      {
        id: 3,
        label: "Actual Data Request",
        from: "browser",
        to: "api",
        packet: "GET /api/data (Authorized)",
        caption: "With preflight approved, browser sends actual request and allows JavaScript to read sensitive response data.",
        status: "normal"
      },
      {
        id: 4,
        label: "Unauthorized Origin Block",
        from: "attacker",
        to: "api",
        packet: "GET /api/data (Origin: evil.com)",
        caption: "Attacker script tries reading API. API omits evil.com in CORS header, so browser DOM blocks response access.",
        status: "attack"
      }
    ],
    whatIsHappening: "The Same-Origin Policy (SOP) is a core browser security mechanism that restricts scripts on one origin (protocol + domain + port) from reading arbitrary resources on another origin. Cross-Origin Resource Sharing (CORS) is a server-driven mechanism that relaxes SOP selectively using HTTP headers (such as Access-Control-Allow-Origin).",
    interviewTakeaway: "SOP protects users by preventing evil.com from reading your bank's API responses in your browser. CORS is NOT a security filter for servers, but an opt-in protocol telling client browsers which external origins are allowed to read response data.",
    keywords: ["SOP", "CORS", "Preflight", "OPTIONS", "Origin", "Access-Control-Allow-Origin"]
  },
  {
    id: 2,
    slug: "how-csrf-works-and-samesite-defense",
    title: "How does Cross-Site Request Forgery (CSRF) work and how do SameSite cookies defend against it?",
    subtitle: "Analyzing ambient credential abuse across cross-site form submissions and modern mitigation strategies.",
    category: "Cross-Site Request Forgery (CSRF)",
    nodes: [
      { id: "browser", label: "User Browser", sub: "Session Cookie Active", iconType: "browser" },
      { id: "attacker", label: "Attacker Site (trap.com)", sub: "Hidden POST Form", iconType: "attacker" },
      { id: "server", label: "Bank Server (bank.com)", sub: "State-Changing Endpoint", iconType: "server" }
    ],
    steps: [
      {
        id: 1,
        label: "User Authenticates",
        from: "browser",
        to: "server",
        packet: "POST /login -> Set-Cookie: session=xyz; SameSite=Lax",
        caption: "User logs into bank.com. Server issues a secure session cookie configured with SameSite=Lax/Strict.",
        status: "normal"
      },
      {
        id: 2,
        label: "Attacker Triggers Form",
        from: "attacker",
        to: "browser",
        packet: "HTML Auto-Submit: <form action='bank.com/transfer'>",
        caption: "Victim visits malicious trap.com, which executes a hidden POST form targeting bank.com/transfer.",
        status: "attack"
      },
      {
        id: 3,
        label: "SameSite Cookie Dropped",
        from: "browser",
        to: "server",
        packet: "POST /transfer (Cookie Omitted by Browser)",
        caption: "Because it is a cross-site state-changing POST request, the browser withholds the SameSite=Lax/Strict session cookie.",
        status: "defense"
      },
      {
        id: 4,
        label: "Server Rejection",
        from: "server",
        to: "browser",
        packet: "401 Unauthorized (No Session)",
        caption: "Bank server finds no valid session cookie (or missing Anti-CSRF token) and safely rejects the unauthorized transaction.",
        status: "defense"
      }
    ],
    whatIsHappening: "CSRF exploits ambient authority where browsers automatically include stored cookies on cross-origin requests. An attacker tricks the victim's browser into issuing unwanted state-changing commands to a vulnerable server where the victim is logged in.",
    interviewTakeaway: "CSRF tricks the browser into sending the user's cookies to perform unwanted actions. We prevent it with Anti-CSRF Synchronizer Tokens (or Double-Submit cookies), SameSite=Lax/Strict cookie flags, and verifying custom headers like X-Requested-With.",
    keywords: ["CSRF", "SameSite", "Anti-CSRF Token", "Ambient Authority", "Session Cookie", "Double Submit"]
  },
  {
    id: 3,
    slug: "broken-object-level-authorization-bola-idor",
    title: "What is Broken Object-Level Authorization (BOLA/IDOR) in APIs and how is it prevented?",
    subtitle: "OWASP API #1 vulnerability: manipulating object IDs in API endpoints without user-context verification.",
    category: "API Security & Authorization",
    nodes: [
      { id: "attacker", label: "Attacker (User 105)", sub: "Valid JWT Token", iconType: "attacker" },
      { id: "api", label: "API Gateway / Server", sub: "GET /api/v1/invoices/:id", iconType: "api" },
      { id: "database", label: "Database", sub: "Tenant Data Records", iconType: "database" }
    ],
    steps: [
      {
        id: 1,
        label: "Forged ID Request",
        from: "attacker",
        to: "api",
        packet: "GET /api/invoices/9999 [Bearer Token sub:105]",
        caption: "Attacker is logged in as User 105, but tampers with the endpoint path parameter to request invoice #9999 belonging to User 200.",
        status: "attack"
      },
      {
        id: 2,
        label: "Vulnerable Direct Fetch",
        from: "api",
        to: "database",
        packet: "SELECT * FROM invoices WHERE id = 9999",
        caption: "Flawed backend queries directly by object ID without checking if req.user.id owns the target invoice.",
        status: "attack"
      },
      {
        id: 3,
        label: "Secure Scoped Check",
        from: "api",
        to: "database",
        packet: "SELECT * FROM invoices WHERE id=9999 AND user_id=105",
        caption: "Proper Defense: Query filters explicitly by both object ID and verified session/JWT user ID, returning 0 rows for unauthorized objects.",
        status: "defense"
      },
      {
        id: 4,
        label: "403 Forbidden Response",
        from: "api",
        to: "attacker",
        packet: "403 Forbidden / 404 Not Found",
        caption: "API returns 403 Forbidden (or 404 to avoid enumeration), preventing unauthorized data leakage.",
        status: "defense"
      }
    ],
    whatIsHappening: "BOLA (Broken Object Level Authorization), also known as IDOR (Insecure Direct Object Reference), occurs when an API accepts an object identifier from the client without verifying whether the authenticated user has permission to access that specific record.",
    interviewTakeaway: "Authentication proves WHO you are; Authorization verifies WHAT you can access. Never rely solely on object IDs in the URL. Always enforce object-level authorization policies (e.g., matching the resource owner ID to the token's subject claim) at the data layer.",
    keywords: ["BOLA", "IDOR", "OWASP API #1", "Authorization", "Access Control", "Tenant Isolation"]
  }
];
fs.writeFileSync('public/data/questions.json', JSON.stringify(sampleQuestions, null, 2), 'utf8');

console.log('Sample questions & types generated.');
