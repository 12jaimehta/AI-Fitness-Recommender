import LayoutWrapper from "@/components/layout/layoutWrapper";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
