"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import dynamic from "next/dynamic";
import UnifiedNavbar from "../../components/shared/UnifiedNavbar";
import UnifiedFooter from "../../components/shared/UnifiedFooter";
import WorkoutPlanActions from "../../components/workout/WorkoutPlanActions";
import { generateAIWorkoutPlan, WorkoutPlanData } from "@/lib/service/dietWorkoutplan";
import { WorkoutPlanFormData } from "@/lib/validation/workoutPlanSchema";
import PageLoader from "@/components/ui/PageLoader";

// Dynamic imports to prevent hydration mismatch
const WorkoutMultiStepForm = dynamic(() => import("../../components/workout").then(mod => ({ default: mod.WorkoutMultiStepForm })), {
  ssr: false,
  loading: () => <PageLoader title="Generating AI Workout plan..."/>
});

const WorkoutPlanDisplay = dynamic(() => import("../../components/workout").then(mod => ({ default: mod.WorkoutPlanDisplay })), {
  ssr: false,
  loading: () => <PageLoader title="Generating AI Workout plan..."/>
});

const LoadingSpinner = dynamic(() => import("../../components/shared").then(mod => ({ default: mod.LoadingSpinner })), {
  ssr: false
});

export default function WorkoutPage() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WorkoutPlanFormData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFormSubmit = async (data: WorkoutPlanFormData) => {
    setLoading(true);
    setFormData(data);
    
    try {
      // Generate AI-powered workout plan
      const plan = await generateAIWorkoutPlan(data);
      setWorkoutPlan(plan);
    } catch (error) {
      console.error("Error generating AI workout plan:", error);
      // Handle error appropriately in production
    } finally {
      setLoading(false);
    }
  };

  const handleNewPlan = () => {
    setWorkoutPlan(null);
    setFormData(null);
  };

  const handleRegenerate = async () => {
    if (!formData) return;
    
    setLoading(true);
    
    try {
      // Generate new AI-powered workout plan with same data
      const plan = await generateAIWorkoutPlan(formData);
      setWorkoutPlan(plan);
    } catch (error) {
      console.error("Error regenerating AI workout plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#667eea',
        position: 'relative'
      }}>
        <UnifiedNavbar />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Activity size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <UnifiedNavbar />
      
      {loading ? (
        <div style={{
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <LoadingSpinner />
        </div>
      ) : workoutPlan ? (
        <WorkoutPlanDisplay 
          workoutPlan={workoutPlan} 
          onNewPlan={handleNewPlan}
          onRegenerate={handleRegenerate}
          loading={loading}
        />
      ) : (
        <div style={{
          minHeight: '100vh',
          background: '#ffffff',
          padding: '60px 20px 80px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              style={{
                fontSize: 'clamp(42px, 6vw, 64px)',
                fontWeight: '800',
                color: '#1a202c',
                marginBottom: '24px',
                lineHeight: '1.1'
              }}
            >
              Custom
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Workout Plans
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              style={{
                fontSize: 'clamp(18px, 2.5vw, 22px)',
                fontWeight: '400',
                color: '#4a5568',
                marginBottom: '60px',
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto 60px'
              }}
            >
              AI-generated workout routines tailored to your fitness level and goals
            </motion.p>
            
            <WorkoutMultiStepForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
        </div>
      )}
      
      {/* Show plan actions when we have a workout plan and form data */}
      {workoutPlan && formData && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          zIndex: 100,
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <WorkoutPlanActions 
            formData={formData} 
            workoutPlan={workoutPlan}
          />
        </div>
      )}
      
      <UnifiedFooter />
    </div>
  );
}
