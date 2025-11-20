"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, Heart, Zap } from "lucide-react";

export const LoadingSpinner: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '40px'
    }}>
      {/* Animated Spinner with Gradient Border */}
      <motion.div
        style={{
          position: 'relative',
          width: '80px',
          height: '80px'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer spinning ring with gradient */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
          padding: '3px',
          animation: 'spin 2s linear infinite'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.9)'
          }} />
        </div>
        
        {/* Inner pulsing circle */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Sparkles size={28} color="#ffffff" />
        </motion.div>

        {/* Orbiting dots */}
        {[0, 120, 240].map((rotation, index) => (
          <motion.div
            key={index}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#ec4899',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: `0 0 10px ${index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#ec4899'}`
            }}
            animate={{ 
              rotate: [rotation, rotation + 360]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "linear",
              delay: index * 0.2
            }}
          />
        ))}
      </motion.div>

      {/* Animated Text with Icons */}
      <motion.div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Main loading text */}
        <motion.div
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: "#8b5cf6",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Brain size={24} color="#8b5cf6" />
          AI is generating your plan...
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Sparkles size={20} color="#8b5cf6" />
          </motion.div>
        </motion.div>

        {/* Subtitle with animated icons */}
        <motion.div
          style={{
            fontSize: '14px',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart size={16} color="#ec4899" />
          </motion.div>
          Analyzing your health data
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            <Zap size={16} color="#f59e0b" />
          </motion.div>
        </motion.div>

        {/* Progress dots */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginTop: '8px'
        }}>
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
              }}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Floating particles effect */}
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: index % 3 === 0 ? '#3b82f6' : index % 3 === 1 ? '#8b5cf6' : '#ec4899',
            opacity: 0.6
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
          initial={{
            top: `${50 + Math.random() * 20}%`,
            left: `${40 + Math.random() * 20}%`
          }}
        />
      ))}
    </div>
  );
};
