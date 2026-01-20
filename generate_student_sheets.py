"""
Generate test student Excel sheets for each level/department.
Run: python3 generate_student_sheets.py
"""
import random
import os

# Check if openpyxl is available, otherwise use csv
try:
    from openpyxl import Workbook
    USE_EXCEL = True
except ImportError:
    import csv
    USE_EXCEL = False
    print("openpyxl not found, will create CSV files instead")

# Arabic first names
FIRST_NAMES = [
    "أحمد", "محمد", "علي", "عمر", "يوسف", "خالد", "مصطفى", "إبراهيم", "كريم", "طارق",
    "سارة", "مريم", "فاطمة", "نورهان", "ياسمين", "هند", "سلمى", "ريم", "دينا", "منى"
]

# Arabic last names
LAST_NAMES = [
    "محمود", "إبراهيم", "أحمد", "عبدالله", "حسن", "علي", "محمد", "عبدالرحمن", "السيد", "خليل",
    "عبدالعزيز", "فاروق", "الشافعي", "البنا", "النجار", "الصياد", "العمري", "الهاشمي", "القاضي", "الحسيني"
]

# Departments mapping
DEPARTMENTS = {
    "prep": {"name": "الفرقة الإعدادية", "code": "PREP"},
    "civil": {"name": "هندسة مدنية", "code": "CIVIL"},
    "arch": {"name": "هندسة معمارية", "code": "ARCH"},
    "ece": {"name": "هندسة اتصالات", "code": "ECE"},
    "epm": {"name": "هندسة قوى", "code": "EPM"},
}

# Levels
LEVELS = {
    "prep": "PREPARATORY",
    "first": "FIRST",
    "second": "SECOND",
    "third": "THIRD",
    "fourth": "FOURTH"
}

# Sheets configuration
SHEETS = [
    ("prep_year.xlsx", "prep", "prep"),
    ("civil_first.xlsx", "civil", "first"),
    ("civil_second.xlsx", "civil", "second"),
    ("civil_third.xlsx", "civil", "third"),
    ("civil_fourth.xlsx", "civil", "fourth"),
    ("arch_first.xlsx", "arch", "first"),
    ("arch_second.xlsx", "arch", "second"),
    ("arch_third.xlsx", "arch", "third"),
    ("arch_fourth.xlsx", "arch", "fourth"),
    ("ece_epm_first.xlsx", "ece", "first"),  # Shared first year
    ("ece_second.xlsx", "ece", "second"),
    ("ece_third.xlsx", "ece", "third"),
    ("ece_fourth.xlsx", "ece", "fourth"),
    ("epm_second.xlsx", "epm", "second"),
    ("epm_third.xlsx", "epm", "third"),
    ("epm_fourth.xlsx", "epm", "fourth"),
]

def generate_national_id():
    """Generate a valid-looking Egyptian national ID (14 digits)"""
    # Format: CYYMMDDSSGGGC
    # C = Century (2 for 1900s, 3 for 2000s)
    # YY = Year, MM = Month, DD = Day
    # SS = Governorate code
    # GGG = Sequential number
    # C = Check digit
    century = random.choice(["2", "3"])
    year = str(random.randint(0, 5)).zfill(2) if century == "3" else str(random.randint(90, 99))
    month = str(random.randint(1, 12)).zfill(2)
    day = str(random.randint(1, 28)).zfill(2)
    gov = str(random.randint(1, 31)).zfill(2)
    seq = str(random.randint(1, 999)).zfill(4)
    check = str(random.randint(1, 9))
    return f"{century}{year}{month}{day}{gov}{seq}{check}"

def generate_students(dept_code, level_key, start_seat, count=10):
    """Generate student data"""
    students = []
    dept = DEPARTMENTS[dept_code]
    level = LEVELS[level_key]
    
    for i in range(count):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        father = random.choice(FIRST_NAMES)
        full_name = f"{first} {father} {last}"
        
        national_id = generate_national_id()
        seat = start_seat + i
        email = f"{seat}@student.eng.bsu.edu.eg"
        
        students.append({
            "full_name": full_name,
            "national_id": national_id,
            "email": email,
            "seat_number": str(seat).zfill(6),
            "department": dept["name"],
            "level": level,
            "academic_year": "2025-2026"
        })
    
    return students

def create_excel_sheet(filename, students, output_dir):
    """Create Excel file with student data"""
    filepath = os.path.join(output_dir, filename)
    
    if USE_EXCEL:
        wb = Workbook()
        ws = wb.active
        ws.title = "Students"
        
        # Header
        headers = ["full_name", "national_id", "email", "seat_number", "department", "level", "academic_year"]
        ws.append(headers)
        
        # Data
        for student in students:
            ws.append([student[h] for h in headers])
        
        wb.save(filepath)
    else:
        # Create CSV instead
        filepath = filepath.replace('.xlsx', '.csv')
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=students[0].keys())
            writer.writeheader()
            writer.writerows(students)
    
    print(f"Created: {filepath}")

def main():
    output_dir = "/home/mhm/Desktop/bsu_project/student_sheets"
    os.makedirs(output_dir, exist_ok=True)
    
    seat_counter = 100001  # Start seat number
    
    for filename, dept_code, level_key in SHEETS:
        students = generate_students(dept_code, level_key, seat_counter)
        create_excel_sheet(filename, students, output_dir)
        seat_counter += 10  # Increment for next batch
    
    print(f"\nTotal: {len(SHEETS)} sheets created in {output_dir}")

if __name__ == "__main__":
    main()
