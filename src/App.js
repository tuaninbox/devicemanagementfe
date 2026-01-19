import React, { useState, useEffect, useContext, useCallback} from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import DeviceList from "./pages/DeviceList";
import DeviceConfigOps from "./pages/DeviceConfig";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import "./App.css";
import { syncDevices, syncModulesEox, listDevices } from "./api/sync";
import { useConfirmDialog } from "./hooks/useConfirmDialog";
import { AuthContext } from "./context/AuthContext";
import { TimezoneContext } from "./context/TimezoneContext";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const { authLoading } = useContext(AuthContext);


  const { user, logout } = useContext(AuthContext);
  const { timezone, setTimezone } = useContext(TimezoneContext);
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

  const { confirm, ConfirmDialog } = useConfirmDialog();
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

    
    const proceed = await confirm({
      title: "Sync Devices",
      message: "Do you want to sync selected devices?",
      confirmText: "Yes",
      cancelText: "No",
    });
    if (!proceed) return;
      
    try {
      const data = await syncDevices(hostnames);

      if (data.success) {
        setResult({
          type: "success",
          title: "Device Sync Started",
          text: `A background job has been created to sync ${selectedDevices.length === 0 ? "all devices" : selectedDevices.length + " device(s)"}.`,
          jobId: data.job_id
        });
      } else {
        setResult({
          type: "error",
          title: "Device Sync Failed",
          text: data.message || "The server returned an unexpected error."
        });
      }
    } catch (err) {
      setError({
        title: "Operation Failed",
        text:
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "An unexpected error occurred.",
        details: err.response?.data || null
      });

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
      setError({
        title: "Operation Failed",
        text:
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "An unexpected error occurred.",
        details: err.response?.data || null
      });

    } finally {
      setLoading(false);
    }
  };


  // Reload when page or pageSize changes
  // useEffect(() => {
  //   handleListDevices();
  // }, [page, pageSize]);
  useEffect(() => {
  if (!authLoading && user) {
    handleListDevices();
  }
}, [authLoading, user, page, pageSize]);


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

      const proceed = await confirm({
        title: "Sync Devices",
        message: "Do you want to sync selected devices?",
        confirmText: "Yes",
        cancelText: "No",
      });
      if (!proceed) return;
      
      // Call shared API helper
      const data = await syncModulesEox(payload);

      if (data.success) {
        setResult({
          type: "success",
          title: "Warranty Sync Started",
          text: `A background job has been created to sync warranty information for ${selectedDevices.length === 0 ? "all devices" : selectedDevices.length + " device(s)"}.`,
          jobId: data.job_id
        });
      } else {
        setResult({
          type: "error",
          title: "Warranty Sync Failed",
          text: data.message || "The server returned an unexpected error."
        });
      }

    } catch (err) {
      setError({
        title: "Operation Failed",
        text:
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "An unexpected error occurred.",
        details: err.response?.data || null
      });

    } finally {
      setLoading(false);
    }
  };


  if (authLoading) {
    return <div className="loading-screen">Loading...</div>;
  }


  return (
  <div className="app-root">
    {/* {!isLoginPage && (
    <header className="app-header">
      <h1>Device Sync Dashboard</h1>
      <div style={{ marginBottom: "10px" }}>
          <label style={{ marginRight: "8px" }}>Timezone:</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="timezone-select"
          >
            <option value="Australia/Perth">Australia/Perth (GMT+8)</option>
            <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
            <option value="Asia/Shanghai">Asia/Shanghai (GMT+8)</option>
            <option value="UTC">UTC</option>
            <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
          </select>
        </div>
        <div className="header-right">
        <span>{user?.username}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </header>
    )} */}
    {!isLoginPage && (
      <header className="app-header">
        <h1 className="app-title">Device Sync Dashboard</h1>

        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user?.username}</span>
          </div>

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
    )}

    <main className="app-main">
      <div className={`top-loading-bar ${loading ? "active" : ""}`} />
      {/* ? Toolbar ? */}
      {!isLoginPage && (
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
        <ConfirmDialog />
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
      )} 
      
      {/* ? ROUTING ? */}
      <Routes>

        {/* Default dashboard route */}
        <Route
          path="/"
          element={
            <>
              {/* Failed result */}
              {error && (
                <div className="status status-error">
                  <h3>{error.title}</h3>
                  <p>{error.text}</p>

                  {error.details && (
                    <details style={{ marginTop: "10px" }}>
                      <summary>Show technical details</summary>
                      <pre>{JSON.stringify(error.details, null, 2)}</pre>
                    </details>
                  )}
                </div>
              )}

              {/* Successful result */ }
              {result && (
                <div className={`status ${result.type === "error" ? "status-error" : "status-success"}`}>
                  <h3>{result.title}</h3>
                  <p>{result.text}</p>

                  {result.jobId && (
                    <p><strong>Job ID:</strong> {result.jobId}</p>
                  )}
                </div>
              )}


              {/* {Array.isArray(devices) && devices.length > 0 && ( */}
              {/* {Array.isArray(devices) &&
               */}
              {loading ? ( 
                // <div className="loading-message">Loading devices<span className="dots"></span></div> 
                <div className="loading-wrapper">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Loading devices…</p>
                </div>
              ) : (
              
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
        <Route path="/login" element={<Login />}/>
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/devices/:hostname/config" element={<DeviceConfigOps />} />
      </Routes>
    </main>
  </div>
);

}

export default App;