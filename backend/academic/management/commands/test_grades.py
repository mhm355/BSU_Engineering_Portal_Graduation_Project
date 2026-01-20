from django.core.management.base import BaseCommand
from academic.models import StudentGrade, Attendance

class Command(BaseCommand):
    help = 'Test calculation of attendance grades'

    def handle(self, *args, **options):
        print("🔍 Starting Grade Calculation Debug...")
        
        grades = StudentGrade.objects.all()[:5]
        if not grades:
            print("⚠️ No StudentGrade records found. Please ensure students are assigned to courses.")
            return

        for grade in grades:
            print(f"\nProcessing Grade for {grade.student.full_name} in {grade.course_offering.subject.name}...")
            
            try:
                # 1. Check Grading Template
                offering = grade.course_offering
                template = offering.grading_template
                if not template:
                    print(f"❌ No Grading Template found for Course {offering}!")
                    continue
                
                print(f"   Template: {template.name}")
                print(f"   Attendance Slots: {template.attendance_slots} (Type: {type(template.attendance_slots)})")
                print(f"   Attendance Weight: {template.attendance_weight} (Type: {type(template.attendance_weight)})")
                
                # 2. Check Attendance Records
                # Debug query
                presence_qs = grade.student.attendance_records.filter(
                    course_offering=grade.course_offering,
                    status=Attendance.AttendanceStatus.PRESENT
                )
                print(f"   Querying Attendance: student={grade.student.id}, course={offering.id}, status=PRESENT")
                present_count = presence_qs.count()
                print(f"   Present Count: {present_count}")
                
                # 3. Calculate
                if template.attendance_slots == 0:
                     print("   ⚠️ Slots is 0. Returning 0.")
                     calc = 0
                else:
                    ratio = present_count / template.attendance_slots
                    weight = float(template.attendance_weight)
                    calc = ratio * weight
                    print(f"   Calculation: ({present_count} / {template.attendance_slots}) * {weight} = {calc}")
                
                print(f"✅ Final Result: {calc}")
                
            except Exception as e:
                print(f"❌ ERROR: {e}")
                import traceback
                traceback.print_exc()
