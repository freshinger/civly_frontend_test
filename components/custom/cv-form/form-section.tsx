"use client";

import * as React from "react";

export function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col ${className ?? ""}`}>{children}</div>;
}
