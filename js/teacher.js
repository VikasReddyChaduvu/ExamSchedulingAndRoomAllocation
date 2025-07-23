class Teacher {
    constructor() {
        this.currentExamType = 'midterm';
        this.currentScheduleId = null;
    }
    
    showExamScheduling() {
        const content = `
            <h3>Live Exam Scheduling</h3>
            <div class="exam-controls">
                <button onclick="teacher.createNewSchedule()">Create New Schedule</button>
                <button onclick="teacher.deleteAllSchedules()" class="delete-btn">Delete All Schedules</button>
                <select id="existing-schedules" onchange="teacher.loadSchedule(this.value)">
                    <option value="">Select Existing Schedule</option>
                    ${db.examSchedules.map(s => `
                        <option value="${s.id}">Year${s.year} ${s.branch} ${s.type} (start date: ${Utils.formatDate(s.startDate)})</option>
                    `).join('')}
                </select>
            </div>
            
            <div id="schedule-editor">
                ${this.renderScheduleEditor()}
            </div>
        `;
        
        document.getElementById('teacher-content').innerHTML = content;
    }

    deleteAllSchedules() {
        mainApp.showConfirmation(
            'Are you sure you want to delete ALL schedules? This cannot be undone.',
            `teacher.confirmDeleteAllSchedules()`
        );
    }

    confirmDeleteAllSchedules() {
        db.examSchedules = [];
        db.saveToLocalStorage();
        this.showExamScheduling();
        mainApp.showSuccess('All schedules deleted successfully');
    }

    renderScheduleEditor(schedule = null) {
        const isNew = !schedule;
        this.currentScheduleId = schedule?.id || null;
        
        return `
            <div class="schedule-form">
                <div class="form-group">
                    <label>Exam Type:</label>
                    <div class="checkbox-group">
                        <label><input type="radio" name="exam-type" id="exam-type-midterm" value="midterm" ${(!schedule || schedule.type === 'midterm') ? 'checked' : ''}> Mid Term</label>
                        <label><input type="radio" name="exam-type" id="exam-type-semester" value="semester" ${schedule?.type === 'semester' ? 'checked' : ''}> Semester</label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Branch:</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" id="select-all-branches" onchange="teacher.toggleAllBranches()"> Select All</label><br>
                        ${['CSE', 'IT', 'CSD', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML'].map(b => `
                            <label><input type="checkbox" class="branch-checkbox" value="${b}" ${schedule?.branch?.includes(b) ? 'checked' : ''}> ${b}</label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Year:</label>
                    <div class="checkbox-group">
                        <label><input type="radio" name="exam-year" value="1" ${schedule?.year === '1' ? 'checked' : ''}> 1st Year</label>
                        <label><input type="radio" name="exam-year" value="2" ${schedule?.year === '2' ? 'checked' : ''}> 2nd Year</label>
                        <label><input type="radio" name="exam-year" value="3" ${schedule?.year === '3' ? 'checked' : ''}> 3rd Year</label>
                        <label><input type="radio" name="exam-year" value="4" ${schedule?.year === '4' ? 'checked' : ''}> 4th Year</label>
                        <label><input type="radio" name="exam-year" value="all" ${!schedule || schedule.year === 'all' ? 'checked' : ''}> All Years</label>
                    </div>
                </div>
                
                <div class="timing-controls">
                    <div class="timing-control">
                        <label><input type="checkbox" id="use-timing1" checked> Timing 1:</label>
                        <input type="text" id="timing1" value="${schedule?.timings?.timing1 || 
                            (schedule?.type === 'midterm' ? '10:30 - 12:00' : '09:30 - 12:30')}">
                    </div>
                    <div class="timing-control">
                        <label><input type="checkbox" id="use-timing2" checked> Timing 2:</label>
                        <input type="text" id="timing2" value="${schedule?.timings?.timing2 || 
                            (schedule?.type === 'midterm' ? '02:30 - 04:00' : '02:00 - 05:00')}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Start Date:</label>
                    <input type="date" id="start-date" value="${schedule ? Utils.formatDate(schedule.startDate) : ''}">
                </div>
                
                <div class="schedule-actions">
                    <button onclick="teacher.generateSchedule('${schedule?.id || ''}')">
                        ${isNew ? 'Generate Schedule' : 'Update Schedule'}
                    </button>
                    ${!isNew ? `
                        <button class="delete-btn" onclick="teacher.deleteSchedule('${schedule.id}')">
                            Delete Schedule
                        </button>
                    ` : ''}
                </div>
                
                ${schedule ? this.renderScheduleCalendar(schedule) : ''}
            </div>
        `;
    }

    toggleAllBranches() {
        const selectAll = document.getElementById('select-all-branches').checked;
        const branchCheckboxes = document.querySelectorAll('.branch-checkbox');
        branchCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
        });
    }

    renderScheduleCalendar(schedule) {
        return `
            <div class="schedule-calendar">
                <h4>Generated Schedule</h4>
                <div class="calendar" id="exam-calendar"></div>
            </div>
            <script>
                teacher.generateCalendar(${JSON.stringify(schedule)});
            </script>
        `;
    }

    createNewSchedule() {
        document.getElementById('schedule-editor').innerHTML = this.renderScheduleEditor();
    }

    loadSchedule(scheduleId) {
        if (!scheduleId) return;
        
        const schedule = db.examSchedules.find(s => s.id === scheduleId);
        if (schedule) {
            document.getElementById('schedule-editor').innerHTML = this.renderScheduleEditor(schedule);
        }
    }

    generateSchedule(scheduleId = null) {
        const examType = document.querySelector('input[name="exam-type"]:checked')?.value;
        const branches = Array.from(document.querySelectorAll('.branch-checkbox:checked')).map(opt => opt.value).join(',');
        const year = document.querySelector('input[name="exam-year"]:checked')?.value;
        const useTiming1 = document.getElementById('use-timing1').checked;
        const useTiming2 = document.getElementById('use-timing2').checked;
        const timing1 = useTiming1 ? document.getElementById('timing1').value : '';
        const timing2 = useTiming2 ? document.getElementById('timing2').value : '';
        const startDate = document.getElementById('start-date').valueAsDate;
        
        if (!examType) {
            mainApp.showError('Please select an exam type');
            return;
        }
        
        if (!branches) {
            mainApp.showError('Please select at least one branch');
            return;
        }
        
        if (!startDate) {
            mainApp.showError('Please select a valid start date');
            return;
        }
        
        if (!useTiming1 && !useTiming2) {
            mainApp.showError('Please select at least one timing');
            return;
        }
        
        const scheduleData = {
            type: examType,
            branch: branches,
            startDate,
            timings: { timing1, timing2 },
            year: year,
            subjects: JSON.parse(JSON.stringify(db.branchSubjects[branches.split(',')[0]]))
        };
        
        if (scheduleId) {
            const success = db.updateExamSchedule(scheduleId, scheduleData);
            if (success) {
                const updatedSchedule = db.examSchedules.find(s => s.id === scheduleId);
                document.getElementById('schedule-editor').innerHTML = 
                    this.renderScheduleEditor(updatedSchedule);
                mainApp.showSuccess('Schedule updated successfully');
            }
        } else {
            const newSchedule = db.createExamSchedule({
                ...scheduleData,
                schedule: db.generateExamDates(startDate, branches, examType, useTiming1, useTiming2)
            });
            document.getElementById('schedule-editor').innerHTML = 
                this.renderScheduleEditor(newSchedule);
            mainApp.showSuccess('Schedule created successfully');
            
            const select = document.getElementById('existing-schedules');
            const option = document.createElement('option');
            option.value = newSchedule.id;
            option.textContent = `Year${newSchedule.year} ${newSchedule.branch} ${newSchedule.type} (start date: ${Utils.formatDate(newSchedule.startDate)})`;
            select.appendChild(option);
        }
    }

    deleteSchedule(scheduleId) {
        mainApp.showConfirmation(
            'Are you sure you want to delete this schedule?',
            `teacher.confirmDeleteSchedule('${scheduleId}')`
        );
    }

    confirmDeleteSchedule(scheduleId) {
        db.deleteExamSchedule(scheduleId);
        document.getElementById('existing-schedules').querySelector(`option[value="${scheduleId}"]`).remove();
        document.getElementById('schedule-editor').innerHTML = this.renderScheduleEditor();
        mainApp.showSuccess('Schedule deleted successfully');
    }

    generateCalendar(schedule) {
        const calendarDiv = document.getElementById('exam-calendar');
        calendarDiv.innerHTML = '';
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'calendar-header';
        
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            headerDiv.appendChild(dayHeader);
        });
        
        calendarDiv.appendChild(headerDiv);
        
        const uniqueDates = [...new Set(schedule.schedule.map(exam => Utils.formatDate(exam.date)))];
        
        let currentDate = new Date(schedule.startDate);
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + 30);
        
        while (currentDate <= endDate) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            
            const dateDiv = document.createElement('div');
            dateDiv.className = 'calendar-date';
            dateDiv.textContent = currentDate.toLocaleDateString();
            dayDiv.appendChild(dateDiv);
            
            schedule.schedule
                .filter(exam => Utils.formatDate(exam.date) === Utils.formatDate(currentDate))
                .forEach(exam => {
                    const examDiv = document.createElement('div');
                    examDiv.className = 'exam-subject';
                    examDiv.innerHTML = `
                        <div class="subject-edit">
                            <span>${exam.subject} (Y${exam.year})</span>
                            <button class="edit-subject-btn" 
                                    onclick="teacher.editExamSubject('${schedule.id}', '${Utils.formatDate(exam.date)}', '${exam.subject}')">
                                Edit
                            </button>
                        </div>
                        <div class="exam-timing">
                            ${exam.timing === 'timing1' ? schedule.timings.timing1 : schedule.timings.timing2}
                        </div>
                    `;
                    dayDiv.appendChild(examDiv);
                });
            
            calendarDiv.appendChild(dayDiv);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    editExamSubject(scheduleId, dateStr, subject) {
        const schedule = db.examSchedules.find(s => s.id === scheduleId);
        if (!schedule) return;
        
        const date = new Date(dateStr);
        const exam = schedule.schedule.find(e => 
            Utils.formatDate(e.date) === Utils.formatDate(date) && 
            e.subject === subject
        );
        
        if (!exam) return;
        
        const modalContent = `
            <p>Editing <strong>${subject}</strong> on ${Utils.formatDate(date)}</p>
            <div class="form-group">
                <label>Timing:</label>
                <select id="edit-exam-timing">
                    ${schedule.timings.timing1 ? `<option value="timing1" ${exam.timing === 'timing1' ? 'selected' : ''}>
                        ${schedule.timings.timing1}
                    </option>` : ''}
                    ${schedule.timings.timing2 ? `<option value="timing2" ${exam.timing === 'timing2' ? 'selected' : ''}>
                        ${schedule.timings.timing2}
                    </option>` : ''}
                </select>
            </div>
            <div class="form-group">
                <label>Reschedule Date:</label>
                <input type="date" id="edit-exam-date" value="${Utils.formatDate(date)}">
            </div>
        `;
        
        mainApp.showModal(
            `Edit Exam - ${subject}`,
            modalContent,
            [
                {
                    text: 'Save Changes',
                    primary: true,
                    onClick: `teacher.saveExamChanges('${scheduleId}', '${dateStr}', '${subject}')`
                }
            ]
        );
    }

    saveExamChanges(scheduleId, oldDateStr, subject) {
        const schedule = db.examSchedules.find(s => s.id === scheduleId);
        if (!schedule) return;
        
        const oldDate = new Date(oldDateStr);
        const newDate = document.getElementById('edit-exam-date').valueAsDate;
        const newTiming = document.getElementById('edit-exam-timing').value;
        
        const examIndex = schedule.schedule.findIndex(e => 
            Utils.formatDate(e.date) === Utils.formatDate(oldDate) && 
            e.subject === subject
        );
        
        if (examIndex !== -1) {
            schedule.schedule[examIndex] = {
                ...schedule.schedule[examIndex],
                date: newDate,
                timing: newTiming
            };
            
            db.saveToLocalStorage();
            document.getElementById('exam-calendar').innerHTML = '';
            this.generateCalendar(schedule);
            mainApp.showSuccess('Exam updated successfully');
            mainApp.closeModal(`modal-${Date.now()}`);
        }
    }

    showRoomAllocation() {
        const content = `
            <h3>Room Allocation</h3>
            <div class="room-allocation-container">
                <div class="selection-controls">
                    <div>
                        <label><input type="checkbox" id="select-all" onclick="teacher.toggleSelectAll()"> SELECT ALL</label>
                    </div>
                    
                    <div style="display: flex; gap: 2rem; margin-top: 1rem;">
                        <div>
                            <h5>By Year:</h5>
                            <div class="checkbox-group">
                                <label><input type="checkbox" id="select-all-years" onchange="teacher.toggleAllYears()"> Select All</label><br>
                                <label><input type="checkbox" name="year" value="1" onchange="teacher.updateStudentSelection()"> 1st Year</label><br>
                                <label><input type="checkbox" name="year" value="2" onchange="teacher.updateStudentSelection()"> 2nd Year</label><br>
                                <label><input type="checkbox" name="year" value="3" onchange="teacher.updateStudentSelection()"> 3rd Year</label><br>
                                <label><input type="checkbox" name="year" value="4" onchange="teacher.updateStudentSelection()"> 4th Year</label>
                            </div>
                        </div>
                        
                        <div>
                            <h5>By Branch:</h5>
                            <div class="checkbox-group">
                                <label><input type="checkbox" id="select-all-branches" onchange="teacher.toggleAllBranches()"> Select All</label><br>
                                <label><input type="checkbox" name="branch" value="CSE" onchange="teacher.updateStudentSelection()"> CSE</label><br>
                                <label><input type="checkbox" name="branch" value="IT" onchange="teacher.updateStudentSelection()"> IT</label><br>
                                <label><input type="checkbox" name="branch" value="CSD" onchange="teacher.updateStudentSelection()"> CSD</label><br>
                                <label><input type="checkbox" name="branch" value="ECE" onchange="teacher.updateStudentSelection()"> ECE</label><br>
                                <label><input type="checkbox" name="branch" value="EEE" onchange="teacher.updateStudentSelection()"> EEE</label><br>
                                <label><input type="checkbox" name="branch" value="MECH" onchange="teacher.updateStudentSelection()"> MECH</label><br>
                                <label><input type="checkbox" name="branch" value="CIVIL" onchange="teacher.updateStudentSelection()"> CIVIL</label>
                                <label><input type="checkbox" name="branch" value="AIML" onchange="teacher.updateStudentSelection()"> AIML</label>
                            </div>
                        </div>
                    </div>
                    
                    <div id="student-selection-summary" class="selection-summary"></div>
                    
                    <div id="student-list" class="student-list">
                        ${this.generateStudentList()}
                    </div>
                    
                    <div class="room-selection" style="margin-top: 1rem;">
                        <h5>Select Rooms:</h5>
                        <div class="checkbox-group">
                            <label><input type="checkbox" id="select-all-rooms" onchange="teacher.toggleAllRooms()"> Select All</label><br>
                            ${['LH01', 'LH02', 'LH03', 'LH04', 'LH05', 'LH06', 'LH07', 'LH08', 'LH09', 'LH10', 
                               'LH11', 'LH12', 'LH13', 'LH14', 'LH15', 'LH101', 'LH102', 'LH103', 'LH104', 'LH105', 
                               'LH106', 'LH107', 'LH108', 'LH109', 'LH110', 'LH111', 'LH112', 'LH113', 'LH114', 'LH115']
                               .map(room => `<label><input type="checkbox" class="room-checkbox" value="${room}"> ${room}</label>`).join('')}
                        </div>
                        <p id="rooms-required-message">Minimum 1 room must be selected</p>
                    </div>
                    
                    <button onclick="teacher.allocateRooms()" style="margin-top: 1rem;">Allocate Rooms</button>
                </div>
                
                <div id="room-allocation-result" class="room-allocation-result"></div>
            </div>
        `;
        
        document.getElementById('teacher-content').innerHTML = content;
        this.updateSelectionSummary();
    }

    toggleAllRooms() {
        const selectAll = document.getElementById('select-all-rooms').checked;
        const roomCheckboxes = document.querySelectorAll('.room-checkbox');
        roomCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
        });
    }

    toggleAllYears() {
        const selectAll = document.getElementById('select-all-years').checked;
        const yearCheckboxes = document.querySelectorAll('input[name="year"]');
        
        yearCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
        });
        
        this.updateStudentSelection();
    }

    toggleAllBranches() {
        const selectAll = document.getElementById('select-all-branches').checked;
        const branchCheckboxes = document.querySelectorAll('input[name="branch"]');
        
        branchCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
        });
        
        this.updateStudentSelection();
    }

    updateSelectionSummary() {
        const selectedStudents = Array.from(document.querySelectorAll('.student-checkbox:checked')).length;
        const totalStudents = db.students.length;
        const roomsRequired = Math.ceil(selectedStudents / 18);
        
        document.getElementById('student-selection-summary').innerHTML = `
            <div class="summary-item">
                <strong>Selected Students:</strong> ${selectedStudents} of ${totalStudents}
            </div>
            <div class="summary-item">
                <strong>Minimum Rooms Required:</strong> ${roomsRequired} (18 students per room)
            </div>
        `;
        
        document.getElementById('rooms-required-message').textContent = 
            `Select at least ${roomsRequired} room${roomsRequired !== 1 ? 's' : ''} (${selectedStudents} students selected)`;
    }

    generateStudentList() {
        const groupedStudents = {};
        
        db.students.forEach(student => {
            const key = `Y${student.year}-${student.branch}`;
            if (!groupedStudents[key]) {
                groupedStudents[key] = [];
            }
            groupedStudents[key].push(student);
        });
        
        let studentListHTML = '<h5>Select Students:</h5>';
        studentListHTML += '<div class="student-list-container">';
        
        const sortedGroups = Object.keys(groupedStudents).sort();
        
        sortedGroups.forEach(group => {
            const [_, year, branch] = group.match(/Y(\d+)-(.*)/);
            studentListHTML += `<div class="student-group"><h6>Year ${year} ${branch}</h6>`;
            
            groupedStudents[group].forEach(student => {
                studentListHTML += `
                    <div>
                        <label>
                            <input type="checkbox" class="student-checkbox" 
                                   value="${student.rollNumber}" 
                                   data-year="${student.year}" 
                                   data-branch="${student.branch}"
                                   onchange="teacher.updateSelectionSummary()">
                            ${student.rollNumber} - ${student.name}
                        </label>
                    </div>
                `;
            });
            
            studentListHTML += '</div>';
        });
        
        studentListHTML += '</div>';
        return studentListHTML;
    }

    toggleSelectAll() {
        const selectAll = document.getElementById('select-all').checked;
        const checkboxes = document.querySelectorAll('.student-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
        });
        
        this.updateSelectionSummary();
    }

    updateStudentSelection() {
        const selectedYears = Array.from(document.querySelectorAll('input[name="year"]:checked')).map(y => y.value);
        const selectedBranches = Array.from(document.querySelectorAll('input[name="branch"]:checked')).map(b => b.value);
        
        const checkboxes = document.querySelectorAll('.student-checkbox');
        
        checkboxes.forEach(checkbox => {
            const year = checkbox.dataset.year;
            const branch = checkbox.dataset.branch;
            
            if ((selectedYears.length === 0 || selectedYears.includes(year)) && 
                (selectedBranches.length === 0 || selectedBranches.includes(branch))) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        });
        
        this.updateSelectionSummary();
    }

    allocateRooms() {
        const selectedStudents = Array.from(document.querySelectorAll('.student-checkbox:checked')).map(s => s.value);
        const selectedRooms = Array.from(document.querySelectorAll('.room-checkbox:checked')).map(o => o.value);
        
        if (selectedStudents.length === 0) {
            mainApp.showError('Please select at least one student');
            return;
        }
        
        if (selectedRooms.length === 0) {
            mainApp.showError('Please select at least one room');
            return;
        }
        
        const roomsRequired = Math.ceil(selectedStudents.length / 18);
        if (selectedRooms.length < roomsRequired) {
            mainApp.showError(`You need to select at least ${roomsRequired} rooms for ${selectedStudents.length} students`);
            return;
        }
        
        // Group students by branch and year
        const groupedStudents = {};
        selectedStudents.forEach(roll => {
            const student = db.getStudentByRollNumber(roll);
            if (student) {
                const key = `Y${student.year}-${student.branch}`;
                if (!groupedStudents[key]) {
                    groupedStudents[key] = [];
                }
                groupedStudents[key].push(roll);
            }
        });
        
        // Sort branches based on complementary pairing
        const branchOrder = ['CSE', 'ECE', 'IT', 'AIML', 'CSD', 'MECH', 'CIVIL', 'EEE'];
        const sortedGroups = Object.keys(groupedStudents).sort((a, b) => {
            const branchA = a.split('-')[1];
            const branchB = b.split('-')[1];
            return branchOrder.indexOf(branchA) - branchOrder.indexOf(branchB);
        });
        
        let allocationHTML = '<h4>Room Allocation Result</h4>';
        let roomIndex = 0;
        let currentRoomStudents = [];
        let currentBench = 0;
        
        // Allocate students to rooms
        for (const group of sortedGroups) {
            const [_, year, branch] = group.match(/Y(\d+)-(.*)/);
            const students = groupedStudents[group];
            
            allocationHTML += `<h5>Year ${year} ${branch} Students</h5>`;
            
            // Find complementary branch
            let complementaryBranch = '';
            if (branch === 'CSE') complementaryBranch = 'ECE';
            else if (branch === 'IT') complementaryBranch = 'AIML';
            else if (branch === 'AIML') complementaryBranch = 'CSD';
            else if (branch === 'MECH') complementaryBranch = 'CIVIL';
            
            const complementaryGroup = `Y${year}-${complementaryBranch}`;
            const complementaryStudents = groupedStudents[complementaryGroup] || [];
            
            // Allocate students to benches
            for (let i = 0; i < students.length; i++) {
                currentRoomStudents.push(students[i]);
                
                // Add complementary student if available
                if (complementaryStudents.length > i) {
                    currentRoomStudents.push(complementaryStudents[i]);
                }
                
                currentBench++;
                
                // When we have 18 students or reached end of students
                if (currentRoomStudents.length >= 18 || 
                    (i === students.length - 1 && currentRoomStudents.length > 0)) {
                    
                    if (roomIndex >= selectedRooms.length) {
                        allocationHTML += '<p class="error">Not enough rooms available!</p>';
                        break;
                    }
                    
                    allocationHTML += this.generateRoomLayout(selectedRooms[roomIndex], currentRoomStudents, year, branch);
                    
                    // Save allocation to database
                    db.roomAllocations.push({
                        room: selectedRooms[roomIndex],
                        students: [...currentRoomStudents],
                        branch,
                        year: parseInt(year),
                        date: new Date()
                    });
                    
                    roomIndex++;
                    currentRoomStudents = [];
                    currentBench = 0;
                }
            }
        }
        
        db.saveToLocalStorage();
        document.getElementById('room-allocation-result').innerHTML = allocationHTML;
        mainApp.showSuccess('Rooms allocated successfully');
    }

    generateRoomLayout(roomName, students, year, branch) {
        let layoutHTML = `
            <div class="room">
                <div class="room-header">
                    <h6>Room: ${roomName}</h6>
                    <div>Year ${year} ${branch} Exams</div>
                </div>
                <div class="room-layout">
                    <div class="room-front">Front of Room</div>
                    <div class="seating-grid">
        `;
        
        // Create 6 rows x 3 columns layout (18 seats)
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 3; col++) {
                const studentIndex = row * 3 + col;
                const student1 = students[studentIndex * 2];
                const student2 = students[studentIndex * 2 + 1];
                
                layoutHTML += `
                    <div class="seat ${student1 ? 'seat-occupied' : ''}">
                        ${student1 || ''}${student2 ? '<br>' + student2 : ''}
                    </div>
                `;
            }
        }
        
        layoutHTML += `
                    </div>
                </div>
            </div>
        `;
        
        return layoutHTML;
    }

    showRequests() {
        const pendingRequests = db.teacherRequests.filter(req => !req.approved);
        
        const content = `
            <h3>Teacher Requests</h3>
            <div class="requests-container">
                ${pendingRequests.length === 0 ? 
                    '<p>No pending requests</p>' : 
                    this.generateRequestsList(pendingRequests)}
            </div>
        `;
        
        document.getElementById('teacher-content').innerHTML = content;
    }

    generateRequestsList(requests) {
        return `
            <table class="requests-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Requested By</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(request => `
                        <tr>
                            <td>${request.teacherData.name}</td>
                            <td>${request.teacherData.username}</td>
                            <td>${request.teacherData.email}</td>
                            <td>${request.requestedBy}</td>
                            <td>
                                <button onclick="teacher.approveRequest('${request.id}')">Approve</button>
                                <button onclick="teacher.rejectRequest('${request.id}')">Reject</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    approveRequest(requestId) {
        const newTeacher = db.approveTeacherRequest(requestId);
        if (newTeacher) {
            this.showRequests();
            mainApp.showSuccess(`Teacher ${newTeacher.username} approved successfully`);
        }
    }

    rejectRequest(requestId) {
        db.rejectTeacherRequest(requestId);
        this.showRequests();
        mainApp.showSuccess('Request rejected');
    }

    showTeacherManagement() {
        if (!auth.currentUser.isAdmin) {
            mainApp.showError('Only admin teachers can access this feature');
            return;
        }
        
        const content = `
            <h3>Teacher Management</h3>
            <div class="teacher-management">
                <h4>Existing Teachers</h4>
                ${this.generateTeacherList()}
            </div>
        `;
        
        document.getElementById('teacher-content').innerHTML = content;
    }

    generateTeacherList() {
        return `
            <table class="teacher-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Admin</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${db.teachers.map(teacher => `
                        <tr>
                            <td>${teacher.username}</td>
                            <td>${teacher.name}</td>
                            <td>${teacher.email}</td>
                            <td>${teacher.isAdmin ? 'Yes' : 'No'}</td>
                            <td>${teacher.approved ? 'Approved' : 'Pending'}</td>
                            <td>
                                ${!teacher.isAdmin ? `
                                    <button onclick="teacher.toggleAdmin('${teacher.id}', ${!teacher.isAdmin})">
                                        ${teacher.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                    </button>
                                    <button class="delete-btn" onclick="teacher.deleteTeacher('${teacher.id}')">
                                        Delete
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    toggleAdmin(teacherId, makeAdmin) {
        const teacher = db.teachers.find(t => t.id === teacherId);
        if (teacher) {
            teacher.isAdmin = makeAdmin;
            db.saveToLocalStorage();
            this.showTeacherManagement();
            mainApp.showSuccess(`Admin status updated for ${teacher.username}`);
        }
    }

    deleteTeacher(teacherId) {
        if (teacherId === auth.currentUser.id) {
            mainApp.showError('You cannot delete your own account');
            return;
        }
        
        mainApp.showConfirmation(
            'Are you sure you want to delete this teacher?',
            `teacher.confirmDeleteTeacher('${teacherId}')`
        );
    }

    confirmDeleteTeacher(teacherId) {
        db.teachers = db.teachers.filter(t => t.id !== teacherId);
        db.saveToLocalStorage();
        this.showTeacherManagement();
        mainApp.showSuccess('Teacher deleted successfully');
    }
}

const teacher = new Teacher();