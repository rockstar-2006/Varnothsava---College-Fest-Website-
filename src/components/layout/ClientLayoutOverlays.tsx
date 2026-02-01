"use client";

import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { PageTransitionBar } from "@/components/layout/PageTransitionBar";
import { Suspense } from "react";

export default function ClientLayoutOverlays() {
  return (
    <Suspense>
      <LoadingScreen />
      <PageTransitionBar />
    </Suspense>
  );
}
