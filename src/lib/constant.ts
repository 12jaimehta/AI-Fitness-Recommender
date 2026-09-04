import {
  Heart,
  Dumbbell,
  Apple,
  Github,
  Twitter,
  Instagram,
  Contact,
  TableOfContents,
  BadgeInfo,
  Store,
  GlobeLock,
  Handshake,
  User,
  Activity,
  Target,
} from "lucide-react";
import { PROGRAM_GOAL_OPTIONS } from "@/shared/lib/program-goals";


export const hero = {
  src: "/home/photos/photo3.jpg",
  title: "Fuel Your Training Energy",
  subtitle: "Personalized AI-powered diet and workout plans tailored to your unique goals",
  cta: "Start Your Journey",
};
export const navItems = [
  { name: "Home", href: "/" },
  { name: "Diet Plan", href: "/diet" },
  { name: "Workout Plan", href: "/workout" },
  { name: "Coach", href: "/progress" },
  // Marketplace paused — restore when checkout works.
  // { name: "Trainers", href: "/fyte-connect" },
];
export const menuItems = [
  { label: "Help", path: "/help" },
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/help/contact" },
  { label: "FAQs", path: "/help/faqs" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Service", path: "/terms" },
];

export const footerSections = [
  {
    title: "Features",
    items: [
      { name: "Diet Plan", icon: Apple, href: "/diet" },
      { name: "Workout Plan", icon: Dumbbell, href: "/workout" },
      { name: "Coach", icon: Activity, href: "/progress" },
      // Marketplace paused — restore when checkout works.
      // { name: "Trainers", icon: Users, href: "/fyte-connect" },
    ],
  },
  {
    title: "Support",
    items: [
      { name: "Help Center", icon: BadgeInfo, href: "/help" },
      { name: "Contact Us", icon: Contact, href: "/help/contact" },
      { name: "FAQs", icon: TableOfContents, href: "/help/faqs" },
    ],
  },
  {
    title: "Company",
    items: [
      { name: "About Us", icon: Store, href: "/about" },
      { name: "Privacy Policy", icon: GlobeLock, href: "/privacy" },
      { name: "Terms of Service", icon: Handshake, href: "/terms" },
    ],
  },
];
export const socialLinks = [
  // { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/mhtjai" },
  // { name: "GitHub", icon: Github, href: "#" },
];

export const steps = [
  { id: "about", title: "About you", icon: User, description: "Enough to set calories. Nothing else." },
  { id: "goal", title: "Goal and food", icon: Heart, description: "What you train for and how you eat." },
  { id: "notes", title: "Anything we should know?", icon: Target, description: "All optional. Skip if nothing applies." },
];

export const workoutSteps = [
  { id: "about", title: "About you", icon: User, description: "Where you are starting from." },
  { id: "training", title: "Training", icon: Dumbbell, description: "Goal, time, and what you have access to." },
  { id: "notes", title: "Anything we should know?", icon: Activity, description: "All optional. Skip if nothing applies." },
];

export const fitnessLevelOptions = [
  { value: "", label: "Select fitness level" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const workoutGoalOptions = [
  { value: "", label: "Select your goal" },
  ...PROGRAM_GOAL_OPTIONS,
];

export const workoutDurationOptions = [
  { value: "", label: "Select duration" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
];

export const workoutFrequencyDaysOptions = [
  { value: "", label: "Select frequency" },
  { value: "2", label: "2 days per week" },
  { value: "3", label: "3 days per week" },
  { value: "4", label: "4 days per week" },
  { value: "5", label: "5 days per week" },
  { value: "6", label: "6 days per week" },
];

export const equipmentOptions = [
  { value: "", label: "Select available equipment" },
  { value: "none", label: "Bodyweight only" },
  { value: "basic", label: "Dumbbells / bands" },
  { value: "full_gym", label: "Full gym" },
];

export const preferredTimeOptions = [
  { value: "", label: "Select preferred time" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

export const muscleGroupOptions = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "biceps", label: "Biceps" },
  { value: "triceps", label: "Triceps" },
  { value: "legs", label: "Legs" },
  { value: "glutes", label: "Glutes" },
  { value: "core", label: "Core" },
  { value: "abs", label: "Abs" },
  { value: "calves", label: "Calves" },
  { value: "forearms", label: "Forearms" },
  { value: "traps", label: "Traps" },
];

export const dietaryOptions = [
  { value: "", label: "Select preference" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non-vegetarian", label: "Non-Vegetarian" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
];

export const goalOptions = [
  { value: "", label: "Select goal" },
  ...PROGRAM_GOAL_OPTIONS,
];

export const activityOptions = [
  { value: "", label: "Select activity level" },
  { value: "sedentary", label: "Mostly sitting" },
  { value: "lightly_active", label: "On my feet a little" },
  { value: "moderately_active", label: "Active most days" },
  { value: "very_active", label: "Very active" },
  { value: "extremely_active", label: "Physical job" },
];

export const workoutOptions = [
  { value: "", label: "Select frequency" },
  { value: "0", label: "No workouts" },
  { value: "1-2", label: "1-2 days/week" },
  { value: "3-4", label: "3-4 days/week" },
  { value: "5-6", label: "5-6 days/week" },
  { value: "7", label: "Every day" },
];