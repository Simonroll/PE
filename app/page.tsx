import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center space-y-4 mb-12">
        <h1
          data-testid="home-title"
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900"
        >
          SpendWise
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Take control of your personal finances. Record daily expenses, filter your spending by month and category, and see exactly where your money goes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Add expenses</CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-2">
              Log daily transactions quickly with categorized amounts, dates, and optional notes.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Filter by month</CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-2">
              Easily filter your spending by specific month and category to monitor monthly budgets.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">See where money goes</CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-2">
              View real-time total amounts, expense counts, and category breakdowns sorted by highest spending.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
