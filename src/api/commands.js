import { api } from "./client";

export async function getAvailableCommands(deviceId) {
  const res = await api.get(
    `/commands/available?device_id=${deviceId}`,
    { withCredentials: true }
  );
  return res.data;
}

export async function runCommands(deviceId, commands) {
  const res = await api.post(
    `/commands/run`,
    {
      device_id: deviceId,
      commands: commands
    },
    { withCredentials: true }
  );
  return res.data;
}
