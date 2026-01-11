import React, { useEffect, useState } from "react";

function Jobs() {
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
    const interval = setInterval(loadJobs, 5000);
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
              <td>{job.started_at || "-"}</td>
              <td>{job.finished_at || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Jobs;
