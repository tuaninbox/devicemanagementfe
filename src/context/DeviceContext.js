import React, { createContext, useState, useEffect } from "react";
import { listDevices } from "../api/sync";

export const DeviceContext = createContext();
export function DeviceProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingDevices, setLoadingDevices] = useState(false);

  // Frontend-controlled pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // 25 is a good default
  // const loadDevices = async () => {
  //   try {
  //     setLoadingDevices(true);

  //     // Step 1: fetch first batch (200)
  //     const res = await listDevices(1, 200);
  //     const backendTotal = res.total || 0;
  //     const firstBatch = res.items || [];

  //     // If backend has more devices than first batch, fetch the rest
  //     if (backendTotal > firstBatch.length) {
  //       const remaining = backendTotal - firstBatch.length;

  //       // Step 2: fetch the rest
  //       const res2 = await listDevices(2, remaining);
  //       const secondBatch = res2.items || [];

  //       // Step 3: merge + dedupe by ID
  //       const merged = [...firstBatch, ...secondBatch];
  //       const deduped = Array.from(
  //         new Map(merged.map((d) => [d.id, d])).values()
  //       );

  //       setDevices(deduped);
  //       setTotal(backendTotal);
  //     } else {
  //       // backend returned everything in the first batch
  //       setDevices(firstBatch);
  //       setTotal(backendTotal);
  //     }
  //   } finally {
  //     setLoadingDevices(false);
  //   }
  // };



  const loadDevices = async () => {
    try {
      setLoadingDevices(true);

      // const res = await listDevices(page, pageSize);
      const res = await listDevices(1,99999);
      setDevices(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Failed to load devices", err);
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  return (
    <DeviceContext.Provider
      value={{
        devices,
        total,
        loadingDevices,
        loadDevices,
        setLoadingDevices,
        page,
        setPage,
        pageSize,
        setPageSize,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}
