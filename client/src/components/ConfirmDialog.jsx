import React from "react";

export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, confirmStyle, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title || "Confirm"}</h3>
        <p style={{ color: '#5C6A6A', fontSize: 14, lineHeight: 1.6, margin: '8px 0 20px' }}>{message}</p>
        <div className="modal-actions">
          <button type="button" className="modal-btn cancel" onClick={onCancel}>{cancelLabel || "Cancel"}</button>
          <button type="button" className="modal-btn submit" style={confirmStyle || {}} onClick={onConfirm}>{confirmLabel || "Confirm"}</button>
        </div>
      </div>
    </div>
  );
}
