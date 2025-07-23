class Utils {
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static formatDate(date) {
        if (!date) return '';
        if (typeof date === 'string') date = new Date(date);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static parseDate(dateStr) {
        return new Date(dateStr);
    }

    static getCurrentAcademicYear() {
        const now = new Date();
        return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    }

    static validateRollNumber(rollNumber) {
        const pattern = /^(2[1-5])([A-Za-z0-9]{4})(T|L)(\d{2}[A-Za-z]?)$/;
        return pattern.test(rollNumber);
    }

    static getDefaultTimings(examType) {
        return examType === 'midterm' 
            ? { timing1: '10:30 - 12:00', timing2: '02:30 - 04:00' }
            : { timing1: '09:30 - 12:30', timing2: '02:00 - 05:00' };
    }
}