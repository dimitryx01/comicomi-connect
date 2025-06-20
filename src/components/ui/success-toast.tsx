
import { CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SuccessToastOptions {
  title: string;
  description?: string;
}

export const showSuccessToast = ({ title, description }: SuccessToastOptions) => {
  toast({
    title: (
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-green-800 font-medium">{title}</span>
      </div>
    ),
    description: description && (
      <span className="text-green-700">{description}</span>
    ),
    className: "bg-green-50 border-green-200 shadow-lg animate-slide-up",
    duration: 4000,
  });
};

export const SuccessToast = showSuccessToast;
