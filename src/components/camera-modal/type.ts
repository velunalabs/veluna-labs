export interface CapturedMedia {
  id: string;
  type: "photo" | "video";
  dataUrl?: string; // for photo
  url?: string; // for video
  blob?: Blob;
  timestamp: Date;
}

export interface CameraModalProps {
  onClose?: (() => void | undefined) | undefined;
  onSaveCaptured?: (media: CapturedMedia[]) => void;
}
