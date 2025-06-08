export const recordAudio = (duration: number = 5000): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      reject("Media devices API not supported in this browser or server-side rendering context.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (error) => {
          reject(error);
        };
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
      });

      mediaRecorder.start();
      const recordingStopper = setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, duration);

      // Ensure recorder stops if component unmounts or user navigates away
      // This is tricky to implement perfectly here, parent component should manage this
      // For now, this basic timeout handles the recording duration.

    } catch (error) {
      console.error("Error accessing microphone:", error);
      let message = "Error accessing microphone.";
      if (error instanceof Error && error.name === "NotAllowedError") {
        message = "Microphone permission denied. Please grant access.";
      } else if (error instanceof Error && error.name === "NotFoundError") {
        message = "No microphone found. Please connect a microphone.";
      }
      reject(message);
    }
  });
};
