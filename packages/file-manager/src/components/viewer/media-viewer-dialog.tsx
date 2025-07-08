import { Button } from "@flarekit/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@flarekit/ui/components/ui/dialog";
import { RiCloseLine } from "@remixicon/react";
import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/plyr/theme.css";
import {
  MediaPlayer,
  MediaProvider,
  type MediaViewType,
} from "@vidstack/react";
import {
  PlyrLayout,
  plyrLayoutIcons,
} from "@vidstack/react/player/layouts/plyr";

interface MediaViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaUrl: string;
  type?: MediaViewType;
  fileName?: string;
}

// audio viewer content component
const MediaViewerContent: React.FC<{
  audioUrl: string;
  fileName?: string;
  onClose: () => void;
  type?: MediaViewType;
}> = ({ audioUrl, fileName, onClose, type }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Top header bar */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium truncate">{fileName || "audio"}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <RiCloseLine className="size-4" />
        </Button>
      </div>

      {/* Main audio area */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center p-4 w-full">
        {/* audio Element with default controls */}
        <MediaPlayer
          title={fileName || "audio"}
          src={audioUrl}
          viewType={type}
          streamType="on-demand"
          logLevel="warn"
          crossOrigin
          playsInline
          className="w-full h-full"
          style={{
            width: "100%",
            height: "100%",
            minWidth: "100%",
            maxWidth: "none",
            aspectRatio: "unset",
          }}
        >
          <MediaProvider />
          <PlyrLayout icons={plyrLayoutIcons} />
        </MediaPlayer>
      </div>
    </div>
  );
};

export function MediaViewerDialog({
  open,
  onOpenChange,
  mediaUrl,
  type,
  fileName,
}: MediaViewerDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1400px] h-[500px] max-w-[95vw] max-h-[90vh] p-0 [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>audio Viewer</DialogTitle>
        </DialogHeader>
        <MediaViewerContent
          audioUrl={mediaUrl}
          fileName={fileName}
          type={type}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
