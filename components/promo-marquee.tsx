"use client";

const MESSAGES = [
  "🎉 Use code 'SAVE200' for ₹200 OFF on your order",
];

export default function PromoMarquee() {
  // Duplicate the list so the loop is seamless
  const items = [...MESSAGES, ...MESSAGES];

  return (
    <div className="overflow-hidden bg-black text-white py-1.5">
  <div className="flex w-max animate-marquee">
    {[...items, ...items].map((msg, i) => (
      <span key={i} className="inline-flex items-center px-5">
        {msg}
        <span className="mx-3 text-gray-500">|</span>
      </span>
    ))}
  </div>
</div>
  );
}
