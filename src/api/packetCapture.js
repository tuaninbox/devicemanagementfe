import { api } from "./client";

export async function listInterfaces(payload) {
  const res = await api.post(
    `/pcap/interfaces`,
    payload,
    { withCredentials: true }
  );
  return res.data;
}

export async function startCapture(payload) {
  const res = await api.post(
    `/pcap/start`,
    payload,
    { withCredentials: true }
  );
  return res.data;
}

export async function stopCapture(payload) {
  const res = await api.post(
    `/pcap/stop`,
    payload,
    { withCredentials: true }
  );
  return res.data;
}

export async function listActiveCaptures(payload) {
  const res = await api.post(
    `/pcap/active`,
    payload,
    { withCredentials: true }
  );
  return res.data;
}

export async function listCaptureFiles(payload) {
  const res = await api.post(
    `/pcap/files`,
    payload,
    { withCredentials: true }
  );
  return res.data;
}

export async function deleteCapture(payload) {
  const res = await api.post(
    `/pcap/delete`,
    payload,
    { withCredentials: true }
  );
  return res.data;
}

export async function downloadCapture(payload) {
  return api.post(
    `/pcap/download`,
    payload,
    { responseType: "blob", withCredentials: true }
  );
}
