"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      data-testid="error-boundary"
      className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center"
    >
      <div className="max-w-md rounded-sm border-2 border-[#d4af37] bg-white/95 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#bfa87e] uppercase tracking-wider mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <Button
          data-testid="btn-retry"
          onClick={() => reset()}
          className="bg-[#2a2622] text-[#d4af37] border-2 border-[#d4af37] hover:bg-[#d4af37] hover:text-[#2a2622] rounded-none uppercase font-bold tracking-wider"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
