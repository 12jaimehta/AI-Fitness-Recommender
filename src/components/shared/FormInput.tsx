"use client";

import React from "react";
import { FormInputProps } from "../../lib/types";

export default function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false
}: FormInputProps) {
  const inputValue = value === undefined || value === null ? "" : String(value);
  const borderColor = error ? "#ef4444" : "rgba(22, 42, 65, 0.2)";
  return (
    <div className="text-left">
      <label
        style={{
          color: "#1a1a1a",
          fontSize: "16px",
          fontWeight: "600",
          marginBottom: "10px",
          display: "block",
        }}
      >
        {label} {required ? <span style={{ color: "#282828" }}>*</span> : null}
      </label>
      <input
        type={type}
        value={inputValue}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        style={{
          width: "100%",
          padding: "16px 20px",
          borderRadius: "16px",
          border: `2px solid ${borderColor}`,
          background: "#ffffff",
          color: "#1a1a1a",
          fontSize: "16px",
          outline: "none",
          transition: "all 0.3s ease",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: "500",
          boxShadow: error
            ? "0 0 0 3px rgba(239, 68, 68, 0.12)"
            : "0 4px 12px -2px rgba(22, 42, 65, 0.1)",
        }}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = error ? "#ef4444" : "#282828";
            e.target.style.background = "#ffffff";
            e.target.style.boxShadow = error
              ? "0 0 0 3px rgba(239, 68, 68, 0.12)"
              : "0 8px 25px -5px rgba(22, 42, 65, 0.25)";
          }
        }}
        onBlur={(e) => {
          onBlur?.();
          if (!disabled) {
            e.target.style.borderColor = error ? "#ef4444" : "rgba(22, 42, 65, 0.2)";
            e.target.style.background = "#ffffff";
            e.target.style.boxShadow = error
              ? "0 0 0 3px rgba(239, 68, 68, 0.12)"
              : "0 4px 12px -2px rgba(22, 42, 65, 0.1)";
          }
        }}
      />
      {error ? (
        <p className="mt-2 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
