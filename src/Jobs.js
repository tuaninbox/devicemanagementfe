import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { TimezoneContext } from "./context//TimezoneContext";

function Jobs() {
  const { timezone, setTimezone } = useContext(TimezoneContext);

  const [jobs, setJobs] = useState([]);

  const loadJobs = async () => {
    try {
      const response = await fetch("http://localhost:8000/jobs");
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs", err);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 10000);
    return () => clearInterval(interval);
  }, []);

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
          {jobs.map(job => (
            <tr key={job.id}>
              <td>{job.id}</td>
              <td>{job.category}</td>
              <td>{job.description}</td>
              <td>{job.status}</td>
             <td>
                {job.started_at
                  ? new Date(job.started_at).toLocaleString("en-AU", {
                      timeZone: timezone,
                    })
                  : "-"}
              </td>
              <td>
                {job.finished_at
                  ? new Date(job.finished_at).toLocaleString("en-AU", {
                      timeZone: timezone,
                    })
                  : "-"}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Jobs;
