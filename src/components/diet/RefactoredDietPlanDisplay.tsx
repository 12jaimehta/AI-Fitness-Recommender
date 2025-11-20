"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, 
  RotateCcw, 
  Mail,
  Sun,
  Flame,
  Moon,
  Apple,
  TrendingUp,
  Dumbbell,
  Timer,
  Calendar,
  ChevronDown,
  ChevronUp,
  Utensils,
  Heart,
  CheckCircle2
} from "lucide-react";

// Define interfaces
import { sendDietPlanEmail } from "@/lib/email-service";
import { DietPlanData } from "@/lib/service/dietWorkoutplan";

interface RefactoredDietPlanDisplayProps {
  dietPlan: DietPlanData;
  onNewPlan: () => void;
  onRegenerate: () => void;
  loading?: boolean;
}

// Icon components for missing icons
const Coffee = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M18 6h-1a4 4 0 0 0-4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    <path d="M18 6a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2V6z" />
  </svg>
);

const Cookie = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="8" cy="10" r="1" />
    <circle cx="16" cy="10" r="1" />
    <circle cx="12" cy="14" r="1" />
    <circle cx="8" cy="18" r="1" />
    <circle cx="16" cy="18" r="1" />
  </svg>
);

const mealIcons = {
  breakfast: Sun,
  lunch: Flame,
  dinner: Moon,
  snacks: Apple,
  morningSnack: Coffee,
  eveningSnack: Moon,
  afternoonSnack: Cookie
};

export default function RefactoredDietPlanDisplay({ 
  dietPlan, 
  onNewPlan, 
  onRegenerate, 
  loading = false 
}: RefactoredDietPlanDisplayProps) {
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({});
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [activeView, setActiveView] = useState<'single' | 'weekly'>('single');
  const [emailLoading, setEmailLoading] = useState<boolean>(false);

  const toggleMealExpansion = (mealKey: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealKey]: !prev[mealKey]
    }));
  };

  const handleSendEmail = async () => {
    // Prompt user for email
    const email = prompt('Please enter your email address:');
    
    if (!email) {
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setEmailLoading(true);
      
      // Create user data object for email
      const userData = {
        dietaryPreference: 'vegetarian', // This should come from form data
        goal: 'weight_loss', // This should come from form data
        activityLevel: 'moderately_active' // This should come from form data
      };

      await sendDietPlanEmail(email, dietPlan, userData);
      
      alert('Diet plan sent successfully to your email!');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again later.');
    } finally {
      setEmailLoading(false);
    }
  };

  const getMealIcon = (mealType: string) => {
    const IconComponent = mealIcons[mealType as keyof typeof mealIcons] || Apple;
    return <IconComponent size={20} color="#ffffff" />;
  };

  const nutritionTargets = [
    { label: "Daily Calories", value: dietPlan.calorieTarget, icon: Flame },
    { label: "Protein", value: `${dietPlan.proteinTarget}g`, icon: Dumbbell },
    { label: "Carbs", value: `${dietPlan.carbTarget}g`, icon: Timer },
    { label: "Fat", value: `${dietPlan.fatTarget}g`, icon: TrendingUp }
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Header 
          onRegenerate={onRegenerate} 
          onNewPlan={onNewPlan} 
          onSendEmail={handleSendEmail}
          loading={loading} 
          emailLoading={emailLoading}
        />
        
        <NutritionSection nutritionTargets={nutritionTargets} />
        
        <ViewToggle activeView={activeView} onViewChange={setActiveView} />
        
        <MealPlansSection 
          dietPlan={dietPlan}
          activeView={activeView}
          selectedDay={selectedDay}
          expandedMeals={expandedMeals}
          onDaySelect={setSelectedDay}
          onMealToggle={toggleMealExpansion}
          getMealIcon={getMealIcon}
          days={days}
        />
        
        <NutritionTips nutritionTips={dietPlan.nutritionTips} />
      </div>
    </div>
  );
}

function Header({ 
  onRegenerate, 
  onNewPlan, 
  onSendEmail, 
  loading, 
  emailLoading 
}: { 
  onRegenerate: () => void; 
  onNewPlan: () => void; 
  onSendEmail: () => void; 
  loading: boolean; 
  emailLoading: boolean; 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', marginBottom: '50px' }}
    >
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        borderRadius: '20px',
        background: '#162a41',
        marginBottom: '20px'
      }}>
        <Utensils size={40} color="#ffffff" />
      </div>
      
      <h1 style={{
        fontSize: clampSize(32, 48),
        fontWeight: '800',
        color: '#162a41',
        marginBottom: '15px'
      }}>
        Your Personalized Diet Plan
      </h1>
      <p style={{ color: '#6b7280', fontSize: clampSize(16, 18), marginBottom: '30px' }}>
        Designed specifically for your goals and preferences
      </p>

      <ActionButtons 
        onRegenerate={onRegenerate} 
        onNewPlan={onNewPlan} 
        onSendEmail={onSendEmail}
        loading={loading} 
        emailLoading={emailLoading}
      />
    </motion.div>
  );
}

function ActionButtons({ 
  onRegenerate, 
  onNewPlan, 
  onSendEmail, 
  loading, 
  emailLoading 
}: { 
  onRegenerate: () => void; 
  onNewPlan: () => void; 
  onSendEmail: () => void; 
  loading: boolean; 
  emailLoading: boolean; 
}) {
  return (
    <motion.div 
      style={{ 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        flexDirection: isMobile() ? 'column' : 'row',
        alignItems: 'center'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <motion.button
        whileHover={!loading ? { 
          scale: 1.05,
          boxShadow: '0 15px 35px rgba(22, 42, 65, 0.3)'
        } : {}}
        whileTap={!loading ? { scale: 0.95 } : {}}
        onClick={onRegenerate}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#162a41',
          color: '#ffffff',
          border: 'none',
          padding: '14px 28px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          minWidth: '140px',
          justifyContent: 'center'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 10 }}
      >
        <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        {loading ? "Generating..." : "Regenerate"}
      </motion.button>

      <motion.button
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 8px 25px rgba(22, 42, 65, 0.2)'
        }}
        whileTap={{ scale: 0.95 }}
        onClick={onNewPlan}
        style={{
          background: '#ffffff',
          color: '#162a41',
          border: '2px solid #162a41',
          padding: '14px 28px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          minWidth: '140px',
          justifyContent: 'center'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 10 }}
      >
        <RotateCcw size={18} />
        New Plan
      </motion.button>

      <motion.button
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 8px 25px rgba(22, 42, 65, 0.2)'
        }}
        whileTap={{ scale: 0.95 }}
        onClick={onSendEmail}
        disabled={emailLoading}
        style={{
          background: emailLoading ? '#9ca3af' : '#ffffff',
          color: emailLoading ? '#666666' : '#162a41',
          border: '2px solid #162a41',
          padding: '14px 28px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: emailLoading ? 'not-allowed' : 'pointer',
          opacity: emailLoading ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          minWidth: '140px',
          justifyContent: 'center'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 400, damping: 10 }}
      >
        <Mail size={18} style={{ animation: emailLoading ? 'pulse 1s linear infinite' : 'none' }} />
        {emailLoading ? "Sending..." : "Send to Email"}
      </motion.button>
    </motion.div>
  );
}

function NutritionSection({ nutritionTargets }: { nutritionTargets: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{ marginBottom: '50px' }}
    >
      <h2 style={{
        fontSize: clampSize(24, 28),
        fontWeight: '700',
        color: '#162a41',
        marginBottom: '25px',
        textAlign: 'center'
      }}>
        Daily Nutrition Targets
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile() ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {nutritionTargets.map((target, index) => (
          <motion.div
            key={target.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            style={{
              background: 'rgba(22, 42, 65, 0.05)',
              border: '2px solid rgba(22, 42, 65, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              scale: 1.05,
              borderColor: '#162a41',
              boxShadow: '0 8px 25px rgba(22, 42, 65, 0.15)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#162a41',
              margin: '0 auto 15px'
            }}>
              <target.icon size={24} color="#ffffff" />
            </div>
            <div style={{
              fontSize: clampSize(20, 24),
              fontWeight: '700',
              color: '#162a41',
              marginBottom: '5px'
            }}>
              {target.value}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {target.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ViewToggle({ activeView, onViewChange }: { activeView: 'single' | 'weekly'; onViewChange: (view: 'single' | 'weekly') => void }) {
  const tabs = [
    { id: 'single', label: 'Daily View', icon: Sun },
    { id: 'weekly', label: 'Weekly View', icon: Calendar }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{ marginBottom: '40px' }}
    >
      <div style={{
        display: 'flex',
        background: 'rgba(22, 42, 65, 0.05)',
        borderRadius: '12px',
        padding: '4px',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onViewChange(tab.id as 'single' | 'weekly')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeView === tab.id ? '#162a41' : 'transparent',
              color: activeView === tab.id ? '#ffffff' : '#162a41',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon size={16} />
            {tab.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function MealPlansSection({ 
  dietPlan, 
  activeView, 
  selectedDay, 
  expandedMeals, 
  onDaySelect, 
  onMealToggle, 
  getMealIcon, 
  days 
}: any) {
  // For daily/single view, use the single day meals (dietPlan.meals)
  // For weekly view, use the selected day's meals from weeklyPlan
  console.log(dietPlan,"MealPlansSection")
  const currentDayMeals = activeView === 'weekly' 
    ? (dietPlan.weeklyPlan?.[selectedDay] || {})
    : dietPlan.meals || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      style={{ marginBottom: '50px' }}
    >
      <h2 style={{
        fontSize: clampSize(24, 28),
        fontWeight: '700',
        color: '#162a41',
        marginBottom: '25px',
        textAlign: 'center'
      }}>
        Meal Plans
      </h2>

      {/* Only show day selector for weekly view */}
      {activeView === 'weekly' && dietPlan.weeklyPlan && (
        <DaySelector 
          days={days} 
          selectedDay={selectedDay} 
          onDaySelect={onDaySelect} 
        />
      )}

      <div style={{
        display: 'grid',
        gap: '20px'
      }}>
        {Object.entries(currentDayMeals).map(([mealType, mealData]: [string, any], index) => (
          <MealCard
            key={mealType}
            mealType={mealType}
            mealData={mealData}
            isExpanded={expandedMeals[mealType]}
            onToggle={() => onMealToggle(mealType)}
            index={index}
            getMealIcon={getMealIcon}
          />
        ))}
      </div>
    </motion.div>
  );
}

function DaySelector({ days, selectedDay, onDaySelect }: any) {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
      overflowX: 'auto',
      padding: '5px'
    }}>
      {days.map((day: string) => (
        <motion.button
          key={day}
          onClick={() => onDaySelect(day)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '2px solid',
            borderColor: selectedDay === day ? '#162a41' : 'rgba(22, 42, 65, 0.2)',
            background: selectedDay === day ? '#162a41' : 'transparent',
            color: selectedDay === day ? '#ffffff' : '#162a41',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            textTransform: 'capitalize'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {day.slice(0, 3)}
        </motion.button>
      ))}
    </div>
  );
}

function MealCard({ mealType, mealData, isExpanded, onToggle, index, getMealIcon }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        background: 'rgba(22, 42, 65, 0.02)',
        border: '2px solid rgba(22, 42, 65, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
      whileHover={{ 
        borderColor: '#162a41',
        boxShadow: '0 8px 25px rgba(22, 42, 65, 0.1)'
      }}
    >
      <div
        style={{
          padding: '20px',
          cursor: 'pointer',
          background: isExpanded ? 'rgba(22, 42, 65, 0.05)' : 'transparent'
        }}
        onClick={onToggle}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexDirection: isMobile() ? 'column' : 'row',
          gap: '15px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px',
            flex: 1
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#162a41'
            }}>
              {getMealIcon(mealType)}
            </div>
            <div>
              <h3 style={{
                color: '#162a41',
                fontSize: clampSize(18, 20),
                fontWeight: '700',
                marginBottom: '5px',
                textTransform: 'capitalize'
              }}>
                {mealType.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '14px', 
                margin: 0,
                fontWeight: '500'
              }}>
                {mealData.calories} calories • {mealData.protein}g protein
              </p>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px' 
          }}>
            <div style={{
              background: 'rgba(22, 42, 65, 0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              color: '#162a41',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {mealData.calories} cal
            </div>
            {isExpanded ? 
              <ChevronUp size={20} color="#162a41" /> : 
              <ChevronDown size={20} color="#162a41" />
            }
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <MealContent mealData={mealData} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MealContent({ mealData }: { mealData: any }) {
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{
        background: 'rgba(22, 42, 65, 0.03)',
        border: '1px solid rgba(22, 42, 65, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '15px'
      }}>
        <h4 style={{ 
          color: '#162a41', 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '10px' 
        }}>
          Main Meal
        </h4>
        <p style={{
          color: '#374151',
          fontSize: '15px',
          lineHeight: '1.6',
          fontWeight: '500',
          margin: 0
        }}>
          {mealData.name}
        </p>
      </div>
      
      <MacroNutrients mealData={mealData} />
      
      {mealData.ingredientBreakdown && (
        <div style={{ marginTop: '15px' }}>
          <h4 style={{ 
            color: '#162a41', 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '10px' 
          }}>
            Ingredients
          </h4>
          <div style={{
            background: 'rgba(22, 42, 65, 0.03)',
            border: '1px solid rgba(22, 42, 65, 0.1)',
            borderRadius: '12px',
            padding: '15px'
          }}>
            <pre style={{
              color: '#374151',
              fontSize: '14px',
              lineHeight: '1.5',
              margin: 0,
              whiteSpace: 'pre-line',
              fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif"
            }}>
              {typeof mealData.ingredientBreakdown === 'string' 
                ? mealData.ingredientBreakdown 
                : JSON.stringify(mealData.ingredientBreakdown, null, 2)
              }
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function MacroNutrients({ mealData }: { mealData: any }) {
  const macros = [
    { label: 'Calories', value: `${mealData.calories} cal`, icon: Flame, color: '#ef4444' },
    { label: 'Protein', value: `${mealData.protein}g`, icon: Dumbbell, color: '#162a41' },
    { label: 'Carbs', value: `${mealData.carbs}g`, icon: Timer, color: '#10b981' },
    { label: 'Fat', value: `${mealData.fat}g`, icon: TrendingUp, color: '#f59e0b' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      gap: '10px', 
      flexWrap: 'wrap',
      marginTop: '15px'
    }}>
      {macros.map((macro) => (
        <div
          key={macro.label}
          style={{
            background: `${macro.color}10`,
            color: macro.color,
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: `1px solid ${macro.color}20`
          }}
        >
          <macro.icon size={14} />
          {macro.value}
        </div>
      ))}
    </div>
  );
}

function NutritionTips({ nutritionTips }: { nutritionTips: string[] }) {
  if (!nutritionTips || nutritionTips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div style={{
        background: 'rgba(22, 42, 65, 0.02)',
        border: '2px solid rgba(22, 42, 65, 0.1)',
        borderRadius: '16px',
        padding: '30px'
      }}>
        <h3 style={{
          fontSize: clampSize(20, 24),
          fontWeight: '700',
          color: '#162a41',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Heart size={24} color="#162a41" />
          Nutrition Tips & Recommendations
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile() ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          {nutritionTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '15px',
                background: 'rgba(22, 42, 65, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(22, 42, 65, 0.1)'
              }}
            >
              <CheckCircle2 size={18} color="#162a41" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ 
                color: '#374151', 
                fontSize: '14px', 
                lineHeight: '1.6',
                fontWeight: '500'
              }}>
                {tip}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Utility functions
function clampSize(min: number, max: number): string {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
  if (width < 768) return `${min}px`;
  if (width > 1200) return `${max}px`;
  return `${min + (max - min) * ((width - 768) / (1200 - 768))}px`;
}

function isMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}
