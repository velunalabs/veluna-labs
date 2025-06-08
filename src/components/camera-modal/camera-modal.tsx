import React, { useEffect, useRef, useState } from "react";
import { CameraModalProps, CapturedMedia } from "./type";
import {
  Camera,
  Circle,
  Download,
  Play,
  RefreshCcw,
  Trash2,
  X,
  Zap,
  ZapOff,
} from "lucide-react";

function CameraModal({ onClose, onSaveCaptured }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<CapturedMedia[]>([]);
  const [videos, setVideos] = useState<CapturedMedia[]>([]);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [flashMode, setFlashMode] = useState<"off" | "on">("off");
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<CapturedMedia | null>(
    null
  );

  const genId = () => Math.random().toString(36).substring(2, 9);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Fetch available video input devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
        if (videoDevices.length === 0) {
          setError("No camera devices found.");
          return;
        }
        setDevices(videoDevices);
        setDeviceId(videoDevices[0].deviceId);
        setError(null);
      } catch {
        setError("Error accessing media devices. Please check permissions.");
      }
    };
    getDevices();
  }, []);

  // Start camera stream on deviceId change
  useEffect(() => {
    if (!deviceId) return;

    const startCamera = async () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
          audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setError(null);
      } catch {
        setError("Unable to access camera. Please grant permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [deviceId]);

  // Capture photo
  const capturePhoto = () => {
    if (!stream || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const id = genId();

    setPhotos((prev) => [
      { id, type: "photo", dataUrl, timestamp: new Date() },
      ...prev,
    ]);
  };

  // Start video recording
  const startRecording = () => {
    if (!stream) return;

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const id = genId();

      setVideos((prev) => [
        { id, type: "video", url, blob, timestamp: new Date() },
        ...prev,
      ]);
    };

    recorder.start();
    setRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    }
  };
  // Switch between cameras
  const switchCamera = () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex((d) => d.deviceId === deviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setDeviceId(devices[nextIndex].deviceId);
  };

  // Toggle flash (if supported)
  const toggleFlash = async () => {
    if (!stream) return;

    const nextMode = flashMode === "off" ? "on" : "off";
    setFlashMode(nextMode);

    try {
      const track = stream.getVideoTracks()[0];
      const capabilities =
        track.getCapabilities?.() as MediaTrackCapabilities & {
          torch?: boolean;
        };

      if (capabilities?.torch) {
        const constraints = {
          advanced: [
            { torch: nextMode === "on" },
          ] as unknown as MediaTrackConstraintSet[],
        };

        await track.applyConstraints(constraints);
      }
    } catch (error) {
      console.warn("Torch not supported or error applying constraints:", error);
    }
  };

  // Close modal and stop stream
  const handleClose = () => {
    if (onClose) onClose();
    if (stream) stream.getTracks().forEach((t) => t.stop());
  };

  const allMedia = [...photos, ...videos].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const handleSaveAll = () => {
    if (onSaveCaptured) onSaveCaptured(allMedia);
  };

  const handleMainAction = () => {
    if (mode === "photo") {
      capturePhoto();
    } else {
      recording ? stopRecording() : startRecording();
    }
  };

  const deleteMedia = (id: string, type: "photo" | "video") => {
    if (type === "photo") setPhotos((p) => p.filter((m) => m.id !== id));
    else setVideos((v) => v.filter((m) => m.id !== id));
    setSelectedMedia(null);
  };

  const downloadMedia = (media: CapturedMedia, type: string) => {
    const link = document.createElement("a");
    if (media.type === "photo") {
      link.href = media.dataUrl || "";
      link.download = `photo-${media.id}.jpg`;
    } else {
      link.href = media.url || "";
      link.download = `video-${media.id}.mp4`;
    }
    link.click();
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm mx-auto bg-gray-900/95 backdrop-blur-xl rounded-4xl shadow-2xl overflow-hidden my-auto"
      >
        <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {recording && (
                <div className="flex items-center gap-2 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {formatTime(recordingTime)}
                </div>
              )}
              {flashMode === "on" && (
                <div className="flex items-center gap-1 bg-yellow-400/90 backdrop-blur-sm text-black px-2 py-1 rounded-full text-xs font-medium">
                  <Zap size={12} />
                  Flash
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {error ? (
          <div className="p-8 text-center min-h-[400px] flex items-center justify-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-300 max-w-sm">
              <div className="text-red-400 mb-2 text-lg font-semibold">
                Camera Error
              </div>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative aspect-[3/4] bg-black overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!recording && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-black/40 backdrop-blur-md rounded-full p-1 flex border border-white/10">
                    <button
                      onClick={() => setMode("photo")}
                      className={`px-3 md:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        mode === "photo"
                          ? "bg-white text-black shadow-lg scale-105"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      Photo
                    </button>
                    <button
                      onClick={() => setMode("video")}
                      className={`px-3 md:px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        mode === "video"
                          ? "bg-white text-black shadow-lg scale-105"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      Video
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={toggleFlash}
                className={`absolute bottom-4 left-2 md:left-4 z-20 size-10 md:size-12 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                  flashMode === "on"
                    ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                    : "bg-black/40 hover:bg-black/60 text-white border border-white/10"
                }`}
              >
                {flashMode === "off" ? <ZapOff size={18} /> : <Zap size={18} />}
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="p-6 bg-gradient-to-t from-black to-gray-900">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={switchCamera}
                  disabled={devices.length < 2}
                  className={`md:size-14 size-10 rounded-full flex items-center justify-center transition-all duration-200 border ${
                    devices.length < 2
                      ? "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                      : "bg-white/10 hover:bg-white/20 text-white active:scale-95 border-white/20 hover:border-white/30"
                  }`}
                >
                  <RefreshCcw size={20} />
                </button>

                <button
                  onClick={handleMainAction}
                  disabled={!stream}
                  className={`relative md:size-24 size-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl ${
                    stream
                      ? mode === "photo"
                        ? "bg-white hover:bg-gray-100 text-gray-900 active:scale-95 border-4 border-white/50"
                        : recording
                        ? "bg-red-500 hover:bg-red-600 text-white active:scale-95 border-4 border-red-300/50 animate-pulse"
                        : "bg-red-500 hover:bg-red-600 text-white active:scale-95 border-4 border-red-300/50"
                      : "bg-white/20 text-white/50 border-4 border-white/20 cursor-not-allowed"
                  }`}
                >
                  {mode === "photo" ? (
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-inner">
                      <Camera size={28} className="text-gray-900" />
                    </div>
                  ) : recording ? (
                    <div className="w-8 h-8 bg-white rounded-sm" />
                  ) : (
                    <Circle size={36} fill="currentColor" />
                  )}
                </button>

                <div className="w-14 h-14 flex items-center justify-center">
                  {mode === "video" && recording && (
                    <button
                      onClick={capturePhoto}
                      className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 active:scale-95 border border-white/20"
                    >
                      <Camera size={20} />
                    </button>
                  )}
                </div>
              </div>

              {allMedia.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-lg">
                      Captured ({allMedia.length})
                    </h3>
                    <button
                      onClick={handleSaveAll}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 text-sm"
                    >
                      Save All
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                    {allMedia.map((media) => (
                      <div
                        key={media.id}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 border border-white/10 group cursor-pointer"
                        onClick={() => setSelectedMedia(media)}
                      >
                        {media.type === "photo" ? (
                          <img
                            src={media.dataUrl || "/placeholder.svg"}
                            alt="Captured"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video
                              src={media.url}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <Play
                                size={20}
                                className="text-white"
                                fill="currentColor"
                              />
                            </div>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selectedMedia && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-40 flex items-center justify-center p-4">
                <div className="relative max-w-full max-h-full">
                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200"
                  >
                    <X size={18} />
                  </button>

                  <div className="bg-gray-900 rounded-2xl overflow-hidden border border-white/10">
                    {selectedMedia.type === "photo" ? (
                      <img
                        src={selectedMedia.dataUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="max-w-full max-h-[60vh] object-contain"
                      />
                    ) : (
                      <video
                        src={selectedMedia.url}
                        controls
                        className="max-w-full max-h-[60vh] object-contain"
                      />
                    )}

                    <div className="p-4 flex items-center justify-between bg-gray-800">
                      <div className="text-white text-sm">
                        {selectedMedia.type === "photo" ? "Photo" : "Video"}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            downloadMedia(selectedMedia, selectedMedia.type)
                          }
                          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-all duration-200"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() =>
                            deleteMedia(selectedMedia.id, selectedMedia.type)
                          }
                          className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CameraModal;
