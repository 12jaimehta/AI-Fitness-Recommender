"use client";

import React from 'react';
import { enter, hoverLift, motion } from '@/components/shared/Motion';
import { 
  Play, 
  CheckCircle, 
  User, 
  Heart, 
  Target,
  ArrowRight,
  ArrowLeft,
  Home,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    number: 1,
    title: "Create Your Account",
    description: "Sign up with your email and create a secure password. Your account will be your personal hub for all diet and fitness planning.",
    icon: User,
    tips: [
      "Use a strong password with at least 8 characters",
      "Verify your email address to unlock all features",
      "Complete your profile for better recommendations"
    ]
  },
  {
    number: 2,
    title: "Complete Your Health Profile",
    description: "Provide detailed information about your health, dietary preferences, and fitness goals. The more accurate your information, the better your personalized plans will be.",
    icon: Heart,
    tips: [
      "Be honest about your current fitness level",
      "Include any allergies or dietary restrictions",
      "Set realistic and achievable goals"
    ]
  },
  {
    number: 3,
    title: "Generate Your First Plan",
    description: "Let our AI analyze your information and create a personalized diet and workout plan tailored specifically to your needs and goals.",
    icon: Target,
    tips: [
      "Review the generated plan carefully",
      "Don't hesitate to regenerate if not satisfied",
      "Check the weekly view for meal alternatives"
    ]
  },
  {
    number: 4,
    title: "Track Your Progress",
    description: "Follow your plan consistently and track your progress regularly. Use our tools to monitor your journey and make adjustments as needed.",
    icon: TrendingUp,
    tips: [
      "Log your meals and workouts daily",
      "Take progress photos weekly",
      "Update your weight and measurements regularly"
    ]
  }
];

const features = [
  {
    icon: Clock,
    title: "Daily Meal Plans",
    description: "Get detailed daily meal plans with calorie counts and nutritional information."
  },
  {
    icon: Target,
    title: "Weekly Alternatives",
    description: "Choose from multiple meal options to keep your diet interesting and varied."
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your progress with detailed analytics and insights."
  },
  {
    icon: Award,
    title: "Achievement System",
    description: "Stay motivated with goals, milestones, and achievement rewards."
  }
];

export default function GettingStarted() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navigation */}
        <motion.div
          {...enter()}
          style={{ marginBottom: '40px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            color: '#6b7280'
          }}>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: '#6b7280',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              <Home size={20} />
              Home
            </Link>
            <span>/</span>
            <Link href="/help" style={{
              textDecoration: 'none',
              color: '#6b7280',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              Help
            </Link>
            <span>/</span>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#282828' }}>Getting Started</span>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          {...enter(0.1)}
          style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: '#282828',
            borderRadius: '20px',
            marginBottom: '20px'
          }}>
            <Play size={40} color="#ffffff" />
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#282828',
            marginBottom: '16px',
            margin: 0
          }}>
            Getting Started
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            marginBottom: '0',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Your complete guide to starting your health journey with Diet Plan
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          {...enter(0.2)}
          style={{ marginBottom: '60px' }}
        >
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#282828',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            4 Simple Steps to Get Started
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '30px'
          }}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  {...enter(0.3 + index * 0.1)}
                  {...hoverLift}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '32px',
                    border: '1px solid rgba(22, 42, 65, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '24px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '64px',
                      height: '64px',
                      background: '#282828',
                      borderRadius: '12px',
                      flexShrink: 0
                    }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#ffffff'
                      }}>
                        {step.number}
                      </div>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#282828',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <Icon size={24} color="#282828" />
                        {step.title}
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        marginBottom: '20px'
                      }}>
                        {step.description}
                      </p>
                      
                      <div style={{
                        background: 'rgba(22, 42, 65, 0.05)',
                        borderRadius: '8px',
                        padding: '16px'
                      }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#282828',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <CheckCircle size={16} color="#10b981" />
                          Pro Tips
                        </h4>
                        <ul style={{
                          margin: 0,
                          paddingLeft: '20px',
                          listStyle: 'none'
                        }}>
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              marginBottom: '6px',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px'
                            }}>
                              <span style={{ color: '#10b981', marginTop: '2px' }}>•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          {...enter(0.7)}
          style={{ marginBottom: '60px' }}
        >
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#282828',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            Key Features to Explore
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  {...enter(0.8 + index * 0.1)}
                  {...hoverLift}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    border: '1px solid rgba(22, 42, 65, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    background: '#282828',
                    borderRadius: '12px',
                    marginBottom: '16px'
                  }}>
                    <Icon size={28} color="#ffffff" />
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#282828',
                    marginBottom: '12px'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          {...enter(0.9)}
          style={{
            background: 'rgba(22, 42, 65, 0.05)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            border: '1px solid rgba(22, 42, 65, 0.1)'
          }}
        >
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#282828',
            marginBottom: '16px'
          }}>
            Ready to Start Your Journey?
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            Begin your personalized health and fitness journey today with our AI-powered planning system.
          </p>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#282828',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'all 0.3s ease'
          }}>
            Get Started Now
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
