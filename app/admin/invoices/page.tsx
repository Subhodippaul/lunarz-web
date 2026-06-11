"use client";
import InvoiceMaker from "@/components/invoice-maker";

export default function InvoicesPage() {
  return (
    <div className="max-w-7xl relative">
      {/* Subtle watermark for the form page */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <img
          src="/logo2.png"
          alt="Lunarz Logo"
          className="opacity-3 transform -rotate-45"
          style={{
            width: "800px",
            height: "800px",
          }}
        />
      </div>
      {/* Main content with higher z-index */}
      <div className="relative z-10">
        <div>
          <InvoiceMaker />
        </div>
      </div>{" "}
      {/* End of z-10 content div */}
    </div>
  );
}
