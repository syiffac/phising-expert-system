"use client";

import type { ReactNode } from "react";
import SmoothScroll from "./SmoothScroll";

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
