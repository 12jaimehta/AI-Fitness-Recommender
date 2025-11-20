"use client";
import { motion } from "framer-motion";
import { GenderOption ,GenderSelectorProps} from "@/lib/types";



const genderOptions: GenderOption[] = [
  {
    value: 'male',
    label: 'Male',
    image: '👨',
    description: 'Male physiology and metabolism'
  },
  {
    value: 'female',
    label: 'Female',
    image: '👩',
    description: 'Female physiology and metabolism'
  }
];

export default function GenderSelector({ selectedGender, onGenderSelect, error }: GenderSelectorProps) {
  return (
    <div>
      <label style={{ 
        color: '#ffffff', 
        fontSize: '16px', 
        fontWeight: '600', 
        marginBottom: '15px', 
        display: 'block' 
      }}>
        Select Your Gender
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {genderOptions.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGenderSelect(option.value)}
            style={{
              background: selectedGender === option.value 
                ? '#162a41'
                : 'rgba(255, 255, 255, 0.05)',
              border: selectedGender === option.value 
                ? '2px solid #162a41'
                : '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '30px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>{option.image}</div>
            <h3 style={{ 
              color: '#ffffff', 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '8px' 
            }}>
              {option.label}
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
              {option.description}
            </p>
          </motion.div>
        ))}
      </div>
      {error && (
        <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '10px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
