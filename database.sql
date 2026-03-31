-- MCGI DRRT Attendance System - SQL Database Structure
-- This file creates the database tables for importing data

-- ==================== ADMIN TABLE ====================
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================== MEMBERS TABLE ====================
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    church_id TEXT UNIQUE NOT NULL,
    local TEXT NOT NULL,
    age INTEGER,
    date_of_birth DATE,
    date_of_baptism DATE,
    skills TEXT,
    vehicle TEXT,
    phone TEXT,
    photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================== GATHERINGS TABLE ====================
CREATE TABLE IF NOT EXISTS gatherings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    local TEXT,
    venue TEXT,
    weather TEXT DEFAULT 'Clear',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ATTENDANCE TABLE ====================
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gathering_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    is_on_duty INTEGER DEFAULT 0,
    duty_time TEXT,
    time_out TEXT,
    batch TEXT,
    duty_venue TEXT,
    condition TEXT DEFAULT 'Normal',
    reason TEXT,
    weather TEXT DEFAULT 'Clear',
    FOREIGN KEY (gathering_id) REFERENCES gatherings(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
);

-- ==================== INDEXES FOR PERFORMANCE ====================
CREATE INDEX IF NOT EXISTS idx_members_local ON members(local);
CREATE INDEX IF NOT EXISTS idx_members_church_id ON members(church_id);
CREATE INDEX IF NOT EXISTS idx_attendance_gathering ON attendance(gathering_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);

-- ==================== SAMPLE INSERT STATEMENTS ====================

-- Example: Insert Admin
-- INSERT INTO admin (name, email, password) VALUES ('Admin Name', 'admin@example.com', 'your_password');

-- Example: Insert Member
-- INSERT INTO members (name, church_id, local, age, date_of_birth, date_of_baptism, skills, vehicle, phone)
-- VALUES ('Juan Dela Cruz', 'MCGI-001', 'Guindulman', 35, '1989-05-15', '2010-06-12', 'First Aid, Driving', 'Motorcycle', '09123456789');

-- Example: Insert Gathering
-- INSERT INTO gatherings (title, date, local, venue, weather) VALUES ('Prayer Meeting', '2024-03-20', 'Guindulman', 'Local ng Guindulman', 'Clear');

-- Example: Insert Attendance
-- INSERT INTO attendance (gathering_id, member_id, is_on_duty, duty_time, time_out, batch, duty_venue, condition, reason, weather)
-- VALUES (1, 1, 1, 'Wednesday - 5:00PM', 'Wednesday - 8:00PM', 'Batch 1', 'Local ng Guindulman', 'Normal', '', 'Clear');

-- ==================== USEFUL QUERIES ====================

-- Get all members with their duty count
-- SELECT m.name, m.local, m.church_id, COUNT(a.id) as total_duties
-- FROM members m
-- LEFT JOIN attendance a ON m.id = a.member_id AND a.is_on_duty = 1
-- GROUP BY m.id
-- ORDER BY total_duties DESC;

-- Get gathering attendance summary
-- SELECT g.title, g.date, 
--        SUM(CASE WHEN a.is_on_duty = 1 THEN 1 ELSE 0 END) as on_duty_count,
--        COUNT(*) as total_members
-- FROM gatherings g
-- LEFT JOIN attendance a ON g.id = a.gathering_id
-- GROUP BY g.id;

-- Get members by local
-- SELECT local, COUNT(*) as member_count
-- FROM members
-- GROUP BY local
-- ORDER BY member_count DESC;