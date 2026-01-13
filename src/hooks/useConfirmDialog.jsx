
import React from "react";
import ReactDOM from "react-dom";

export function useConfirmDialog() {
  const [state, setState] = React.useState({ open: false });
  const resolverRef = React.useRef(null);

  const confirm = (opts = {}) =>
    new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ open: true, ...opts });
    });

  const close = () => setState((s) => ({ ...s, open: false }));

  const handleCancel = () => {
    resolverRef.current(false);
    close();
  };

  const handleConfirm = () => {
    resolverRef.current(true);
    close();
  };

  const Dialog = () => {
    if (!state.open) return null;
    const { title = "Confirm", message = "Are you sure?", confirmText = "OK", cancelText = "Cancel" } = state;

    return ReactDOM.createPortal(
      <div className="cd-backdrop" onClick={handleCancel}>
        <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="cd-actions">
            <button onClick={handleCancel}>{cancelText}</button>
            <button onClick={handleConfirm}>{confirmText}</button>
          </div>
        </div>
        <style>{`
          .cd-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; }
          .cd-modal { background: #fff; padding: 16px; border-radius: 8px; width: 300px; }
          .cd-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
        `}</style>
      </div>,
      document.body
    );
  };

  return { confirm, ConfirmDialog: Dialog };
}

