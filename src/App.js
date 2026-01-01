import React, { useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import DeviceList from "./DeviceList";
import FileViewer from "./FileViewer";
import "./App.css";

const API_BASE = "http://localhost:8000";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedModules, setSelectedModules] = useState({});
  const [expandedInterfaces, setExpandedInterfaces] = useState({});
  const [expandedModules, setExpandedModules] = useState({});




  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    // const trimmed = hostnamesInput.trim();

    const payload = {
      hostnames:
        selectedDevices.length === 0
          ? null
          : selectedDevices.map((id) => {
              const dev = devices.find((d) => d.id === id);
              return dev.hostname;
            }),
    };


    try {
      const res = await axios.post(`${API_BASE}/devices/sync`, payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleListDevices = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setDevices([]);

    try {
      const res = await axios.get(`${API_BASE}/devices`);
      setDevices(res.data);
    } catch (err) {
      setError(err.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="app-root">
        <header className="app-header">
          <h1>Device Sync Dashboard</h1>
          {/* <nav>
            <Link to="/">Sync</Link> | <Link to="/devices">Devices</Link>
          </nav> */}
        </header>

        <main className="app-main">

          {/* Top Toolbar */}
          <div className="toolbar">
            <button onClick={handleListDevices} disabled={loading}>
              {loading ? "Loading…" : "List Devices"}
            </button>

          <button onClick={handleSync} disabled={loading}>
            {selectedDevices.length === 0
              ? "Sync Devices (All)"
              : `Sync (${selectedDevices.length}) Selected Devices`}
          </button>

          <button disabled>
            {selectedDevices.length === 0
              ? "Sync Warranty Information (All)"
              : `Sync Warranty Information (${selectedDevices.length})`}
          </button>
          </div>

           {/* Status Messages */}
          {loading && <div className="status status-info">Processing…</div>}

          {error && (
            <div className="status status-error">
              <h3>Error</h3>
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
          )}

          {/* Device Table */}
          {devices.length > 0 && (
            <DeviceList devices={devices} onSelectionChange={setSelectedDevices} />
          )}

          {/* Sync Result */}
          {result && (
            <div className="status status-success">
              <h3>Result</h3>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;
