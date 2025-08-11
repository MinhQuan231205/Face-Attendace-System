import React, { useState, useRef, useCallback } from 'react';
import apiClient from '../../api/axios';

function AttendanceTaker({ sessionId, onRecognitionSuccess }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [message, setMessage] = useState('Sẵn sàng điểm danh.');
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionIntervalRef = useRef(null);

    const startRecognitionInterval = () => {
        if (recognitionIntervalRef.current) clearInterval(recognitionIntervalRef.current);
        recognitionIntervalRef.current = setInterval(() => {
            handleRecognition();
        }, 3000);
    };

    const stopRecognitionInterval = () => {
        if (recognitionIntervalRef.current) {
            clearInterval(recognitionIntervalRef.current);
            recognitionIntervalRef.current = null;
        }
    };

    const toggleCamera = async () => {
        if (isCameraOn) {
            stopRecognitionInterval();
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraOn(false);
            setMessage('Sẵn sàng điểm danh.');
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                setIsCameraOn(true);
                setMessage('Camera đã bật. Tự động nhận diện...');
                startRecognitionInterval();
            } catch (err) {
                alert("Không thể truy cập camera.");
            }
        }
    };

    const handleRecognition = useCallback(async () => {
        if (isProcessing || !videoRef.current?.srcObject) return;

        setIsProcessing(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');

        try {
            const payload = { image_base64: imageDataUrl };
            const response = await apiClient.post(`/sessions/${sessionId}/recognize/`, payload);
            const recognizedLog = response.data;
            const userName = recognizedLog.user ? recognizedLog.user.full_name : 'Không rõ';
            setMessage(`Đã nhận diện: ${userName}`);
            onRecognitionSuccess(recognizedLog);
        } catch (error) {
            if (error.response && error.response.status !== 404) {
                setMessage(`Lỗi: ${error.response.data.detail}`);
            }
        } finally {
            setIsProcessing(false);
        }
    }, [sessionId, isProcessing, onRecognitionSuccess]); // <-- ĐÃ SỬA Ở ĐÂY
    
    return (
        <div className="panel-card">
            <h2>Camera Điểm danh</h2>
            <div className="panel-content">
                <div className="video-container">
                    <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)', display: isCameraOn ? 'block' : 'none' }}/>
                    {!isCameraOn && <div className="placeholder">Camera đang tắt</div>}
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button onClick={toggleCamera}>
                    {isCameraOn ? 'Tắt Camera' : 'Bắt đầu Điểm danh'}
                </button>
                <p className="message">{message}</p>
            </div>
        </div>
    );
}

export default AttendanceTaker;