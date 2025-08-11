import React, { useState } from 'react';

function StartSessionModal({ isOpen, onClose, onStart }) {
    const [duration, setDuration] = useState(45); // Mặc định là 45 phút

    const handleSubmit = (e) => {
        e.preventDefault();
        onStart(duration);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Bắt đầu Buổi học mới</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="duration">Thời lượng (phút):</label>
                        <input
                            type="number"
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                            min="1"
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="save-btn">Bắt đầu</button>
                        <button type="button" onClick={onClose} className="cancel-btn">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StartSessionModal;