# Deployment Guide — Client Presentations

## Overview

This site is deployed via **GitHub Pages** on the `stride-shift/client-presentations` repo. It serves static HTML files with a client-side password gate.

**Live URL:** https://stride-shift.github.io/client-presentations/

## Setup (how it was done)

### 1. Create the repo

```bash
gh repo create stride-shift/client-presentations --private \
  --description "Client-facing interactive presentations and deliverables"
```

### 2. Make it public (required for Pages on free plans)

GitHub Pages requires public repos unless you're on GitHub Enterprise or a paid org plan.

```bash
gh repo edit stride-shift/client-presentations \
  --visibility public \
  --accept-visibility-change-consequences
```

### 3. Enable GitHub Pages

```bash
gh api repos/stride-shift/client-presentations/pages \
  -X POST \
  -f "build_type=legacy" \
  -f "source[branch]=main" \
  -f "source[path]=/"
```

This tells GitHub to serve the root of the `main` branch as a static site.

### 4. Check deployment status

```bash
gh api repos/stride-shift/client-presentations/pages/builds \
  --jq '.[0] | {status, created_at}'
```

Status will go from `"building"` to `"built"` (usually takes 30-60 seconds).

## Structure

```
client-presentations/
├── index.html              # Landing page (links to both clients)
├── auth.js                 # Shared password gate (SHA-256 hashed)
├── jet/
│   └── index.html          # JET Phase 1 Options
├── correlation/
│   └── index.html          # Correlation What's Next
└── DEPLOYMENT.md           # This file
```

Each `index.html` includes `<script src="../auth.js"></script>` (or `./auth.js` for root) in the `<head>`.

## Password Protection

Since GitHub Pages only serves static files, there's no server-side auth. Instead, `auth.js` provides a **client-side password gate**:

- The password is stored as a SHA-256 hash (not plaintext) in `auth.js`
- On page load, if the user hasn't authenticated this session, a full-screen overlay prompts for the password
- The entered password is hashed and compared against the stored hash
- On success, the hash is saved to `sessionStorage` so it persists across page navigations within the same browser session
- Closing the browser (or tab, depending on browser) clears the session

**To change the password:**

```bash
# Generate the new hash
printf '%s' 'YourNewPassword' | shasum -a 256 | awk '{print $1}'

# Update the HASH variable in auth.js with the output
```

**Important:** This is not cryptographic security. The HTML source is publicly accessible in the repo and via view-source. It's a deterrent against casual access, not a security boundary. For truly confidential content, use a private repo with GitHub Enterprise, or a different hosting solution with server-side auth.

## Deploying Changes

Just push to `main`. GitHub Pages rebuilds automatically on every push.

```bash
cd /tmp/client-presentations
git add -A
git commit -m "Description of changes"
git push
```

Check build status with:

```bash
gh api repos/stride-shift/client-presentations/pages/builds \
  --jq '.[0] | {status, created_at}'
```

## Adding a New Client Page

1. Create a new directory: `mkdir newclient`
2. Add `index.html` with `<script src="../auth.js"></script>` in the `<head>`
3. Add a card linking to it from the root `index.html`
4. Push to `main`

## GitHub Account

- **Organization:** `stride-shift`
- **Account:** `JustinGermis`
- **Repo:** `stride-shift/client-presentations`
