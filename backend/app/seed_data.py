import datetime
from sqlalchemy.orm import Session
import json
from .models import User, Group, Student, Session as DBSession, Attendance, Payment, StudentNote, CorrectionProject
from .routers.auth import get_password_hash
from .services.correction_ocr import CorrectionOCRService

def init_virgin_database(db: Session):
    """Initialize a virgin database with admin user and default settings (0 students, 0 groups)."""
    if db.query(User).count() == 0:
        teacher = User(
            name="Enseignant",
            email="admin@mathprof.tn",
            password_hash=get_password_hash("password123"),
            phone="+216",
            currency="DT",
            school_year="2025-2026",
            avatar="preset_1"
        )
        db.add(teacher)
        db.commit()
    
    from .models import NotificationSetting
    if db.query(NotificationSetting).count() == 0:
        setting = NotificationSetting(
            whatsapp_phone="+216",
            daily_schedule_time="20:00",
            timezone="Africa/Tunis",
            provider="simulation",
            is_enabled=True
        )
        db.add(setting)
        db.commit()

def seed_database(db: Session, reset: bool = False):
    if reset:
        db.query(Attendance).delete()
        db.query(Payment).delete()
        db.query(StudentNote).delete()
        db.query(DBSession).delete()
        db.query(Student).delete()
        db.query(Group).delete()
        db.query(CorrectionProject).delete()
        db.query(User).delete()
        db.commit()
    elif db.query(User).first() and db.query(Group).first() and db.query(Student).first():
        # Already seeded
        return

    # 1. Admin Teacher User
    teacher = User(
        name="Prof. Mohamed Ben Salem",
        email="admin@mathprof.tn",
        password_hash=get_password_hash("password123"),
        phone="+216 98 123 456",
        currency="DT",
        school_year="2025-2026"
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    # 2. Groups (5 groups across 3 levels)
    groups_data = [
        {
            "name": "Bac Math A",
            "level": "Baccalauréat",
            "subject": "Mathématiques",
            "capacity": 15,
            "schedule": "Samedi 10:00 - 12:00",
            "day_of_week": 5,
            "start_time": "10:00",
            "end_time": "12:00",
            "location": "Salle Principale A",
            "color": "#4f46e5"
        },
        {
            "name": "Bac Math B",
            "level": "Baccalauréat",
            "subject": "Mathématiques",
            "capacity": 15,
            "schedule": "Dimanche 10:00 - 12:00",
            "day_of_week": 6,
            "start_time": "10:00",
            "end_time": "12:00",
            "location": "Salle Principale A",
            "color": "#7c3aed"
        },
        {
            "name": "2ème Sci A",
            "level": "2ème Sciences",
            "subject": "Mathématiques",
            "capacity": 12,
            "schedule": "Mercredi 15:30 - 17:30",
            "day_of_week": 2,
            "start_time": "15:30",
            "end_time": "17:30",
            "location": "Salle B",
            "color": "#0284c7"
        },
        {
            "name": "2ème Sci B",
            "level": "2ème Sciences",
            "subject": "Mathématiques",
            "capacity": 12,
            "schedule": "Vendredi 17:00 - 19:00",
            "day_of_week": 4,
            "start_time": "17:00",
            "end_time": "19:00",
            "location": "Salle B",
            "color": "#0d9488"
        },
        {
            "name": "9ème Base A",
            "level": "9ème Année",
            "subject": "Mathématiques",
            "capacity": 10,
            "schedule": "Samedi 15:00 - 16:30",
            "day_of_week": 5,
            "start_time": "15:00",
            "end_time": "16:30",
            "location": "Salle C",
            "color": "#d97706"
        },
    ]

    created_groups = []
    for g_data in groups_data:
        g = Group(user_id=teacher.id, **g_data)
        db.add(g)
        created_groups.append(g)
    db.commit()
    for g in created_groups:
        db.refresh(g)

    # 3. 30 Realistic Students
    students_data = [
        # Bac Math A (8 students)
        ("Ahmed", "Ben Ali", "Baccalauréat", "+216 22 111 001", "+216 98 111 001", "+216 55 111 001", 90.0, created_groups[0].id, "Élève sérieux, bonne intuition mathématique"),
        ("Mariem", "Trabelsi", "Baccalauréat", "+216 22 111 002", "+216 98 111 002", "+216 55 111 002", 90.0, created_groups[0].id, "Excellents résultats en analyse et complexes"),
        ("Yassine", "Mansour", "Baccalauréat", "+216 22 111 003", "+216 98 111 003", "+216 55 111 003", 90.0, created_groups[0].id, "Doit faire plus d'exercices sur les probabilités"),
        ("Nour", "Jaziri", "Baccalauréat", "+216 22 111 004", "+216 98 111 004", "+216 55 111 004", 90.0, created_groups[0].id, "Très attentive et appliquée"),
        ("Khalil", "Dridi", "Baccalauréat", "+216 22 111 005", "+216 98 111 005", "+216 55 111 005", 90.0, created_groups[0].id, "Participe activement au cours"),
        ("Aya", "Sassi", "Baccalauréat", "+216 22 111 006", "+216 98 111 006", "+216 55 111 006", 90.0, created_groups[0].id, "Niveau solide en géométrie spatiale"),
        ("Aziz", "Gharbi", "Baccalauréat", "+216 22 111 007", "+216 98 111 007", "+216 55 111 007", 90.0, created_groups[0].id, "Bonne rigueur rédactionnelle"),
        ("Salma", "Khemir", "Baccalauréat", "+216 22 111 008", "+216 98 111 008", "+216 55 111 008", 90.0, created_groups[0].id, "A besoin d'approfondir les limites et continuités"),
        
        # Bac Math B (6 students)
        ("Farouk", "Bouazizi", "Baccalauréat", "+216 22 111 009", "+216 98 111 009", "+216 55 111 009", 90.0, created_groups[1].id, "Progression constante sur les équations différentielles"),
        ("Ines", "Chaabane", "Baccalauréat", "+216 22 111 010", "+216 98 111 010", "+216 55 111 010", 90.0, created_groups[1].id, "Très méthodique dans la résolution des problèmes"),
        ("Omar", "Riahi", "Baccalauréat", "+216 22 111 011", "+216 98 111 011", "+216 55 111 011", 90.0, created_groups[1].id, "Doit être plus régulier dans ses devoirs"),
        ("Rania", "Ayari", "Baccalauréat", "+216 22 111 012", "+216 98 111 012", "+216 55 111 012", 90.0, created_groups[1].id, "Excellente compréhension des fonctions réciproques"),
        ("Mohamed Amine", "Toumi", "Baccalauréat", "+216 22 111 013", "+216 98 111 013", "+216 55 111 013", 90.0, created_groups[1].id, "Capacité de calcul mental remarquable"),
        ("Syrine", "Belhadj", "Baccalauréat", "+216 22 111 014", "+216 98 111 014", "+216 55 111 014", 90.0, created_groups[1].id, "Progrès notables en arithmétique"),

        # 2ème Sci A (6 students)
        ("Houssem", "Mathlouthi", "2ème Sciences", "+216 22 111 015", "+216 98 111 015", "+216 55 111 015", 80.0, created_groups[2].id, "Bonne base en polynômes"),
        ("Chaima", "Hamdi", "2ème Sciences", "+216 22 111 016", "+216 98 111 016", "+216 55 111 016", 80.0, created_groups[2].id, "Très bon sens de l'observation géométrique"),
        ("Rayen", "Zaidi", "2ème Sciences", "+216 22 111 017", "+216 98 111 017", "+216 55 111 017", 80.0, created_groups[2].id, "Doit réviser la trigonométrie"),
        ("Eya", "Mejri", "2ème Sciences", "+216 22 111 018", "+216 98 111 018", "+216 55 111 018", 80.0, created_groups[2].id, "Travail soigné et régulier"),
        ("Hamza", "Trabelsi", "2ème Sciences", "+216 22 111 019", "+216 98 111 019", "+216 55 111 019", 80.0, created_groups[2].id, "Dynamique et curieux"),
        ("Mayssa", "Ben Salem", "2ème Sciences", "+216 22 111 020", "+216 98 111 020", "+216 55 111 020", 80.0, created_groups[2].id, "Bonne maîtrise des vecteurs"),

        # 2ème Sci B (5 students)
        ("Adem", "Guesmi", "2ème Sciences", "+216 22 111 021", "+216 98 111 021", "+216 55 111 021", 80.0, created_groups[3].id, "Besoin d'aide pour le calcul barycentrique"),
        ("Emna", "Driss", "2ème Sciences", "+216 22 111 022", "+216 98 111 022", "+216 55 111 022", 80.0, created_groups[3].id, "Très motivée"),
        ("Bilel", "Yahiaoui", "2ème Sciences", "+216 22 111 023", "+216 98 111 023", "+216 55 111 023", 80.0, created_groups[3].id, "À l'aise avec les systèmes d'équations"),
        ("Molka", "Cherif", "2ème Sciences", "+216 22 111 024", "+216 98 111 024", "+216 55 111 024", 80.0, created_groups[3].id, "Devoirs toujours bien rédigés"),
        ("Wassim", "Baccouche", "2ème Sciences", "+216 22 111 025", "+216 98 111 025", "+216 55 111 025", 80.0, created_groups[3].id, "Bon potentiel, manque un peu de concentration"),

        # 9ème Base A (5 students)
        ("Ons", "Jlassi", "9ème Année", "+216 22 111 026", "+216 98 111 026", "+216 55 111 026", 70.0, created_groups[4].id, "Excellents résultats sur le théorème de Thalès"),
        ("Karim", "Zouari", "9ème Année", "+216 22 111 027", "+216 98 111 027", "+216 55 111 027", 70.0, created_groups[4].id, "Doit perfectionner le calcul littéral et factorisation"),
        ("Hiba", "Fakhfakh", "9ème Année", "+216 22 111 028", "+216 98 111 028", "+216 55 111 028", 70.0, created_groups[4].id, "Très bon travail en géométrie"),
        ("Mehdi", "Rebai", "9ème Année", "+216 22 111 029", "+216 98 111 029", "+216 55 111 029", 70.0, created_groups[4].id, "Participation active"),
        ("Zeineb", "Mahjoub", "9ème Année", "+216 22 111 030", "+216 98 111 030", "+216 55 111 030", 70.0, created_groups[4].id, "Très sérieuse et régulière"),
    ]

    created_students = []
    current_year = datetime.date.today().year
    for idx, s_info in enumerate(students_data, 1):
        code = f"{current_year}-{idx:03d}"
        st = Student(
            user_id=teacher.id,
            student_code=code,
            first_name=s_info[0],
            last_name=s_info[1],
            level=s_info[2],
            student_phone=s_info[3],
            father_phone=s_info[4],
            mother_phone=s_info[5],
            monthly_price=s_info[6],
            group_id=s_info[7],
            registration_date=datetime.date(2025, 9, 15) if idx <= 25 else datetime.date.today(),
            notes=s_info[8],
            is_active=True
        )
        db.add(st)
        created_students.append(st)
    db.commit()
    for s in created_students:
        db.refresh(s)

    # 4. Pedagogical Notes for some students
    notes_sample = [
        (created_students[0].id, "Ahmed a besoin de travailler davantage les fonctions exponentielles."),
        (created_students[0].id, "Excellente note (18.5/20) au devoir de contrôle n°1."),
        (created_students[1].id, "Mariem : Très bon niveau, prête pour le concours de révision."),
        (created_students[2].id, "Yassine : Progrès constants sur les suites arithmétiques."),
        (created_students[26].id, "Karim : Soutien particulier accordé sur les équations du 1er degré."),
    ]
    for st_id, note_txt in notes_sample:
        db.add(StudentNote(student_id=st_id, content=note_txt))
    db.commit()

    # 5. Sessions (Past with attendance, Today's sessions, Upcoming)
    today = datetime.date.today()
    sessions_to_create = [
        # Past session 1 (Bac Math A)
        {
            "group_id": created_groups[0].id,
            "date": today - datetime.timedelta(days=7),
            "start_time": "10:00",
            "end_time": "12:00",
            "topic": "Fonctions Logarithmes & Continuité",
            "location": "Salle Principale A",
            "notes": "Cours magistral et résolution de la série d'exercices n°3",
            "status": "completed"
        },
        # Past session 2 (2ème Sci A)
        {
            "group_id": created_groups[2].id,
            "date": today - datetime.timedelta(days=3),
            "start_time": "15:30",
            "end_time": "17:30",
            "topic": "Polynômes du second degré & Factorisation",
            "location": "Salle B",
            "notes": "Exercices d'application directe",
            "status": "completed"
        },
        # Today's Session 1 (Bac Math A)
        {
            "group_id": created_groups[0].id,
            "date": today,
            "start_time": "17:00",
            "end_time": "18:30",
            "topic": "Nombres Complexes - Forme trigonométrique et exponentielle",
            "location": "Salle Principale A",
            "notes": "Préparation aux exercices de type Bac",
            "status": "scheduled"
        },
        # Today's Session 2 (9ème Base A)
        {
            "group_id": created_groups[4].id,
            "date": today,
            "start_time": "18:30",
            "end_time": "20:00",
            "topic": "Théorème de Thalès & Réciproque",
            "location": "Salle C",
            "notes": "Séance pratique avec figures géométriques",
            "status": "scheduled"
        },
        # Upcoming Session (Bac Math B)
        {
            "group_id": created_groups[1].id,
            "date": today + datetime.timedelta(days=1),
            "start_time": "10:00",
            "end_time": "12:00",
            "topic": "Géométrie dans l'espace & Produit scalaire",
            "location": "Salle Principale A",
            "notes": "Représentation 3D",
            "status": "scheduled"
        },
        # Upcoming Session (2ème Sci B)
        {
            "group_id": created_groups[3].id,
            "date": today + datetime.timedelta(days=5),
            "start_time": "17:00",
            "end_time": "19:00",
            "topic": "Trigonométrie & Formules d'addition",
            "location": "Salle B",
            "notes": "Série 4",
            "status": "scheduled"
        }
    ]

    created_sessions = []
    for s_dict in sessions_to_create:
        s_obj = DBSession(user_id=teacher.id, **s_dict)
        db.add(s_obj)
        created_sessions.append(s_obj)
    db.commit()
    for s_obj in created_sessions:
        db.refresh(s_obj)

    # 6. Attendances for past sessions
    # Past session 1 (Bac Math A - 8 students)
    bac_a_students = [s for s in created_students if s.group_id == created_groups[0].id]
    for idx, st in enumerate(bac_a_students):
        status = "present"
        if idx == 2:
            status = "absent"
        elif idx == 7:
            status = "late"
        db.add(Attendance(session_id=created_sessions[0].id, student_id=st.id, status=status))

    # Past session 2 (2ème Sci A - 6 students)
    sci_a_students = [s for s in created_students if s.group_id == created_groups[2].id]
    for idx, st in enumerate(sci_a_students):
        status = "present"
        if idx == 4:
            status = "late"
        db.add(Attendance(session_id=created_sessions[1].id, student_id=st.id, status=status))
    db.commit()

    # 7. Payments History
    months_to_seed = ["Septembre 2025", "Octobre 2025", "Novembre 2025"]
    current_month_str = "Novembre 2025"
    
    pay_count = 1
    for st in created_students:
        # Septembre: mostly paid
        if st.id % 10 != 0:
            db.add(Payment(
                student_id=st.id,
                month="Septembre 2025",
                amount=st.monthly_price,
                payment_date=datetime.date(2025, 9, 20),
                payment_method="Espèces" if st.id % 2 == 0 else "Virement",
                status="paid",
                receipt_number=f"REC-2025-{pay_count:04d}",
                notes="Règlement ponctuel"
            ))
            pay_count += 1

        # Octobre: 85% paid
        if st.id % 5 != 0:
            db.add(Payment(
                student_id=st.id,
                month="Octobre 2025",
                amount=st.monthly_price,
                payment_date=datetime.date(2025, 10, 18),
                payment_method="Espèces",
                status="paid",
                receipt_number=f"REC-2025-{pay_count:04d}",
                notes=""
            ))
            pay_count += 1
        elif st.id % 3 == 0:
            # Partial payment
            db.add(Payment(
                student_id=st.id,
                month="Octobre 2025",
                amount=st.monthly_price / 2,
                payment_date=datetime.date(2025, 10, 25),
                payment_method="Espèces",
                status="partial",
                receipt_number=f"REC-2025-{pay_count:04d}",
                notes="Acompte versé, solde à la prochaine séance"
            ))
            pay_count += 1

        # Novembre (Current month): 60% paid
        if st.id % 2 == 0:
            db.add(Payment(
                student_id=st.id,
                month="Novembre 2025",
                amount=st.monthly_price,
                payment_date=datetime.date(2025, 11, 10),
                payment_method="Virement" if st.id % 4 == 0 else "Espèces",
                status="paid",
                receipt_number=f"REC-2025-{pay_count:04d}",
                notes=""
            ))
        pay_count += 1

    # 6. Sample Initial Correction Projects
    if db.query(CorrectionProject).count() == 0:
        templates = CorrectionOCRService.get_template_exams()
        for t in templates[:2]:
            db.add(CorrectionProject(
                user_id=teacher.id,
                title=t["title"],
                subject="Mathématiques",
                level=t["level"],
                chapter=t["chapter"],
                teacher_name="Prof. Mohamed Ben Salem",
                school_name="Académie des Sciences Mathématiques",
                exam_date=datetime.date.today().strftime("%d/%m/%Y"),
                detail_level=t["detail_level"],
                language=t["language"],
                handwriting_style="style_a_classique",
                paper_style="squared_5mm",
                color_primary="#1e3a8a",
                color_correction="#dc2626",
                color_secondary="#16a34a",
                color_header="#0f172a",
                structured_data=json.dumps(t["exercises"], ensure_ascii=False),
                status="completed"
            ))

    db.commit()
    print("Database successfully seeded with 30 students, 5 groups, sessions, attendance, payments & corrections!")

