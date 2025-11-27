"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Mail, 
  MessageCircle, 
  Building, 
  Info, 
  Shield, 
  FileText,
  ArrowLeft,
  Home
} from 'lucide-react';
import Link from 'next/link';

const helpCenterItems = [
  {
    icon: HelpCircle,
    title: "Getting Started",
    description: "Learn how to use our diet and workout planning features",
    link: "/help/getting-started"
  },
  {
    icon: MessageCircle,
    title: "FAQs",
    description: "Find answers to commonly asked questions",
    link: "/help/faqs"
  },
  {
    icon: Mail,
    title: "Contact Support",
    description: "Get in touch with our support team",
    link: "/help/contact"
  },
  {
    icon: Building,
    title: "About Our Company",
    description: "Learn more about our mission and values",
    link: "/about"
  },
  {
    icon: Shield,
    title: "Privacy Policy",
    description: "Understand how we protect your data",
    link: "/privacy"
  },
  {
    icon: FileText,
    title: "Terms of Service",
    description: "Read our terms and conditions",
    link: "/terms"
  }
];

export default function HelpCenter() {
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
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#282828' }}>Help Center</span>
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
            background: '#282828',
            borderRadius: '20px',
            marginBottom: '20px'
          }}>
            <HelpCircle size={40} color="#ffffff" />
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#282828',
            marginBottom: '16px',
            margin: 0
          }}>
            Help Center
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            marginBottom: '0',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Find answers, get support, and learn more about our services
          </p>
        </motion.div>

        {/* Help Items Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}
        >
          {helpCenterItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(22, 42, 65, 0.1)'
                }}
              >
                <Link href={item.link} style={{
                  textDecoration: 'none',
                  color: 'inherit'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '56px',
                      height: '56px',
                      background: '#282828',
                      borderRadius: '12px',
                      flexShrink: 0
                    }}>
                      <Icon size={28} color="#ffffff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#282828',
                        marginBottom: '8px',
                        margin: 0
                      }}>
                        {item.title}
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        margin: 0
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            background: 'rgba(22, 42, 65, 0.05)',
            borderRadius: '16px',
            padding: '32px',
            marginTop: '60px',
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
            Still need help?
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            Our support team is here to assist you with any questions or concerns.
          </p>
          <Link href="/help/contact" style={{
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
            <Mail size={18} />
            Contact Support
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
