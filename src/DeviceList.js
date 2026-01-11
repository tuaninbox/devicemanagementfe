import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "./App.css";

/**
 * DeviceList
 *
 * Props:
 * - devices: array of device objects
 * - onSelectionChange: (selectedDeviceIds: number[]) => void
 *
 * Optional pagination props (for backend pagination):
 * - page: current page (1-based)
 * - setPage: function to update page
 * - pageSize: items per page
 * - setPageSize: function to update pageSize
 * - total: total number of devices across all pages
 */
export default function DeviceList({
  devices,
  onSelectionChange,
  page,
  setPage,
  pageSize,
  setPageSize,
  total,
  onSyncEox,
  setError  
}) {
  const [expanded, setExpanded] = useState({});
  const [expandedInterfaces, setExpandedInterfaces] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [selected, setSelected] = useState({});
  const [selectedModules, setSelectedModules] = useState({});

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    hostname: "",
    mgmt: "",
    model: "",
    serial: "",
  });

  const [showModuleFilters, setShowModuleFilters] = useState(false);
  const [moduleFilters, setModuleFilters] = useState({
    name: "",
    part_number: "",
    serial: "",
    description: "",
    warranty: "",
    expiry: "",
    sfp: "",
  });

  const [showInterfaceFilters, setShowInterfaceFilters] = useState(false);
  const [interfaceFilters, setInterfaceFilters] = useState({
    name: "",
    status: "",
    speed: "",
    description: "",
    sfp: "",
  });

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

      if (newState) {
        setExpandedInterfaces((prevInt) => ({ ...prevInt, [id]: true }));
        setExpandedModules((prevMod) => ({ ...prevMod, [id]: true }));
      } else {
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

  // Apply top-level filters
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

  const hasPagination =
    typeof page === "number" &&
    typeof pageSize === "number" &&
    typeof total === "number" &&
    typeof setPage === "function" &&
    typeof setPageSize === "function";

  const totalPages =
    hasPagination && pageSize > 0 ? Math.ceil(total / pageSize) : 1;

  return (
    <section className="panel panel-result">
      <div className="title-row">
        <h3>Devices in Inventory</h3>
        <button
          className="button"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

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
              {showFilters && (
                <input
                  className="filter-input"
                  placeholder="Filter"
                  value={filters.hostname}
                  onChange={(e) =>
                    setFilters({ ...filters, hostname: e.target.value })
                  }
                />
              )}
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
              {showFilters && (
                <input
                  className="filter-input"
                  placeholder="Filter"
                  value={filters.mgmt}
                  onChange={(e) =>
                    setFilters({ ...filters, mgmt: e.target.value })
                  }
                />
              )}
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
              {showFilters && (
                <input
                  className="filter-input"
                  placeholder="Filter"
                  value={filters.model}
                  onChange={(e) =>
                    setFilters({ ...filters, model: e.target.value })
                  }
                />
              )}
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
              {showFilters && (
                <input
                  className="filter-input"
                  placeholder="Filter"
                  value={filters.serial}
                  onChange={(e) =>
                    setFilters({ ...filters, serial: e.target.value })
                  }
                />
              )}
            </th>

            <th className="center">Config</th>
            <th className="center">Operational Data</th>
          </tr>
        </thead>

        <tbody>
          {sortedDevices.map((d, index) => {
            const rowNumber =
              hasPagination && page && pageSize
                ? (page - 1) * pageSize + index + 1
                : index + 1;

            return (
              <React.Fragment key={d.id}>
                <tr className={selected[d.id] ? "row-selected" : ""}>
                  <td className="center">
                    <input
                      type="checkbox"
                      checked={!!selected[d.id]}
                      onChange={() => toggleSelect(d.id)}
                    />
                  </td>

                  <td className="center">{rowNumber}</td>

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
                    {(d.routing_table_path || d.mac_table_path) ? (
                      <Link
                        className="button"
                        to={`/file/${d.id}/operational`}
                      >
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
                      {/* ========================= INTERFACES SECTION ========================= */}
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
                        <button
                          className="button"
                          style={{ marginLeft: "auto" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowInterfaceFilters((prev) => !prev);
                          }}
                        >
                          {showInterfaceFilters
                            ? "Hide Filters"
                            : "Show Filters"}
                        </button>
                      </h4>

                      {expandedInterfaces[d.id] && (
                        <table className="subtable">
                          <thead>
                            <tr>
                              <th className="center">No</th>
                              <th>
                                Name
                                {showInterfaceFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="Filter"
                                    value={interfaceFilters.name}
                                    onChange={(e) =>
                                      setInterfaceFilters({
                                        ...interfaceFilters,
                                        name: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                              <th>
                                Status / Protocol
                                {showInterfaceFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="Filter"
                                    value={interfaceFilters.status}
                                    onChange={(e) =>
                                      setInterfaceFilters({
                                        ...interfaceFilters,
                                        status: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                              <th>
                                Speed
                                {showInterfaceFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="Filter"
                                    value={interfaceFilters.speed}
                                    onChange={(e) =>
                                      setInterfaceFilters({
                                        ...interfaceFilters,
                                        speed: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                              <th>
                                Description
                                {showInterfaceFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="Filter"
                                    value={interfaceFilters.description}
                                    onChange={(e) =>
                                      setInterfaceFilters({
                                        ...interfaceFilters,
                                        description: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                              <th>
                                SFP / Module Info
                                {showInterfaceFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="Filter"
                                    value={interfaceFilters.sfp}
                                    onChange={(e) =>
                                      setInterfaceFilters({
                                        ...interfaceFilters,
                                        sfp: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {d.interfaces
                              ?.filter((i) => {
                                const name = (i.name || "").toLowerCase();
                                const statusCombined = `${i.status || ""}/${
                                  i.line_protocol || ""
                                }`.toLowerCase();
                                const speed = (i.speed || "").toLowerCase();
                                const desc = (i.description || "").toLowerCase();

                                const parentModule =
                                  i.sfp_module &&
                                  d.modules.find(
                                    (m) => m.id === i.sfp_module.module_id
                                  );

                                const sfpText = parentModule
                                  ? `${parentModule.description} ${parentModule.part_number} ${parentModule.serial_number}`.toLowerCase()
                                  : "none";

                                return (
                                  name.includes(
                                    interfaceFilters.name.toLowerCase()
                                  ) &&
                                  statusCombined.includes(
                                    interfaceFilters.status.toLowerCase()
                                  ) &&
                                  speed.includes(
                                    interfaceFilters.speed.toLowerCase()
                                  ) &&
                                  desc.includes(
                                    interfaceFilters.description.toLowerCase()
                                  ) &&
                                  sfpText.includes(
                                    interfaceFilters.sfp.toLowerCase()
                                  )
                                );
                              })
                              .map((i, idx) => {
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

                      {/* ========================= MODULES SECTION ========================= */}
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
                        <button
                          className="button"
                          style={{ marginLeft: "10px" }}
                          onClick={(e) => {
                            e.stopPropagation();

                            // 1. Collect selected module IDs
                            const selectedIds = Object.keys(selectedModules)
                              .filter((id) => selectedModules[id])
                              .map((id) => Number(id));

                            let modulesToSync = [];

                            if (selectedIds.length === 0) {
                              // ⭐ No modules selected → sync ALL modules for this device
                              modulesToSync = d.modules;
                            } else {
                              // ⭐ Sync only selected modules
                              modulesToSync = d.modules.filter((m) => selectedIds.includes(m.id));
                            }

                            // 2. Extract valid serial numbers
                            const serialNumbers = modulesToSync
                              .map((m) => m.serial_number?.trim().toUpperCase())
                              .filter(Boolean); // remove null/undefined/empty

                            if (serialNumbers.length === 0) {
                              setError({
                                message: "No valid serial numbers found for selected modules",
                              });
                              return;
                            }

                            // 3. Call the App.js handler with the new payload format
                            onSyncEox({ serialNumbers });
                          }}
                        >
                          {Object.values(selectedModules).some((v) => v)
                            ? `Sync Warranty Information (${
                                Object.values(selectedModules).filter(Boolean).length
                              } Selected Modules)`
                            : "Sync Warranty Information (All Modules)"}
                        </button>

                        <button
                          className="button"
                          style={{ marginLeft: "auto" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowModuleFilters((prev) => !prev);
                          }}
                        >
                          {showModuleFilters ? "Hide Filters" : "Show Filters"}
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
                                    d.modules.every(
                                      (m) => selectedModules[m.id]
                                    )
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
                              <th>
                                Name
                                {showModuleFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="Filter"
                                    value={moduleFilters.name}
                                    onChange={(e) =>
                                      setModuleFilters({
                                        ...moduleFilters,
                                        name: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                              <th>
                                Part Number
                                {showModuleFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="Filter"
                                    value={moduleFilters.part_number}
                                    onChange={(e) =>
                                      setModuleFilters({
                                        ...moduleFilters,
                                        part_number: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                              <th>
                                Serial
                                {showModuleFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="Filter"
                                    value={moduleFilters.serial}
                                    onChange={(e) =>
                                      setModuleFilters({
                                        ...moduleFilters,
                                        serial: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                              <th>
                                Description
                                {showModuleFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="Filter"
                                    value={moduleFilters.description}
                                    onChange={(e) =>
                                      setModuleFilters({
                                        ...moduleFilters,
                                        description: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                              <th>
                                Under Warranty
                                {showModuleFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="yes/no"
                                    value={moduleFilters.warranty}
                                    onChange={(e) =>
                                      setModuleFilters({
                                        ...moduleFilters,
                                        warranty: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                              <th>
                                Expiry
                                {showModuleFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="Filter"
                                    value={moduleFilters.expiry}
                                    onChange={(e) =>
                                      setModuleFilters({
                                        ...moduleFilters,
                                        expiry: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                              <th>
                                SFP Module
                                {showModuleFilters && (
                                  <input
                                    className="filter-input"
                                    placeholder="Filter"
                                    value={moduleFilters.sfp}
                                    onChange={(e) =>
                                      setModuleFilters({
                                        ...moduleFilters,
                                        sfp: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {d.modules
                              ?.filter((m) => {
                                const name = (m.name || "").toLowerCase();
                                const part = (m.part_number || "").toLowerCase();
                                const serial = (m.serial_number || "").toLowerCase();
                                const desc =
                                  (m.description || "").toLowerCase();
                                const warranty = m.under_warranty
                                  ? "yes"
                                  : "no";
                                const expiry = m.warranty_expiry
                                  ? new Date(
                                      m.warranty_expiry
                                    ).toLocaleDateString().toLowerCase()
                                  : "";
                                const sfp = m.sfp_module
                                  ? `${m.sfp_module.interface_name} ${m.sfp_module.part_number}`.toLowerCase()
                                  : "";

                                return (
                                  name.includes(
                                    moduleFilters.name.toLowerCase()
                                  ) &&
                                  part.includes(
                                    moduleFilters.part_number.toLowerCase()
                                  ) &&
                                  serial.includes(
                                    moduleFilters.serial.toLowerCase()
                                  ) &&
                                  desc.includes(
                                    moduleFilters.description.toLowerCase()
                                  ) &&
                                  warranty.includes(
                                    moduleFilters.warranty.toLowerCase()
                                  ) &&
                                  expiry.includes(
                                    moduleFilters.expiry.toLowerCase()
                                  ) &&
                                  sfp.includes(
                                    moduleFilters.sfp.toLowerCase()
                                  )
                                );
                              })
                              .map((m, idx) => (
                                <tr
                                  key={m.id}
                                  className={
                                    selectedModules[m.id]
                                      ? "row-selected"
                                      : ""
                                  }
                                >
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
            );
          })}
        </tbody>
      </table>

      {hasPagination && (
        <div className="pagination-bar">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="button"
          >
            Prev
          </button>

          <span className="pagination-info">
            Page {page} of {totalPages}{" "}
            {total ? `(Total devices: ${total})` : ""}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="button"
          >
            Next
          </button>

          {/* <select
            className="page-size-select"
            value={pageSize}
            onChange={(e) => {
              const newSize = e.target.value === "all" ? 999 : Number(e.target.value);
              setPageSize(newSize);
              if (setPage) setPage(1);
            }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select> */}
          <select
            className="page-size-select"
            value={pageSize === 999999 ? "all" : pageSize}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "all") {
                setPageSize(999999);
                setPage(1);
              } else {
                setPageSize(Number(val));
                setPage(1);
              }
            }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>

        </div>
      )}
    </section>
  );
}
