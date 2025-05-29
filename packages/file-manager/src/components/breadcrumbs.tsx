import { useFileStore } from "@/store/use-file-store";
import { Button } from "@flarekit/ui/components/ui/button";
import { cn } from "@flarekit/ui/lib/utils";
import { RiArrowRightSLine, RiFolderLine, RiHome3Line } from "@remixicon/react";

interface BreadcrumbsProps {
  items: Array<{ id: string | null; name: string }>;
  onNavigate: (id: string | null) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  const { setCurrentFolder } = useFileStore();
  const handleonNavigate = (id: string | null) => {
    onNavigate(id);
    setCurrentFolder(id);
  };

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {items?.map((item, index) => (
        <div
          key={item.id ?? "root"}
          className="flex items-center last:text-foreground"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleonNavigate(item.id)}
            className={cn(
              "h-auto px-2 py-1.5 text-sm",
              "hover:text-foreground",
              index === items.length - 1 &&
                "cursor-default hover:bg-transparent",
            )}
            disabled={index === items.length - 1}
          >
            {index === 0 ? (
              <div className="flex items-center gap-1">
                <RiHome3Line className="size-4" />
                <span>Home</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <RiFolderLine className="size-4" />
                <span className="max-w-[100px] truncate">{item.name}</span>
              </div>
            )}
          </Button>
          {index < items.length - 1 && (
            <RiArrowRightSLine className="size-4 mx-0.5 flex-shrink-0" />
          )}
        </div>
      ))}
    </nav>
  );
}
