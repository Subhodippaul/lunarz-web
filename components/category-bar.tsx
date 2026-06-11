import { Badge } from "@/components/ui/badge";

export default function CategoryBar() {
  const categories = ["Oversized", "Regular", "Hoodie","Customize"];
  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex gap-3 flex-wrap">
      {categories.map((c) => (
        <Badge key={c} variant="secondary" className="px-4 py-2 cursor-pointer">
          {c}
        </Badge>
      ))}
    </div>
  );
}
