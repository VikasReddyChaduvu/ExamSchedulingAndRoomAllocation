class Student {
    constructor() {
        this.currentExamType = 'midterm';
    }
    
    showTimetable() {
        const content = `
            <h3>Your Exam Schedule</h3>
            <div class="timetable-search">
                <input type="text" id="search-roll" placeholder="Enter your roll number" 
                       value="${auth.currentUser?.rollNumber || ''}">
                <button onclick="student.searchTimetable()">Search</button>
            </div>
            
            <div id="timetable-result" class="timetable-result">
                ${this.renderTimetable()}
            </div>
        `;
        
        document.getElementById('student-content').innerHTML = content;
    }
    
    searchTimetable() {
        const rollNumber = document.getElementById('search-roll').value.trim();
        
        if (!rollNumber) {
            mainApp.showError('Please enter your roll number');
            return;
        }
        
        const student = db.getStudentByRollNumber(rollNumber);
        
        if (!student) {
            mainApp.showError('Student not found. Please check your roll number.');
            return;
        }
        
        document.getElementById('timetable-result').innerHTML = this.renderTimetable(student);
    }
    
    renderTimetable(student = null) {
        if (!student && !auth.currentUser?.rollNumber) {
            return '<p>Please enter your roll number to view timetable</p>';
        }
        
        const currentStudent = student || db.getStudentByRollNumber(auth.currentUser.rollNumber);
        if (!currentStudent) return '<p>Student not found</p>';
        
        const midtermSchedules = db.getExamSchedules(currentStudent.branch, currentStudent.year, 'midterm');
        const semesterSchedules = db.getExamSchedules(currentStudent.branch, currentStudent.year, 'semester');
        
        if (midtermSchedules.length === 0 && semesterSchedules.length === 0) {
            return '<p>No schedule found for your branch/year</p>';
        }
        
        let timetableHTML = `
            <h4>Exam Schedule for ${currentStudent.rollNumber} (Year ${currentStudent.year} ${currentStudent.branch})</h4>
            
            <table class="timetable-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Timing</th>
                        <th>Exam Type</th>
                        <th>Room</th>
                        <th>Seat</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Combine both exam types into one table
        const allExams = [];
        
        midtermSchedules.forEach(schedule => {
            schedule.schedule
                .filter(exam => exam.year === currentStudent.year || exam.year === 'all')
                .forEach(exam => {
                    allExams.push({
                        ...exam,
                        type: 'Mid Term',
                        timing: exam.timing === 'timing1' ? schedule.timings.timing1 : schedule.timings.timing2
                    });
                });
        });
        
        semesterSchedules.forEach(schedule => {
            schedule.schedule
                .filter(exam => exam.year === currentStudent.year || exam.year === 'all')
                .forEach(exam => {
                    allExams.push({
                        ...exam,
                        type: 'Semester',
                        timing: exam.timing === 'timing1' ? schedule.timings.timing1 : schedule.timings.timing2
                    });
                });
        });
        
        // Sort exams by date
        allExams.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Add rows to table
        allExams.forEach(exam => {
            const roomAllocation = db.getRoomForStudent(currentStudent.rollNumber, exam.type.toLowerCase(), exam.date);
            
            timetableHTML += `
                <tr>
                    <td>${exam.date.toLocaleDateString()}</td>
                    <td>${exam.subject}</td>
                    <td>${exam.timing}</td>
                    <td>${exam.type}</td>
                    <td>${roomAllocation?.room || 'TBA'}</td>
                    <td>${roomAllocation ? `Row ${roomAllocation.row}, Col ${roomAllocation.col}` : 'TBA'}</td>
                </tr>
            `;
        });
        
        timetableHTML += `
                </tbody>
            </table>
        `;
        
        return timetableHTML;
    }
    
    showAllocatedRoom() {
        const content = `
            <h3>Your Allocated Exam Room</h3>
            <div class="room-search">
                <input type="text" id="search-room-roll" placeholder="Enter your roll number" 
                       value="${auth.currentUser?.rollNumber || ''}">
                <button onclick="student.searchRoom()">Search</button>
            </div>
            
            <div id="room-result" class="room-result">
                ${this.renderRoomAllocation()}
            </div>
        `;
        
        document.getElementById('student-content').innerHTML = content;
    }
    
    searchRoom() {
        const rollNumber = document.getElementById('search-room-roll').value.trim();
        
        if (!rollNumber) {
            mainApp.showError('Please enter your roll number');
            return;
        }
        
        document.getElementById('room-result').innerHTML = this.renderRoomAllocation(rollNumber);
    }
    
    renderRoomAllocation(rollNumber = null) {
        const currentRoll = rollNumber || auth.currentUser?.rollNumber;
        if (!currentRoll) return '<p>Please enter your roll number</p>';
        
        const student = db.getStudentByRollNumber(currentRoll);
        if (!student) return '<p>Student not found</p>';
        
        const midtermAllocation = db.getRoomForStudent(currentRoll, 'midterm');
        const semesterAllocation = db.getRoomForStudent(currentRoll, 'semester');
        
        if (!midtermAllocation && !semesterAllocation) {
            return `
                <div class="room-not-found">
                    <p>Room not yet allocated for ${currentRoll}</p>
                </div>
            `;
        }
        
        let allocationHTML = `
            <div class="room-allocation-details">
                <h4>Room Allocation Details</h4>
                <div class="student-info">
                    <p><strong>Roll Number:</strong> ${currentRoll}</p>
                    <p><strong>Name:</strong> ${student.name}</p>
                    <p><strong>Year:</strong> ${student.year}</p>
                    <p><strong>Branch:</strong> ${student.branch}</p>
                </div>
        `;
        
        if (midtermAllocation) {
            const roomStudents = db.roomAllocations.find(a => 
                a.room === midtermAllocation.room && 
                a.examType === 'midterm'
            )?.students || [];
            
            allocationHTML += `
                <div class="exam-info">
                    <h5>Mid Term Exams</h5>
                    <p><strong>Room Number:</strong> ${midtermAllocation.room}</p>
                    <p><strong>Seat Position:</strong> Row ${midtermAllocation.row}, Column ${midtermAllocation.col}</p>
                </div>
                
                <div class="room-layout-container">
                    <h5>Room Layout (${midtermAllocation.room}):</h5>
                    ${this.generateRoomLayout(roomStudents, currentRoll)}
                </div>
            `;
        }
        
        if (semesterAllocation) {
            const roomStudents = db.roomAllocations.find(a => 
                a.room === semesterAllocation.room && 
                a.examType === 'semester'
            )?.students || [];
            
            allocationHTML += `
                <div class="exam-info">
                    <h5>Semester Exams</h5>
                    <p><strong>Room Number:</strong> ${semesterAllocation.room}</p>
                    <p><strong>Seat Position:</strong> Row ${semesterAllocation.row}, Column ${semesterAllocation.col}</p>
                </div>
                
                <div class="room-layout-container">
                    <h5>Room Layout (${semesterAllocation.room}):</h5>
                    ${this.generateRoomLayout(roomStudents, currentRoll)}
                </div>
            `;
        }
        
        allocationHTML += `
                <div class="exam-instructions">
                    <h5>Exam Instructions:</h5>
                    <ul>
                        <li>Arrive at least 30 minutes before exam time</li>
                        <li>Bring your student ID and exam admission ticket</li>
                        <li>No electronic devices allowed</li>
                        <li>Follow all exam hall rules and regulations</li>
                    </ul>
                </div>
            </div>
        `;
        
        return allocationHTML;
    }
    
    generateRoomLayout(students, highlightRoll) {
        if (!students || students.length === 0) return '<p>Room layout not available</p>';
        
        let layoutHTML = `
            <div class="room-layout">
                <div class="room-front">▲ Front of Room</div>
                <div class="seating-grid">
        `;
        
        // Create 3 columns x 6 rows layout (9 benches with 2 students each)
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 3; col++) {
                const studentIndex = row * 3 + col;
                const student1 = students[studentIndex * 2];
                const student2 = students[studentIndex * 2 + 1];
                const isHighlighted1 = student1 === highlightRoll;
                const isHighlighted2 = student2 === highlightRoll;
                
                layoutHTML += `
                    <div class="seat ${student1 ? 'seat-occupied' : ''}">
                        <span class="${isHighlighted1 ? 'seat-highlight' : ''}">${student1 || ''}</span>
                        ${student2 ? `<br><span class="${isHighlighted2 ? 'seat-highlight' : ''}">${student2}</span>` : ''}
                    </div>
                `;
            }
        }
        
        layoutHTML += `
                </div>
            </div>
        `;
        
        return layoutHTML;
    }
}

const student = new Student();