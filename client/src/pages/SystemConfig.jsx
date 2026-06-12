
import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import "../styles/AdminDashboard.css"; // Reuses standard dashboard spacing & card aesthetics

export default function CommunityModeration() {
  // Moderation items initialized into local state for reactivity
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: "Julianne Devis",
      content: `"This book donation drive is a joke. I've been waiting for three weeks and nobody has picked up my box. Extremely frustrated with the service here! #BadService"`,
      posted: "Oct 15, 2026, 10:32 AM",
      status: "Flagged: Profanity",
      statusClass: "flagged",
    },
    {
      id: 2,
      user: "Marcus Rivera",
      content: `"Does anyone have a copy of 'The Shadow of the Wind'? I'm looking to complete my collection and would love to trade some of my historical fiction pieces for it."`,
      posted: "Oct 15, 2026, 10:20 AM",
      status: "Regular Post",
      statusClass: "regular",
    },
    {
      id: 3,
      user: "Unknown Account #552",
      content: `"CLICK HERE FOR FREE BOOK VOUCHERS AND AMAZON GIFTCARDS!!! http://bit.ly/fake-link-moderation-needed-fast-now"`,
      posted: "Oct 15, 2026, 9:15 AM",
      status: "Spam Detected",
      statusClass: "spam",
    },
    {
      id: 4,
      user: "Sarah Higgins",
      content: `"I just finished reading 'The Great Gatsby' for the tenth time. Every time I find something new. Is there a book club meeting this Friday to discuss classic literature?"`,
      posted: "Oct 15, 2026, 7:45 AM",
      status: "Regular Post",
      statusClass: "regular",
    },
    {
      id: 5,
      user: "Elena Wong",
      content: `"The children's reading hour was magical yesterday! Thank you to all volunteers. 📚✨"`,
      posted: "Oct 14, 2026, 6:12 PM",
      status: "Regular Post",
      statusClass: "regular",
    },
    {
      id: 6,
      user: "Daniel Park",
      content: `"Is the library open during the holiday break? I need to return some rare manuscripts."`,
      posted: "Oct 14, 2026, 2:05 PM",
      status: "Regular Post",
      statusClass: "regular",
    },
  ]);

  // Tracks IDs currently playing out their fade/slide transition before being spliced from data state
  const [removingIds, setRemovingIds] = useState([]);

  // Approve Handler
  const handleApprove = (id) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? { ...msg, status: "Approved ✓", statusClass: "verified" }
          : msg
      )
    );
    alert("✅ Message approved (status updated).");
  };

  // Delete Handler with animated delayed structural removal
  const handleDelete = (id, user) => {
    if (window.confirm(`⚠️ Permanently delete message from ${user}? This action cannot be undone.`)) {
      setRemovingIds((prev) => [...prev, id]);
      
      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        setRemovingIds((prev) => prev.filter((rid) => rid !== id));
      }, 280);
    }
  };

  // Reply Handler (Simulated view trigger)
  const handleReply = (user) => {
    alert(`📝 Compose reply to ${user} (simulated). In a full implementation, an operational modal overlay opens.`);
  };

  return (
    <AdminLayout>
      {/* Sub-Header Unit containing dynamic dynamic metrics row components */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "between", 
          alignItems: "center", 
          flexWrap: "wrap", 
          gap: "12px", 
          marginBottom: "20px" 
        }}
      >
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-tertiary)" }}>
            Moderation Queue
          </p>
          <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.75rem", color: "var(--color-primary)", fontWeight: "bold" }}>
            Community Messages
          </h2>
        </div>
        
        <div style={{ backgroundColor: "var(--color-surface)", padding: "8px 16px", borderRadius: "20px", fontSize: "0.85rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid var(--color-border)" }}>
          <span style={{ fontWeight: "600", color: "var(--color-primary)" }}>{messages.length}</span>{" "}
          <span style={{ color: "var(--color-neutral)" }}>pending items</span>
        </div>
      </div>

      {/* Main Table Interface Element Container */}
      <section className="table-card">
        <div className="card-header">
          <h3>Active Review Stream</h3>
          <span style={{ fontSize: "0.8rem", color: "var(--color-neutral)" }}>Real-time execution panel</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "15%" }}>User</th>
                <th style={{ width: "45%" }}>Message Content</th>
                <th style={{ width: "15%" }}>Posted</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "15%", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((row) => {
                const isRemoving = removingIds.includes(row.id);
                return (
                  <tr 
                    key={row.id}
                    style={{
                      opacity: isRemoving ? 0 : 1,
                      transform: isRemoving ? "translateX(20px)" : "none",
                      transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
                      backgroundColor: row.statusClass === "spam" ? "rgba(186, 26, 26, 0.03)" : "transparent"
                    }}
                  >
                    {/* User Column */}
                    <td style={{ fontWeight: "600", color: "var(--color-primary)", verticalAlign: "top" }}>
                      {row.user}
                    </td>

                    {/* Content Column */}
                    <td 
                      style={{ 
                        whiteSpace: "normal", 
                        wordBreak: "break-word", 
                        lineHeight: "1.45", 
                        color: "var(--color-text-dark)",
                        paddingRight: "20px"
                      }}
                    >
                      <div style={{ color: row.statusClass === "spam" ? "var(--color-tertiary)" : "inherit" }}>
                        {row.content}
                      </div>
                    </td>

                    {/* Date Column */}
                    <td style={{ fontSize: "0.8rem", color: "var(--color-neutral)", whiteSpace: "nowrap" }}>
                      {row.posted}
                    </td>

                    {/* Dynamic Badges Column mapping your local color standards */}
                    <td>
                      <span 
                        className={`status-badge ${
                          row.statusClass === "spam" || row.statusClass === "flagged" ? "pending" : row.statusClass
                        }`}
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          backgroundColor: row.statusClass === "spam" ? "#FFE9E9" : undefined,
                          color: row.statusClass === "spam" ? "#B91C1C" : undefined
                        }}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Actions Context Control Cluster */}
                    <td>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
                        {/* Reply Button */}
                        <button 
                          onClick={() => handleReply(row.user)}
                          style={{ border: "1px solid var(--color-border)", background: "#EEF2FF", color: "var(--color-primary)", padding: "5px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
                          title="Reply to user"
                        >
                          ↩ Reply
                        </button>

                        {/* Approve Button */}
                        {row.status !== "Approved ✓" && (
                          <button 
                            onClick={() => handleApprove(row.id)}
                            style={{ border: "1px solid var(--color-border)", background: "#E0F2E9", color: "var(--color-primary)", padding: "5px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "500", cursor: "pointer" }}
                            title="Approve message"
                          >
                            ✓ Approve
                          </button>
                        )}

                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(row.id, row.user)}
                          style={{ border: "1px solid #FFD6D6", background: "#FFE9E9", color: "#B91C1C", padding: "5px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "500", cursor: "pointer" }}
                          title="Delete message"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--color-neutral)", padding: "12px", borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-bg-light)" }}>
          All messages are displayed on this single page — easy moderation, no pagination loop.
        </div>
      </section>
    </AdminLayout>
  );
}