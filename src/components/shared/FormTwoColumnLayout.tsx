"use client";

import React from "react";
import { motion } from "framer-motion";

export type FormLayoutStep = {
  title: string;
  description: string;
};

const verticalItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

export default function FormTwoColumnLayout({
  children,
  currentStep,
  heading,
  steps,
  header,
}: {
  children: React.ReactNode;
  currentStep: number;
  heading: string;
  steps: FormLayoutStep[];
  header?: React.ReactNode;
}) {
  const renderVerticalStepper = () => (
    <motion.ol
      className="space-y-8 pt-20"
      initial="hidden"
      animate="visible"
    >
      {steps.map((step, index) => {
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;

        return (
          <motion.li
            key={index}
            className={`flex items-start gap-4 transition-colors duration-200 cursor-default ${
              isActive ? "text-[#454545]" : "text-gray-600 hover:text-blue-500"
            }`}
            variants={verticalItemVariants}
            custom={index}
          >
            <motion.div
              className={`w-9 h-9 flex items-center justify-center rounded-full border-2 text-base font-semibold shrink-0 transition-all duration-300 ease-in-out
                ${
                  isActive
                    ? "bg-[#282828] text-white border-[#282828]"
                    : isCompleted
                    ? "bg-teal-500 text-white border-teal-500"
                    : "bg-white text-gray-500 border-gray-300"
                }`}
              animate={isActive ? "active" : "rest"}
            >
              {isCompleted ? (
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              ) : (
                index + 1
              )}
            </motion.div>

            <div>
              <p
                className={`font-semibold transition-colors duration-200 ${
                  isActive ? "text-[#454545]" : "text-gray-800"
                }`}
              >
                {step.title}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {step.description}
              </p>
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );

  const renderHorizontalStepper = () => (
    <motion.div
      className="border-b border-gray-200 pb-3 mb-8 lg:hidden bg-white shadow-sm -mx-4 sm:mx-0"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar px-6 py-2">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;

          return (
            <motion.div
              key={index}
              className="flex items-center gap-2 shrink-0"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-medium shrink-0 transition-all duration-300
                  ${
                    isActive
                      ? "bg-[#282828] text-white border-[#282828]"
                      : isCompleted
                      ? "bg-teal-500 text-white border-teal-500"
                      : "bg-white text-gray-500 border-gray-300"
                  }`}
              >
                {isCompleted ? (
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-[#454545]" : "text-gray-700"
                }`}
              >
                {step.title}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {header}
        <div className="flex flex-col lg:flex-row lg:gap-16">
          <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-gray-200 lg:pr-10">
            <motion.div
              className="text-2xl font-bold mb-12 text-gray-900 border-b border-gray-200 pb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {heading}
            </motion.div>
            {renderVerticalStepper()}
          </aside>

          <main className="flex-1 lg:pt-4">
            {renderHorizontalStepper()}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
