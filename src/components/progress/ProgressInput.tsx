"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Weight, Activity, Flame, Target, Calendar, Clock } from "lucide-react";

interface ProgressInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  inputType: 'weight' | 'workout' | 'goal';
}

export default function ProgressInput({ isOpen, onClose, onSubmit, inputType }: ProgressInputProps) {
  const [formData, setFormData] = useState({
    // Weight form data
    weight: '',
    date: new Date().toISOString().split('T')[0],

    // Workout form data
    workoutType: '',
    duration: '',
    calories: '',
    notes: '',

    // Goal form data
    goalTitle: '',
    goalTarget: '',
    goalUnit: '',
    goalCategory: 'weight'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      type: inputType,
      goalUnit: goalUnits[formData.goalCategory as keyof typeof goalUnits] 
    };

    onSubmit(submitData);
    setFormData({
      weight: '',
      date: new Date().toISOString().split('T')[0],
      workoutType: '',
      duration: '',
      calories: '',
      notes: '',
      goalTitle: '',
      goalTarget: '',
      goalUnit: '',
      goalCategory: 'weight'
    });
    onClose();
  };

  const workoutTypes = [
    'Cardio', 'Strength Training', 'Yoga', 'Running', 'Cycling',
    'Swimming', 'HIIT', 'Walking', 'Sports', 'Other'
  ];

const goalUnits: { [key: string]: string } = {
  weight: 'kg',
  workout: 'days/week',
  calories: 'cal/week',
  duration: 'min/day'
};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {inputType === 'weight' && <Weight size={24} color="#162a41" />}
              {inputType === 'workout' && <Activity size={24} color="#162a41" />}
              {inputType === 'goal' && <Target size={24} color="#162a41" />}

              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#162a41',
                margin: 0
              }}>
                {inputType === 'weight' && 'Log Weight'}
                {inputType === 'workout' && 'Add Workout'}
                {inputType === 'goal' && 'Set New Goal'}
              </h2>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(22, 42, 65, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <X size={20} color="#6b7280" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {inputType === 'weight' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#162a41';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 42, 65, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(22, 42, 65, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#162a41';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 42, 65, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(22, 42, 65, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {inputType === 'workout' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Workout Type
                  </label>
                  <select
                    required
                    value={formData.workoutType}
                    onChange={(e) => setFormData({ ...formData, workoutType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#162a41';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 42, 65, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(22, 42, 65, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select workout type</option>
                    {workoutTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#162a41';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 42, 65, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(22, 42, 65, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Calories Burned
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#162a41';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 42, 65, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(22, 42, 65, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="How did you feel? Any achievements?"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px',
                      resize: 'vertical',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#162a41';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 42, 65, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(22, 42, 65, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {inputType === 'goal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Goal Category
                  </label>
                  <select
                    required
                    value={formData.goalCategory}
                    onChange={(e) => setFormData({ ...formData, goalCategory: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#162a41';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 42, 65, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(22, 42, 65, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="weight">Weight Loss</option>
                    <option value="workout">Workout Frequency</option>
                    <option value="calories">Calorie Burn</option>
                    <option value="duration">Exercise Duration</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Goal Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Lose 10 kg, Workout 5 times a week"
                    value={formData.goalTitle}
                    onChange={(e) => setFormData({ ...formData, goalTitle: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#162a41';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 42, 65, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(22, 42, 65, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Target Value
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 10, 5, 2000"
                    value={formData.goalTarget}
                    onChange={(e) => setFormData({ ...formData, goalTarget: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#162a41';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22, 42, 65, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(22, 42, 65, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={goalUnits[formData.goalCategory as keyof typeof goalUnits]}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px',
                      background: 'rgba(22, 42, 65, 0.05)',
                      color: '#6b7280'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ marginTop: '32px' }}>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#162a41',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1e3a5f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#162a41';
                }}
              >
                {inputType === 'weight' && 'Log Weight'}
                {inputType === 'workout' && 'Add Workout'}
                {inputType === 'goal' && 'Set Goal'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
