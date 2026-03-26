# Student Upload CSV Format

## Required Columns (updated after validation fix)

| Column | Description | Required |
|--------|-------------|----------|
| `national_id` | Student's national ID number | ✓ Yes |
| `full_name` | Student's full name in Arabic | ✓ Yes |
| `email` | Student's email address | Optional |
| `department` | Department name (must match UI selection) | ✓ Yes |
| `level` | Academic level (must match UI selection) | ✓ Yes |

## Department Values

Use one of these exact values in the `department` column:

| Value | Arabic Name |
|-------|-------------|
| `Civil` | الهندسة المدنية |
| `Architecture` | الهندسة المعمارية |
| `Electrical` | الهندسة الكهربائية |
| `PREPARATORY` | الفرقة الإعدادية |

## Level Values

Use one of these exact values in the `level` column:

| Value | Arabic Name |
|-------|-------------|
| `PREPARATORY` | الفرقة الإعدادية |
| `FIRST` | الفرقة الأولى |
| `SECOND` | الفرقة الثانية |
| `THIRD` | الفرقة الثالثة |
| `FOURTH` | الفرقة الرابعة |

## Sample Files - All Departments & Levels

### Preparatory Year
- `sample_prep_year.csv` - Preparatory Year

### Civil Engineering
- `sample_civil_first.csv` - Civil Engineering, First Year
- `sample_civil_second.csv` - Civil Engineering, Second Year
- `sample_civil_third.csv` - Civil Engineering, Third Year
- `sample_civil_fourth.csv` - Civil Engineering, Fourth Year

### Architecture
- `sample_architecture_first.csv` - Architecture, First Year
- `sample_architecture_second.csv` - Architecture, Second Year
- `sample_architecture_third.csv` - Architecture, Third Year
- `sample_architecture_fourth.csv` - Architecture, Fourth Year

### Electrical Engineering - Communications (ECE)
- `sample_ece_second.csv` - Electrical Communications, Second Year
- `sample_ece_third.csv` - Electrical Communications, Third Year
- `sample_ece_fourth.csv` - Electrical Communications, Fourth Year

### Electrical Engineering - Power (EPM)
- `sample_epm_second.csv` - Electrical Power, Second Year
- `sample_epm_third.csv` - Electrical Power, Third Year
- `sample_epm_fourth.csv` - Electrical Power, Fourth Year

## Specialization Column (Optional)

For Electrical Engineering students in years 2-4, you can optionally include a `specialization` column:

| Value | Description |
|-------|-------------|
| `ECE` | Communications Engineering (اتصالات) |
| `EPM` | Power & Machines (قوى وآلات) |

### ⚠️ Important Notes:
1. **The `specialization` column is NOT required** - specialization is selected from the UI dropdown
2. If the CSV includes a `specialization` column, it **must match** the specialization selected in the UI
3. If there's a mismatch, the upload will be rejected with an error message
4. Files without the `specialization` column will use the UI selection for all students

## Validation Rules

1. The `department` column in CSV must match the department selected in the UI dropdown
2. The `level` column in CSV must match the level selected in the UI dropdown
3. If `specialization` column exists, it must match the specialization selected in the UI dropdown
4. Files without required columns will be rejected
5. Mismatched data will show an error in the preview step

## Example Row

```csv
national_id,full_name,email,department,level
29803150100101,أحمد محمد علي,ahmed@example.com,Civil,FIRST
```
