export default function Toast({ toast, setToast }) {
  if (!toast) return null;
  return (
    <div className={`rankora-toast ${toast.type === 'error' ? 'toast-error' : ''}`}>
      <span>{toast.message}</span>
      <button className="toast-close-btn" onClick={() => setToast(null)}>×</button>
    </div>
  );
}
