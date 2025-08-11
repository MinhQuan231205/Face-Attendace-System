import React, { useState, useRef, useEffect, useCallback } from 'react';
import apiClient from '../../api/axios'; // Đảm bảo import apiClient

function AttendanceTaker({ sessionId, onRecognitionSuccess }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [message, setMessage] = useState('Sẵn sàng điểm danh.');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const recognitionIntervalRef = useRef(null);

    // Dọn dẹp khi component unmount
    useEffect(() => {
        return () => {
            if (recognitionIntervalRef.current) {
                clearInterval(recognitionIntervalRef.current);
            }
            if(videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleRecognition = useCallback(async () => {
        if (isProcessing || !videoRef.current?.srcObject || !canvasRef.current) return;

        setIsProcessing(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            setIsProcessing(false);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');

        try {
            // Đảm bảo tên trường khớp với schema: `image_base64`
            const payload = { image_base64: imageDataUrl };
            const response = await apiClient.post(`/sessions/${sessionId}/recognize/`, payload);
            
            const recognizedLog = response.data;
            // Chỉ hiển thị message thành công, không cần lặp lại tên
            setMessage(`Đã nhận diện thành công!`);
            onRecognitionSuccess(recognizedLog);

        } catch (error) {
            // Không làm gì cả khi lỗi 404 (không tìm thấy khuôn mặt)
            // vì đây là trường hợp bình thường
            if (error.response && error.response.status !== 404) {
                setMessage(`Lỗi: ${error.response.data.detail || 'Lỗi không xác định'}`);
            }
        } finally {
            // Dừng xử lý sau khi hoàn thành, đợi vòng lặp tiếp theo
            setIsProcessing(false);
        }
    }, [sessionId, isProcessing, onRecognitionSuccess]); // Dependency đã được rút gọn

    const toggleCamera = useCallback(() => {
        if (isCameraOn) {
            // Tắt camera và dừng vòng lặp
            if (recognitionIntervalRef.current) {
                clearInterval(recognitionIntervalRef.current);
                recognitionIntervalRef.current = null;
            }
            if(videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            setIsCameraOn(false);
            setMessage('Sẵn sàng điểm danh.');
        } else {
            // Bật camera
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        setIsCameraOn(true);
                        setMessage('Camera đã bật. Tự động nhận diện...');
                        // Bắt đầu vòng lặp nhận diện tự động
                        recognitionIntervalRef.current = setInterval(handleRecognition, 3000); // 3 giây một lần
                    }
                })
                .catch(err => {
                    console.error("Lỗi camera:", err);
                    alert("Không thể truy cập camera. Vui lòng cấp quyền và tải lại trang.");
                });
        }
    }, [isCameraOn, handleRecognition]); // toggleCamera phụ thuộc vào isCameraOn và handleRecognition

    return (
        <div className="panel-card">
            <h2>Camera Điểm danh</h2>
            <div className="panel-content">
                <div className="video-container">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        style={{ transform: 'scaleX(-1)', display: isCameraOn ? 'block' : 'none' }}
                    />
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