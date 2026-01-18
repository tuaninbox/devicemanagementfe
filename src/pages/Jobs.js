
import React, { useEffect, useState, useContext, useRef } from "react";
import { TimezoneContext } from "../context/TimezoneContext";
import { getJobs } from "../api/sync";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";


function Jobs() {
  const { user } = useContext(AuthContext);
  const { timezone } = useContext(TimezoneContext);
  const [jobs, setJobs] = useState([]);
  const isMountedRef = useRef(true);

  const loadJobs = async () => {
    try {
      const data = await getJobs();
      if (isMountedRef.current) {
        setJobs(data || []);
      }
    } catch (err) {
      console.error("Failed to load jobs", err);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    // initial load
    loadJobs();

    // poll every 5s
    const interval = setInterval(loadJobs, 5000);

    // cleanup
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Background Jobs</h2>

      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Description</th>
            <th>Status</th>
            <th>Started</th>
            <th>Finished</th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              <td>{job.category}</td>
              <td>{job.description}</td>
              <td>{job.status}</td>
              <td>{job.started_at  ? new Date(job.started_at).toLocaleString("en-AU", {
                          timeZone: timezone,
                        })
                      : "-"}</td>
              <td>{job.finished_at ? new Date(job.finished_at).toLocaleString("en-AU", {
                          timeZone: timezone,
                        })
                      : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Jobs;

