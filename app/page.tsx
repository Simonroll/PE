import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Add books",
    text: "Save every book you want to read with its author and number of pages.",
  },
  {
    title: "Track your progress",
    text: "Move each book from To Read to Reading to Finished in one click.",
  },
  {
    title: "Search your shelf",
    text: "Filter by status or search by title and author to find a book fast.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <h1 data-testid="home-title" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          ShelfLife
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-600">
          Keep a list of the books you want to read, are reading or have finished, and see how much is on your shelf.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <CardTitle>{f.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">{f.text}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
