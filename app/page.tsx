export default function HomePage() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4">
      {/* ======================================================== */}
      {/* TIÊU ĐỀ NẰM CHÍNH GIỮA TRANG (HOME TITLE)                 */}
      {/* Khi thi, bạn chỉ cần thay chữ "blank" bằng tên đề thi    */}
      {/* ======================================================== */}
      <h1
        data-testid="home-title"
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 text-center"
      >
        blank
      </h1>
    </div>
  );
}
