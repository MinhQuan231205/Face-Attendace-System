import React, { useState, useEffect } from 'react';

function SessionTimer({ endTime, onEnd }) {
    const calculateTimeLeft = () => {
        if (!endTime) return {};
        const difference = new Date(endTime) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        if (!endTime) return;
        
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (Object.keys(newTimeLeft).length === 0 && !isEnded) {
                setIsEnded(true);
                onEnd(); // Tự động gọi hàm onEnd khi hết giờ
            }
        }, 1000);

        return () => clearTimeout(timer);
    }); // Bỏ dependency array để timer luôn cập nhật

    const hasTimeLeft = Object.keys(timeLeft).length > 0;

    return (
        <div className="session-timer">
            {hasTimeLeft ? (
                <>
                    Thời gian còn lại: 
                    <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
                    <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
                    <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                </>
            ) : (
                <span>Buổi học đã kết thúc.</span>
            )}
        </div>
    );
}

export default SessionTimer;