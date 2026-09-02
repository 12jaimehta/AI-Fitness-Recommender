"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Clock, 
  Send,
  User,
  HelpCircle,
  ArrowLeft,
  Home
} from 'lucide-react';
import Link from 'next/link';
import FormSelect from "@/components/shared/FormSelect";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      contact: "jaimehtaalerts@gmail.com",
      action: "mailto:jaimehtaalerts@gmail.com"
    },
    // {
    //   icon: Phone,
    //   title: "Phone Support",
    //   description: "Call us Monday-Friday, 9AM-6PM EST",
    //   contact: "1-800-DIET-PLAN",
    //   action: "tel:18003487752"
    // },
    // {
    //   icon: MessageCircle,
    //   title: "Live Chat",
    //   description: "Chat with our support team in real-time",
    //   contact: "Available 24/7",
    //   action: "#"
    // }
  ];

  const faqItems = [
    {
      question: "How do I create a diet plan?",
      answer: "Simply fill out our multi-step form with your personal information, dietary preferences, and goals. Our AI will generate a personalized plan for you."
    },
    {
      question: "Can I modify my diet plan?",
      answer: "Yes! You can regenerate your plan at any time or use the alternatives provided in the weekly view to customize your meals."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption and never share your personal information with third parties."
    }
  ];

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
            <Link href="/help" style={{
              textDecoration: 'none',
              color: '#6b7280',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              Help
            </Link>
            <span>/</span>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#282828' }}>Contact Us</span>
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
            <Mail size={40} color="#ffffff" />
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#282828',
            marginBottom: '16px',
            margin: 0
          }}>
            Contact Us
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            marginBottom: '0',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            We're here to help! Reach out to us through any of the following channels
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          marginBottom: '60px'
        }}>
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#282828',
              marginBottom: '24px'
            }}>
              Get in Touch
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.a
                    key={index}
                    href={method.action}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '24px',
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(22, 42, 65, 0.1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      background: '#282828',
                      borderRadius: '10px',
                      flexShrink: 0
                    }}>
                      <Icon size={24} color="#ffffff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#282828',
                        marginBottom: '4px',
                        margin: 0
                      }}>
                        {method.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        marginBottom: '8px',
                        margin: 0
                      }}>
                        {method.description}
                      </p>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#282828',
                        margin: 0
                      }}>
                        {method.contact}
                      </p>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Contact Form */}
          {/* <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#282828',
              marginBottom: '24px'
            }}>
              Send us a Message
            </h2>
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              border: '1px solid rgba(22, 42, 65, 0.1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px'
                  }}
                >
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    background: '#10b981',
                    borderRadius: '50%',
                    marginBottom: '16px'
                  }}>
                    <Send size={32} color="#ffffff" />
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#282828',
                    marginBottom: '8px'
                  }}>
                    Message Sent!
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    We'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#282828',
                      marginBottom: '8px'
                    }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid rgba(22, 42, 65, 0.2)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#282828'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(22, 42, 65, 0.2)'}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#282828',
                      marginBottom: '8px'
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid rgba(22, 42, 65, 0.2)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#282828'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(22, 42, 65, 0.2)'}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <FormSelect
                      label="Subject"
                      value={formData.subject}
                      onChange={(value) => setFormData({ ...formData, subject: value })}
                      options={[
                        { value: "general", label: "General inquiry" },
                        { value: "technical", label: "Technical support" },
                        { value: "billing", label: "Billing question" },
                        { value: "feedback", label: "Feedback" },
                        { value: "other", label: "Other" },
                      ]}
                      required
                      variant="dropdown"
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#282828',
                      marginBottom: '8px'
                    }}>
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid rgba(22, 42, 65, 0.2)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#282828'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(22, 42, 65, 0.2)'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      background: isSubmitting ? '#9ca3af' : '#282828',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '14px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock size={18} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div> */}
        </div>

        {/* Quick FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#282828',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Frequently Asked Questions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                style={{
                  background: 'rgba(22, 42, 65, 0.05)',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid rgba(22, 42, 65, 0.1)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <HelpCircle size={20} color="#282828" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#282828',
                      marginBottom: '8px'
                    }}>
                      {item.question}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {item.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
