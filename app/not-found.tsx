import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div
      data-testid="not-found"
      className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center"
    >
      <div className="max-w-md rounded-sm border-2 border-[#d4af37] bg-white/95 p-8 shadow-2xl">
        <h2 className="text-3xl font-extrabold text-[#bfa87e] tracking-wider mb-2">
          404
        </h2>
        <p className="text-lg font-bold text-gray-800 mb-2">
          Page or Product Not Found
        </p>
        <p className="text-sm text-gray-600 mb-6">
          The requested item or page could not be found.
        </p>
        <Link href="/">
          <Button className="bg-[#2a2622] text-[#d4af37] border-2 border-[#d4af37] hover:bg-[#d4af37] hover:text-[#2a2622] rounded-none uppercase font-bold tracking-wider">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
