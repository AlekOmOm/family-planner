import { useState } from 'react';
import { ShareIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useEventStore } from '../stores/eventStore';

interface ShareButtonProps {
  eventId: string;
}

export function ShareButton({ eventId }: ShareButtonProps) {
  const { shareEvent, shareUrl, loading } = useEventStore();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await shareEvent(eventId);
    } catch (error) {
      console.error('Failed to share event:', error);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div className="relative inline-block">
      {!shareUrl ? (
        <button
          onClick={handleShare}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
        >
          <ShareIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      ) : (
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <ShareIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}