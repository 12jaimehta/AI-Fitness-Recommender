"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { Save, FolderOpen, Trash2, Check } from "lucide-react";

export interface SavedPlanListItem {
  id: string;
  title: string;
  description?: string;
  created_at: string;
}

interface SavedPlanActionsProps {
  unsignedMessage: string;
  savedListTitle: string;
  onSave: () => Promise<void>;
  onLoad: () => Promise<SavedPlanListItem[]>;
  onDelete: (id: string) => Promise<void>;
}

export default function SavedPlanActions({
  unsignedMessage,
  savedListTitle,
  onSave,
  onLoad,
  onDelete,
}: SavedPlanActionsProps) {
  const { isSignedIn } = useCurrentUser();
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlanListItem[]>([]);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSavePlan = async () => {
    if (!isSignedIn) return;

    setIsSaving(true);
    try {
      await onSave();
      setSaveMessage("Plan saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving plan:", error);
      setSaveMessage("Failed to save plan");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSavedPlans = async () => {
    if (!isSignedIn) return;

    try {
      const plans = await onLoad();
      setSavedPlans(plans);
      setShowSaved(true);
    } catch (error) {
      console.error("Error loading saved plans:", error);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!isSignedIn) return;

    try {
      await onDelete(planId);
      setSavedPlans((prev) => prev.filter((plan) => plan.id !== planId));
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  if (!isSignedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: "center",
          padding: "20px",
          background: "rgba(102, 126, 234, 0.1)",
          borderRadius: "16px",
          border: "2px solid rgba(102, 126, 234, 0.2)",
          margin: "20px 0",
        }}
      >
        <p
          style={{
            color: "#667eea",
            fontSize: "16px",
            fontWeight: "600",
            margin: 0,
          }}
        >
          {unsignedMessage}
        </p>
      </motion.div>
    );
  }

  return (
    <div style={{ margin: "20px 0" }}>
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "12px 20px",
            background: saveMessage.includes("success") ? "#10b981" : "#ef4444",
            color: "#ffffff",
            borderRadius: "12px",
            marginBottom: "16px",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Check size={16} />
          {saveMessage}
        </motion.div>
      )}

      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <motion.button
          onClick={handleSavePlan}
          disabled={isSaving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.7 : 1,
          }}
          whileHover={!isSaving ? { scale: 1.05 } : {}}
          whileTap={!isSaving ? { scale: 0.95 } : {}}
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Plan"}
        </motion.button>

        <motion.button
          onClick={handleLoadSavedPlans}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "#ffffff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FolderOpen size={16} />
          My Saved Plans
        </motion.button>
      </div>

      {showSaved && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowSaved(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "30px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "70vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  margin: 0,
                }}
              >
                {savedListTitle}
              </h3>
              <button
                onClick={() => setShowSaved(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>

            {savedPlans.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  margin: "40px 0",
                }}
              >
                No saved plans yet
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {savedPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    style={{
                      padding: "16px",
                      border: "2px solid rgba(102, 126, 234, 0.2)",
                      borderRadius: "12px",
                      background: "rgba(102, 126, 234, 0.05)",
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#1a1a1a",
                            margin: "0 0 8px 0",
                          }}
                        >
                          {plan.title}
                        </h4>
                        {plan.description && (
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#6b7280",
                              margin: "0 0 8px 0",
                            }}
                          >
                            {plan.description}
                          </p>
                        )}
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#9ca3af",
                            margin: 0,
                          }}
                        >
                          {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#ef4444",
                            padding: "4px",
                          }}
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
