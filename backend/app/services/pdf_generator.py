import sys
import os
import io
import datetime
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

if getattr(sys, 'frozen', False):
    APP_ROOT = os.path.dirname(sys.executable)
else:
    APP_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

REPORTS_DIR = os.path.join(APP_ROOT, "reports")
DAILY_REPORTS_DIR = os.path.join(REPORTS_DIR, "daily")
MONTHLY_REPORTS_DIR = os.path.join(REPORTS_DIR, "monthly")
RECEIPTS_DIR = os.path.join(REPORTS_DIR, "receipts")

os.makedirs(DAILY_REPORTS_DIR, exist_ok=True)
os.makedirs(MONTHLY_REPORTS_DIR, exist_ok=True)
os.makedirs(RECEIPTS_DIR, exist_ok=True)

DAYS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
MONTHS_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

def format_date_long_fr(d: datetime.date) -> str:
    weekday = DAYS_FR[d.weekday()]
    month = MONTHS_FR[d.month - 1]
    return f"{weekday} {d.day} {month} {d.year}"

def generate_daily_schedule_pdf(schedule_data: Dict[str, Any], output_path: Optional[str] = None) -> bytes:
    """
    Generate a clean, high-resolution daily planning PDF using ReportLab.
    Saves to output_path or returns bytes.
    """
    buffer = io.BytesIO() if output_path is None else open(output_path, "wb")

    doc = SimpleDocTemplate(
        buffer if output_path is None else output_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Colors
    c_primary = colors.HexColor("#4f46e5") # Indigo
    c_dark = colors.HexColor("#0f172a")    # Slate 900
    c_slate = colors.HexColor("#475569")   # Slate 600
    c_light_bg = colors.HexColor("#f8fafc")
    c_emerald = colors.HexColor("#059669")
    c_emerald_bg = colors.HexColor("#ecfdf5")
    c_amber = colors.HexColor("#d97706")

    cell_style = ParagraphStyle('CellText', fontName='Helvetica', fontSize=9, leading=12, textColor=c_dark)
    cell_bold = ParagraphStyle('CellBold', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=c_dark)
    header_cell = ParagraphStyle('HeaderCell', fontName='Helvetica-Bold', fontSize=9, leading=11, textColor=colors.white)

    story = []

    target_date_str = schedule_data.get("date_long_fr", "Demain")
    target_date = schedule_data.get("target_date")
    sessions = schedule_data.get("sessions", [])
    total_sessions = schedule_data.get("total_sessions", len(sessions))
    total_duration_str = schedule_data.get("total_duration_str", "0h00")

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>Maths<font color='#4f46e5'>Prof</font></b>", ParagraphStyle('Logo', fontName='Helvetica-Bold', fontSize=22, textColor=c_dark)),
            Paragraph(f"<b>Planning Quotidien de Cours</b><br/><font size=9 color='#64748b'>Fiche Enseignant • {target_date_str}</font>", ParagraphStyle('RightHeader', fontName='Helvetica', fontSize=12, alignment=2, textColor=c_dark))
        ]
    ]
    header_table = Table(header_data, colWidths=[180, 340])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10)
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceAfter=15))

    # 2. Date Hero Box
    hero_data = [
        [
            Paragraph(f"📅 <b>Programme du {target_date_str}</b>", ParagraphStyle('HeroTitle', fontName='Helvetica-Bold', fontSize=14, textColor=c_dark)),
            Paragraph(f"<b>{total_sessions} séance{'s' if total_sessions > 1 else ''}</b> • <font color='#4f46e5'><b>{total_duration_str}</b> de cours</font>", ParagraphStyle('HeroSub', fontName='Helvetica-Bold', fontSize=11, alignment=2, textColor=c_dark))
        ]
    ]
    hero_table = Table(hero_data, colWidths=[300, 220])
    hero_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
    ]))
    story.append(hero_table)
    story.append(Spacer(1, 15))

    # 3. Sessions Table or Rest Day Card
    if sessions:
        table_data = [[
            Paragraph("Horaire", header_cell),
            Paragraph("Groupe & Niveau", header_cell),
            Paragraph("Effectif", header_cell),
            Paragraph("Salle / Lieu", header_cell),
            Paragraph("Sujet / Chapitre prévu", header_cell),
        ]]

        for s in sessions:
            table_data.append([
                Paragraph(f"<b><font size=10 color='#4f46e5'>{s.get('start_time')} → {s.get('end_time')}</font></b>", cell_bold),
                Paragraph(f"<b>{s.get('group_name')}</b><br/><font size=8 color='#64748b'>{s.get('level', '')}</font>", cell_style),
                Paragraph(f"<b>{s.get('student_count', 0)}</b> élèves", cell_style),
                Paragraph(str(s.get('location', 'Salle 1')), cell_style),
                Paragraph(str(s.get('topic') or '<font color="#94a3b8">Non renseigné</font>'), cell_style),
            ])

        sess_table = Table(table_data, colWidths=[90, 130, 70, 80, 150])
        sess_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), c_primary),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(sess_table)
    else:
        # Rest Day Box
        rest_data = [
            [
                Paragraph(
                    "<font size=16 color='#059669'><b>✅ Aucun cours prévu pour cette journée</b></font><br/><br/>"
                    "<font size=10 color='#475569'>Profitez de votre journée de repos pour vous ressourcer ! 😊</font>",
                    ParagraphStyle('RestStyle', fontName='Helvetica', alignment=1, spaceBefore=10, spaceAfter=10)
                )
            ]
        ]
        rest_table = Table(rest_data, colWidths=[520])
        rest_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_emerald_bg),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 25),
            ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#a7f3d0")),
        ]))
        story.append(rest_table)

    story.append(Spacer(1, 25))

    # 4. Summary Key Metrics Banner
    summary_data = [
        [
            Paragraph(f"<font size=8 color='#64748b'>DATE</font><br/><b><font size=11 color='#0f172a'>{target_date_str}</font></b>", cell_style),
            Paragraph(f"<font size=8 color='#64748b'>SÉANCES PRÉVUES</font><br/><b><font size=11 color='#4f46e5'>{total_sessions} séance(s)</font></b>", cell_style),
            Paragraph(f"<font size=8 color='#64748b'>DURÉE TOTALE</font><br/><b><font size=11 color='#059669'>{total_duration_str}</font></b>", cell_style),
        ]
    ]
    summary_table = Table(summary_data, colWidths=[200, 160, 160])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    story.append(summary_table)

    story.append(Spacer(1, 20))

    # 5. Footer Signature
    footer_text = f"Fiche générée automatiquement par MathsProf le {datetime.datetime.now().strftime('%d/%m/%Y à %H:%M')}."
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=6))
    story.append(Paragraph(footer_text, ParagraphStyle('Footer', fontName='Helvetica-Oblique', fontSize=8, alignment=1, textColor=c_slate)))

    doc.build(story)

    if output_path is None:
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
    else:
        buffer.close()
        return None

def generate_monthly_pdf_report(report_data: Dict[str, Any], output_path: Optional[str] = None) -> bytes:
    """
    Generate a professional PDF report for monthly payments using ReportLab.
    Returns bytes or writes to output_path.
    """
    buffer = io.BytesIO() if output_path is None else open(output_path, "wb")
    
    doc = SimpleDocTemplate(
        buffer if output_path is None else output_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#4f46e5") # Indigo 600
    c_dark = colors.HexColor("#0f172a")    # Slate 900
    c_slate = colors.HexColor("#475569")   # Slate 600
    c_light_bg = colors.HexColor("#f8fafc")
    c_green = colors.HexColor("#059669")   # Emerald 600
    c_green_bg = colors.HexColor("#ecfdf5")
    c_red = colors.HexColor("#dc2626")     # Rose 600
    c_red_bg = colors.HexColor("#fef2f2")

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=c_dark,
        spaceBefore=12,
        spaceAfter=6
    )

    cell_style = ParagraphStyle('CellText', fontName='Helvetica', fontSize=9, leading=11, textColor=c_dark)
    cell_bold = ParagraphStyle('CellTextBold', fontName='Helvetica-Bold', fontSize=9, leading=11, textColor=c_dark)
    header_cell = ParagraphStyle('HeaderCell', fontName='Helvetica-Bold', fontSize=9, leading=11, textColor=colors.white)

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>Maths<font color='#4f46e5'>Prof</font></b>", ParagraphStyle('Logo', fontName='Helvetica-Bold', fontSize=22, textColor=c_dark)),
            Paragraph(f"<b>Rapport Mensuel des Paiements</b><br/><font size=9 color='#64748b'>Mois : {report_data.get('month_name', 'Mois')} | Année : {report_data.get('year', 2026)}</font>", ParagraphStyle('RightHeader', fontName='Helvetica', fontSize=12, alignment=2, textColor=c_dark))
        ]
    ]
    header_table = Table(header_data, colWidths=[200, 320])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10)
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceAfter=15))

    # 2. Key Metrics Cards
    currency = report_data.get("currency", "DT")
    total_students = report_data.get("total_students", 0)
    paid_count = report_data.get("paid_count", 0)
    unpaid_count = report_data.get("unpaid_count", 0)
    total_collected = report_data.get("total_collected", 0.0)
    total_remaining = report_data.get("total_remaining", 0.0)

    kpi_data = [
        [
            Paragraph(f"<font size=8 color='#64748b'>TOTAL ÉLÈVES</font><br/><b><font size=14 color='#0f172a'>{total_students}</font></b>", cell_style),
            Paragraph(f"<font size=8 color='#059669'>AYANT PAYÉ</font><br/><b><font size=14 color='#059669'>{paid_count}</font></b>", cell_style),
            Paragraph(f"<font size=8 color='#dc2626'>EN ATTENTE</font><br/><b><font size=14 color='#dc2626'>{unpaid_count}</font></b>", cell_style),
            Paragraph(f"<font size=8 color='#059669'>ENCAISSÉ</font><br/><b><font size=14 color='#0f172a'>{total_collected:,.0f} {currency}</font></b>", cell_style),
            Paragraph(f"<font size=8 color='#dc2626'>RESTE DÛ</font><br/><b><font size=14 color='#dc2626'>{total_remaining:,.0f} {currency}</font></b>", cell_style),
        ]
    ]
    kpi_table = Table(kpi_data, colWidths=[104, 104, 104, 104, 104])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 15))

    # 3. Section: 🟢 Paiements reçus
    paid_list = report_data.get("paid_students", [])
    story.append(Paragraph(f"🟢 <b>Paiements Reçus ({len(paid_list)})</b>", section_heading))

    if paid_list:
        paid_table_data = [[
            Paragraph("Élève", header_cell),
            Paragraph("Groupe / Niveau", header_cell),
            Paragraph("Montant", header_cell),
            Paragraph("Date", header_cell),
            Paragraph("Mode", header_cell),
            Paragraph("Reçu N°", header_cell),
        ]]
        for s in paid_list:
            paid_table_data.append([
                Paragraph(f"<b>{s.get('name', '')}</b>", cell_style),
                Paragraph(f"{s.get('group', 'Sans groupe')} ({s.get('level', '')})", cell_style),
                Paragraph(f"<b>{s.get('amount', 0):,.0f} {currency}</b>", cell_bold),
                Paragraph(str(s.get('date', '')), cell_style),
                Paragraph(str(s.get('method', 'Espèces')), cell_style),
                Paragraph(f"<font color='#64748b'>{s.get('receipt_number', '---')}</font>", cell_style),
            ])
        paid_table = Table(paid_table_data, colWidths=[130, 110, 75, 75, 65, 65])
        paid_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), c_green),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_green_bg]),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#d1fae5")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(paid_table)
    else:
        story.append(Paragraph("<i>Aucun paiement reçu pour cette période.</i>", cell_style))

    story.append(Spacer(1, 15))

    # 4. Section: 🔴 Paiements en attente
    unpaid_list = report_data.get("unpaid_students", [])
    story.append(Paragraph(f"🔴 <b>Paiements en Attente ({len(unpaid_list)})</b>", section_heading))

    if unpaid_list:
        unpaid_table_data = [[
            Paragraph("Élève", header_cell),
            Paragraph("Groupe / Niveau", header_cell),
            Paragraph("Attendu", header_cell),
            Paragraph("Versé", header_cell),
            Paragraph("Reste à Payer", header_cell),
            Paragraph("Contact Parents", header_cell),
        ]]
        for s in unpaid_list:
            unpaid_table_data.append([
                Paragraph(f"<b>{s.get('name', '')}</b>", cell_style),
                Paragraph(f"{s.get('group', 'Sans groupe')} ({s.get('level', '')})", cell_style),
                Paragraph(f"{s.get('expected', 0):,.0f} {currency}", cell_style),
                Paragraph(f"{s.get('paid', 0):,.0f} {currency}", cell_style),
                Paragraph(f"<b><font color='#dc2626'>{s.get('remaining', 0):,.0f} {currency}</font></b>", cell_bold),
                Paragraph(str(s.get('phone', '---')), cell_style),
            ])
        unpaid_table = Table(unpaid_table_data, colWidths=[130, 110, 70, 70, 75, 65])
        unpaid_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), c_red),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_red_bg]),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#fee2e2")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(unpaid_table)
    else:
        story.append(Paragraph("<i>Tous les élèves ont réglé leur cotisation ce mois-ci ! 👏</i>", cell_style))

    story.append(Spacer(1, 20))

    # 5. Footer Signature
    footer_text = f"Document généré automatiquement par MathsProf le {datetime.date.today().strftime('%d/%m/%Y')}."
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=6))
    story.append(Paragraph(footer_text, ParagraphStyle('Footer', fontName='Helvetica-Oblique', fontSize=8, alignment=1, textColor=c_slate)))

    doc.build(story)

    if output_path is None:
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
    else:
        buffer.close()
        return None

def generate_payment_receipt_pdf(receipt_data: Dict[str, Any], output_path: Optional[str] = None) -> bytes:
    """
    Generate an official, high-resolution payment receipt PDF using ReportLab.
    Saves to output_path or returns PDF bytes.
    """
    buffer = io.BytesIO() if output_path is None else open(output_path, "wb")

    doc = SimpleDocTemplate(
        buffer if output_path is None else output_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    c_primary = colors.HexColor("#4f46e5") # Indigo 600
    c_dark = colors.HexColor("#0f172a")    # Slate 900
    c_slate = colors.HexColor("#475569")   # Slate 600
    c_light_bg = colors.HexColor("#f8fafc")
    c_emerald = colors.HexColor("#059669")
    c_emerald_bg = colors.HexColor("#ecfdf5")
    c_border = colors.HexColor("#e2e8f0")

    cell_style = ParagraphStyle('RCellText', fontName='Helvetica', fontSize=9, leading=13, textColor=c_dark)
    cell_bold = ParagraphStyle('RCellBold', fontName='Helvetica-Bold', fontSize=9, leading=13, textColor=c_dark)
    header_cell = ParagraphStyle('RHeaderCell', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.white)

    story = []

    teacher_name = receipt_data.get("teacher_name", "Professeur de Mathématiques")
    teacher_phone = receipt_data.get("teacher_phone", "")
    school_year = receipt_data.get("school_year", "2025-2026")
    receipt_number = receipt_data.get("receipt_number", "REC-0001")
    payment_date = str(receipt_data.get("date", datetime.date.today()))
    student_name = receipt_data.get("student_name", "Élève")
    student_code = receipt_data.get("student_code", "")
    level = receipt_data.get("level", "---")
    group_name = receipt_data.get("group_name", "---")
    month = receipt_data.get("month", "---")
    amount_paid = float(receipt_data.get("amount_paid", 0.0))
    monthly_price = float(receipt_data.get("monthly_price", amount_paid))
    payment_method = receipt_data.get("payment_method", "Espèces")
    currency = receipt_data.get("currency", "DT")
    status = receipt_data.get("status", "paid")
    notes = receipt_data.get("notes", "")

    # 1. Top Header Banner
    header_table_data = [
        [
            Paragraph("<b>Maths<font color='#4f46e5'>Prof</font></b><br/><font size=9 color='#64748b'>Cours Particuliers & Suivi Pédagogique</font>", ParagraphStyle('RLogo', fontName='Helvetica-Bold', fontSize=22, textColor=c_dark)),
            Paragraph(f"<b>REÇU DE PAIEMENT</b><br/><font size=11 color='#4f46e5'><b>N° {receipt_number}</b></font><br/><font size=8 color='#64748b'>Date : {payment_date}</font>", ParagraphStyle('RTopRight', fontName='Helvetica', fontSize=10, alignment=2, textColor=c_dark))
        ]
    ]
    header_table = Table(header_table_data, colWidths=[280, 235])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10)
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=2, color=c_primary, spaceAfter=15))

    # 2. Teacher & Student Info 2-Column Box
    info_table_data = [
        [
            Paragraph("<b>ÉMIS PAR :</b>", ParagraphStyle('SubH1', fontName='Helvetica-Bold', fontSize=8, textColor=c_primary)),
            Paragraph("<b>DESTINATAIRE / ÉLÈVE :</b>", ParagraphStyle('SubH2', fontName='Helvetica-Bold', fontSize=8, textColor=c_primary))
        ],
        [
            Paragraph(f"<b>{teacher_name}</b><br/><font size=9 color='#475569'>Enseignant de Mathématiques<br/>📞 {teacher_phone}<br/>Année Scolaire : {school_year}</font>", cell_style),
            Paragraph(f"<b>{student_name}</b> <font color='#64748b'>({student_code})</font><br/><font size=9 color='#475569'>Niveau : <b>{level}</b><br/>Groupe : <b>{group_name}</b></font>", cell_style)
        ]
    ]
    info_table = Table(info_table_data, colWidths=[250, 265])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 15))

    # 3. Payment Details Table
    status_label = "🟢 Payé Intégralement" if status == "paid" else ("🟠 Partiel" if status == "partial" else "🔴 En attente")
    details_data = [
        [
            Paragraph("Désignation & Mois Concerné", header_cell),
            Paragraph("Tarif Mensuel", header_cell),
            Paragraph("Mode", header_cell),
            Paragraph("Statut", header_cell),
            Paragraph("Montant Versé", header_cell)
        ],
        [
            Paragraph(f"<b>Cotisation de cours — {month}</b><br/><font size=8 color='#64748b'>{student_name} • {level}</font>", cell_style),
            Paragraph(f"{monthly_price:,.2f} {currency}", cell_style),
            Paragraph(payment_method, cell_style),
            Paragraph(f"<b>{status_label}</b>", cell_style),
            Paragraph(f"<b><font size=10 color='#059669'>{amount_paid:,.2f} {currency}</font></b>", cell_bold)
        ]
    ]
    if notes:
        details_data.append([
            Paragraph(f"<font size=8 color='#64748b'><i>Note : {notes}</i></font>", cell_style),
            Paragraph("", cell_style),
            Paragraph("", cell_style),
            Paragraph("", cell_style),
            Paragraph("", cell_style)
        ])

    details_table = Table(details_data, colWidths=[180, 85, 80, 95, 75])
    details_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
    ]))
    story.append(details_table)
    story.append(Spacer(1, 15))

    # 4. Big Total Box
    total_box_data = [
        [
            Paragraph("<b>MONTANT TOTAL ENCAISSÉ</b><br/><font size=8 color='#065f46'>Paiement certifié & validé</font>", ParagraphStyle('TotLbl', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#065f46"))),
            Paragraph(f"<b>{amount_paid:,.2f} {currency}</b>", ParagraphStyle('TotVal', fontName='Helvetica-Bold', fontSize=18, alignment=2, textColor=c_emerald))
        ]
    ]
    total_table = Table(total_box_data, colWidths=[315, 200])
    total_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_emerald_bg),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 12),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#a7f3d0")),
    ]))
    story.append(total_table)
    story.append(Spacer(1, 25))

    # 5. Signatures and Stamp Block
    sign_data = [
        [
            Paragraph("<font size=8 color='#64748b'><b>Reçu remis à :</b></font><br/><br/><font size=9>L'élève / Responsable légal</font><br/><br/>", cell_style),
            Paragraph(f"<font size=8 color='#64748b'><b>Signature & Cachet :</b></font><br/><br/><font size=9><b>{teacher_name}</b></font><br/><br/>", ParagraphStyle('SigR', fontName='Helvetica', fontSize=9, alignment=2, textColor=c_dark))
        ]
    ]
    sign_table = Table(sign_data, colWidths=[250, 265])
    sign_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sign_table)
    story.append(Spacer(1, 15))

    # 6. Legal / App Footer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=6))
    footer_text = f"Reçu électronique émis par MathsProf le {payment_date}. Ce document tient lieu de justificatif de règlement."
    story.append(Paragraph(footer_text, ParagraphStyle('RFooter', fontName='Helvetica-Oblique', fontSize=8, alignment=1, textColor=c_slate)))

    doc.build(story)

    if output_path is None:
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
    else:
        buffer.close()
        return None
