"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Dumbbell, 
  Timer, 
  TrendingUp 
} from "lucide-react";
import { ImprovedMealCardProps,MealData,MealAlternative } from "@/lib/types";


export default function ImprovedMealCard({ 
  mealType, 
  mealData, 
  isExpanded, 
  onToggle, 
  index, 
  mealIcon, 
  mealColor 
}: ImprovedMealCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}
    >
      {/* Meal Header */}
      <div
        style={{
          padding: '25px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          background: isExpanded ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
        }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '15px',
              background: mealColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              {mealIcon}
            </div>
            <div>
              <h3 style={{
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '5px',
                textTransform: 'capitalize'
              }}>
                {mealType.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                {mealData.calories} calories • {mealData.protein}g protein
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '20px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {mealData.calories} cal
            </div>
            {isExpanded ? 
              <ChevronUp size={24} color="#9ca3af" /> : 
              <ChevronDown size={24} color="#9ca3af" />
            }
          </div>
        </div>
      </div>

      {/* Meal Content */}
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

function MealContent({ mealData }: { mealData: MealData }) {
  return (
    <div style={{ padding: '0 25px 25px' }}>
      {/* Main Meal */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
          Main Meal
        </h4>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '15px'
        }}>
          <p style={{
            color: '#ffffff',
            fontSize: '16px',
            lineHeight: '1.6',
            fontWeight: '500',
            margin: 0
          }}>
            {mealData.name}
          </p>
        </div>
        
        {/* Macro Badges */}
        <MacroBadges mealData={mealData} />
      </div>

      {/* Ingredient Breakdown */}
      <IngredientBreakdown ingredientBreakdown={mealData.ingredientBreakdown} />

      {/* Alternatives */}
      <Alternatives alternatives={mealData.alternatives} />
    </div>
  );
}

function MacroBadges({ mealData }: { mealData: MealData }) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <MacroBadge icon={Flame} label={`${mealData.calories} cal`} color="#ef4444" />
      <MacroBadge icon={Dumbbell} label={`${mealData.protein}g protein`} color="#3b82f6" />
      <MacroBadge icon={Timer} label={`${mealData.carbs}g carbs`} color="#10b981" />
      <MacroBadge icon={TrendingUp} label={`${mealData.fat}g fat`} color="#f59e0b" />
    </div>
  );
}

function MacroBadge({ 
  icon: Icon, 
  label, 
  color 
}: { 
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  color: string;
}) {
  return (
    <div style={{
      background: `${color}20`,
      color: color,
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    }}>
      <Icon size={14} />
      {label}
    </div>
  );
}

function IngredientBreakdown({ ingredientBreakdown }: { ingredientBreakdown: string | object }) {
  // Convert object to string if it's an object
  const formatIngredientBreakdown = (breakdown: string | object): string => {
    if (typeof breakdown === 'string') {
      return breakdown;
    }
    
    if (typeof breakdown === 'object' && breakdown !== null) {
      return Object.entries(breakdown)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
    
    return String(breakdown || '');
  };

  return (
    <div style={{ marginBottom: '25px' }}>
      <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
        Ingredient Breakdown
      </h4>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '20px'
      }}>
        <pre style={{
          color: '#d4d4d4',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: 0,
          whiteSpace: 'pre-line',
          fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif"
        }}>
          {formatIngredientBreakdown(ingredientBreakdown)}
        </pre>
      </div>
    </div>
  );
}

function Alternatives({ alternatives }: { alternatives?: MealAlternative[] }) {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div>
      <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
        Alternatives
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alternatives.map((alternative, altIndex) => (
          <motion.div
            key={altIndex}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: altIndex * 0.1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '15px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '500',
                  marginBottom: '5px',
                  margin: 0
                }}>
                  {alternative.name}
                </p>
                {alternative.description && (
                  <p style={{
                    color: '#9ca3af',
                    fontSize: '13px',
                    margin: '5px 0 0 0'
                  }}>
                    {alternative.description}
                  </p>
                )}
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '4px 10px',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                marginLeft: '15px'
              }}>
                {alternative.calories} cal
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
