"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, Trophy, Activity, Target, Apple, Brain, Zap } from "lucide-react";

interface FeatureCardProps {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  description: string;
  delay: number;
  gradient: string;
}

function FeatureCard({ icon: Icon, title, description, delay, gradient }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 400, damping: 10 }}
      whileHover={{ y: -5 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 20px 40px -12px rgba(102, 126, 234, 0.15)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
    >
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '16px',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        color: '#ffffff',
        boxShadow: '0 10px 20px -5px rgba(102, 126, 234, 0.2)'
      }}>
        <Icon size={28} />
      </div>
      <h3 style={{
        color: '#1a1a1a',
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '12px'
      }}>
        {title}
      </h3>
      <p style={{ color: '#6b7280', fontSize: '15px', margin: 0, lineHeight: '1.5' }}>
        {description}
      </p>
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      style={{ textAlign: 'center', marginBottom: '80px' }}
    >
      {/* Main heading with healthcare theme */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 10 }}
      >
        <h1 style={{
          fontSize: '64px',
          fontWeight: '800',
          color: '#1a1a1a',
          marginBottom: '24px',
          lineHeight: '1.1',
          letterSpacing: '-0.02em'
        }}>
          Your Personal
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Health Companion
          </span>
        </h1>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          color: '#6b7280',
          fontSize: '22px',
          marginBottom: '50px',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 50px'
        }}
      >
        Get personalized nutrition plans powered by AI, designed for your unique health goals and lifestyle
      </motion.p>
      
      {/* Trust indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          marginBottom: '60px',
          flexWrap: 'wrap'
        }}
      >
        {[
          { icon: Activity, text: "Expert-Designed", delay: 0 },
          { icon: Brain, text: "AI-Powered", delay: 0.1 },
          { icon: Target, text: "Goal-Focused", delay: 0.2 }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#667eea',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            <item.icon size={20} />
            <span>{item.text}</span>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Features with modern healthcare design */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        <FeatureCard
          icon={Sparkles}
          title="Smart Nutrition"
          description="Advanced AI algorithms create personalized meal plans based on your unique needs"
          delay={0.6}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <FeatureCard
          icon={Heart}
          title="Health-Focused"
          description="Every plan is designed with your health goals and medical considerations in mind"
          delay={0.7}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <FeatureCard
          icon={Trophy}
          title="Proven Results"
          description="Track your progress with plans that have helped thousands achieve their goals"
          delay={0.8}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </div>

      {/* Additional features row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '25px'
      }}>
        <FeatureCard
          icon={Apple}
          title="Food Preferences"
          description="Accommodates dietary restrictions, allergies, and personal food preferences"
          delay={0.9}
          gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
        <FeatureCard
          icon={Zap}
          title="Quick & Easy"
          description="Get your personalized plan in seconds, not hours of consultation"
          delay={1.0}
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        />
      </div>
    </motion.div>
  );
}
