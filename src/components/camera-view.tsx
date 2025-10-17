"use client";

import {
    AlertCircle,
    Camera,
    CameraOff,
    ChevronDownIcon,
    Download,
    RefreshCcw,
    Square,
} from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import {
    ButtonGroup,
    ButtonGroupSeparator,
} from "./ui/button-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

function CameraView({
    closeCamera,
    onUsePhoto = () => { }
}: { closeCamera?: boolean, onUsePhoto?: (data: string) => void }) {
    const [cameraAccessDenied, setCameraAccessDenied] = React.useState(false);
    const [cameraAccessRequired, setCameraAccessRequired] = React.useState(false);
    const [error, setError] = React.useState("");
    const [isCameraOn, setIsCameraOn] = React.useState(false);
    const [stream, setStream] = React.useState<MediaStream | null>(null);
    const [availableDevices, setAvailableDevices] = React.useState<MediaDeviceInfo[]>([]);
    const [selectedDevice, setSelectedDevice] = React.useState<MediaDeviceInfo | null>(null);
    const [facingMode, setFacingMode] = React.useState<"user" | "environment">("user");
    const [capturedImage, setCapturedImage] = React.useState<string | null>(null);

    const videoRef = React.useRef<HTMLVideoElement>(null);

    const checkCameraAccess = async () => {
        try {
            // Safari doesn't support navigator.permissions for "camera"
            if ("permissions" in navigator && (navigator as any).permissions.query) {
                const result = await (navigator as any).permissions.query({ name: "camera" });
                if (result.state === "denied") setCameraAccessDenied(true);
                if (result.state === "prompt") setCameraAccessRequired(true);
            } else {
                // Fallback: directly try to access camera
                setCameraAccessRequired(true);
            }
        } catch {
            setCameraAccessRequired(true);
        }
    };

    React.useEffect(() => {
        checkCameraAccess();
    }, []);

    React.useEffect(() => {
        return () => {
            if (closeCamera) {
                stopCamera();
            }
        };
    }, [closeCamera]);


    const stopCamera = async () => {
        if (stream) {
            await stream.getTracks().forEach((track) => {
                track.stop()
            });
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false)
    };

    const startCamera = async (deviceId?: string) => {
        try {
            setError("");
            const constraints: MediaStreamConstraints = {
                video: deviceId
                    ? {
                        deviceId: {
                            exact: deviceId
                        },
                        width: { ideal: 1080 },
                        height: { ideal: 1440 },
                        aspectRatio: 3 / 4
                    }
                    : {
                        facingMode: facingMode,
                        width: { ideal: 1080 },
                        height: { ideal: 1440 },
                        aspectRatio: 3 / 4
                    },
                audio: false,
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter((d) => d.kind === "videoinput");

            setAvailableDevices(cameras);
            if (!deviceId) {
                setSelectedDevice(cameras[0] || null);
            }
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            setCameraAccessDenied(false);
            setCameraAccessRequired(false);
            setIsCameraOn(true)
        } catch (err: any) {
            console.error("Error accessing camera:", err);
            setError("Failed to start camera. Try file upload instead.");
            if (err.name === "NotAllowedError") {
                setCameraAccessDenied(true);
                setCameraAccessRequired(false);
            }
            setIsCameraOn(false)
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        // const video = videoRef.current;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return;

        // Match video resolution
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Mirror correction if facing user
        if (facingMode === "user") {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }

        // Draw the current video frame
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert to image data URL
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageDataUrl);
        stopCamera()
    };

    const switchCamera = async (device: MediaDeviceInfo) => {
        if (device.deviceId === selectedDevice?.deviceId) return
        stopCamera();            // Stop current camera first
        setSelectedDevice(device);
        await startCamera(device.deviceId);  // Start selected camera
    };


    // ----------- UI States -------------
    if (cameraAccessRequired) {
        return (
            <div className="w-full h-full">
                <Camera className="text-primary mx-auto mb-6" size={64} />
                <h1 className="text-2xl font-bold mb-4 text-center">Camera Access Required</h1>
                <p className="text-gray-500 mb-6 text-center">
                    This app needs access to your camera to capture invoice photos. On mobile devices, you’ll
                    be prompted to allow camera use.
                </p>

                <div className="bg-foreground rounded-lg p-4 mb-6 text-left">
                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle size={20} className="text-yellow-400" />
                        What we’ll access:
                    </h3>
                    <ul className="text-gray-300 text-sm space-y-1 ml-7">
                        <li>• Your device camera (if supported)</li>
                        <li>• Live camera feed for preview</li>
                        <li>• Ability to capture invoice images</li>
                    </ul>
                </div>

                <Button
                    onClick={() => startCamera()}
                    size="lg"
                    className="w-full font-semibold transition flex items-center justify-center"
                >
                    <Camera size={20} />
                    Continue
                </Button>

                <p className="text-gray-400 text-xs mt-4 text-center">
                    Your privacy is protected. We don’t store or transmit any images.
                </p>
            </div>
        );
    }

    if (cameraAccessDenied) {
        return (
            <div className="w-full h-full">
                <CameraOff className="text-red-500 mx-auto mb-6" size={64} />
                <h1 className="text-2xl font-bold mb-4 text-center">Camera Access Denied</h1>

                <p className="text-gray-500 mb-6 text-center">
                    Camera access is blocked. To continue, allow camera permissions in your browser settings.
                </p>

                <div className="bg-foreground rounded-lg p-4 mb-6 text-left">
                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle size={20} className="text-yellow-400" />
                        How to enable camera access:
                    </h3>

                    <ul className="text-gray-300 text-sm space-y-2 ml-7 list-disc">
                        <li>
                            <strong>Desktop (Arc, Chrome, Firefox):</strong> Click the 🔒 icon → “Site settings” →
                            Allow camera.
                        </li>
                        <li>
                            <strong>Mobile:</strong> In browser settings → “Website Settings” → Enable Camera.
                        </li>
                        <li>
                            <strong>iPhone:</strong> Settings → Safari (or Arc) → Camera → Allow.
                        </li>
                        <li>
                            <strong>Android:</strong> App Info → Permissions → Enable Camera.
                        </li>
                    </ul>
                </div>

                <Button
                    onClick={() => startCamera()}
                    size="lg"
                    className="w-full font-semibold transition flex items-center justify-center"
                >
                    <RefreshCcw size={20} />
                    Retry Access
                </Button>

                <p className="text-gray-400 text-xs mt-4 text-center">
                    After changing your browser settings, reload this page or tap “Retry Access”.
                </p>
            </div>
        );
    }

    // ----------- Main Camera UI -------------
    return (
        <div className="w-full h-full">
            {/* <Camera className="text-primary mx-auto mb-4" size={64} /> */}
            <h1 className="text-2xl font-bold mb-4 text-center sr-only">Capture and Attach Your Invoice</h1>
            <p className="text-gray-500 mb-6 text-center">
                Take a clear photo of your invoice using your camera. Keep the document flat and well-lit
                for best results.
            </p>

            <div className="relative max-w-[18rem] mx-auto h-auto aspect-[3/4] bg-muted rounded-xl overflow-hidden">
                <video
                    id="camera-viewer"
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                        "w-full h-full object-cover",
                        facingMode === "user" ? "scale-x-[-1]" : ""
                    )}
                />
                {!isCameraOn && <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center"><Camera size={48} className="text-black/30" /></div>}
                {capturedImage && <img
                    src={capturedImage}
                    alt="Captured invoice"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />}

            </div>

            <ButtonGroup className="mx-auto mt-6 max-w-full">
                <Button variant="secondary" size="sm"
                    onClick={() => {
                        startCamera(selectedDevice ? selectedDevice.deviceId : undefined)
                    }}
                    disabled={isCameraOn || capturedImage !== null}
                >
                    <Camera />
                    <span className="hidden md:block">Start</span>
                </Button>
                <ButtonGroupSeparator />
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                        if (capturedImage) {
                            setCapturedImage(null)
                            await startCamera()
                        } else {
                            capturePhoto()
                        }
                    }}
                    disabled={capturedImage === null && !isCameraOn}
                >
                    {capturedImage ? <RefreshCcw /> : <Square />}
                    <span className="hidden md:block">
                        {capturedImage ? "Retake" : "Capture"}
                    </span>
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                        if (capturedImage) {
                            onUsePhoto(capturedImage)
                        }
                    }}
                    disabled={!capturedImage}
                >
                    <Download />
                    <span className="hidden md:block">Use Photo</span>
                </Button>
                <ButtonGroupSeparator />
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={stopCamera}
                    disabled={!isCameraOn}
                >
                    <CameraOff className="text-destructive" />
                    <span className="hidden md:block">Stop</span>
                </Button>
            </ButtonGroup>

            {selectedDevice && (
                <ButtonGroup className="mx-auto mt-3">
                    <Button variant="outline" className="truncate">
                        {selectedDevice.label || "Default Camera"}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="!pl-2">
                                <ChevronDownIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="[--radius:1rem]">
                            <DropdownMenuGroup>
                                {availableDevices.map((device) => (
                                    <DropdownMenuItem
                                        key={device.deviceId}
                                        onClick={() => switchCamera(device)}
                                    >
                                        <Camera />
                                        {device.label || "Camera"}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </ButtonGroup>
            )}
        </div>
    );
}

export default CameraView;
