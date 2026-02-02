#!/usr/bin/env python3
"""
Script pour générer un PDF du Manuel Utilisateur Expert
Utilise reportlab pour créer un document PDF professionnel
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from datetime import datetime
import os

# Données du manuel (structure simplifiée)
CHAPTERS = [
    {
        "title": "Tableau de Bord",
        "subtitle": "Le Centre de Pilotage Stratégique",
        "description": "Votre tableau de bord est le cœur opérationnel de Cabinet 360.",
        "sections": [
            {
                "title": "Fonctions Principales",
                "items": [
                    {
                        "name": "Bouton 'Nouveau Dossier'",
                        "function": "Permet d'initier la création d'une nouvelle fiche client ou mission complexe.",
                        "result": "Ouvre un formulaire de création assistée par IA."
                    },
                    {
                        "name": "Bouton 'Scanner Pièce'",
                        "function": "Active le module d'OCR pour numériser des pièces comptables.",
                        "result": "Les données sont extraites automatiquement pour pré-saisie."
                    }
                ]
            }
        ]
    },
    {
        "title": "Clients (CRM 360°)",
        "subtitle": "Gestion de la Relation Client",
        "description": "Un CRM conçu spécifiquement pour les experts-comptables.",
        "sections": [
            {
                "title": "Interface de Gestion",
                "items": [
                    {
                        "name": "Sélecteur de Vue",
                        "function": "Alterne entre une vue visuelle par cartes et une vue tabulaire.",
                        "result": "Optimise l'affichage selon le volume de clients."
                    }
                ]
            }
        ]
    }
]

def create_pdf(filename="Manuel_Expert_Cabinet360.pdf"):
    """Crée le PDF du manuel utilisateur"""
    
    # Création du document
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Style personnalisé pour le titre principal
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Style pour les chapitres
    chapter_style = ParagraphStyle(
        'ChapterTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#312E81'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    # Style pour les sous-titres
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#6366F1'),
        spaceAfter=10,
        fontName='Helvetica-Bold'
    )
    
    # Style pour les sections
    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#4338CA'),
        spaceAfter=8,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    # Style pour le corps de texte
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        alignment=TA_JUSTIFY,
        spaceAfter=6
    )
    
    # Contenu du PDF
    story = []
    
    # Page de couverture
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("MANUEL UTILISATEUR", title_style))
    story.append(Paragraph("Cabinet 360 - Expert OHADA", subtitle_style))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph(f"Généré le {datetime.now().strftime('%d/%m/%Y')}", body_style))
    story.append(Paragraph("Version 2.0.0", body_style))
    story.append(PageBreak())
    
    # Table des matières
    story.append(Paragraph("TABLE DES MATIÈRES", chapter_style))
    story.append(Spacer(1, 0.5*cm))
    
    for idx, chapter in enumerate(CHAPTERS, 1):
        toc_entry = f"{idx}. {chapter['title']}"
        story.append(Paragraph(toc_entry, body_style))
    
    story.append(PageBreak())
    
    # Chapitres
    for idx, chapter in enumerate(CHAPTERS, 1):
        # Titre du chapitre
        story.append(Paragraph(f"Chapitre {idx}: {chapter['title']}", chapter_style))
        story.append(Paragraph(chapter['subtitle'], subtitle_style))
        story.append(Paragraph(chapter['description'], body_style))
        story.append(Spacer(1, 0.5*cm))
        
        # Sections
        for section in chapter['sections']:
            story.append(Paragraph(section['title'], section_style))
            story.append(Spacer(1, 0.3*cm))
            
            # Items
            for item in section['items']:
                # Nom de la fonction
                story.append(Paragraph(f"<b>{item['name']}</b>", body_style))
                
                # Fonctionnalité
                story.append(Paragraph(f"<i>Fonctionnalité:</i> {item['function']}", body_style))
                
                # Résultat
                result_style = ParagraphStyle(
                    'Result',
                    parent=body_style,
                    textColor=colors.HexColor('#10B981'),
                    leftIndent=10
                )
                story.append(Paragraph(f"<b>✓ Résultat:</b> {item['result']}", result_style))
                story.append(Spacer(1, 0.4*cm))
        
        story.append(PageBreak())
    
    # Pied de page
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER
    )
    story.append(Paragraph("© 2026 Cabinet 360 - Tous droits réservés", footer_style))
    
    # Construction du PDF
    doc.build(story)
    print(f"✓ PDF généré avec succès: {filename}")
    return filename

if __name__ == "__main__":
    # Vérifier si reportlab est installé
    try:
        import reportlab
        pdf_file = create_pdf()
        print(f"\n📄 Le manuel PDF est disponible: {os.path.abspath(pdf_file)}")
    except ImportError:
        print("❌ Erreur: reportlab n'est pas installé.")
        print("   Installez-le avec: pip install reportlab")
