"""
PDF Export Service — ReportLab A4 Print-Ready Generator
Produces clean, structured multi-page PDF documents with customizable teacher headers,
exercise demarcation, step boxes, and pedagogical formatting.
"""

import os
import io
import json
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Adds 'Page X sur Y' and teacher footer dynamically."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Bottom footer
        page_text = f"Page {self._pageNumber} sur {page_count}"
        self.drawRightString(A4[0] - 2 * cm, 1.2 * cm, page_text)
        self.drawString(2 * cm, 1.2 * cm, "MathsProf — Plateforme Pédagogique de Correction Manuscrite")
        
        # Thin footer line
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(2 * cm, 1.6 * cm, A4[0] - 2 * cm, 1.6 * cm)
        
        self.restoreState()

class PDFExportService:
    """
    Generates high-definition A4 PDF documents ready for printing and distribution.
    """

    @classmethod
    def generate_correction_pdf(cls, project_data: Dict[str, Any]) -> bytes:
        """Builds the complete PDF document and returns bytes."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=1.8 * cm,
            rightMargin=1.8 * cm,
            topMargin=1.8 * cm,
            bottomMargin=2.2 * cm
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        header_title_style = ParagraphStyle(
            'HeaderTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor(project_data.get('color_header', '#0f172a')),
            alignment=1 # Center
        )
        
        header_subtitle_style = ParagraphStyle(
            'HeaderSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569'),
            alignment=1
        )
        
        exercise_title_style = ParagraphStyle(
            'ExerciseTitle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor(project_data.get('color_primary', '#1e3a8a')),
            spaceBefore=12,
            spaceAfter=4
        )
        
        question_title_style = ParagraphStyle(
            'QuestionTitle',
            parent=styles['Heading3'],
            fontName='Helvetica-Bold',
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=8,
            spaceAfter=3
        )
        
        step_title_style = ParagraphStyle(
            'StepTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=12,
            textColor=colors.HexColor(project_data.get('color_secondary', '#16a34a'))
        )
        
        step_content_style = ParagraphStyle(
            'StepContent',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor(project_data.get('color_primary', '#1e3a8a'))
        )
        
        result_box_style = ParagraphStyle(
            'ResultBox',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor(project_data.get('color_correction', '#dc2626'))
        )

        elements = []

        # --- 1. Teacher & Exam Header Banner ---
        teacher_name = project_data.get('teacher_name', 'Prof. Mohamed')
        school_name = project_data.get('school_name', 'Académie des Sciences Mathématiques')
        title = project_data.get('title', 'Correction d\'Examen de Mathématiques')
        level = project_data.get('level', 'Bac')
        chapter = project_data.get('chapter', 'Analyse & Algèbre')
        exam_date = project_data.get('exam_date', '2026')

        header_table_data = [
            [
                Paragraph(f"<b>{school_name}</b><br/>Enseignant : {teacher_name}", ParagraphStyle('LeftHead', parent=styles['Normal'], fontSize=8.5, leading=11, textColor=colors.HexColor('#334155'))),
                Paragraph(f"<b>Classe :</b> {level}<br/><b>Date :</b> {exam_date}", ParagraphStyle('RightHead', parent=styles['Normal'], fontSize=8.5, leading=11, textColor=colors.HexColor('#334155'), alignment=2))
            ]
        ]
        header_table = Table(header_table_data, colWidths=[9 * cm, 8.4 * cm])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        elements.append(header_table)
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceBefore=3, spaceAfter=8))

        # Title block
        elements.append(Paragraph(title, header_title_style))
        if chapter:
            elements.append(Spacer(1, 2))
            elements.append(Paragraph(f"Chapitre : {chapter}", header_subtitle_style))
        
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor(project_data.get('color_primary', '#1e3a8a')), spaceBefore=2, spaceAfter=12))

        # --- 2. Structured Exercises & Questions ---
        structured_raw = project_data.get('structured_data', '[]')
        try:
            exercises = json.loads(structured_raw) if isinstance(structured_raw, str) else structured_raw
        except Exception:
            exercises = []

        for ex in exercises:
            ex_title = ex.get('title', f"Exercice {ex.get('exercise_number', 1)}")
            ex_points = ex.get('points', '')
            ex_statement = ex.get('statement', '')

            ex_head_text = f"{ex_title} {f'({ex_points})' if ex_points else ''}"
            elements.append(Paragraph(ex_head_text, exercise_title_style))
            
            if ex_statement:
                elements.append(Paragraph(f"<i>Énoncé : {ex_statement}</i>", ParagraphStyle('Statement', parent=styles['Normal'], fontSize=8.5, leading=12, textColor=colors.HexColor('#64748b'))))
                elements.append(Spacer(1, 4))

            for q in ex.get('questions', []):
                q_num = q.get('question_number', '')
                q_text = q.get('question_text', '')
                
                elements.append(Paragraph(f"<b>{q_num}</b> {q_text}", question_title_style))

                # Steps container
                for step in q.get('steps', []):
                    step_title = step.get('title', '')
                    step_content = step.get('content', '').replace('\n', '<br/>')
                    latex = step.get('latex', '')
                    step_type = step.get('type', 'calculation')

                    step_box_data = [
                        [Paragraph(f"<b>{step_title}</b>", step_title_style)],
                        [Paragraph(step_content, step_content_style)]
                    ]
                    
                    if latex:
                        clean_latex = latex.replace('$$', '').replace('$', '')
                        step_box_data.append([Paragraph(f"<b>Formule / Résultat :</b> <i>{clean_latex}</i>", result_box_style)])

                    bg_color = colors.HexColor("#f8fafc") if step_type != "result" else colors.HexColor("#f0fdf4")
                    border_color = colors.HexColor("#e2e8f0") if step_type != "result" else colors.HexColor("#86efac")

                    step_table = Table(step_box_data, colWidths=[17.4 * cm])
                    step_table.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,-1), bg_color),
                        ('BOX', (0,0), (-1,-1), 0.75, border_color),
                        ('PADDING', (0,0), (-1,-1), 5),
                        ('TOPPADDING', (0,0), (-1,-1), 4),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                    ]))
                    
                    elements.append(step_table)
                    elements.append(Spacer(1, 4))

                elements.append(Spacer(1, 6))

            elements.append(Spacer(1, 8))

        doc.build(elements, canvasmaker=NumberedCanvas)
        return buffer.getvalue()
