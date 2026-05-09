"use client";

import NextTopLoader from "nextjs-toploader";

const NavigationProgress = () => {
  return (
    <NextTopLoader
      color="#5c4a42"
      shadow={false}
      showSpinner={false}
      height={2}
    />
  );
};

export default NavigationProgress;
