import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "./App.css";

export default function DeviceList({ devices, onSelectionChange }) {
  const [expanded, setExpanded] = useState({});
  const [expandedInterfaces, setExpandedInterfaces] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [selected, setSelected] = useState({});
  const [selectedModules, setSelectedModules] = useState({});

  // Column filters
  const [filters, setFilters] = useState({
    hostname: "",
    mgmt: "",
    model: "",
    serial: "",
  });

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Notify parent when device selection changes
  useEffect(() => {
    const selectedIds = Object.keys(selected)
      .filter((id) => selected[id])
      .map((id) => Number(id));

    onSelectionChange(selectedIds);
  }, [selected, onSelectionChange]);

  const toggleExpand = (id) => {
  setExpanded((prev) => {
      const newState = !prev[id]; 
      // When expanding device → expand interfaces + modules
      if (newState) {
      setExpandedInterfaces((prevInt) => ({ ...prevInt, [id]: true }));
      setExpandedModules((prevMod) => ({ ...prevMod, [id]: true }));
      } else {
      // When collapsing device → collapse interfaces + modules
      setExpandedInterfaces((prevInt) => ({ ...prevInt, [id]: false }));
      setExpandedModules((prevMod) => ({ ...prevMod, [id]: false }));
      } 
      return { ...prev, [id]: newState };
  });
  };


  const toggleSelect = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Apply filters
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const hostname = (d.hostname || "").toLowerCase();
      const mgmt = (d.mgmt_address || "").toLowerCase();
      const model = (d.model || "").toLowerCase();
      const serial = (d.serial_number || "").toLowerCase();

      return (
        hostname.includes(filters.hostname.toLowerCase()) &&
        mgmt.includes(filters.mgmt.toLowerCase()) &&
        model.includes(filters.model.toLowerCase()) &&
        serial.includes(filters.serial.toLowerCase())
      );
    });
  }, [devices, filters]);

  // Apply sorting
  const sortedDevices = useMemo(() => {
    let sortable = [...filteredDevices];

    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const valA = (a[sortConfig.key] || "").toString().toLowerCase();
        const valB = (b[sortConfig.key] || "").toString().toLowerCase();

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return sortable;
  }, [filteredDevices, sortConfig]);

  return (
    <section className="panel panel-result">
      <h3>Devices in Inventory</h3>

      <table className="device-table">
        <thead>
          <tr>

            <th className="center">
              <input
                type="checkbox"
                checked={
                  sortedDevices.length > 0 &&
                  sortedDevices.every((d) => selected[d.id])
                }
                onChange={(e) => {
                  const checked = e.target.checked;
                  const updated = { ...selected };
                  sortedDevices.forEach((d) => {
                    updated[d.id] = checked;
                  });
                  setSelected(updated);
                }}
              />
            </th>

            <th className="center">No</th>
            {/* Hostname */}
            <th className="sortable" onClick={() => requestSort("hostname")}>
              Hostname{" "}
              {sortConfig.key === "hostname"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
              <br />
              <input
                className="filter-input"
                placeholder="Filter"
                value={filters.hostname}
                onChange={(e) =>
                  setFilters({ ...filters, hostname: e.target.value })
                }
              />
            </th>

            {/* Mgmt IP */}
            <th
              className="sortable"
              onClick={() => requestSort("mgmt_address")}
            >
              Mgmt IP{" "}
              {sortConfig.key === "mgmt_address"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
              <br />
              <input
                className="filter-input"
                placeholder="Filter"
                value={filters.mgmt}
                onChange={(e) =>
                  setFilters({ ...filters, mgmt: e.target.value })
                }
              />
            </th>

            {/* Model */}
            <th className="sortable" onClick={() => requestSort("model")}>
              Model{" "}
              {sortConfig.key === "model"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
              <br />
              <input
                className="filter-input"
                placeholder="Filter"
                value={filters.model}
                onChange={(e) =>
                  setFilters({ ...filters, model: e.target.value })
                }
              />
            </th>

            {/* Serial */}
            <th
              className="sortable"
              onClick={() => requestSort("serial_number")}
            >
              Serial{" "}
              {sortConfig.key === "serial_number"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
              <br />
              <input
                className="filter-input"
                placeholder="Filter"
                value={filters.serial}
                onChange={(e) =>
                  setFilters({ ...filters, serial: e.target.value })
                }
              />
            </th>

            <th className="center">Config</th>
            <th className="center">Operational Data</th>
          </tr>
        </thead>

        <tbody>
          {sortedDevices.map((d, index) => (
            <React.Fragment key={d.id}>
              <tr className={selected[d.id] ? "row-selected" : ""}>
                <td className="center">
                  <input
                    type="checkbox"
                    checked={!!selected[d.id]}
                    onChange={() => toggleSelect(d.id)}
                  />
                </td>
                
                <td className="center">{index + 1}</td>
                
                {/* Hostname + expand icon */}
                <td style={{ cursor: "pointer" }}>
                  <span
                    onClick={() => toggleExpand(d.id)}
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      marginRight: "8px",
                      userSelect: "none",
                    }}
                  >
                    {expanded[d.id] ? "−" : "+"}
                  </span>
                  {d.hostname}
                </td>

                <td>{d.mgmt_address}</td>
                <td>{d.model}</td>
                <td>{d.serial_number}</td>

                <td className="center">
                  {d.running_config_path ? (
                    <Link className="button" to={`/file/${d.id}/config`}>
                      View
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="center">
                  {d.routing_table_path || d.mac_table_path ? (
                    <Link className="button" to={`/file/${d.id}/operational`}>
                      View
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>

              {expanded[d.id] && (
                <tr className="expanded-row">
                  <td colSpan="8">
                    {/* INTERFACES */}
                    <h4
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setExpandedInterfaces((prev) => ({
                          ...prev,
                          [d.id]: !prev[d.id],
                        }))
                      }
                    >
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          userSelect: "none",
                        }}
                      >
                        {expandedInterfaces[d.id] ? "−" : "+"}
                      </span>
                      Interfaces
                    </h4>

                    {expandedInterfaces[d.id] && (
                      <table className="subtable">
                        <thead>
                          <tr>
                            <th className="center">No</th>
                            <th>Name</th>
                            <th>Status / Protocol</th>
                            <th>Speed</th>
                            <th>Description</th>
                            <th>SFP / Module Info</th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.interfaces?.map((i, idx) => {
                            const parentModule =
                              i.sfp_module &&
                              d.modules.find(
                                (m) => m.id === i.sfp_module.module_id
                              );

                            return (
                              <tr key={i.id}>
                                <td className="center">{idx + 1}</td>
                                <td>{i.name}</td>
                                <td>
                                  {(i.status || "-") +
                                    "/" +
                                    (i.line_protocol || "-")}
                                </td>
                                <td>{i.speed}</td>
                                <td>{i.description}</td>

                                <td>
                                  {parentModule ? (
                                    <div>
                                      <strong>
                                        {parentModule.description}
                                      </strong>
                                      <br />
                                      PN: {parentModule.part_number}
                                      <br />
                                      SN: {parentModule.serial_number}
                                      <br />
                                      HW: {parentModule.hw_revision}
                                    </div>
                                  ) : (
                                    "None"
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}

                    {/* MODULES */}
                    <h4
                      style={{
                        marginTop: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setExpandedModules((prev) => ({
                          ...prev,
                          [d.id]: !prev[d.id],
                        }))
                      }
                    >
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          userSelect: "none",
                        }}
                      >
                        {expandedModules[d.id] ? "−" : "+"}
                      </span>
                      Modules

                      {/* Sync Warranty Button */}
                      <button
                        className="button"
                        onClick={() => {
                          const selectedIds = Object.keys(selectedModules)
                            .filter((id) => selectedModules[id])
                            .map((id) => Number(id));

                          if (selectedIds.length === 0) {
                            console.log(
                              "Syncing ALL modules for device:",
                              d.hostname
                            );
                          } else {
                            console.log("Syncing SELECTED modules:", selectedIds);
                          }
                        }}
                      >
                        {Object.values(selectedModules).some((v) => v)
                          ? `Sync Warranty Information (${
                              Object.values(selectedModules).filter(Boolean)
                                .length
                            } Selected Modules)`
                          : "Sync Warranty Information (All Modules)"}
                      </button>
                    </h4>

                    {expandedModules[d.id] && (
                      <table className="subtable">
                        <thead>
                          <tr>
                            <th className="center">
                              <input
                                type="checkbox"
                                checked={
                                  d.modules.length > 0 &&
                                  d.modules.every((m) => selectedModules[m.id])
                                }
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const updated = { ...selectedModules };
                                  d.modules.forEach((m) => {
                                    updated[m.id] = checked;
                                  });
                                  setSelectedModules(updated);
                                }}
                              />
                            </th>
                            <th className="center">No</th>
                            <th>Name</th>
                            <th>Part Number</th>
                            <th>Serial</th>
                            <th>Description</th>
                            <th>Under Warranty</th>
                            <th>Expiry</th>
                            <th>SFP Module</th>
                          </tr>
                        </thead>

                        <tbody>
                          {d.modules?.map((m, idx) => (
                            <tr
                                key={m.id}
                                className={selectedModules[m.id] ? "row-selected" : ""}>
                              <td className="center">
                                <input
                                  type="checkbox"
                                  checked={!!selectedModules[m.id]}
                                  onChange={() =>
                                    setSelectedModules((prev) => ({
                                      ...prev,
                                      [m.id]: !prev[m.id],
                                    }))
                                  }
                                />
                              </td>

                              <td className="center">{idx + 1}</td>

                              <td>{m.name}</td>
                              <td>{m.part_number}</td>
                              <td>{m.serial_number}</td>
                              <td>{m.description}</td>

                              <td>{m.under_warranty ? "Yes" : "No"}</td>

                              <td>
                                {m.warranty_expiry
                                  ? new Date(
                                      m.warranty_expiry
                                    ).toLocaleDateString()
                                  : "–"}
                              </td>

                              <td>
                                {m.sfp_module ? (
                                  <div>
                                    <strong>
                                      {m.sfp_module.interface_name}
                                    </strong>
                                    <br />
                                    PN: {m.sfp_module.part_number}
                                  </div>
                                ) : (
                                  "None"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </section>
  );
}
