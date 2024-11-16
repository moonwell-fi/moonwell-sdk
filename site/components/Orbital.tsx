"use client";

import { Suspense, lazy } from "react";
import OrbitalLottie from "../public/Orbital.json";
const LazyLottieComponent = lazy(() => import("lottie-react"));

export default function Orbital() {
  return (
    <Suspense>
      <LazyLottieComponent animationData={OrbitalLottie} loop={true} />
    </Suspense>
  );
}
