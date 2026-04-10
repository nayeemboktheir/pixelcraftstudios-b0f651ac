import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const STORAGE_BASE = 'https://nnykxuqznubhblqrkhrv.supabase.co/storage/v1/object/public/shop-assets/products';

const FILE_MAP: Record<string, string> = {
  'ai-prompt-mastery': `${STORAGE_BASE}/AI%20Prompt%20Mastery-compressed.pdf`,
};

export default function DownloadPage() {
  const [searchParams] = useSearchParams();
  const fileKey = searchParams.get('file') || 'ai-prompt-mastery';

  useEffect(() => {
    const url = FILE_MAP[fileKey];
    if (url) {
      window.location.href = url;
    }
  }, [fileKey]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Preparing your download...</p>
      </div>
    </div>
  );
}
