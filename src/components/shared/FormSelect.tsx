"use client";

import React from "react";
import { FormSelectProps } from "../../lib/types";

export default function FormSelect({ 
  label, 
  value, 
  onChange, 
  options, 
  error, 
  required = false,
  disabled = false
}: FormSelectProps) {
  const selectValue = value === undefined || value === null ? '' : String(value);

  return (
    <div>
      <label style={{ 
        color: '#1a1a1a', 
        fontSize: '16px', 
        fontWeight: '600', 
        marginBottom: '10px', 
        display: 'block' 
      }}>
        {label} {required && <span style={{ color: '#282828' }}>*</span>}
      </label>
      <select
        value={selectValue}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '2px solid rgba(22, 42, 65, 0.2)',
          background: '#ffffff',
          color: '#1a1a1a',
          fontSize: '16px',
          outline: 'none',
          transition: 'all 0.3s ease',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontWeight: '500',
          boxShadow: '0 4px 12px -2px rgba(22, 42, 65, 0.1)',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23162a41' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 16px center',
          backgroundSize: '20px',
          paddingRight: '48px'
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = '#282828';
            e.target.style.background = '#ffffff';
            e.target.style.boxShadow = '0 8px 25px -5px rgba(22, 42, 65, 0.25)';
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            e.target.style.borderColor = 'rgba(22, 42, 65, 0.2)';
            e.target.style.background = '#ffffff';
            e.target.style.boxShadow = '0 4px 12px -2px rgba(22, 42, 65, 0.1)';
          }
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p style={{ 
          color: '#ef4444', 
          fontSize: '14px', 
          marginTop: '8px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}
