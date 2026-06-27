"use client";

import { useState } from "react";

export default function TestPage() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 40, fontFamily: "system-ui", background: "#f0f9ff", minHeight: "100vh" }}>
      <h1 style={{ color: "#1A7EA8", fontSize: 32 }}>Test Page</h1>
      <p>This should have teal heading.</p>

      <div style={{
        marginTop: 20,
        padding: 20,
        background: "white",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ color: "#333", fontSize: 18 }}>Counter: {count}</h2>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            marginTop: 10,
            padding: "10px 20px",
            background: "#1A7EA8",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          Increment
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ color: "#333" }}>Test Links:</h3>
        <a href="/dashboard" style={{ color: "#1A7EA8", marginRight: 20 }}>Dashboard</a>
        <a href="/dashboard/patient" style={{ color: "#1A7EA8", marginRight: 20 }}>Patient</a>
        <a href="/login" style={{ color: "#1A7EA8" }}>Login</a>
      </div>
    </div>
  );
}
