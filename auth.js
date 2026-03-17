// Simple client-side password gate
// Password hash is SHA-256 of the password, checked client-side
// This is NOT cryptographic security — it's a lightweight gate to prevent casual access

(function() {
  var HASH = 'd4de5305a679f60f19709d0c8f3efa8571c372d91001ad9f9a8a50bf7cbe4022';
  var KEY = 'ss_auth';

  if (sessionStorage.getItem(KEY) === HASH) return;

  // Hide page content
  document.documentElement.style.visibility = 'hidden';

  async function sha256(str) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  // Build lock screen
  var overlay = document.createElement('div');
  overlay.id = 'auth-overlay';
  overlay.innerHTML = [
    '<div style="max-width:360px;width:100%;text-align:center;">',
    '<div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5b52e8;margin-bottom:14px;">StrideShift</div>',
    '<div style="font-size:24px;font-weight:800;letter-spacing:-0.02em;margin-bottom:8px;">This page is protected.</div>',
    '<div style="font-size:14px;color:#52525f;margin-bottom:28px;line-height:1.6;">Enter the password to continue.</div>',
    '<form id="auth-form" style="display:flex;gap:8px;">',
    '<input id="auth-input" type="password" placeholder="Password" autocomplete="off" style="flex:1;padding:10px 14px;border:1px solid rgba(0,0,0,0.12);border-radius:8px;font-size:14px;font-family:inherit;outline:none;transition:border-color 0.2s;" />',
    '<button type="submit" style="padding:10px 20px;border:none;border-radius:8px;background:#5b52e8;color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s;">Enter</button>',
    '</form>',
    '<div id="auth-error" style="font-size:12px;color:#ef4444;margin-top:12px;opacity:0;transition:opacity 0.3s;"></div>',
    '</div>'
  ].join('');

  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', zIndex: '99999',
    background: '#f7f7fa',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    color: '#111118'
  });

  document.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(overlay);
    document.documentElement.style.visibility = 'visible';

    var input = document.getElementById('auth-input');
    var error = document.getElementById('auth-error');
    input.focus();

    document.getElementById('auth-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      var h = await sha256(input.value);
      if (h === HASH) {
        sessionStorage.setItem(KEY, HASH);
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s';
        setTimeout(function() { overlay.remove(); }, 300);
      } else {
        error.textContent = 'Incorrect password.';
        error.style.opacity = '1';
        input.value = '';
        input.focus();
        input.style.borderColor = '#ef4444';
        setTimeout(function() { input.style.borderColor = ''; }, 1500);
      }
    });
  });
})();
