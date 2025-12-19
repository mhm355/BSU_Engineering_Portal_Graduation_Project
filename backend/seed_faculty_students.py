#!/usr/bin/env python
"""
Seed script to create all faculty members (doctors) and sample students
"""
import os
import random
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from academic.models import Department, AcademicYear, Level, Student, Specialization

User = get_user_model()


def generate_national_id():
    """Generate random 14-digit national ID"""
    return ''.join(random.choices('0123456789', k=14))


def clean_name(name):
    """Clean doctor name by removing titles"""
    name = name.replace('أ.د/', '').replace('أ.م.د/', '').replace('أ.م.د.', '').replace('أ.د.م/', '')
    name = name.replace('د/', '').replace('د.', '').replace('ـ.م.د/', '')
    name = name.replace('م.م/', '').replace('م/', '')
    return name.strip()


# All Civil Department Faculty
CIVIL_FACULTY = [
    'أ.د/ عمرو الخولي',
    'أ.د/ أحمد محمد أحمد حسن بخيت',
    'أ.د/ أحمد شعبان',
    'أ.د/ أحمد زيدان',
    'أ.د/ أحمد محمد كامل التهامي',
    'أ.د/ كمال الغمري متولي محمد',
    'أ.م.د/ وائل نشأت عبد السميع عبد الغني',
    'أ.م.د/ محمد نبيل علي بيومي',
    'أ.م.د/ أماني طلعت عبد القادر حسونه',
    'أ.م.د/ ناصر زكي أحمد أبو القاسم',
    'أ.م.د/ محمد عبد السلام إبراهيم عرب',
    'أ.م.د/ محمود عبد العزيز عبد المحسن المندوه',
    'أ.م.د/ شرين أحمد إبراهيم زكي',
    'أ.م.د/ وائل صلاح الدين زكي',
    'د. سحر عبد السلام مصطفى أحمد',
    'د. محمود سيد محمود',
    'د. عمرو علي حسن فرج البنا',
    'د. فتحي محمود فتحي',
    'د. خالد محمد يوسف أمان',
    'د. أحمد سعد ربيع',
    'د. محمود كمال محمد طه',
    'د. دينا علي عبد العزيز حسين',
]

# All Electrical Department Faculty
ELECTRICAL_FACULTY = [
    'أ.د/ محمد محمود سامي عبد العزيز',
    'أ.د/ جان هنري حنا',
    'أ.م.د/ عرفة سيد محمد منصور',
    'أ.م.د/ فتحي محمد مصطفى',
    'أ.م.د/ شيماء حسن سيد بركات',
    'د/ فتحي عبد اللطيف المسيري',
    'د/ ليلى أبو هاشم محمد',
    'د/ أسماء محمد أحمد عبد الغني',
    'د/ محمد فيصل',
    'م.م/ محمد ذكري',
    'م.م/ محمد جاد المولى عبد ربه',
    'م/ مصطفى موسى',
]

# All Architecture Department Faculty
ARCHITECTURE_FACULTY = [
    'أ.د/ ريهام الدسوقي حامد',
    'أ.د/ محمد شكر ندا',
    'أ.م.د/ سحر محسن رزق',
    'أ.م.د/ إيمان بدوي أحمد محمود',
    'أ.م.د/ مروة مصطفى الأشموني',
    'د. هبة حسن أحمد كامل إسماعيل',
    'د. نسمة محمد عبد المقصود',
    'د. هايدي عصام يوسف',
    'د. أحمد محمد طه علي',
    'د. هشام طاهر الليثي',
    'د. أيمن حسني محمد أبو العلا',
]

# Sample student names (Arabic)
STUDENT_FIRST_NAMES = [
    'أحمد', 'محمد', 'علي', 'حسن', 'خالد', 'عمر', 'يوسف', 'إبراهيم', 'مصطفى', 'عبدالله',
    'فاطمة', 'مريم', 'نورا', 'سارة', 'هدى', 'أمل', 'ريم', 'دينا', 'ياسمين', 'سلمى'
]

STUDENT_LAST_NAMES = [
    'محمود', 'علي', 'حسن', 'إبراهيم', 'أحمد', 'عبدالرحمن', 'سعيد', 'مصطفى', 'السيد', 'الشافعي',
    'عبدالعزيز', 'الجمال', 'البدري', 'الفقي', 'النجار', 'الحداد', 'الصاوي', 'العربي', 'المهدي', 'القاضي'
]


def create_doctor(name):
    """Create a doctor user"""
    clean = clean_name(name)
    national_id = generate_national_id()
    username = f"dr_{national_id[-8:]}"
    
    # Check if already exists
    if User.objects.filter(username=username).exists():
        username = f"dr_{random.randint(10000000, 99999999)}"
    
    name_parts = clean.split()
    first_name = name_parts[0] if name_parts else clean
    last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
    
    try:
        user = User.objects.create_user(
            username=username,
            password=national_id,
            national_id=national_id,
            email=f"{username}@eng.bsu.edu.eg",
            first_name=first_name,
            last_name=last_name,
            role='DOCTOR'
        )
        print(f"  Created doctor: {clean}")
        return user
    except Exception as e:
        print(f"  Error creating doctor {clean}: {e}")
        return None


def create_student(first_name, last_name, level, department, academic_year, specialization=None):
    """Create a student user and Student profile"""
    national_id = generate_national_id()
    full_name = f"{first_name} {last_name}"
    username = national_id
    
    # Check if national_id exists in either User or Student table
    if User.objects.filter(national_id=national_id).exists():
        return None
    if Student.objects.filter(national_id=national_id).exists():
        return None
    
    try:
        user = User.objects.create_user(
            username=username,
            password=national_id,
            national_id=national_id,
            email=f"s{national_id[-6:]}@student.eng.bsu.edu.eg",
            first_name=first_name,
            last_name=last_name,
            role='STUDENT'
        )
        
        # Create Student profile with national_id and full_name
        student = Student.objects.create(
            user=user,
            national_id=national_id,  # Student model's national_id field
            full_name=full_name,       # Student model's full_name field
            level=level,
            department=department,
            academic_year=academic_year,
            specialization=specialization
        )
        
        return student
    except Exception as e:
        print(f"    Error creating student: {e}")
        return None


def seed_doctors():
    """Seed all faculty members"""
    print("\n=== Seeding Faculty Members ===\n")
    
    all_faculty = CIVIL_FACULTY + ELECTRICAL_FACULTY + ARCHITECTURE_FACULTY
    created_count = 0
    
    for name in all_faculty:
        if create_doctor(name):
            created_count += 1
    
    print(f"\nTotal doctors created: {created_count}")


def seed_students():
    """Seed sample students for each department and level"""
    print("\n=== Seeding Sample Students ===\n")
    
    try:
        current_year = AcademicYear.objects.get(is_current=True)
    except AcademicYear.DoesNotExist:
        print("No current academic year found! Please create one first.")
        return
    
    students_per_level = 10
    created_count = 0
    
    # Get departments
    departments = Department.objects.all()
    
    for dept in departments:
        print(f"\nSeeding students for {dept.name} ({dept.code})...")
        
        # Get levels for this department in current year
        levels = Level.objects.filter(department=dept, academic_year=current_year)
        
        if not levels.exists():
            print(f"  No levels found for {dept.code}. Creating levels...")
            if dept.code == 'PREP':
                Level.objects.get_or_create(
                    name='PREPARATORY',
                    department=dept,
                    academic_year=current_year
                )
            else:
                for level_name in ['FIRST', 'SECOND', 'THIRD', 'FOURTH']:
                    Level.objects.get_or_create(
                        name=level_name,
                        department=dept,
                        academic_year=current_year
                    )
            levels = Level.objects.filter(department=dept, academic_year=current_year)
        
        for level in levels:
            print(f"  Creating {students_per_level} students for {level.get_name_display()}...")
            
            # For Electrical dept years 2-4, assign specializations
            if dept.code == 'ELEC' and level.name in ['SECOND', 'THIRD', 'FOURTH']:
                specs = list(Specialization.objects.filter(department=dept))
                if specs:
                    for i in range(students_per_level):
                        first_name = random.choice(STUDENT_FIRST_NAMES)
                        last_name = random.choice(STUDENT_LAST_NAMES)
                        spec = specs[i % len(specs)]
                        student = create_student(first_name, last_name, level, dept, current_year, spec)
                        if student:
                            created_count += 1
                    continue
            
            # Regular students
            for i in range(students_per_level):
                first_name = random.choice(STUDENT_FIRST_NAMES)
                last_name = random.choice(STUDENT_LAST_NAMES)
                student = create_student(first_name, last_name, level, dept, current_year, None)
                if student:
                    created_count += 1
    
    print(f"\nTotal students created: {created_count}")


if __name__ == '__main__':
    print("=" * 60)
    print("Faculty & Students Seed Script")
    print("=" * 60)
    
    seed_doctors()
    seed_students()
    
    print("\n" + "=" * 60)
    print("Seeding complete!")
    print("=" * 60)
