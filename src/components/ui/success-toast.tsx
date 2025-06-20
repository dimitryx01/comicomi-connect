
import { CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SuccessToastOptions {
  title: string;
  description?: string;
}

export const showSuccessToast = ({ title, description }: SuccessToastOptions) => {
  toast({
    title,
    description,
    className: "bg-green-50 border-green-200 text-green-800 [&_[data-title]]:text-green-800 [&_[data-description]]:text-green-700",
    duration: 4000,
  });
};

export const SuccessToast = showSuccessToast;
