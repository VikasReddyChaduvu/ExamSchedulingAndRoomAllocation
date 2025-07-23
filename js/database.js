class Database {
    constructor() {
        this.teachers = [
            {
                id: 1,
                username: "Teacher1",
                password: "password123",
                name: "Admin Teacher",
                email: "teacher1@institution.edu",
                isAdmin: true,
                approved: true
            }
        ];
        
        this.students = this.generateAllStudents();
        this.examSchedules = [];
        this.roomAllocations = [];
        this.teacherRequests = [];
        this.branchSubjects = this.initializeBranchSubjects();
        
        this.loadFromLocalStorage();
        
        if (this.examSchedules.length === 0) {
            this.initializeSampleData();
        }
    }

    initializeBranchSubjects() {
        return {
            CSE: {
                1: { semester1: ['PHY', 'M1', 'BEE', 'EG', 'EM'], semester2: ['CHM', 'M2', 'PPS', 'WS', 'ENG'] },
                2: { semester1: ['ES', 'M3', 'AE', 'DS', 'CAO'], semester2: ['COI', 'DE', 'MFCS', 'DAA', 'OS'] },
                3: { semester1: ['DBMS', 'TOC', 'ADJAVA', 'PSS', 'MEA'], semester2: ['CD', 'CN', 'SE', 'AI', 'MPI'] },
                4: { semester1: ['PY3', 'OOAD', 'ML', 'CNS'], semester2: ['DS', 'IP', 'IOT'] }
            },
            IT: {
                1: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                2: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                3: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                4: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] }
            },
            CSD: {
                1: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                2: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                3: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                4: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] }
            },
            ECE: {
                1: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                2: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                3: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                4: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] }
            },
            EEE: {
                1: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                2: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                3: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                4: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] }
            },
            MECH: {
                1: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                2: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                3: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                4: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] }
            },
            CIVIL: {
                1: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                2: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                3: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                4: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] }
            },
            AIML: {
                1: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                2: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                3: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] },
                4: { semester1: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'], semester2: ['Sub1', 'Sub2', 'Sub3', 'Sub4', 'Sub5'] }
            }
        };
    }

    generateAllStudents() {
        const students = [];
        const branches = [
            { code: '567T09', name: 'CSE' },
            { code: '567T18', name: 'IT' },
            { code: '567T10', name: 'CSD' },
            { code: '567T11', name: 'ECE' },
            { code: '567T12', name: 'EEE' },
            { code: '567T13', name: 'MECH' },
            { code: '567T14', name: 'CIVIL' },
            { code: '567T15', name: 'AIML' }
        ];
        
        branches.forEach(branch => {
            // 1st Year (24 prefix)
            for (let i = 1; i <= 65; i++) {
                students.push(this.createStudent(`24${branch.code}${i < 10 ? '0' + i : i}`, branch.name, 1));
            }
            for (let i = 66; i <= 71; i++) {
                students.push(this.createStudent(`24${branch.code.substring(0,4)}${i}L`, branch.name, 1));
            }
            
            // 2nd Year (23 prefix)
            for (let i = 1; i <= 65; i++) {
                students.push(this.createStudent(`23${branch.code}${i < 10 ? '0' + i : i}`, branch.name, 2));
            }
            for (let i = 66; i <= 71; i++) {
                students.push(this.createStudent(`23${branch.code.substring(0,4)}${i}L`, branch.name, 2));
            }
            
            // 3rd Year (22 prefix)
            for (let i = 1; i <= 65; i++) {
                students.push(this.createStudent(`22${branch.code}${i < 10 ? '0' + i : i}`, branch.name, 3));
            }
            for (let i = 66; i <= 71; i++) {
                students.push(this.createStudent(`22${branch.code.substring(0,4)}${i}L`, branch.name, 3));
            }
            
            // 4th Year (21 prefix)
            for (let i = 1; i <= 65; i++) {
                students.push(this.createStudent(`21${branch.code}${i < 10 ? '0' + i : i}`, branch.name, 4));
            }
            for (let i = 66; i <= 71; i++) {
                students.push(this.createStudent(`21${branch.code.substring(0,4)}${i}L`, branch.name, 4));
            }
        });
        
        return students;
    }

    createStudent(rollNumber, branch, year) {
        return {
            rollNumber,
            name: `Student ${rollNumber.substring(6)}`,
            branch,
            year,
            email: `${rollNumber.toLowerCase()}@institution.edu`
        };
    }

    initializeSampleData() {
        const branches = ['CSE', 'IT', 'CSD', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML'];
        const currentDate = new Date();
        
        branches.forEach(branch => {
            // Mid-term schedule
            const midTermStart = new Date(currentDate);
            midTermStart.setDate(midTermStart.getDate() + 7);
            
            this.examSchedules.push({
                id: Utils.generateId(),
                type: 'midterm',
                branch,
                year: 'all',
                startDate: new Date(midTermStart),
                timings: Utils.getDefaultTimings('midterm'),
                subjects: JSON.parse(JSON.stringify(this.branchSubjects[branch])),
                schedule: this.generateExamDates(midTermStart, branch, 'midterm', true, true)
            });
            
            // Semester schedule
            const semesterStart = new Date(currentDate);
            semesterStart.setDate(semesterStart.getDate() + 30);
            
            this.examSchedules.push({
                id: Utils.generateId(),
                type: 'semester',
                branch,
                year: 'all',
                startDate: new Date(semesterStart),
                timings: Utils.getDefaultTimings('semester'),
                subjects: JSON.parse(JSON.stringify(this.branchSubjects[branch])),
                schedule: this.generateExamDates(semesterStart, branch, 'semester', true, true)
            });
        });
        
        this.saveToLocalStorage();
    }

    generateExamDates(startDate, branch, examType, useTiming1 = true, useTiming2 = true) {
        const schedule = [];
        let currentDate = new Date(startDate);
        const subjects = this.branchSubjects[branch];
        let subjectIndex = 0;
        let timing = 'timing1';
        
        // Flatten all subjects for this branch
        const allSubjects = [];
        for (let year = 1; year <= 4; year++) {
            if (subjects[year]) {
                allSubjects.push(...subjects[year].semester1, ...subjects[year].semester2);
            }
        }
        
        while (subjectIndex < allSubjects.length) {
            // Skip Sundays
            while (currentDate.getDay() === 0) {
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            // Only add if the timing is enabled
            if ((timing === 'timing1' && useTiming1) || (timing === 'timing2' && useTiming2)) {
                schedule.push({
                    date: new Date(currentDate),
                    subject: allSubjects[subjectIndex],
                    timing,
                    branch,
                    year: this.getYearForSubject(subjects, allSubjects[subjectIndex])
                });
                subjectIndex++;
            }
            
            // Alternate timing if both are enabled
            if (useTiming1 && useTiming2) {
                timing = timing === 'timing1' ? 'timing2' : 'timing1';
            }
            
            // Move to next date based on exam type
            currentDate.setDate(currentDate.getDate() + (examType === 'midterm' ? 1 : 2));
        }
        
        return schedule;
    }

    getYearForSubject(subjects, subjectName) {
        for (let year = 1; year <= 4; year++) {
            if (subjects[year]) {
                if (subjects[year].semester1.includes(subjectName)) return year;
                if (subjects[year].semester2.includes(subjectName)) return year;
            }
        }
        return 1;
    }

    getTeacherByUsername(username) {
        return this.teachers.find(t => t.username === username);
    }

    getStudentByRollNumber(rollNumber) {
        return this.students.find(s => s.rollNumber === rollNumber);
    }

    getExamSchedules(branch, year, type) {
        return this.examSchedules.filter(schedule => 
            (branch ? schedule.branch === branch : true) &&
            (year ? schedule.year === year || schedule.year === 'all' : true) &&
            (type ? schedule.type === type : true)
        );
    }

    getRoomForStudent(rollNumber, examType, date) {
        const allocation = this.roomAllocations.find(a => 
            a.students.includes(rollNumber) && 
            a.examType === examType &&
            (!date || Utils.formatDate(a.date) === Utils.formatDate(date))
        );
        
        if (allocation) {
            const studentIndex = allocation.students.indexOf(rollNumber);
            const row = Math.floor(studentIndex / 3) + 1;
            const col = (studentIndex % 3) + 1;
            
            return {
                room: allocation.room,
                row,
                col,
                branch: allocation.branch,
                year: allocation.year
            };
        }
        return null;
    }

    addTeacher(teacher) {
        teacher.id = Utils.generateId();
        this.teachers.push(teacher);
        this.saveToLocalStorage();
        return teacher;
    }

    addTeacherRequest(request) {
        request.id = Utils.generateId();
        request.approved = false;
        this.teacherRequests.push(request);
        this.saveToLocalStorage();
    }

    approveTeacherRequest(requestId) {
        const request = this.teacherRequests.find(r => r.id === requestId);
        if (request) {
            const newTeacher = {
                ...request.teacherData,
                id: Utils.generateId(),
                approved: true
            };
            this.teachers.push(newTeacher);
            this.teacherRequests = this.teacherRequests.filter(r => r.id !== requestId);
            this.saveToLocalStorage();
            return newTeacher;
        }
        return null;
    }

    rejectTeacherRequest(requestId) {
        this.teacherRequests = this.teacherRequests.filter(r => r.id !== requestId);
        this.saveToLocalStorage();
    }

    createExamSchedule(schedule) {
        schedule.id = Utils.generateId();
        this.examSchedules.push(schedule);
        this.saveToLocalStorage();
        return schedule;
    }

    deleteExamSchedule(scheduleId) {
        this.examSchedules = this.examSchedules.filter(s => s.id !== scheduleId);
        this.saveToLocalStorage();
    }

    updateExamSchedule(scheduleId, updates) {
        const index = this.examSchedules.findIndex(s => s.id === scheduleId);
        if (index !== -1) {
            this.examSchedules[index] = { ...this.examSchedules[index], ...updates };
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    saveToLocalStorage() {
        localStorage.setItem('examSystem_teachers', JSON.stringify(this.teachers));
        localStorage.setItem('examSystem_students', JSON.stringify(this.students));
        localStorage.setItem('examSystem_examSchedules', JSON.stringify(this.examSchedules));
        localStorage.setItem('examSystem_roomAllocations', JSON.stringify(this.roomAllocations));
        localStorage.setItem('examSystem_teacherRequests', JSON.stringify(this.teacherRequests));
        localStorage.setItem('examSystem_branchSubjects', JSON.stringify(this.branchSubjects));
    }

    loadFromLocalStorage() {
        const teachers = localStorage.getItem('examSystem_teachers');
        const students = localStorage.getItem('examSystem_students');
        const examSchedules = localStorage.getItem('examSystem_examSchedules');
        const roomAllocations = localStorage.getItem('examSystem_roomAllocations');
        const teacherRequests = localStorage.getItem('examSystem_teacherRequests');
        const branchSubjects = localStorage.getItem('examSystem_branchSubjects');
        
        if (teachers) this.teachers = JSON.parse(teachers);
        if (students) this.students = JSON.parse(students);
        if (examSchedules) this.examSchedules = JSON.parse(examSchedules);
        if (roomAllocations) this.roomAllocations = JSON.parse(roomAllocations);
        if (teacherRequests) this.teacherRequests = JSON.parse(teacherRequests);
        if (branchSubjects) this.branchSubjects = JSON.parse(branchSubjects);
    }
}

const db = new Database();