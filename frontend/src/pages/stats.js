import React, { useState } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import axios from "axios";

function Stats() {
  const [code, setCode] = useState("");
  const [stats, setStats] = useState(null);

  const handleFetch = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/shorturls/${code}`);
      setStats(res.data);
    } catch (error) {
      alert("Error fetching stats");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>URL Statistics</Typography>
      <TextField
        fullWidth
        label="Enter Shortcode"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleFetch}>Get Stats</Button>

      {stats && (
        <div style={{ marginTop: "20px" }}>
          <Typography>Original URL: {stats.url}</Typography>
          <Typography>Clicks: {stats.clicks}</Typography>
          <Typography>Expiry: {new Date(stats.expiry).toString()}</Typography>
        </div>
      )}
    </Container>
  );
}

export default Stats;
