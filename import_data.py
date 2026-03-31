#!/usr/bin/env python3
"""
MCGI DRRT Attendance System - Data Import Script
This script imports data from SQL database to JSON format for the web application.

Usage:
    python import_data.py <database.db>

The script will generate JSON files that can be imported into localStorage.
"""

import sqlite3
import json
import sys
import os

def export_to_json(db_path):
    """Export SQL database to JSON files for localStorage"""
    
    if not os.path.exists(db_path):
        print(f"Error: Database file '{db_path}' not found!")
        return
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Export admin
    cursor.execute("SELECT * FROM admin")
    admins = [dict(row) for row in cursor.fetchall()]
    if admins:
        # Remove 'id' and 'created_at' for localStorage format
        for admin in admins:
            admin.pop('id', None)
            admin.pop('created_at', None)
        with open('exported_admin.json', 'w') as f:
            json.dump(admins[0] if admins else {}, f, indent=2)
        print(f"Exported {len(admins)} admin account(s) to exported_admin.json")
    
    # Export members
    cursor.execute("SELECT * FROM members")
    members = []
    for row in cursor.fetchall():
        member = dict(row)
        # Convert to localStorage format with timestamp ID
        member['id'] = int(member.pop('id', 0) or 0) or int(__import__('time').time() * 1000)
        member.pop('created_at', None)
        # Rename fields to match localStorage format
        if 'church_id' in member:
            member['churchId'] = member.pop('church_id')
        if 'date_of_birth' in member:
            member['dob'] = member.pop('date_of_birth')
        if 'date_of_baptism' in member:
            member['baptism'] = member.pop('date_of_baptism')
        members.append(member)
    
    with open('exported_members.json', 'w') as f:
        json.dump(members, f, indent=2)
    print(f"Exported {len(members)} member(s) to exported_members.json")
    
    # Export gatherings with attendance
    cursor.execute("SELECT * FROM gatherings ORDER BY date")
    gatherings = []
    for row in cursor.fetchall():
        gathering = dict(row)
        gathering_id = gathering['id']
        gathering.pop('created_at', None)
        
        # Get attendance for this gathering
        cursor.execute("""
            SELECT a.member_id, a.is_on_duty, a.duty_time, a.duty_local, a.condition
            FROM attendance a
            WHERE a.gathering_id = ?
        """, (gathering_id,))
        
        attendances = []
        for att_row in cursor.fetchall():
            att = dict(att_row)
            att['memberId'] = att.pop('member_id')
            att['isOnDuty'] = bool(att.pop('is_on_duty'))
            att['dutyTime'] = att.pop('duty_time') or ''
            att['dutyLocal'] = att.pop('duty_local') or ''
            attendances.append(att)
        
        gathering['attendances'] = attendances
        gatherings.append(gathering)
    
    with open('exported_gatherings.json', 'w') as f:
        json.dump(gatherings, f, indent=2)
    print(f"Exported {len(gatherings)} gathering(s) to exported_gatherings.json")
    
    conn.close()
    print("\nExport complete!")
    print("\nTo import into the web application:")
    print("1. Open the web application in your browser")
    print("2. Open Developer Tools (F12)")
    print("3. Go to Console tab")
    print("4. Run the following commands:")
    print("")
    print("   // Import members")
    print("   fetch('exported_members.json').then(r => r.json()).then(data => localStorage.setItem('members', JSON.stringify(data)));")
    print("")
    print("   // Import gatherings")
    print("   fetch('exported_gatherings.json').then(r => r.json()).then(data => localStorage.setItem('gatherings', JSON.stringify(data)));")
    print("")
    print("   // Import admin (if exists)")
    print("   fetch('exported_admin.json').then(r => r.json()).then(data => localStorage.setItem('admin', JSON.stringify(data)));")
    print("")
    print("5. Refresh the page")

def create_sample_database():
    """Create a sample database with test data"""
    conn = sqlite3.connect('mcgi_drrt_sample.db')
    cursor = conn.cursor()
    
    # Create tables
    with open('database.sql', 'r') as f:
        sql_script = f.read()
        # Split by semicolons and execute each statement
        for statement in sql_script.split(';'):
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                try:
                    cursor.execute(statement)
                except sqlite3.Error as e:
                    pass  # Ignore errors for sample data creation
    
    # Insert sample admin
    cursor.execute("INSERT INTO admin (name, email, password) VALUES (?, ?, ?)",
                   ('DRRT Admin', 'admin@mcgi.org', 'admin123'))
    
    # Insert sample members
    sample_members = [
        ('Juan Dela Cruz', 'MCGI-001', 'Guindulman', 35, '1989-05-15', '2010-06-12', 'First Aid, Driving', 'Motorcycle'),
        ('Maria Santos', 'MCGI-002', 'Guindulman', 28, '1996-03-20', '2015-08-15', 'First Aid', 'None'),
        ('Pedro Reyes', 'MCGI-003', 'Carmen', 42, '1982-11-08', '2008-01-20', 'Driving, Mechanics', 'Motorcycle'),
        ('Ana Garcia', 'MCGI-004', 'Carmen', 31, '1993-07-12', '2012-04-10', 'First Aid, Cooking', 'None'),
        ('Jose Martinez', 'MCGI-005', 'Bilar', 38, '1986-09-25', '2011-12-01', 'Driving', 'Tricycle'),
    ]
    
    for member in sample_members:
        cursor.execute("""
            INSERT INTO members (name, church_id, local, age, date_of_birth, date_of_baptism, skills, vehicle)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, member)
    
    # Insert sample gatherings
    cursor.execute("INSERT INTO gatherings (title, date, batch, local) VALUES (?, ?, ?, ?)",
                   ('Sunday Prayer Meeting', '2024-03-17', 'Batch 1', 'Guindulman'))
    gathering_id = cursor.lastrowid
    
    # Insert sample attendance
    cursor.execute("INSERT INTO attendance (gathering_id, member_id, is_on_duty, duty_time, duty_local, condition) VALUES (?, ?, ?, ?, ?, ?)",
                   (gathering_id, 1, 1, 'Sunday AM - 6:00AM', 'Guindulman', 'Normal'))
    cursor.execute("INSERT INTO attendance (gathering_id, member_id, is_on_duty, duty_time, duty_local, condition) VALUES (?, ?, ?, ?, ?, ?)",
                   (gathering_id, 2, 1, 'Sunday AM - 9:00AM', 'Guindulman', 'Normal'))
    cursor.execute("INSERT INTO attendance (gathering_id, member_id, is_on_duty, duty_time, duty_local, condition) VALUES (?, ?, ?, ?, ?, ?)",
                   (gathering_id, 3, 0, '', 'Carmen', 'Normal'))
    
    conn.commit()
    conn.close()
    print("Sample database created: mcgi_drrt_sample.db")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("MCGI DRRT Data Import Tool")
        print("=" * 40)
        print("\nUsage:")
        print("  python import_data.py <database.db>  - Export database to JSON")
        print("  python import_data.py --sample       - Create sample database")
        print("\nExample:")
        print("  python import_data.py mcgi_drrt_sample.db")
        sys.exit(1)
    
    if sys.argv[1] == '--sample':
        create_sample_database()
    else:
        export_to_json(sys.argv[1])