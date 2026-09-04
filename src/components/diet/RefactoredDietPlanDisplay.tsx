"use client";

import React, { useState } from "react";
import { Collapse, delay, enter, FadeIn, motion, press } from "@/components/shared/Motion";
import { 
  Mail,
  Sun,
  Flame,
  Moon,
  Apple,
  TrendingUp,
  Dumbbell,
  Timer,
  ChevronDown,
  ChevronUp,
  Utensils,
  Heart
} from "lucide-react";

import { sendDietPlanEmail } from "@/lib/service/email-service";
import { DietPlanData } from "@/lib/service/dietWorkoutplan";
import PlanDisplayShell from "@/components/shared/PlanDisplayShell";
import PlanResultHeader from "@/components/shared/PlanResultHeader";
import PlanStatGrid from "@/components/shared/PlanStatGrid";
import PlanViewToggle from "@/components/shared/PlanViewToggle";
import PlanTips from "@/components/shared/PlanTips";
import { clampSize, isMobile } from "@/components/shared/planDisplayUtils";

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
    <PlanDisplayShell>
      <PlanResultHeader
        icon={Utensils}
        title="Your Personalized Diet Plan"
        subtitle="Designed specifically for your goals and preferences"
        loading={loading}
        onRegenerate={onRegenerate}
        onNewPlan={onNewPlan}
        extraAction={{
          label: "Send to Email",
          loadingLabel: "Sending...",
          loading: emailLoading,
          icon: Mail,
          onClick: handleSendEmail,
        }}
      />

      <PlanStatGrid title="Daily Nutrition Targets" items={nutritionTargets} />

      <PlanViewToggle activeView={activeView} onViewChange={setActiveView} />

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

      <PlanTips
        title="Nutrition Tips & Recommendations"
        icon={Heart}
        tips={dietPlan.nutritionTips}
      />
    </PlanDisplayShell>
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
    <FadeIn delay={0.08} style={{ marginBottom: '50px' }}>
      <h2 style={{
        fontSize: clampSize(24, 28),
        fontWeight: '700',
        color: '#282828',
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
    </FadeIn>
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
            borderColor: selectedDay === day ? '#282828' : 'rgba(22, 42, 65, 0.2)',
            background: selectedDay === day ? '#282828' : 'transparent',
            color: selectedDay === day ? '#ffffff' : '#282828',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            textTransform: 'capitalize'
          }}
          {...press}
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
      {...enter(delay(index))}
      style={{
        background: 'rgba(22, 42, 65, 0.02)',
        border: '2px solid rgba(22, 42, 65, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
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
              background: '#282828'
            }}>
              {getMealIcon(mealType)}
            </div>
            <div>
              <h3 style={{
                color: '#282828',
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
              color: '#282828',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {mealData.calories} cal
            </div>
            {isExpanded ? 
              <ChevronUp size={20} color="#282828" /> : 
              <ChevronDown size={20} color="#282828" />
            }
          </div>
        </div>
      </div>

      <Collapse open={isExpanded}>
        <MealContent mealData={mealData} />
      </Collapse>
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
          color: '#282828', 
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
            color: '#282828', 
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
    { label: 'Protein', value: `${mealData.protein}g`, icon: Dumbbell, color: '#282828' },
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

