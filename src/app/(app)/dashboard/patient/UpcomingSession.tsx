"use client";
import { useState } from "react";
import { formatDateTime } from "@/lib/data/dashboard-mock";
import { getToken } from "@/lib/auth";

type Booking = {
  id: string;
  status: string;
  sessionStatus: string;
  scheduledAt: string;
  amount: number;
  address?: string;
  location?: string;
  drip?: {
    name: string;
    slug: string;
    icon: string;
  };
  nurse?: {
    name: string;
    phone: string;
  };
};

type UpcomingSessionProps = {
  session: Booking;
};

export default function UpcomingSession({ session }: UpcomingSessionProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({
    hygieneRating: 5,
    behaviourRating: 5,
    comfortRating: 5,
    overallRating: 5,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleFeedbackSubmit() {
    setSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          bookingId: session.id,
          ...feedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setShowFeedback(false);
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return { bg: "#DBEAFE", color: "#1D4ED8" };
      case "nurse_en_route":
        return { bg: "#FEF3C7", color: "#D97706" };
      case "in_progress":
        return { bg: "#D1FAE5", color: "#059669" };
      case "completed":
        return { bg: "#DCFCE7", color: "#16A34A" };
      case "cancelled":
        return { bg: "#FEE2E2", color: "#DC2626" };
      default:
        return { bg: "#F3F4F6", color: "#6B7280" };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Scheduled";
      case "nurse_en_route":
        return "Nurse En Route";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const statusStyle = getStatusColor(session.sessionStatus || session.status);

  return (
    <div
      style={{
        background: "var(--white)",
        borderRadius: 16,
        padding: 20,
        border: "1.5px solid var(--border)",
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            {session.drip?.name || "IV Therapy Session"}
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            {formatDateTime(session.scheduledAt)}
          </p>
        </div>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 50,
            fontSize: 12,
            fontWeight: 500,
            background: statusStyle.bg,
            color: statusStyle.color,
          }}
        >
          {getStatusLabel(session.sessionStatus || session.status)}
        </span>
      </div>

      {/* Location */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 14 }}>📍</span>
        <span style={{ fontSize: 13, color: "var(--text-2)" }}>
          {session.location === "home"
            ? "Home Visit"
            : session.location === "clinic"
            ? "At Clinic"
            : session.location === "office"
            ? "Office Visit"
            : "Hotel Visit"}
          {session.address && ` — ${session.address}`}
        </span>
      </div>

      {/* Nurse info */}
      {session.nurse && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 14 }}>👩‍⚕️</span>
          <span style={{ fontSize: 13 }}>
            <strong>{session.nurse.name}</strong>
            {session.nurse.phone && (
              <a
                href={`tel:${session.nurse.phone}`}
                style={{ color: "var(--teal)", marginLeft: 8, textDecoration: "none" }}
              >
                📞 Call
              </a>
            )}
          </span>
        </div>
      )}

      {/* Price */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
          ₹{session.amount?.toLocaleString("en-IN") || 0}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {session.sessionStatus === "completed" && !submitted && (
            <button
              onClick={() => setShowFeedback(true)}
              style={{
                padding: "6px 14px",
                borderRadius: 50,
                background: "var(--sky-bg)",
                border: "none",
                fontSize: 12,
                cursor: "pointer",
                color: "var(--teal)",
              }}
            >
              Leave Feedback
            </button>
          )}
          {submitted && (
            <span style={{ fontSize: 12, color: "#16A34A", display: "flex", alignItems: "center", gap: 4 }}>
              ✓ Feedback Submitted
            </span>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "var(--white)",
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: "100%",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
              Session Feedback
            </h3>

            {[
              { key: "hygieneRating", label: "Hygiene & Safety" },
              { key: "behaviourRating", label: "Nurse Professionalism" },
              { key: "comfortRating", label: "Comfort During Session" },
              { key: "overallRating", label: "Overall Experience" },
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                  {label}
                </label>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const rating = (feedback as unknown as Record<string, number>)[key];
                    return (
                      <button
                        key={star}
                        onClick={() => setFeedback((f) => ({ ...f, [key]: star }))}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          border: "none",
                          background: rating >= star ? "var(--gold)" : "#E5E7EB",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                      >
                        {star <= rating ? "★" : "☆"}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                Additional Comments
              </label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience..."
                rows={3}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1.5px solid var(--border)",
                  fontSize: 14,
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowFeedback(false)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 50,
                  border: "1.5px solid var(--border)",
                  background: "var(--white)",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 50,
                  background: submitting ? "#ccc" : "var(--teal)",
                  color: "#fff",
                  border: "none",
                  fontSize: 14,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}