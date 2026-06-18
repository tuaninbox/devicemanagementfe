import { useEffect, useState } from "react";
import { getAvailableCommands, runCommands } from "../api/commands";

export default function RunCommands({ deviceId }) {
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getAvailableCommands(deviceId);
        setAvailable(res.commands || []);
      } catch {
        setMessage("Failed to load available commands");
      }
    }
    load();
  }, [deviceId]);

  const handleRun = async () => {
    if (!selected) return;

    setLoading(true);
    setMessage("");
    setOutput("");

    try {
      const res = await runCommands(deviceId, [selected]);
      const first = res.commands?.[0];
      setOutput(first?.output || "No output returned");
    } catch {
      setMessage("Failed to run command");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="config-section">
      <div className="config-section-header">
        <h3>Run Commands</h3>
      </div>

      <div className="config-section-body">
        {message && (
          <div className="status status-error">{message}</div>
        )}

        <select
          className="login-input"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select a command…</option>
          {available.map((cmd) => (
            <option key={cmd} value={cmd}>
              {cmd}
            </option>
          ))}
        </select>

        <button className="icon-btn" onClick={handleRun}>
          <span className="material-symbols-rounded">terminal</span>
          Run
        </button>

        {loading && <p>Running…</p>}

        {output && (
          <pre className="config-block config-block-operational">
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}
