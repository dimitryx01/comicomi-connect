
interface CheersIconProps {
  className?: string;
}

export const CheersIcon = ({ className }: CheersIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
    <path d="M11 12V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
    <path d="M3 19h18l-2-7H5z" />
    <path d="M12 12v7" />
  </svg>
);
