"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/lib/use-current-user";
import { Save, Bookmark, FolderOpen, Edit, Trash2, Check } from "lucide-react";
import { WorkoutPlanFormData } from "../../lib/validation";
import { deleteWorkoutPlan, getUserWorkoutPlans, saveWorkoutPlan, WorkoutPlanData } from "@/lib/service/dietWorkoutplan";

interface WorkoutPlanActionsProps {
  formData: WorkoutPlanFormData;
  workoutPlan: WorkoutPlanData;
  onPlanLoaded?: (plan: WorkoutPlanData) => void;
}

interface SavedPlan {
  id: string;
  title: string;
  description?: string;
  created_at: string;
}

export default function WorkoutPlanActions({ formData, workoutPlan, onPlanLoaded }: WorkoutPlanActionsProps) {
  const { isSignedIn, user } = useCurrentUser();
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSave = async () => {
    if (!isSignedIn || !user) {
      setSaveMessage("Please sign in to save plans");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    setIsSaving(true);
    try {
      await saveWorkoutPlan(user.id, formData, workoutPlan);
      setSaveMessage("Workout plan saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving workout plan:", error);
      setSaveMessage("Failed to save workout plan");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSaved = async () => {
    if (!isSignedIn || !user) {
      setSaveMessage("Please sign in to load plans");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    try {
      const plans = await getUserWorkoutPlans(user.id);
      setSavedPlans(plans);
      setShowSaved(true);
    } catch (error) {
      console.error("Error loading saved plans:", error);
      setSaveMessage("Failed to load saved plans");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!isSignedIn || !user) return;

    try {
      await deleteWorkoutPlan(user.id, planId);
      setSavedPlans(savedPlans.filter(plan => plan.id !== planId));
      setSaveMessage("Plan deleted successfully");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting plan:", error);
      setSaveMessage("Failed to delete plan");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '16px',
        boxShadow: '0 10px 30px -10px rgba(102, 126, 234, 0.2)',
        border: '1px solid rgba(102, 126, 234, 0.1)'
      }}
    >
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1
          }}
          whileHover={!isSaving ? { scale: 1.05 } : {}}
          whileTap={!isSaving ? { scale: 0.95 } : {}}
        >
          {isSaving ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Save size={16} />
            </motion.div>
          ) : (
            <Save size={16} />
          )}
          {isSaving ? 'Saving...' : 'Save Workout'}
        </motion.button>

        <motion.button
          onClick={handleLoadSaved}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(102, 126, 234, 0.1)',
            color: '#667eea',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          whileHover={{ scale: 1.05, background: 'rgba(102, 126, 234, 0.15)' }}
          whileTap={{ scale: 0.95 }}
        >
          <FolderOpen size={16} />
          My Workouts
        </motion.button>
      </div>

      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            textAlign: 'center',
            background: saveMessage.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: saveMessage.includes('success') ? '#10b981' : '#ef4444'
          }}
        >
          {saveMessage}
        </motion.div>
      )}

      {/* Saved Plans Modal */}
      {showSaved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 50px -10px rgba(102, 126, 234, 0.3)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            zIndex: 1000,
            maxWidth: '400px',
            width: '90%'
          }}
        >
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '16px'
          }}>
            Saved Workout Plans
          </h3>

          {savedPlans.length === 0 ? (
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              No saved workout plans yet
            </p>
          ) : (
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              marginBottom: '16px'
            }}>
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(102, 126, 234, 0.05)',
                    marginBottom: '8px'
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1a1a1a'
                    }}>
                      {plan.title}
                    </div>
                    {plan.description && (
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {plan.description}
                      </div>
                    )}
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af'
                    }}>
                      {new Date(plan.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <motion.button
                    onClick={() => handleDeletePlan(plan.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>
              ))}
            </div>
          )}

          <motion.button
            onClick={() => setShowSaved(false)}
            style={{
              width: '100%',
              background: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Close
          </motion.button>
        </motion.div>
      )}

      {/* Backdrop for modal */}
      {showSaved && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowSaved(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}
    </motion.div>
  );
}
