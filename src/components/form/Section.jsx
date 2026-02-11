import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';

export function Section({ title, children, defaultOpen = false, className }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm", className)}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left transition-colors",
          isOpen ? "bg-indigo-50/50 border-b border-gray-100" : "hover:bg-gray-50",
          "bg-white" // Ensure header background
        )}
      >
        <span className="font-semibold text-gray-800 text-lg">{title}</span>
        {isOpen ? (
          <ChevronUp className="text-gray-500" size={20} />
        ) : (
          <ChevronDown className="text-gray-500" size={20} />
        )}
      </button>
      
      {isOpen && (
        <div className="p-6 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
