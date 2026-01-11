import React, { useState, useEffect, useCallback} from "react";
import axios from "axios";
import { Routes, Route, useNavigate } from "react-router-dom";
import DeviceList from "./DeviceList";
import Jobs from "./Jobs";
import "./App.css";
import { syncDevices, syncModulesEox, listDevices } from "./api/sync";

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

  const navigate = useNavigate();

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const hostnames =
      selectedDevices.length === 0
        ? null
        : selectedDevices.map((id) => {
            const dev = devices.find((d) => d.id === id);
            return dev.hostname;
          });

    try {
      const data = await syncDevices(hostnames);

      if (data.success) {
        setResult({
          message: "Background job submitted successfully",
          job_id: data.job_id,
        });
        navigate("/jobs");
      } else {
        setResult({
          message: "Background job failed to submit",
          details: data.message || "Unknown error",
        });
      }
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
      // Call shared API helper
      const data = await listDevices(page, pageSize);

      console.log("API response:", data);

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
  

  const handleSyncEoxForModules = async ({ serialNumbers = null, deviceIds = null }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Build payload based on what was provided
      const payload = {
        serial_numbers: serialNumbers && serialNumbers.length > 0 ? serialNumbers : null,
        device_ids: deviceIds && deviceIds.length > 0 ? deviceIds : null,
      };

      // Call shared API helper
      const data = await syncModulesEox(payload);

      if (data.success) {
        setResult({
          message: "Background job submitted successfully",
          job_id: data.job_id,
        });
        navigate("/jobs");
      } else {
        setResult({
          message: "Background job failed to submit",
          details: data.message || "Unknown error",
        });
      }
    } catch (err) {
      setError(err.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="app-root">
    <header className="app-header">
      <h1>Device Sync Dashboard</h1>
    </header>

    <main className="app-main">

      {/* ⭐ Toolbar ⭐ */}
      <div className="toolbar">
        <button
          type="button"
          onClick={() => {
            console.log("Button clicked");
            navigate("/");
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

        <button
          onClick={() => {
            const deviceIds =
              selectedDevices.length === 0
                ? devices.map((d) => d.id)
                : selectedDevices;

            handleSyncEoxForModules({ deviceIds });
          }}
        > {selectedDevices.length === 0
            ? "Sync Warranty Information (All)"
            : `Sync Warranty Information (${selectedDevices.length})`}
        </button>

        <button
          type="button"
          onClick={() => navigate("/jobs")}
          style={{ marginLeft: "10px" }}
        >
          View Background Jobs
        </button>
      </div>

      {/* ⭐ ROUTING ⭐ */}
      <Routes>

        {/* Default dashboard route */}
        <Route
          path="/"
          element={
            <>
              {loading && (
                <div className="status status-info">Processing…</div>
              )}

              {error && (
                <div className="status status-error">
                  <h3>Error</h3>
                  <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
              )}

              {result && (
                <div className="status status-success">
                  <h3>Result</h3>
                  <pre>{JSON.stringify(result, null, 2)}</pre>
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
                  onSyncEox={handleSyncEoxForModules}
                  setError={setError}
                />
              )}
            </>
          }
        />

        {/* Jobs page route */}
        <Route path="/jobs" element={<Jobs />} />

      </Routes>
      {/* ⭐ ROUTING ENDS HERE ⭐ */}

    </main>
  </div>
);

}

export default App;
