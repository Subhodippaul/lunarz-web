"use client";
import { useEffect, useState } from "react";

interface LoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Loader({ 
  text = "Loading...", 
  size = "md",
  className = "" 
}: LoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  if (!mounted) return null;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${sizeClasses[size]} loader-container`}>
        {/* Logo */}
        <img
          src="/loader_logo.png"
          alt="Lunarz Logo"
          className={`${sizeClasses[size]} animate-logo object-contain`}
          onError={(e) => {
            // Fallback if logo doesn't exist
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        
        {/* Fallback logo if image doesn't exist */}
        <div 
          className={`${sizeClasses[size]} animate-logo bg-linear-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center text-white font-bold hidden`}
          style={{ fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.5rem' : '2rem' }}
        >
          L
        </div>

        {/* Sparkles */}
        <span className="sparkle sparkle-1"></span>
        <span className="sparkle sparkle-2"></span>
        <span className="sparkle sparkle-3"></span>
        <span className="sparkle sparkle-4"></span>
        <span className="sparkle sparkle-5"></span>
        <span className="sparkle sparkle-6"></span>

        {/* Crackers/Particles */}
        <span className="cracker cracker-1"></span>
        <span className="cracker cracker-2"></span>
        <span className="cracker cracker-3"></span>
        <span className="cracker cracker-4"></span>
      </div>
      
      <p className={`mt-6 ${textSizeClasses[size]} tracking-wide text-gray-600 animate-pulse`}>
        {text}
      </p>
    </div>
  );
}

// Centered loader for full screen
export function CenteredLoader({ 
  text = "Loading...", 
  size = "lg",
  className = "" 
}: LoaderProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
      <Loader text={text} size={size} />
    </div>
  );
}

// Inline loader for smaller spaces
export function InlineLoader({ 
  text = "Loading...", 
  size = "sm",
  className = "" 
}: LoaderProps) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <Loader text={text} size={size} />
    </div>
  );
}