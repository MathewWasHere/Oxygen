/**
 * Builds a static, upload-ready bundle for cPanel shared hosting.
 *
 *   npm run build:cpanel
 *
 * Output: ./out  (upload its CONTENTS to public_html)
 * Also writes .htaccess for SPA-style routing, compression and caching.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const mainCfg = path.join(root, "next.config.ts");
const exportCfg = path.join(root, "next.config.export.ts");
const backup = path.join(root, "next.config.main.bak");

const log = (m) => console.log(`\x1b[38;5;208m▲ OXYGEN\x1b[0m ${m}`);

function swapIn() {
  fs.copyFileSync(mainCfg, backup);
  fs.copyFileSync(exportCfg, mainCfg);
}
function swapBack() {
  if (fs.existsSync(backup)) {
    fs.copyFileSync(backup, mainCfg);
    fs.unlinkSync(backup);
  }
}

const HTACCESS = `# ---------------------------------------------------------------------------
# OXYGEN — فست فود اکسیژن | cPanel configuration
# ---------------------------------------------------------------------------

Options -Indexes
DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Force HTTPS (required for the PWA / "add to home screen")
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

  # Serve existing files and directories as-is
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # /menu -> /menu/index.html  (Next.js exports folders per route)
  RewriteCond %{REQUEST_FILENAME}/index.html -f
  RewriteRule ^(.*)$ /$1/index.html [L]

  # /menu.html fallback
  RewriteCond %{REQUEST_FILENAME}.html -f
  RewriteRule ^(.*)$ /$1.html [L]

  # Anything else -> the custom 404 page
  RewriteRule ^ /404.html [L]
</IfModule>

# --------------------------- Compression ----------------------------------
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript
  AddOutputFilterByType DEFLATE application/javascript application/x-javascript
  AddOutputFilterByType DEFLATE application/json image/svg+xml
  AddOutputFilterByType DEFLATE font/woff2 application/manifest+json
</IfModule>

# ----------------------------- Caching -------------------------------------
<IfModule mod_expires.c>
  ExpiresActive On

  # Hashed build assets are immutable
  <FilesMatch "\\.(js|css|woff2)$">
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable, max-age=31536000"
  </FilesMatch>

  <FilesMatch "\\.(jpg|jpeg|png|webp|avif|svg|ico)$">
    ExpiresDefault "access plus 6 months"
  </FilesMatch>

  # HTML must always revalidate so updates appear immediately
  <FilesMatch "\\.html$">
    ExpiresDefault "access plus 0 seconds"
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>
</IfModule>

# The service worker must never be cached, or updates never ship
<Files "sw.js">
  <IfModule mod_headers.c>
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Service-Worker-Allowed "/"
  </IfModule>
</Files>

# ---------------------------- MIME types -----------------------------------
<IfModule mod_mime.c>
  AddType application/manifest+json .webmanifest
  AddType font/woff2 .woff2
  AddType image/svg+xml .svg
</IfModule>

# ------------------------------ Security -----------------------------------
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

<FilesMatch "^\\.">
  Require all denied
</FilesMatch>
`;

const README = `# 📦 آپلود اکسیژن روی cPanel — Upload guide

This folder is a complete, self-contained website. No Node.js, no database,
no build step on the server. It runs on any basic cPanel/Apache hosting.

## Upload (5 minutes)

1. Log in to **cPanel** → open **File Manager**.
2. Go to **public_html** (or \`public_html/oxygen\` for a subfolder demo).
3. Click **Upload** and select **oxygen-cpanel.zip**.
4. Back in File Manager, right-click the zip → **Extract**.
5. Delete the zip. Done — open your domain.

> Make sure **.htaccess** is present after extracting.
> In File Manager use **Settings → Show Hidden Files (dotfiles)** to see it.

## Important

- **Enable HTTPS** (cPanel → SSL/TLS Status → *Run AutoSSL*).
  Without HTTPS the "install app" feature will not appear on Android.
- If you uploaded into a **subfolder**, everything still works because all
  links are relative.

## What the client can test

| Area | How |
| --- | --- |
| Customer app | Open the domain on a phone |
| Install as app | Chrome menu → *Install app* |
| Login | Any \`09xxxxxxxxx\` number, OTP code **۱۲۳۴۵** |
| Coupons | \`OXYGEN10\` or \`FASA20\` |
| Admin panel | Add \`/admin\` to the URL |

## Note about this demo

This is the **Stage 1 prototype**. Orders, addresses and login are stored in the
visitor's own browser (localStorage) — they are not sent to a server and are not
shared between devices. That is intentional for the showcase.

Stage 2 (PostgreSQL + real OTP + Zarinpal payments + live order sync between
customer and kitchen) requires Node.js hosting or a VPS rather than basic shared
hosting.
`;

try {
  log("switching to static-export config…");
  swapIn();

  log("cleaning previous output…");
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.rmSync(path.join(root, ".next"), { recursive: true, force: true });

  log("building static export (this takes a moment)…");
  execSync("npx next build", { stdio: "inherit", cwd: root });

  if (!fs.existsSync(outDir)) throw new Error("Export failed: ./out was not created");

  log("writing .htaccess…");
  fs.writeFileSync(path.join(outDir, ".htaccess"), HTACCESS);
  fs.writeFileSync(path.join(outDir, "UPLOAD-GUIDE.md"), README);

  // Prevent Next.js internals from being crawled/served oddly
  fs.writeFileSync(
    path.join(outDir, "robots.txt"),
    "User-agent: *\nAllow: /\nDisallow: /admin\n",
  );

  log("zipping…");
  const zipPath = path.join(root, "oxygen-cpanel.zip");
  fs.rmSync(zipPath, { force: true });
  execSync(`cd "${outDir}" && zip -qr "${zipPath}" . -x ".DS_Store"`, { stdio: "inherit" });

  const size = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
  const files = execSync(`find "${outDir}" -type f | wc -l`).toString().trim();

  console.log("");
  log(`\x1b[32mDone.\x1b[0m`);
  log(`Folder : out/            (${files} files)`);
  log(`Zip    : oxygen-cpanel.zip  (${size} MB)`);
  log(`Upload the ZIP to public_html and extract it.`);
} finally {
  swapBack();
  log("restored development config.");
}
