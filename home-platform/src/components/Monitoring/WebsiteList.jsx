import React from "react";
import StatusBadge from "./StatusBadge";

const WebsiteList = ({ websites }) => {
  if (!websites.length) {
    return <p>No websites added yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Website</th>
          <th>Status</th>
          <th>Response Time</th>
        </tr>
      </thead>
      <tbody>
        {websites.map((site) => (
          <tr key={site.id}>
            <td>{site.url}</td>
            <td>
              <StatusBadge status={site.status} />
            </td>
            <td>{site.response_time} ms</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default WebsiteList;
