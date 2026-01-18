import { api } from "./client";

export async function syncDevices(hostnames) {
  const payload = { hostnames };
  const res = await api.post("/devices/sync", payload);
  return res.data;
}

export async function syncModulesEox(payload) {
  const res = await api.post("/modules/sync-eox", payload);
  return res.data;
}

export async function listDevices(page, pageSize) {
  const res = await api.get("/devices/", {
    params: { page, page_size: pageSize },
  });
  return res.data;
}

export async function getDeviceConfigOps(hostname) {
  const res = await api.get(`/devices/${hostname}/configops`);
  return res.data;
}

export async function getJobs() {
  const res = await api.get("/jobs/");
  return res.data;
}
