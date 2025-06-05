import { Button } from "@flarekit/ui/components/ui/button";
import { useEffect, useRef } from "react";

interface LoadMoreProps {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

export function LoadMore({ onLoadMore, isLoading, hasMore }: LoadMoreProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.5 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading]);

  if (!hasMore) return null;

  return (
    <div ref={observerRef} className="py-4 flex justify-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={onLoadMore}
        disabled={isLoading}
        className="h-7 px-3 text-xs"
      >
        {isLoading ? (
          <>
            <div className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Loading more...
          </>
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
}
