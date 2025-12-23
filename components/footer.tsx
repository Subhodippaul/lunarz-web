import { SITE_CONFIG, FOOTER } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-gray-600">
        © {new Date().getFullYear()} {SITE_CONFIG.name}. {FOOTER.copyright}
      </div>
    </footer>
  );
}
