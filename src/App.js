import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import DeviceList from "./DeviceList";
import "./App.css";

const API_BASE = "http://localhost:8000";


function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

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

    try {
      const res = await axios.get(`${API_BASE}/devices`, {
        params: { page, page_size: pageSize },
      });

      console.log("API response:", res.data);

      const data = res.data;

      if (Array.isArray(data.items)) {
        // New paginated backend
        setDevices(data.items);
        setTotal(data.total ?? data.items.length);
      } else if (Array.isArray(data)) {
        // Old backend (plain array)
        setDevices(data);
        setTotal(data.length);
      } else {
        console.warn("Unexpected API format:", data);
        setDevices([]);
        setTotal(0);
      }

    } catch (err) {
      setError(err.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Reload when page or pageSize changes
  useEffect(() => {
    handleListDevices();
  }, [page, pageSize]);
  
  return (
    <BrowserRouter>
      <div className="app-root">
        <header className="app-header">
          <h1>Device Sync Dashboard</h1>
        </header>

        <main className="app-main">
          <div className="toolbar">
            {/* <button onClick={handleListDevices} disabled={loading}>
              {loading ? "Loading…" : "List Devices"}
            </button> */}
            {/* <button
              onClick={() => {
                console.log("List Devices clicked");
                handleListDevices();
              }}
              disabled={loading}
            >
              {loading ? "Loading…" : "List Devices"}
            </button> */}
            <button
              type="button"
              onClick={() => {
                console.log("Button clicked");
                handleListDevices();
              }}
            >
              List Devices
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

          {loading && <div className="status status-info">Processing…</div>}

          {error && (
            <div className="status status-error">
              <h3>Error</h3>
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
          )}

          {Array.isArray(devices) && devices.length > 0 && (
            <DeviceList
              devices={devices}
              onSelectionChange={setSelectedDevices}
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              total={total}
            />
          )}

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
