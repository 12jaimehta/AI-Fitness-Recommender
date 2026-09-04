"use client";

import React, { useState } from 'react';
import { AnimatePresence, Collapse, enter, enterPop, motion, press, transition } from '@/components/shared/Motion';
import { 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  ArrowLeft,
  Home,
  Search,
  User,
  Heart,
  Activity,
  Shield,
  CreditCard,
  Settings
} from 'lucide-react';
import Link from 'next/link';

const faqCategories = [
  {
    id: 'general',
    name: 'General',
    icon: HelpCircle,
    color: '#282828'
  },
  {
    id: 'account',
    name: 'Account',
    icon: User,
    color: '#282828'
  },
  {
    id: 'diet',
    name: 'Diet Plans',
    icon: Heart,
    color: '#ef4444'
  },
  {
    id: 'workout',
    name: 'Workout Plans',
    icon: Activity,
    color: '#f59e0b'
  },
  {
    id: 'billing',
    name: 'Billing',
    icon: CreditCard,
    color: '#ef4444'
  },
  {
    id: 'technical',
    name: 'Technical',
    icon: Settings,
    color: '#282828'
  }
];

const faqData = {
  general: [
    {
      question: "What is Diet Plan?",
      answer: "Diet Plan is an AI-powered platform that creates personalized diet and workout plans based on your individual needs, preferences, and goals. Our advanced algorithms analyze your data to generate customized meal plans and exercise routines."
    },
    {
      question: "How does the AI generate my plans?",
      answer: "Our AI uses advanced machine learning algorithms to analyze your personal information, dietary preferences, fitness goals, and health conditions. It then creates customized plans that match your specific requirements while ensuring nutritional balance and effectiveness."
    },
    {
      question: "Is Diet Plan suitable for beginners?",
      answer: "Absolutely! Diet Plan is designed for users of all fitness levels. Whether you're just starting your health journey or you're an experienced athlete, our platform adapts to your specific needs and provides appropriate recommendations."
    },
    {
      question: "Can I use Diet Plan if I have dietary restrictions?",
      answer: "Yes, Diet Plan accommodates various dietary preferences including vegetarian, vegan, non-vegetarian, eggetarian, and pescatarian diets. You can also specify allergies and medical conditions, and our AI will create plans that work for you."
    }
  ],
  account: [
    {
      question: "How do I create an account?",
      answer: "Click on the 'Sign Up' button on our homepage, fill in your email address and create a password. You'll receive a confirmation email to verify your account. Once verified, you can start using all our features."
    },
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the sign-in page, enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password."
    },
    {
      question: "Can I change my email address?",
      answer: "Yes, you can update your email address in your account settings. Go to your profile page, click on 'Edit Profile', and enter your new email address. You'll need to verify the new email address."
    },
    {
      question: "How do I delete my account?",
      answer: "You can delete your account from the account settings page. Please note that this action is permanent and will remove all your data, including saved diet plans and progress tracking."
    }
  ],
  diet: [
    {
      question: "How accurate are the calorie calculations?",
      answer: "Our calorie calculations are based on scientifically proven formulas that take into account your age, gender, height, weight, activity level, and goals. While highly accurate, individual metabolism may vary, so results should be used as guidelines."
    },
    {
      question: "Can I customize my meal plans?",
      answer: "Yes! You can regenerate your plan at any time if you're not satisfied with the current one. In the weekly view, you'll also find alternative meal options that you can switch between while maintaining similar nutritional values."
    },
    {
      question: "What if I don't like a recommended meal?",
      answer: "You can either regenerate the entire plan or use the alternative meals provided in the weekly view. Each meal comes with 2-3 alternatives that offer similar nutritional benefits."
    },
    {
      question: "How often should I update my diet plan?",
      answer: "We recommend updating your diet plan every 4-6 weeks or whenever you experience significant changes in your weight, activity level, or goals. This ensures your plan continues to meet your evolving needs."
    }
  ],
  workout: [
    {
      question: "Do I need equipment for the workout plans?",
      answer: "Our workout plans can be customized based on available equipment. Whether you have a full gym, basic home equipment, or no equipment at all, our AI will create appropriate routines for your situation."
    },
    {
      question: "How do I know if I'm doing exercises correctly?",
      answer: "Each exercise in our plans includes detailed instructions, proper form guidelines, and common mistakes to avoid. We recommend starting with lighter weights and focusing on form before increasing intensity."
    },
    {
      question: "Can I modify the workout plans?",
      answer: "Yes, you can regenerate your workout plan at any time. You can also specify your preferred workout frequency, available equipment, and fitness level to get more personalized routines."
    },
    {
      question: "How long until I see results?",
      answer: "Results vary depending on your consistency, starting point, and goals. Most users begin to feel stronger and more energetic within 2-3 weeks, with visible changes typically appearing after 6-8 weeks of consistent effort."
    }
  ],
  billing: [
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our payment partners."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for new subscriptions. If you're not satisfied with our service, contact our support team within 30 days of your initial purchase for a full refund."
    },
    {
      question: "How do I update my payment information?",
      answer: "You can update your payment method in the billing section of your account settings. Simply add your new payment method and remove the old one."
    }
  ],
  technical: [
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption to protect your data. All personal information is stored securely and we never share your data with third parties without your explicit consent."
    },
    {
      question: "What browsers are supported?",
      answer: "Diet Plan works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience."
    },
    {
      question: "Is there a mobile app?",
      answer: "Our mobile app is currently in development. In the meantime, our website is fully responsive and works great on mobile devices."
    },
    {
      question: "I'm experiencing technical issues. What should I do?",
      answer: "First, try clearing your browser cache and cookies. If the issue persists, contact our technical support team with details about the problem, including your browser type and any error messages you're seeing."
    }
  ]
};

export default function FAQs() {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const filteredFAQs = faqData[selectedCategory as keyof typeof faqData].filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#282828' }}>FAQs</span>
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
            <MessageCircle size={40} color="#ffffff" />
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#282828',
            marginBottom: '16px',
            margin: 0
          }}>
            Frequently Asked Questions
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            marginBottom: '0',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Find answers to common questions about our services
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          {...enter(0.2)}
          style={{ marginBottom: '40px' }}
        >
          <div style={{
            position: 'relative',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Search
              size={20}
              color="#6b7280"
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.7
              }}
            />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                background: 'rgba(22, 42, 65, 0.05)',
                border: '2px solid rgba(22, 42, 65, 0.1)',
                borderRadius: '12px',
                color: '#282828',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(22, 42, 65, 0.08)';
                e.target.style.borderColor = 'rgba(22, 42, 65, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(22, 42, 65, 0.05)';
                e.target.style.borderColor = 'rgba(22, 42, 65, 0.1)';
              }}
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          {...enter(0.3)}
          style={{ marginBottom: '40px' }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {faqCategories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  {...enterPop(0.08)}
                  {...press}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: selectedCategory === category.id 
                      ? '#282828' 
                      : 'rgba(22, 42, 65, 0.05)',
                    border: selectedCategory === category.id 
                      ? '2px solid #282828' 
                      : '2px solid rgba(22, 42, 65, 0.1)',
                    borderRadius: '25px',
                    color: selectedCategory === category.id ? '#ffffff' : '#282828',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Icon size={16} />
                  {category.name}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          {...enter(0.5)}
          style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}
        >
          <AnimatePresence mode="wait">
            {filteredFAQs.length === 0 ? (
              <motion.div
                key="no-results"
                {...enter()}
                exit={{ opacity: 0 }}
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: 'rgba(22, 42, 65, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(22, 42, 65, 0.1)'
                }}
              >
                <MessageCircle size={48} color="#6b7280" style={{ opacity: 0.5 }} />
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#282828',
                  marginTop: '16px'
                }}>
                  No results found
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  marginTop: '8px'
                }}>
                  Try searching with different keywords or browse other categories.
                </p>
              </motion.div>
            ) : (
              <div key="faq-list">
                {filteredFAQs.map((item, index) => (
                  <motion.div
                    key={index}
                    {...enter(0.6 + index * 0.1)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(22, 42, 65, 0.1)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <motion.button
                      onClick={() => toggleItem(`${selectedCategory}-${index}`)}
                      style={{
                        width: '100%',
                        padding: '20px 24px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#282828',
                        margin: 0,
                        flex: 1,
                        paddingRight: '16px'
                      }}>
                        {item.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: expandedItems[`${selectedCategory}-${index}`] ? 180 : 0 }}
                        transition={transition}
                      >
                        <ChevronDown size={20} color="#282828" />
                      </motion.div>
                    </motion.button>
                    
                    <Collapse open={Boolean(expandedItems[`${selectedCategory}-${index}`])}>
                          <div style={{
                            padding: '0 24px 20px',
                            borderTop: '1px solid rgba(22, 42, 65, 0.1)'
                          }}>
                            <p style={{
                              fontSize: '15px',
                              color: '#6b7280',
                              lineHeight: '1.6',
                              margin: 0
                            }}>
                              {item.answer}
                            </p>
                          </div>
                    </Collapse>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Still Need Help */}
        <motion.div
          {...enter(0.8)}
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
            Still have questions?
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            Can't find the answer you're looking for? Our support team is here to help.
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
            <MessageCircle size={18} />
            Contact Support
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
