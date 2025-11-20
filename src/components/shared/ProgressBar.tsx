"use client";

import { motion } from "framer-motion";
import {ProgressBarProps} from "@/lib/types";



export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={step.id} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: isActive 
                  ? 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 100%)'
                  : isCompleted 
                  ? '#10b981'
                  : 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                border: isActive ? '2px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}>
                <Icon size={24} color={isActive || isCompleted ? '#000000' : '#9ca3af'} />
              </div>
              <h3 style={{
                color: isActive ? '#9ca3af' : isCompleted ? '#10b981' : '#9ca3af',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {step.title}
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '12px',
                margin: 0
              }}>
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
      
      {/* Progress Line */}
      <div style={{
        height: '2px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '1px',
        marginTop: '20px',
        position: 'relative'
      }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
            borderRadius: '1px'
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
