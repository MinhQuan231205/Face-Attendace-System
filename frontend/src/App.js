import React from 'react';
import './App.css';
import AddStudentForm from './components/AddStudentForm';
import AttendanceTaker from './components/AttendanceTaker'; // Import component mới

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hệ thống Điểm danh Nhận diện Khuôn mặt</h1>
      </header>
      <main className="main-layout">
        <div className="add-student-section">
          <AddStudentForm />
        </div>
        <div className="attendance-section">
          <AttendanceTaker />
        </div>
      </main>
    </div>
  );
}

export default App;