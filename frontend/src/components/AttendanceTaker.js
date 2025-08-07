import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

function AttendanceTaker() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [isCameraOn, setIsCameraOn] = useState(false);
    const [recognizedStudents, setRecognizedStudents] = useState([]);
    const [lastRecognitionTime, setLastRecognitionTime] = useState(0);

    const recognitionInterval = 2000; 

    const toggleCamera = async () => {
        if (isCameraOn) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraOn(false);
            setRecognizedStudents([]); 
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                setIsCameraOn(true);
            } catch (err) {
                console.error("Lỗi khi mở camera:", err);
                alert("Không thể truy cập camera. Vui lòng cấp quyền và thử lại.");
            }
        }
    };

    const handleRecognition = useCallback(async () => {
        if (!isCameraOn || !videoRef.current || !canvasRef.current) return;

        const now = Date.now();
        if (now - lastRecognitionTime < recognitionInterval) {
            return;
        }
        setLastRecognitionTime(now);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg');

        try {
            const payload = { image_base64: imageDataUrl };
            const response = await axios.post('/recognize/', payload);
            
            setRecognizedStudents(prevStudents => {
                const currentStudentCodes = new Set(prevStudents.map(s => s.student_code));
                const newStudents = response.data.filter(s => !currentStudentCodes.has(s.student_code));
                return [...prevStudents, ...newStudents];
            });

        } catch (error) {
            console.error("Lỗi khi nhận diện:", error);
        }

    }, [isCameraOn, lastRecognitionTime]);


    useEffect(() => {
        let intervalId;
        if (isCameraOn) {
            intervalId = setInterval(() => {
                handleRecognition();
            }, 500); 
        }
        
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isCameraOn, handleRecognition]);

    return (
        <div className="attendance-container">
            <h2>Điểm Danh</h2>
            <div className="camera-controls">
                <button onClick={toggleCamera}>
                    {isCameraOn ? 'Tắt Camera' : 'Mở Camera Điểm Danh'}
                </button>
            </div>
            
            <div className="video-container">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ width: '100%', display: isCameraOn ? 'block' : 'none' }}
                />
                {!isCameraOn && <div className="placeholder">Camera đang tắt</div>}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="recognized-list">
                <h3>Danh sách đã điểm danh:</h3>
                {recognizedStudents.length > 0 ? (
                    <ul>
                        {recognizedStudents.map(student => (
                            <li key={student.student_code}>
                                {student.full_name} - {student.student_code}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Chưa có sinh viên nào được điểm danh.</p>
                )}
            </div>
        </div>
    );
}

export default AttendanceTaker;