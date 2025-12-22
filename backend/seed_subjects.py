"""
Seed script for fixed academic data: Departments, Specializations, and Subjects
This data is from the official curriculum and should not be modified by users.
Run with: docker exec bsu_backend python manage.py shell < seed_subjects.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from academic.models import Department, Specialization, Subject

print("Creating departments...")

# Create Departments
prep_dept, _ = Department.objects.get_or_create(
    code='PREP',
    defaults={'name': 'الفرقة الإعدادية', 'is_preparatory': True, 'has_specializations': False}
)

civil_dept, _ = Department.objects.get_or_create(
    code='CIVIL',
    defaults={'name': 'الهندسة المدنية', 'has_specializations': False}
)

arch_dept, _ = Department.objects.get_or_create(
    code='ARCH',
    defaults={'name': 'الهندسة المعمارية', 'has_specializations': False}
)

elec_dept, _ = Department.objects.get_or_create(
    code='ELEC',
    defaults={'name': 'الهندسة الكهربية', 'has_specializations': True}
)

print("Creating specializations...")

# Create Specializations for Electrical
ece_spec, _ = Specialization.objects.get_or_create(
    department=elec_dept,
    code='ECE',
    defaults={'name': 'هندسة الإلكترونيات والاتصالات'}
)

power_spec, _ = Specialization.objects.get_or_create(
    department=elec_dept,
    code='EPM',
    defaults={'name': 'هندسة القوى والآلات الكهربية'}
)

print("Creating subjects...")

# ========== الفرقة الإعدادية ==========
prep_subjects = [
    # Semester 1
    {'code': 'PHM011', 'name': 'جبر وتفاضل', 'semester': 1, 'max_grade': 150},
    {'code': 'PHM031', 'name': 'الحرارة والقوانين الميكانيكية للمادة', 'semester': 1, 'max_grade': 150},
    {'code': 'PHM041', 'name': 'كيمياء هندسية', 'semester': 1, 'max_grade': 150},
    {'code': 'MDP011', 'name': 'الرسم الهندسي', 'semester': 1, 'max_grade': 200},
    {'code': 'HUMX11', 'name': 'اللغة الانجليزية', 'semester': 1, 'max_grade': 50},
    {'code': 'HUMXE1', 'name': 'تاريخ الهندسة والتكنولوجيا', 'semester': 1, 'max_grade': 100},
    {'code': 'PHM030', 'name': 'استاتيكا', 'semester': 1, 'max_grade': 100},
    # Semester 2
    {'code': 'PHM012', 'name': 'هندسة تحليلية وتكامل', 'semester': 2, 'max_grade': 150},
    {'code': 'PHM032', 'name': 'كهربية ومغناطيسية', 'semester': 2, 'max_grade': 150},
    {'code': 'PHM033', 'name': 'هندسة الإنتاج', 'semester': 2, 'max_grade': 150},
    {'code': 'MDP021', 'name': 'هندسة الأتمتة', 'semester': 2, 'max_grade': 100},
    {'code': 'ECE062', 'name': 'مقدمة للبرمجة', 'semester': 2, 'max_grade': 100},
    {'code': 'HUMX51', 'name': 'نهر النيل والقضايا المعاصرة', 'semester': 2, 'max_grade': 50},
    {'code': 'HUMX42', 'name': 'قضايا المجتمع وحقوق الإنسان', 'semester': 2, 'max_grade': 50},
]

for subj in prep_subjects:
    Subject.objects.get_or_create(
        code=subj['code'],
        defaults={
            'name': subj['name'],
            'department': prep_dept,
            'level': 'PREPARATORY',
            'semester': subj['semester'],
            'max_grade': subj.get('max_grade', 100)
        }
    )

# ========== الهندسة المدنية ==========
civil_subjects = [
    # First Year - Semester 1
    {'code': 'PHM111', 'name': 'الجبر الخطي والتكامل متعدد المتغيرات', 'level': 'FIRST', 'semester': 1},
    {'code': 'PHM131', 'name': 'ميكانيكا الأجسام الجاسئة', 'level': 'FIRST', 'semester': 1},
    {'code': 'CVE111', 'name': 'تحليل إنشاءات(1)', 'level': 'FIRST', 'semester': 1},
    {'code': 'CVE131', 'name': 'رسم مدني(1)', 'level': 'FIRST', 'semester': 1},
    {'code': 'CVE121', 'name': 'المساحة(1)', 'level': 'FIRST', 'semester': 1},
    # First Year - Semester 2
    {'code': 'CVE112', 'name': 'ميكانيكا إنشاءات(1)', 'level': 'FIRST', 'semester': 2},
    {'code': 'CVE113', 'name': 'مقاومة وتكنولوجيا المواد(1)', 'level': 'FIRST', 'semester': 2},
    {'code': 'CVE122', 'name': 'المساحة(2)', 'level': 'FIRST', 'semester': 2},
    {'code': 'CVE114', 'name': 'جيولوجيا هندسية', 'level': 'FIRST', 'semester': 2},
    {'code': 'HUMX52', 'name': 'مهارات العرض والاتصال', 'level': 'FIRST', 'semester': 2},
    {'code': 'PHM113', 'name': 'الاحتمالات والإحصاء', 'level': 'FIRST', 'semester': 2},
    
    # Second Year - Semester 1
    {'code': 'CVE211', 'name': 'تحليل الإنشاءات(2)', 'level': 'SECOND', 'semester': 1},
    {'code': 'CVE212', 'name': 'مقاومة وتكنولوجيا المواد(2)', 'level': 'SECOND', 'semester': 1},
    {'code': 'CVE231', 'name': 'ميكانيكا الموائع', 'level': 'SECOND', 'semester': 1},
    {'code': 'EPM211', 'name': 'التركيبات الكهربية ومعدات الإنشاء', 'level': 'SECOND', 'semester': 1},
    {'code': 'ARC211', 'name': 'تخطيط وإنشاء ومواصفات معمارية', 'level': 'SECOND', 'semester': 1},
    {'code': 'HUM2E1', 'name': 'مقرر اختياري(1)', 'level': 'SECOND', 'semester': 1, 'is_elective': True},
    # Second Year - Semester 2
    {'code': 'CVE213', 'name': 'ميكانيكا الإنشاءات(2)', 'level': 'SECOND', 'semester': 2},
    {'code': 'CVE214', 'name': 'خرسانة مسلحة(1)', 'level': 'SECOND', 'semester': 2},
    {'code': 'CVE221', 'name': 'هندسة الجيوماتكس', 'level': 'SECOND', 'semester': 2},
    {'code': 'CVE232', 'name': 'هندسة الري والصرف', 'level': 'SECOND', 'semester': 2},
    {'code': 'CVE215', 'name': 'إدارة مشروعات التشييد(1)', 'level': 'SECOND', 'semester': 2},
    
    # Third Year - Semester 1
    {'code': 'CVE311', 'name': 'تحليل الإنشاءات(3)', 'level': 'THIRD', 'semester': 1},
    {'code': 'CVE312', 'name': 'خرسانة مسلحة(2)', 'level': 'THIRD', 'semester': 1},
    {'code': 'CVE313', 'name': 'منشآت معدنية(1)', 'level': 'THIRD', 'semester': 1},
    {'code': 'CVE331', 'name': 'الهندسة الهيدروليكية', 'level': 'THIRD', 'semester': 1},
    {'code': 'CVE321', 'name': 'ميكانيكا التربة(1)', 'level': 'THIRD', 'semester': 1},
    {'code': 'CVE322', 'name': 'تخطيط النقل وهندسة المرور', 'level': 'THIRD', 'semester': 1},
    # Third Year - Semester 2
    {'code': 'CVE314', 'name': 'ميكانيكا الإنشاءات(3)', 'level': 'THIRD', 'semester': 2},
    {'code': 'CVE315', 'name': 'خرسانة مسلحة(3)', 'level': 'THIRD', 'semester': 2},
    {'code': 'CVE316', 'name': 'منشآت معدنية(2)', 'level': 'THIRD', 'semester': 2},
    {'code': 'CVE332', 'name': 'تصميمات أعمال الري(1)', 'level': 'THIRD', 'semester': 2},
    {'code': 'CVE323', 'name': 'ميكانيكا التربة(2)', 'level': 'THIRD', 'semester': 2},
    {'code': 'CVE412', 'name': 'إدارة مشروعات التشييد(2)', 'level': 'THIRD', 'semester': 2},
    
    # Fourth Year - Semester 1
    {'code': 'CVE411', 'name': 'خرسانة مسلحة(4)', 'level': 'FOURTH', 'semester': 1},
    {'code': 'CVE421', 'name': 'هندسة الطرق والمطارات(1)', 'level': 'FOURTH', 'semester': 1},
    {'code': 'CVE422', 'name': 'أساسات(1)', 'level': 'FOURTH', 'semester': 1},
    {'code': 'CVE423', 'name': 'هندسة صحية وبيئية(1)', 'level': 'FOURTH', 'semester': 1},
    {'code': 'HUMX41', 'name': 'أخلاقيات المهنة', 'level': 'FOURTH', 'semester': 1},
    {'code': 'CVE4E1', 'name': 'مقرر اختياري(2)', 'level': 'FOURTH', 'semester': 1, 'is_elective': True},
    # Fourth Year - Semester 2
    {'code': 'CVE424', 'name': 'أساسات(2)', 'level': 'FOURTH', 'semester': 2},
    {'code': 'CVE431', 'name': 'تصميمات أعمال الري(2)', 'level': 'FOURTH', 'semester': 2},
    {'code': 'HUMX61', 'name': 'اقتصاد هندسي', 'level': 'FOURTH', 'semester': 2},
    {'code': 'CVE4E2', 'name': 'مقرر اختياري(3)', 'level': 'FOURTH', 'semester': 2, 'is_elective': True},
    {'code': 'CVE4E3', 'name': 'مقرر اختياري(4)', 'level': 'FOURTH', 'semester': 2, 'is_elective': True},
    {'code': 'CVE400', 'name': 'مشروع التخرج', 'level': 'FOURTH', 'semester': 2, 'max_grade': 150},
]

for subj in civil_subjects:
    Subject.objects.get_or_create(
        code=subj['code'],
        defaults={
            'name': subj['name'],
            'department': civil_dept,
            'level': subj['level'],
            'semester': subj['semester'],
            'is_elective': subj.get('is_elective', False),
            'max_grade': subj.get('max_grade', 100)
        }
    )

# ========== الهندسة المعمارية ==========
arch_subjects = [
    # First Year - Semester 1
    {'code': 'ARC111', 'name': 'التصميم المعماري والإظهار المعماري(1)', 'level': 'FIRST', 'semester': 1},
    {'code': 'ARC121', 'name': 'نظريات العمارة والتصميم(1)', 'level': 'FIRST', 'semester': 1},
    {'code': 'ARC131', 'name': 'الإنشاء المعماري ومواد البناء(1)', 'level': 'FIRST', 'semester': 1},
    {'code': 'PHM113A', 'name': 'الاحتمالات وإحصاء هندسية', 'level': 'FIRST', 'semester': 1},
    {'code': 'CVE111A', 'name': 'نظرية الإنشاءات وخواص المواد', 'level': 'FIRST', 'semester': 1},
    {'code': 'HUM1E1', 'name': 'مقرر اختياري(1)', 'level': 'FIRST', 'semester': 1, 'is_elective': True},
    # First Year - Semester 2
    {'code': 'ARC112', 'name': 'التصميم المعماري(2)', 'level': 'FIRST', 'semester': 2},
    {'code': 'ARC141', 'name': 'تاريخ العمارة(1)', 'level': 'FIRST', 'semester': 2},
    {'code': 'ARC1141', 'name': 'الرسم المعماري والمهارات البصرية', 'level': 'FIRST', 'semester': 2},
    {'code': 'ARC132', 'name': 'الإنشاء المعماري ومواد البناء(2)', 'level': 'FIRST', 'semester': 2},
    {'code': 'HUM1E2', 'name': 'مقرر اختياري(2)', 'level': 'FIRST', 'semester': 2, 'is_elective': True},
    {'code': 'CVE112A', 'name': 'المساحة ونظم المعلومات الجغرافية', 'level': 'FIRST', 'semester': 2},
    
    # Second Year - Semester 1
    {'code': 'ARC213', 'name': 'التصميم المعماري(3)', 'level': 'SECOND', 'semester': 1},
    {'code': 'ARC222', 'name': 'نظريات العمارة والتصميم(2)', 'level': 'SECOND', 'semester': 1},
    {'code': 'HUM2E1A', 'name': 'مقرر اختياري(3)', 'level': 'SECOND', 'semester': 1, 'is_elective': True},
    {'code': 'ARC233', 'name': 'الإنشاء المعماري وتكنولوجيا البناء(3)', 'level': 'SECOND', 'semester': 1},
    {'code': 'ARC271', 'name': 'تاريخ ونظريات التخطيط العمراني', 'level': 'SECOND', 'semester': 1},
    {'code': 'ARC261', 'name': 'التحكم البيئي والنظم البيئية المتكاملة(1)', 'level': 'SECOND', 'semester': 1},
    # Second Year - Semester 2
    {'code': 'ARC214', 'name': 'التصميم المعماري(4)', 'level': 'SECOND', 'semester': 2},
    {'code': 'ARC242', 'name': 'تاريخ العمارة(2)', 'level': 'SECOND', 'semester': 2},
    {'code': 'ARC281', 'name': 'مقدمة في التصميم العمراني(1)', 'level': 'SECOND', 'semester': 2},
    {'code': 'ARC234', 'name': 'الإنشاء المعماري وتكنولوجيا البناء(4)', 'level': 'SECOND', 'semester': 2},
    {'code': 'HUMX45', 'name': 'الدراسات الإنسانية في العمارة', 'level': 'SECOND', 'semester': 2},
    {'code': 'ARC262', 'name': 'التحكم البيئي والنظم البيئية المتكاملة(2)', 'level': 'SECOND', 'semester': 2},
    
    # Third Year - Semester 1
    {'code': 'ARC315', 'name': 'التصميم المعماري(5)', 'level': 'THIRD', 'semester': 1},
    {'code': 'ARC323', 'name': 'نظريات العمارة(3)', 'level': 'THIRD', 'semester': 1},
    {'code': 'ARC391', 'name': 'التصميمات التنفيذية وقوانين البناء(1)', 'level': 'THIRD', 'semester': 1},
    {'code': 'ARC372', 'name': 'التخطيط العمراني(1)', 'level': 'THIRD', 'semester': 1},
    {'code': 'CVE313A', 'name': 'الإنشاءات المعدنية والخرسانة المسلحة', 'level': 'THIRD', 'semester': 1},
    {'code': 'HUM3E1', 'name': 'مقرر اختياري(4)', 'level': 'THIRD', 'semester': 1, 'is_elective': True},
    # Third Year - Semester 2
    {'code': 'ARC316', 'name': 'التصميم المعماري(6)', 'level': 'THIRD', 'semester': 2},
    {'code': 'ARC324', 'name': 'نظريات العمارة(4)', 'level': 'THIRD', 'semester': 2},
    {'code': 'ARC392', 'name': 'التصميمات التنفيذية(2)', 'level': 'THIRD', 'semester': 2},
    {'code': 'ARC382', 'name': 'تخطيط وتصميم المناطق السكنية', 'level': 'THIRD', 'semester': 2},
    {'code': 'CVE314A', 'name': 'الأساسات والتربة', 'level': 'THIRD', 'semester': 2},
    {'code': 'ARC3E2', 'name': 'مقرر اختياري(5)', 'level': 'THIRD', 'semester': 2, 'is_elective': True},
    
    # Fourth Year - Semester 1
    {'code': 'ARC400', 'name': 'مشروع التخرج(1)', 'level': 'FOURTH', 'semester': 1, 'max_grade': 200},
    {'code': 'HUMX38', 'name': 'العقود والمواصفات', 'level': 'FOURTH', 'semester': 1},
    {'code': 'ARC4E1', 'name': 'مقرر اختياري(6)', 'level': 'FOURTH', 'semester': 1, 'is_elective': True},
    {'code': 'ARC4E2', 'name': 'مقرر اختياري(7)', 'level': 'FOURTH', 'semester': 1, 'is_elective': True},
    {'code': 'HUMX73', 'name': 'الأثر البيئي للمشروعات', 'level': 'FOURTH', 'semester': 1},
    # Fourth Year - Semester 2
    {'code': 'ARC401', 'name': 'مشروع التخرج(2)', 'level': 'FOURTH', 'semester': 2, 'max_grade': 250},
    {'code': 'ARC4E3', 'name': 'مقرر اختياري(8)', 'level': 'FOURTH', 'semester': 2, 'is_elective': True},
    {'code': 'ARC4E4', 'name': 'مقرر اختياري(9)', 'level': 'FOURTH', 'semester': 2, 'is_elective': True},
    {'code': 'HUMX32', 'name': 'إدارة المشروعات', 'level': 'FOURTH', 'semester': 2},
    {'code': 'HUMX77', 'name': 'المجتمع وقضايا المواطنة', 'level': 'FOURTH', 'semester': 2},
]

for subj in arch_subjects:
    Subject.objects.get_or_create(
        code=subj['code'],
        defaults={
            'name': subj['name'],
            'department': arch_dept,
            'level': subj['level'],
            'semester': subj['semester'],
            'is_elective': subj.get('is_elective', False),
            'max_grade': subj.get('max_grade', 100)
        }
    )

# ========== الهندسة الكهربية - الفرقة الأولى المشتركة ==========
elec_first_year = [
    # Semester 1
    {'code': 'PHM113E', 'name': 'احتمالات وإحصاء هندسي', 'semester': 1},
    {'code': 'PHM122', 'name': 'الفيزياء الحديثة وميكانيكا الكم', 'semester': 1},
    {'code': 'EPM111', 'name': 'دوائر كهربية(1)', 'semester': 1},
    {'code': 'EPM121', 'name': 'مجالات كهرومغناطيسية', 'semester': 1},
    {'code': 'CVE111E', 'name': 'هندسة مدنية', 'semester': 1},
    {'code': 'ECE111', 'name': 'أساسيات الكترونية', 'semester': 1},
    # Semester 2
    {'code': 'PHM112', 'name': 'الدوال الخاصة والمعادلات التفاضلية الجزئية', 'semester': 2},
    {'code': 'MEP114', 'name': 'هندسة ميكانيكية', 'semester': 2},
    {'code': 'EPM171', 'name': 'قياسات كهربية وإلكترونية', 'semester': 2},
    {'code': 'EPM112', 'name': 'دوائر كهربية(2)', 'semester': 2},
    {'code': 'ECE151', 'name': 'دوائر منطقية', 'semester': 2},
    {'code': 'HUMX52E', 'name': 'مهارات الاتصال والعرض', 'semester': 2},
]

for subj in elec_first_year:
    Subject.objects.get_or_create(
        code=subj['code'],
        defaults={
            'name': subj['name'],
            'department': elec_dept,
            'specialization': None,  # Shared - no specialization
            'level': 'FIRST',
            'semester': subj['semester'],
            'max_grade': subj.get('max_grade', 100)
        }
    )

# ========== الهندسة الكهربية - ECE (الإلكترونيات والاتصالات) ==========
ece_subjects = [
    # Second Year - Semester 1
    {'code': 'PHM218', 'name': 'الدوال المركبة والتحليل العددي', 'level': 'SECOND', 'semester': 1},
    {'code': 'ECE235', 'name': 'إشارات ونظم', 'level': 'SECOND', 'semester': 1},
    {'code': 'ECE216', 'name': 'دوائر إلكترونية رقمية', 'level': 'SECOND', 'semester': 1},
    {'code': 'ECE261', 'name': 'برمجة الحاسب', 'level': 'SECOND', 'semester': 1},
    {'code': 'ECE212', 'name': 'دوائر إلكترونية تناظرية(1)', 'level': 'SECOND', 'semester': 1},
    {'code': 'HUMX12E', 'name': 'كتابة التقارير الفنية', 'level': 'SECOND', 'semester': 1},
    # Second Year - Semester 2
    {'code': 'ECE213', 'name': 'دوائر إلكترونية تناظرية(2)', 'level': 'SECOND', 'semester': 2},
    {'code': 'ECE252', 'name': 'تنظيم حاسبات', 'level': 'SECOND', 'semester': 2},
    {'code': 'ECE253', 'name': 'متحكمات دقيقة وربط بالأنظمة', 'level': 'SECOND', 'semester': 2},
    {'code': 'ECE236', 'name': 'مبادئ نظم الاتصالات', 'level': 'SECOND', 'semester': 2},
    {'code': 'EPM271', 'name': 'ديناميكا النظم وعناصر التحكم', 'level': 'SECOND', 'semester': 2},
    {'code': 'HUMX53', 'name': 'مهارات البحث والتحليل', 'level': 'SECOND', 'semester': 2},
    
    # Third Year - Semester 1
    {'code': 'ECE353', 'name': 'الدوائر المتكاملة التناظرية', 'level': 'THIRD', 'semester': 1},
    {'code': 'EPM323', 'name': 'الطاقة والطاقة المتجددة', 'level': 'THIRD', 'semester': 1},
    {'code': 'ECE321', 'name': 'موجات كهرومغناطيسية', 'level': 'THIRD', 'semester': 1},
    {'code': 'ECE331', 'name': 'أنظمة اتصالات تناظرية ورقمية', 'level': 'THIRD', 'semester': 1},
    {'code': 'EPM372', 'name': 'هندسة التحكم الآلي', 'level': 'THIRD', 'semester': 1},
    {'code': 'HUMX61E', 'name': 'اقتصاد هندسي واستثمار', 'level': 'THIRD', 'semester': 1},
    # Third Year - Semester 2
    {'code': 'ECE354', 'name': 'نظم للأنظمة المدمجة', 'level': 'THIRD', 'semester': 2},
    {'code': 'ECE317', 'name': 'تصميم الدوائر المتكاملة الرقمية', 'level': 'THIRD', 'semester': 2},
    {'code': 'ECE3E1', 'name': 'مقرر اختياري(1)', 'level': 'THIRD', 'semester': 2, 'is_elective': True},
    {'code': 'ECE3E2', 'name': 'مقرر اختياري(2)', 'level': 'THIRD', 'semester': 2, 'is_elective': True},
    {'code': 'ECE324', 'name': 'إلكترونيات ضوئية', 'level': 'THIRD', 'semester': 2},
    {'code': 'HUMX32E', 'name': 'إدارة مشروعات الهندسة الكهربية', 'level': 'THIRD', 'semester': 2},
    
    # Fourth Year - Semester 1
    {'code': 'ECE400', 'name': 'مشروع(1)', 'level': 'FOURTH', 'semester': 1, 'max_grade': 150},
    {'code': 'ECE432', 'name': 'معالجة إشارات رقمية', 'level': 'FOURTH', 'semester': 1},
    {'code': 'ECE421', 'name': 'هوائيات وانتشار موجات', 'level': 'FOURTH', 'semester': 1},
    {'code': 'ECE4E1', 'name': 'مقرر اختياري(3)', 'level': 'FOURTH', 'semester': 1, 'is_elective': True},
    {'code': 'ECE4E2', 'name': 'مقرر اختياري(4)', 'level': 'FOURTH', 'semester': 1, 'is_elective': True},
    {'code': 'HUMX41E', 'name': 'أخلاقيات المهنة', 'level': 'FOURTH', 'semester': 1},
    # Fourth Year - Semester 2
    {'code': 'ECE401', 'name': 'مشروع(2)', 'level': 'FOURTH', 'semester': 2, 'max_grade': 250},
    {'code': 'ECE422', 'name': 'أنظمة ميكروويڤية', 'level': 'FOURTH', 'semester': 2},
    {'code': 'ECE4E3', 'name': 'مقرر اختياري(5)', 'level': 'FOURTH', 'semester': 2, 'is_elective': True},
    {'code': 'ECE4E4', 'name': 'مقرر اختياري(6)', 'level': 'FOURTH', 'semester': 2, 'is_elective': True},
    {'code': 'HUMX73E', 'name': 'الأثر البيئي للمشروعات', 'level': 'FOURTH', 'semester': 2},
]

for subj in ece_subjects:
    Subject.objects.get_or_create(
        code=subj['code'],
        defaults={
            'name': subj['name'],
            'department': elec_dept,
            'specialization': ece_spec,
            'level': subj['level'],
            'semester': subj['semester'],
            'is_elective': subj.get('is_elective', False),
            'max_grade': subj.get('max_grade', 100)
        }
    )

# ========== الهندسة الكهربية - Power (القوى والآلات) ==========
power_subjects = [
    # Second Year - Semester 1
    {'code': 'PHM212', 'name': 'التحليل العددي', 'level': 'SECOND', 'semester': 1},
    {'code': 'EPM232', 'name': 'ديناميكا نظم القوى الكهربية', 'level': 'SECOND', 'semester': 1},
    {'code': 'EPM211P', 'name': 'محطات محولات الجهد العالي', 'level': 'SECOND', 'semester': 1},
    {'code': 'EPM221', 'name': 'تحويل طاقة', 'level': 'SECOND', 'semester': 1},
    {'code': 'ECE237', 'name': 'معالجة إشارات', 'level': 'SECOND', 'semester': 1},
    {'code': 'HUMX12P', 'name': 'كتابة التقارير الفنية', 'level': 'SECOND', 'semester': 1},
    # Second Year - Semester 2
    {'code': 'EPM212', 'name': 'طاقة جديدة ومتجددة', 'level': 'SECOND', 'semester': 2},
    {'code': 'EPM215', 'name': 'متحكمات دقيقة', 'level': 'SECOND', 'semester': 2},
    {'code': 'EPM222', 'name': 'آلات كهربية(1)', 'level': 'SECOND', 'semester': 2},
    {'code': 'EPM231', 'name': 'نقل وتوزيع الطاقة الكهربية(1)', 'level': 'SECOND', 'semester': 2},
    {'code': 'ECE238', 'name': 'نظم اتصالات', 'level': 'SECOND', 'semester': 2},
    {'code': 'HUMX53P', 'name': 'مهارات البحث والتحليل', 'level': 'SECOND', 'semester': 2},
    
    # Third Year - Semester 1
    {'code': 'EPM4E1', 'name': 'مقرر اختياري(1)', 'level': 'THIRD', 'semester': 1, 'is_elective': True},
    {'code': 'EPM321', 'name': 'آلات كهربية(2)', 'level': 'THIRD', 'semester': 1},
    {'code': 'EPM341', 'name': 'هندسة الجهد العالي(1)', 'level': 'THIRD', 'semester': 1},
    {'code': 'EPM381', 'name': 'التحكم الآلي', 'level': 'THIRD', 'semester': 1},
    {'code': 'EPM351', 'name': 'إلكترونيات القوى(1)', 'level': 'THIRD', 'semester': 1},
    # Third Year - Semester 2
    {'code': 'EPM332', 'name': 'تحليل نظم القوى الكهربية(1)', 'level': 'THIRD', 'semester': 2},
    {'code': 'EPM333', 'name': 'توليد واقتصاديات تشغيل القوى الكهربية', 'level': 'THIRD', 'semester': 2},
    {'code': 'EPM3E2', 'name': 'مقرر اختياري(2)', 'level': 'THIRD', 'semester': 2, 'is_elective': True},
    {'code': 'EPM3E3', 'name': 'مقرر اختياري(3)', 'level': 'THIRD', 'semester': 2, 'is_elective': True},
    {'code': 'EPM334', 'name': 'تخطيط الشبكات الكهربية', 'level': 'THIRD', 'semester': 2},
    {'code': 'HUMX32P', 'name': 'إدارة المشروعات', 'level': 'THIRD', 'semester': 2},
    
    # Fourth Year - Semester 1
    {'code': 'EPM400', 'name': 'المشروع', 'level': 'FOURTH', 'semester': 1, 'max_grade': 300},
    {'code': 'EPM412', 'name': 'استخدامات الطاقة الكهربية', 'level': 'FOURTH', 'semester': 1},
    {'code': 'EPM413', 'name': 'إلكترونيات القوى(2)', 'level': 'FOURTH', 'semester': 1},
    {'code': 'EPM481', 'name': 'التحكم في نظم القوى الكهربية', 'level': 'FOURTH', 'semester': 1},
    {'code': 'EPM4E4', 'name': 'مقرر اختياري(4)', 'level': 'FOURTH', 'semester': 1, 'is_elective': True},
    {'code': 'HUMX73P', 'name': 'الأثر البيئي للمشروعات', 'level': 'FOURTH', 'semester': 1},
    # Fourth Year - Semester 2
    {'code': 'EPM431', 'name': 'تحليل نظم القوى الكهربية(2)', 'level': 'FOURTH', 'semester': 2},
    {'code': 'EPM414', 'name': 'هندسة الجهد العالي(2)', 'level': 'FOURTH', 'semester': 2},
    {'code': 'EPM4E5', 'name': 'مقرر اختياري(5)', 'level': 'FOURTH', 'semester': 2, 'is_elective': True},
    {'code': 'EPM452', 'name': 'تسيير كهربي', 'level': 'FOURTH', 'semester': 2},
    {'code': 'EPM462', 'name': 'وقاية نظم القوى الكهربية', 'level': 'FOURTH', 'semester': 2},
    {'code': 'HUMX34', 'name': 'إدارة أعمال', 'level': 'FOURTH', 'semester': 2},
]

for subj in power_subjects:
    Subject.objects.get_or_create(
        code=subj['code'],
        defaults={
            'name': subj['name'],
            'department': elec_dept,
            'specialization': power_spec,
            'level': subj['level'],
            'semester': subj['semester'],
            'is_elective': subj.get('is_elective', False),
            'max_grade': subj.get('max_grade', 100)
        }
    )

print(f"\nSeeding complete!")
print(f"Departments: {Department.objects.count()}")
print(f"Specializations: {Specialization.objects.count()}")
print(f"Subjects: {Subject.objects.count()}")
