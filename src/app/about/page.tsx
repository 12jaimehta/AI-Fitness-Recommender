"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  Users, 
  Target, 
  Heart, 
  Award,
  ArrowLeft,
  Home,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import Link from 'next/link';

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    description: "Passionate about making healthy living accessible to everyone through technology and personalized nutrition."
  },
  {
    name: "Dr. Michael Chen",
    role: "Chief Medical Officer",
    description: "Board-certified nutritionist with 15+ years of experience in clinical nutrition and preventive medicine."
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Product",
    description: "Dedicated to creating user-friendly experiences that make health and fitness tracking simple and effective."
  },
  {
    name: "James Wilson",
    role: "Lead AI Engineer",
    description: "Expert in machine learning and nutrition science, focused on developing intelligent diet planning algorithms."
  }
];

const companyStats = [
  {
    number: "500K+",
    label: "Active Users",
    description: "People transforming their lives with our platform"
  },
  {
    number: "10M+",
    label: "Meal Plans Generated",
    description: "Personalized nutrition plans created by our AI"
  },
  {
    number: "98%",
    label: "Customer Satisfaction",
    description: "Users who achieve their health goals"
  },
  {
    number: "50+",
    label: "Team Members",
    description: "Dedicated professionals committed to your success"
  }
];

const milestones = [
  {
    year: "2020",
    title: "Founded",
    description: "Started with a mission to make personalized nutrition accessible to everyone"
  },
  {
    year: "2021",
    title: "AI Launch",
    description: "Introduced our revolutionary AI-powered diet planning system"
  },
  {
    year: "2022",
    title: "Mobile Expansion",
    description: "Expanded to mobile platforms with responsive design and offline capabilities"
  },
  {
    year: "2023",
    title: "Global Reach",
    description: "Reached users in over 100 countries worldwide"
  },
  {
    year: "2024",
    title: "Advanced Analytics",
    description: "Launched comprehensive health tracking and progress analytics"
  }
];

export default function AboutUs() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
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
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#162a41' }}>About Us</span>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
            background: '#162a41',
            borderRadius: '20px',
            marginBottom: '20px'
          }}>
            <Building size={40} color="#ffffff" />
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#162a41',
            marginBottom: '16px',
            margin: 0
          }}>
            About Diet Plan
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            marginBottom: '0',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Empowering healthier lives through personalized nutrition and intelligent planning
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '48px',
            marginBottom: '60px',
            textAlign: 'center',
            border: '1px solid rgba(22, 42, 65, 0.1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: '#162a41',
            borderRadius: '50%',
            marginBottom: '24px'
          }}>
            <Target size={32} color="#ffffff" />
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#162a41',
            marginBottom: '16px'
          }}>
            Our Mission
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            lineHeight: '1.7',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            To make personalized nutrition and fitness planning accessible to everyone through cutting-edge AI technology. 
            We believe that healthy living shouldn't be complicated or expensive - it should be personalized, 
            effective, and enjoyable for each individual's unique journey.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '60px'
          }}
        >
          {companyStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(22, 42, 65, 0.1)'
              }}
            >
              <div style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#162a41',
                marginBottom: '8px'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#162a41',
                marginBottom: '8px'
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {stat.description}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: '60px' }}
        >
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              background: '#162a41',
              borderRadius: '50%',
              marginBottom: '16px'
            }}>
              <Users size={32} color="#ffffff" />
            </div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#162a41',
              marginBottom: '16px'
            }}>
              Meet Our Team
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              The passionate experts behind your health journey
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(22, 42, 65, 0.1)'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#162a41',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#ffffff'
                  }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#162a41',
                  marginBottom: '8px'
                }}>
                  {member.name}
                </h3>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#162a41',
                  marginBottom: '16px'
                }}>
                  {member.role}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ marginBottom: '60px' }}
        >
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              background: '#162a41',
              borderRadius: '50%',
              marginBottom: '16px'
            }}>
              <Award size={32} color="#ffffff" />
            </div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#162a41',
              marginBottom: '16px'
            }}>
              Our Journey
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Key milestones in our mission to transform health and wellness
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                style={{
                  background: 'rgba(22, 42, 65, 0.05)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  border: '1px solid rgba(22, 42, 65, 0.1)'
                }}
              >
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#162a41',
                  marginBottom: '8px'
                }}>
                  {milestone.year}
                </div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#162a41',
                  marginBottom: '8px'
                }}>
                  {milestone.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {milestone.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
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
            color: '#162a41',
            marginBottom: '24px'
          }}>
            Get in Touch
          </h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6b7280'
            }}>
              <Mail size={18} />
              <span>support@dietplan.com</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6b7280'
            }}>
              <Phone size={18} />
              <span>1-800-DIET-PLAN</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6b7280'
            }}>
              <MapPin size={18} />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
