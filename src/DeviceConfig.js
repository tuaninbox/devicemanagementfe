import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getDeviceConfigOps } from "./api/sync";

export default function DeviceConfigOps() {
  const { hostname } = useParams();

  const [config, setConfig] = useState("");
  const [operational, setOperational] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("config");
  const [searchTerm, setSearchTerm] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const configRef = useRef(null);
  const operationalRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const envelope = await getDeviceConfigOps(hostname);

        if (!envelope.success) {
          setError(envelope.message || "Failed to load configuration");
          return;
        }

        setConfig(envelope.result?.configuration || "");
        setOperational(envelope.result?.operationaldata || "");
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [hostname]);

  const downloadConfig = () => {
    const blob = new Blob([config], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${hostname}_config.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highlightText = (text) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  const getMarks = () => {
    const ref = activeTab === "config" ? configRef : operationalRef;
    if (!ref.current) return [];
    return Array.from(ref.current.querySelectorAll("mark"));
  };

  const scrollToMatch = (index) => {
    const marks = getMarks();
    if (marks.length === 0) return;
    const target = marks[index % marks.length];
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleFind = () => {
    setMatchIndex(0);
    scrollToMatch(0);
  };

  const handleNext = () => {
    const marks = getMarks();
    if (marks.length === 0) return;
    const nextIndex = (matchIndex + 1) % marks.length;
    setMatchIndex(nextIndex);
    scrollToMatch(nextIndex);
  };

  const handlePrev = () => {
    const marks = getMarks();
    if (marks.length === 0) return;
    const prevIndex = (matchIndex - 1 + marks.length) % marks.length;
    setMatchIndex(prevIndex);
    scrollToMatch(prevIndex);
  };

  if (loading) return <div className="config-loading">Loading configuration…</div>;
  if (error) return <div className="config-error">Error: {JSON.stringify(error)}</div>;

  const copyActiveTab = () => {
    const ref = activeTab === "config" ? configRef : operationalRef;
    const text = ref.current?.innerText || "";
    navigator.clipboard.writeText(text);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // revert after 2 seconds
  };

  return (
    <div className="config-page">
      <h2>Configuration for {hostname}</h2>

      {/* Tabs */}
      <div className="config-tabs">
        <button
          className={activeTab === "config" ? "active" : ""}
          onClick={() => setActiveTab("config")}
        >
          Configuration
        </button>

        <button
          className={activeTab === "operational" ? "active" : ""}
          onClick={() => setActiveTab("operational")}
          disabled={!operational}
        >
          Operational Data
        </button>
      </div>

      {/* Standout Section */}
      <div className="config-section">
        <div className="config-section-header">
          <h3>
            {activeTab === "config"
              ? "Configuration Output"
              : "Operational Data Output"}
          </h3>

          <div className="config-header-actions">

            {/* Search Group */}
            <div className="search-group">
              <span className="material-symbols-rounded search-icon">search</span>

              <input
                type="text"
                className="search-input"
                placeholder="Search…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setMatchIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFind();
                }}
              />

              <button className="icon-btn" onClick={handlePrev} title="Previous match">
                <span className="material-symbols-rounded">arrow_upward</span>
              </button>

              <button className="icon-btn" onClick={handleNext} title="Next match">
                <span className="material-symbols-rounded">arrow_downward</span>
              </button>
            </div>
            
            {/* Download Button */}
            <button className="icon-btn" onClick={downloadConfig} title="Download">
              <span className="material-symbols-rounded">download</span>
            </button>

            <button className="copy-config-btn" onClick={copyActiveTab}>
              <span className="material-symbols-rounded">
                {copied ? "check_circle" : "content_copy"}
              </span>
              {copied ? "Copied!" : "Copy All"}
            </button>
          </div>
        </div>


        <div className="config-section-body">
          {activeTab === "config" && (
            <pre
              className="config-block config-block-config"
              ref={configRef}
              dangerouslySetInnerHTML={{ __html: highlightText(config) }}
            />
          )}

          {activeTab === "operational" && (
            <pre
              className="config-block config-block-operational"
              ref={operationalRef}
              dangerouslySetInnerHTML={{ __html: highlightText(operational) }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
