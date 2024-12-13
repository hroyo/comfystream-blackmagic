import React, { useEffect, useRef, useState, useCallback } from "react";

interface WebcamProps {
  onStreamReady: (stream: MediaStream) => void;
}

export function Webcam({ onStreamReady }: WebcamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  const captureStream = useCallback(() => {
    if (videoRef.current) {
      // cast to any because captureStream() not recognized
      const video = videoRef.current as any;
      const stream = video.captureStream(30);

      streamRef.current = stream;

      onStreamReady(stream);
    }
  }, [onStreamReady]);

  // Function to log available webcams and store them in state
  const logAvailableWebcams = async () => {
    try {
      // Request permission to access the camera
      await navigator.mediaDevices.getUserMedia({ video: true });

      // After permission is granted, enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      setDevices(videoDevices);

      if (videoDevices.length === 0) {
        console.log("No webcams found.");
      } else {
        videoDevices.forEach((device, index) => {
          console.log(`${index + 1}. ${device.label} - ID: ${device.deviceId}`);
        });
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };



  // Function to start webcam stream based on selected device
  const startWebcam = async () => {
    try {
      const constraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { exact: 512 },
          height: { exact: 512 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      captureStream();
    } catch (err) {
      console.error("Error accessing webcam:", err);
      if (err === "NotReadableError") {
        console.error("The selected device is currently unavailable.");
      } else {
        console.error("An unknown error occurred while accessing the webcam.");
      }
    }
  };


  useEffect(() => {
    logAvailableWebcams();
  }, []);

  useEffect(() => {
    if (selectedDeviceId) {
      startWebcam();
    }
  }, [selectedDeviceId]);

  return (
    <div>
      <select onChange={(e) => setSelectedDeviceId(e.target.value)} value={selectedDeviceId}>
        <option value="">Select a webcam</option>
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Device ${device.deviceId}`}
          </option>
        ))}
      </select>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
}
