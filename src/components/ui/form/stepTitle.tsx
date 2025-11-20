"use client";

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
};

export default function StepTitle({ title, subtitle, className = "" }: Props) {
  return (
    <div className={"mb-6 " + className}>
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f1724] leading-tight">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-gray-500 max-w-xl">{subtitle}</p>}
    </div>
  );
}
