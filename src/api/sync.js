import axios from "axios";
import { API_BASE } from "../config";

export async function syncDevices(hostnames) {
  const payload = { hostnames };

  const res = await axios.post(`${API_BASE}/devices/sync`, payload);
  return res.data;
}

export async function syncModulesEox(payload) {

  const res = await axios.post(`${API_BASE}/modules/sync-eox`, payload);
  return res.data;
}

export async function listDevices(page, pageSize) {
  const res = await axios.get(`${API_BASE}/devices`, {
    params: { page, page_size: pageSize },
  });

  return res.data;
}

export async function getDeviceConfigOps(hostname) {
  const res = await axios.get(`${API_BASE}/devices/${hostname}/configops`);
  return res.data; // returns DeviceConfigOpsEnvelope
}
