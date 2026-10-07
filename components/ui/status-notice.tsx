import type { ReactNode } from "react";
import { CheckCircle, Info, WarningCircle } from "@phosphor-icons/react/dist/ssr";

type StatusNoticeProps = {
  tone: "success" | "error" | "info";
  children: ReactNode;
  className?: string;
};

export function StatusNotice({ tone, children, className = "" }: StatusNoticeProps) {
  const Icon = tone === "success" ? CheckCircle : tone === "error" ? WarningCircle : Info;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`status-notice status-notice-${tone} ${className}`}
    >
      <Icon size={18} weight="bold" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
