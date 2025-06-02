import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  isOpen: boolean;
  onClick: () => void;
  position: 'left' | 'right';
  className?: string;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ 
  isOpen, 
  onClick, 
  position,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute z-50 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md",
        position === 'left' ? "top-4 -right-4 transform translate-x-1/2" : "top-4 -left-4 transform -translate-x-1/2",
        className
      )}
      style={{
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      {position === 'left' ? 
        (isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : 
        (isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)
      }
    </button>
  );
};

export default SidebarToggle;
