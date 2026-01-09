import React from "react";

const StatusBadge = ({ status }) => {
  const isUp = status === "UP";

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: isUp ? "#d1fae5" : "#fee2e2",
        color: isUp ? "#065f46" : "#991b1b",
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
