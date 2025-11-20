"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { DietPlanFormData } from "../../lib/validation/dietPlanSchema";
import UnifiedNavbar from "../../components/shared/UnifiedNavbar";
import UnifiedFooter from "../../components/shared/UnifiedFooter";
import PlanActions from "../../components/diet/PlanActions";
import { DietPlanData, generateAIDietPlan } from "@/lib/service/dietWorkoutplan";

// Dynamic imports to prevent hydration mismatch
const RefactoredMultiStepForm = dynamic(() => import("../../components/diet").then(mod => ({ default: mod.RefactoredMultiStepForm })), {
  ssr: false,
  loading: () => <div style={{ 
    height: '400px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    color: '#667eea'
  }}>Loading form...</div>
});

const RefactoredDietPlanDisplay = dynamic(() => import("../../components/diet").then(mod => ({ default: mod.RefactoredDietPlanDisplay })), {
  ssr: false,
  loading: () => <div style={{ 
    height: '400px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    color: '#667eea'
  }}>Loading diet plan...</div>
});

const LoadingSpinner = dynamic(() => import("../../components/shared").then(mod => ({ default: mod.LoadingSpinner })), {
  ssr: false
});

export default function Home() {
  const [dietPlan, setDietPlan] = useState<DietPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DietPlanFormData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFormSubmit = async (data: DietPlanFormData) => {
    setLoading(true);
    setFormData(data);
    
    try {
      // Generate AI-powered diet plan
      const plan = await generateAIDietPlan(data);
      setDietPlan(plan);
    } catch (error) {
      console.error("Error generating AI diet plan:", error);
      // Handle error appropriately in production
    } finally {
      setLoading(false);
    }
  };

  const handleNewPlan = () => {
    setDietPlan(null);
    setFormData(null);
  };

  const handleRegenerate = async () => {
    if (!formData) return;
    
    setLoading(true);
    
    try {
      // Generate new AI-powered diet plan with same data
      const plan = await generateAIDietPlan(formData);
      setDietPlan(plan);
    } catch (error) {
      console.error("Error regenerating AI diet plan:", error);
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
      ) : dietPlan ? (
        <RefactoredDietPlanDisplay 
          dietPlan={dietPlan} 
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
              Personalized
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Diet Plans
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
              AI-powered nutrition plans tailored to your goals and lifestyle
            </motion.p>
            
            <RefactoredMultiStepForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
        </div>
      )}
      
      {/* Show plan actions when we have a diet plan and form data */}
      {dietPlan && formData && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          zIndex: 100,
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <PlanActions 
            formData={formData} 
            dietPlan={dietPlan}
          />
        </div>
      )}
      
      <UnifiedFooter />
    </div>
  );
}
