let toastContainer = null;

function ensureContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container-root';
  toastContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:100000;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
  const root = document.getElementById('root');
  if (root) {
    root.appendChild(toastContainer);
  } else {
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'info') {
  const container = ensureContainer();
  const toast = document.createElement('div');
  const isSuccess = type === 'success';
  const isError = type === 'error';

  toast.style.cssText = `
    pointer-events:auto;display:flex;align-items:center;gap:10px;
    padding:14px 20px;border-radius:10px;font-family:Inter,system-ui,sans-serif;font-size:14px;font-weight:500;
    color:${isError ? '#991B1B' : isSuccess ? '#065F46' : '#1E4D4B'};
    background:${isError ? '#FEF2F2' : isSuccess ? '#F0FDF4' : '#F0FDFA'};
    border:1px solid ${isError ? '#FECACA' : isSuccess ? '#BBF7D0' : '#B2DFDB'};
    box-shadow:0 4px 12px rgba(0,0,0,0.1);transform:translateX(120%);transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);max-width:420px;word-break:break-word;
  `;
  const icon = document.createElement('span');
  icon.textContent = isError ? '\u26A0\uFE0F' : isSuccess ? '\u2705' : '\u2139\uFE0F';
  icon.style.fontSize = '18px';
  const text = document.createElement('span');
  text.textContent = message;
  text.style.flex = '1';
  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);
  requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
