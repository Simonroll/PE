import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <Card className="border-emerald-200 shadow-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
            ✓
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Vercel Deployment Successful!
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Tab test này đã được tự động build và deploy trực tiếp từ commit trên GitHub lên Vercel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
            🚀 <strong>Đường ống CI/CD hoạt động hoàn hảo!</strong> Mỗi khi bạn gõ <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300">git push origin main</code>, Vercel sẽ tự động cập nhật web trong vòng ~1 phút.
          </div>
          <div className="pt-2">
            <Link href="/">
              <Button variant="outline">
                ← Quay lại Trang Chủ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
