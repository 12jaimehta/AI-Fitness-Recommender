import { Metadata } from "next";
import {
  Heart,
  Dumbbell,
  Apple,
  Mail,
  Phone,
  MapPin,
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
  Target
} from "lucide-react";


export const slides = [
  {
    type: "video",
    src: "/home/videos/video1.mp4",
    title: "Fuel Your Training Energy",
    subtitle: "Personalized AI-powered diet and workout plans tailored to your unique goals",
    cta: "Start Your Journey",
  },
  {
    type: "image",
    src: "/home/photos/photo1.jpg",
    title: "Achieve Your Fitness Goals",
    subtitle: "Expert-designed workout plans that adapt to your progress and push your limits",
    cta: "Explore Workouts",
  },
  {
    type: "image",
    src: "/home/photos/photo2.jpg",
    title: "Nutrition Made Simple",
    subtitle: "Custom meal plans that respect your preferences and deliver real results",
    cta: "Discover Diets",
  },
  {
    type: "video",
    src: "/home/videos/video2.mp4",
    title: "Your Health, Our Mission",
    subtitle: "Join thousands who have transformed their lives with personalized wellness plans",
    cta: "Get Started Now",
  },
];
export const metadata: Metadata = {
  title: "AI Diet Plan Generator",
  description: "Get personalized nutrition plans powered by AI",
};
export const navItems = [
  { name: "Home", href: "/" },
  { name: "Diet Plan", href: "/diet" },
  { name: "Workout Plan", href: "/workout" },
  { name: "Progress", href: "/progress" },
  { name: "Fyte Connect", href: "/fyte-connect" },
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
      { name: "AI Diet Plans", icon: Apple, href: "/diet" },
      { name: "Workout Routines", icon: Dumbbell, href: "/workout" },
      { name: "Personalized Plans", icon: Heart, href: "/" },
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
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "GitHub", icon: Github, href: "#" },
];

export const steps = [
  { id: "personal", title: "Personal Information", icon: User, description: "Tell us about yourself" },
  { id: "physical", title: "Physical Details", icon: Activity, description: "Your measurements and activity" },
  { id: "preferences", title: "Dietary Preferences", icon: Heart, description: "Your food preferences and goals" },
  { id: "health", title: "Health Information", icon: Target, description: "Health considerations and favorites" },
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
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "weight_maintenance", label: "Weight Maintenance" },
  { value: "endurance", label: "Endurance" },
  { value: "general_health", label: "General Health" },
];

export const activityOptions = [
  { value: "", label: "Select activity level" },
  { value: "sedentary", label: "Sedentary (Little or no exercise)" },
  { value: "lightly_active", label: "Lightly Active (1-3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (3-5 days/week)" },
  { value: "very_active", label: "Very Active (6-7 days/week)" },
  { value: "extremely_active", label: "Extremely Active (Physical job)" },
];

export const workoutOptions = [
  { value: "", label: "Select frequency" },
  { value: "0", label: "No workouts" },
  { value: "1-2", label: "1-2 days/week" },
  { value: "3-4", label: "3-4 days/week" },
  { value: "5-6", label: "5-6 days/week" },
  { value: "7", label: "Every day" },
];