import { useEffect, useState } from "react";
import {
  listInterfaces,
  startCapture,
  stopCapture,
  listActiveCaptures,
  listCaptureFiles,
  deleteCapture,
  downloadCapture
} from "../api/packetCapture";

export default function PacketCapture({ deviceId }) {
  const [interfaces, setInterfaces] = useState([]);
  const [iface, setIface] = useState("");
  const [name, setName] = useState("capture1");
  const [duration, setDuration] = useState(10);
  const [filter, setFilter] = useState("");
  const [packetSize, setPacketSize] = useState(1500);

  const [active, setActive] = useState([]);
  const [files, setFiles] = useState([]);

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const intRes = await listInterfaces({ device_id: deviceId });
        setInterfaces(intRes.interfaces || []);

        const activeRes = await listActiveCaptures({ device_id: deviceId });
        setActive(activeRes.captures || []);

        const fileRes = await listCaptureFiles({ device_id: deviceId });
        setFiles(fileRes.files || []);
      } catch {
        setMessage("Failed to load packet capture data");
      }
    }
    load();
  }, [deviceId]);

  const handleStart = async () => {
    setMessage("");

    try {
      await startCapture({
        device_id: deviceId,
        name,
        interface: iface,
        duration,
        filter,
        packet_size: packetSize
      });

      setMessage(`Capture '${name}' started`);
    } catch {
      setMessage("Failed to start capture");
    }
  };

  const handleStop = async () => {
    setMessage("");

    try {
      const res = await stopCapture({
        device_id: deviceId,
        name
      });

      setFiles(res.files || []);
      setMessage(`Capture '${name}' stopped and exported`);
    } catch {
      setMessage("Failed to stop capture");
    }
  };

  const handleDownload = async (fileName) => {
    const res = await downloadCapture({
      device_id: deviceId,
      name: fileName
    });

    const blob = new Blob([res.data], { type: "application/vnd.tcpdump.pcap" });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.pcap`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (fileName) => {
    await deleteCapture({
      device_id: deviceId,
      name: fileName
    });

    setFiles(files.filter((f) => f.name !== fileName));
  };

  return (
    <div className="config-section">
      <div className="config-section-header">
        <h3>Packet Capture</h3>
      </div>

      <div className="config-section-body">
        {message && (
          <div
            className={`status ${
              message.includes("Failed") ? "status-error" : "status-success"
            }`}
          >
            {message}
          </div>
        )}

        <select
          className="login-input"
          value={iface}
          onChange={(e) => setIface(e.target.value)}
        >
          <option value="">Select interface…</option>
          {interfaces.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>

        <input
          className="login-input"
          placeholder="Capture name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="login-input"
          type="number"
          placeholder="Duration (seconds)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <input
          className="login-input"
          placeholder="Filter (optional)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <input
          className="login-input"
          type="number"
          placeholder="Packet Size"
          value={packetSize}
          onChange={(e) => setPacketSize(e.target.value)}
        />

        <button className="icon-btn" onClick={handleStart}>
          <span className="material-symbols-rounded">play_arrow</span>
          Start Capture
        </button>

        <button className="icon-btn" onClick={handleStop}>
          <span className="material-symbols-rounded">stop</span>
          Stop & Export
        </button>

        <h4>Active Captures</h4>
        <ul>
          {active.map((c) => (
            <li key={c.name}>
              {c.name} — {c.status}
            </li>
          ))}
        </ul>

        <h4>Capture Files</h4>
        <ul>
          {files.map((f) => (
            <li key={f.name}>
              {f.name}.pcap ({f.size} bytes)
              <button className="icon-btn" onClick={() => handleDownload(f.name)}>
                <span className="material-symbols-rounded">download</span>
              </button>
              <button className="icon-btn" onClick={() => handleDelete(f.name)}>
                <span className="material-symbols-rounded">delete</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
