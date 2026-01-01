import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function FileViewer() {
  const { deviceId, fileType } = useParams();
  const [content, setContent] = useState("");
  const [device, setDevice] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await axios.get(`${API_BASE}/devices/${deviceId}/file/${fileType}`);
      setContent(res.data.content);
      setDevice(res.data.device);
    }
    load();
  }, [deviceId, fileType]);

  return (
    <div className="panel panel-result">
      <h2>
        {fileType.toUpperCase()} — {device?.hostname}
      </h2>

      <pre className="file-content">{content}</pre>

      <Link className="button" to="/devices">
        Back to Devices
      </Link>
    </div>
  );
}
