/**
 * Export Manager Service
 * Manages high-definition print-ready PDF export (300 DPI),
 * PNG image page rendering, and native print formatting.
 */

class ExportManager {
  /**
   * Triggers server-side high-resolution PDF download
   */
  static downloadServerPdf(projectId, filename = "Correction_Mathematiques.pdf") {
    const downloadUrl = `/api/corrections/${projectId}/export-pdf`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Client-side high-res PNG export of the A4 canvas sheet
   */
  static async exportToPng(elementId = "a4-correction-sheet", filename = "correction_page.png") {
    const el = document.getElementById(elementId);
    if (!el) {
      if (window.app && window.app.showToast) window.app.showToast("Feuille de correction introuvable", "error");
      return;
    }

    if (!window.html2canvas) {
      if (window.app && window.app.showToast) window.app.showToast("Moteur html2canvas indisponible", "error");
      return;
    }

    try {
      if (window.app && window.app.showToast) window.app.showToast("Génération de l'image haute définition en cours...", "info");
      
      const canvas = await window.html2canvas(el, {
        scale: 2, // 2x high DPI rendering
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (window.app && window.app.showToast) window.app.showToast("Image PNG téléchargée avec succès !", "success");
    } catch (err) {
      console.error("Export PNG error:", err);
      if (window.app && window.app.showToast) window.app.showToast("Erreur lors de l'export PNG", "error");
    }
  }

  /**
   * Opens standard browser print dialog optimized for A4 paper
   */
  static printSheet() {
    window.print();
  }
}

window.ExportManager = ExportManager;
