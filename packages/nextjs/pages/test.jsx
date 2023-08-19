import { useState, useEffect } from 'react';

const AudioLevelMonitor = () => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  useEffect(() => {
    const updateDeviceList = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      setDevices(audioDevices);
    };

    updateDeviceList();
  }, []);

  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;

    const startAudioMonitoring = async () => {
      try {
        if (!selectedDevice) return;
        
        const constraints = {
          audio: {
            deviceId: { exact: selectedDevice },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);

        microphone.connect(analyser);
        analyser.connect(audioContext.destination);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);

          const sum = dataArray.reduce((acc, value) => acc + value, 0);
          const avg = sum / dataArray.length;
          setAudioLevel(avg);
          
          requestAnimationFrame(updateAudioLevel);
        };

        updateAudioLevel();
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    startAudioMonitoring();

    return () => {
      if (microphone) microphone.disconnect();
      if (analyser) analyser.disconnect();
      if (audioContext) audioContext.close();
    };
  }, [selectedDevice]);

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  return (
    <div>
      <h1>Audio Level Monitor</h1>
      <select onChange={handleDeviceChange}>
        <option value={null}>Select a microphone</option>
        {devices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Microphone ${device.deviceId}`}
          </option>
        ))}
      </select>
      <p>Audio Level: {audioLevel}</p>
    </div>
  );
};

export default AudioLevelMonitor;
