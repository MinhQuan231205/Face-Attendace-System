import React, { useState, useRef, useCallback } from 'react';
import apiClient from '../../api/axios';

// Component nhận một prop là hàm callback onAttendanceSuccess
function AttendanceTaker({ onAttendanceSuccess }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [message, setMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleCamera = async () => {
        if (isCameraOn) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraOn(false);
            setMessage('');
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                setIsCameraOn(true);
            } catch (err) {
                alert("Không thể truy cập camera.");
            }
        }
    };

    const handleRecognition = useCallback(async () => {
        if (!isCameraOn || isProcessing) return;

        setIsProcessing(true);
        setMessage('Đang nhận diện...');

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');

        try {
            const payload = { image_base64: imageDataUrl };
            // Gọi API điểm danh được bảo vệ của student
            const response = await apiClient.post('/attendance/recognize/', payload);
            setMessage(`Điểm danh thành công lúc ${new Date().toLocaleTimeString()}!`);
            
            // Gọi hàm callback để thông báo cho component cha
            if(onAttendanceSuccess) {
                onAttendanceSuccess();
            }

            // Tự động tắt camera sau khi thành công
            setTimeout(toggleCamera, 2000);

        } catch (error) {
            const errorMsg = error.response?.data?.detail || "Không thể nhận diện khuôn mặt.";
            setMessage(`Lỗi: ${errorMsg}`);
        } finally {
            // Đợi một chút trước khi cho phép nhận diện lại để tránh spam
            setTimeout(() => setIsProcessing(false), 2000);
        }
    }, [isCameraOn, isProcessing, onAttendanceSuccess]);

    return (
        <div className="panel-card">
            <h2>Điểm Danh</h2>
            <div className="panel-content">
                <div className="video-container">
                    <video ref={videoRef} autoPlay playsInline muted style={{ display: isCameraOn ? 'block' : 'none' }}/>
                    {!isCameraOn && <div className="placeholder">Camera đang tắt</div>}
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {isCameraOn ? (
                    <button onClick={handleRecognition} disabled={isProcessing}>
                        {isProcessing ? 'Đang xử lý...' : 'Chụp ảnh điểm danh'}
                    </button>
                ) : (
                    <button onClick={toggleCamera}>Mở Camera</button>
                )}

                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
}
export default AttendanceTaker;