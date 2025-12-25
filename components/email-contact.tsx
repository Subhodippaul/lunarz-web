"use client";
import { Mail } from "lucide-react";

interface EmailContactProps {
  className?: string;
  showIcon?: boolean;
  text?: string;
}

export default function EmailContact({ 
  className = "", 
  showIcon = true, 
  text = "lunarz.info@gmail.com" 
}: EmailContactProps) {
  return (
    <a
      href="mailto:lunarz.info@gmail.com"
      className={`inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
    >
      {showIcon && <Mail className="h-4 w-4" />}
      <span>{text}</span>
    </a>
  );
}