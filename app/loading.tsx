export default function Loading() {
  return (
    <div
      data-testid="loading"
      className="flex min-h-[50vh] items-center justify-center p-8"
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d4af37] border-t-transparent"></div>
        <p className="text-sm font-semibold tracking-wider text-[#bfa87e] uppercase">
          Loading 1999 Store...
        </p>
      </div>
    </div>
  );
}
