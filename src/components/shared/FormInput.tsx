"use client";

import React from "react";
import { FormInputProps } from "../../lib/types";

export default function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false
}: FormInputProps) {
  const inputValue = value === undefined || value === null ? '' : String(value);
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
      <input
        type={type}
        value={inputValue}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
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
          boxShadow: '0 4px 12px -2px rgba(22, 42, 65, 0.1)'
        }}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
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
      />
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
