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
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  PlyrLayout,
  plyrLayoutIcons,
} from "@vidstack/react/player/layouts/plyr";

interface VideoViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  fileName?: string;
}

// Video viewer content component
const VideoViewerContent: React.FC<{
  videoUrl: string;
  fileName?: string;
  onClose: () => void;
}> = ({ videoUrl, fileName, onClose }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Top header bar */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium truncate">{fileName || "Video"}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <RiCloseLine className="size-4" />
        </Button>
      </div>

      {/* Main video area */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center p-4 w-full">
        {/* Video Element with default controls */}
        <MediaPlayer
          title={fileName || "Video"}
          src={videoUrl}
          viewType="video"
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

export function VideoViewerDialog({
  open,
  onOpenChange,
  videoUrl,
  fileName,
}: VideoViewerDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1400px] h-[500px] max-w-[95vw] max-h-[90vh] p-0 [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Video Viewer</DialogTitle>
        </DialogHeader>
        <VideoViewerContent
          videoUrl={videoUrl}
          fileName={fileName}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
