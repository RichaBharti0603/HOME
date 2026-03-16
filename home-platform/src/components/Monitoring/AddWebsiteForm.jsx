import React, { useState } from "react";
import { registerWebsite } from "../../services/monitoringApi";

const AddWebsiteForm = ({ onAdded }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerWebsite(url);
      setUrl("");
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Website to Monitor</h3>

      <input
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Website"}
      </button>

      {error && <p>{error}</p>}
    </form>
  );
};

export default AddWebsiteForm;
