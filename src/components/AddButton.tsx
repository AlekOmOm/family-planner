import { PlusIcon } from '@heroicons/react/24/outline';

interface AddButtonProps {
  onClick: () => void;
  label?: string;
  compact?: boolean;
}

export function AddButton({ onClick, label, compact = false }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-[#1B4B6B] text-white rounded-lg hover:bg-[#123448] transition-all
        ${compact ? 'p-1.5' : 'px-4 py-2'}
        flex items-center gap-2
      `}
    >
      <PlusIcon className="w-4 h-4" />
      {!compact && label && <span>{label}</span>}
    </button>
  );
}