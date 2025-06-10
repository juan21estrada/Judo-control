import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const pdfService = {
  // Exportar estadísticas básicas a PDF
  async exportarEstadisticasPDF(elementId, filename = 'estadisticas.pdf') {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento no encontrado');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30; // Espacio para el título
      
      // Agregar título
      pdf.setFontSize(16);
      pdf.text('Reporte de Estadísticas de Judo', pdfWidth / 2, 20, { align: 'center' });
      
      // Agregar fecha
      pdf.setFontSize(10);
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pdfWidth / 2, 25, { align: 'center' });
      
      // Agregar imagen
      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      
      pdf.save(filename);
      return true;
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  },

  // Exportar análisis avanzado a PDF
  async exportarAnalisisAvanzadoPDF(elementId, competidorNombre, filename = 'analisis-avanzado.pdf') {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento no encontrado');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        height: element.scrollHeight,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calcular si necesitamos múltiples páginas
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      
      let yPosition = 0;
      let pageHeight = pdfHeight - 40; // Espacio para header
      
      // Primera página con título
      pdf.setFontSize(16);
      pdf.text('Análisis Avanzado de Rendimiento', pdfWidth / 2, 20, { align: 'center' });
      
      if (competidorNombre) {
        pdf.setFontSize(12);
        pdf.text(`Competidor: ${competidorNombre}`, pdfWidth / 2, 30, { align: 'center' });
      }
      
      pdf.setFontSize(10);
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pdfWidth / 2, 35, { align: 'center' });
      
      // Agregar imagen (puede ser en múltiples páginas)
      while (yPosition < scaledHeight) {
        const remainingHeight = scaledHeight - yPosition;
        const currentPageHeight = Math.min(pageHeight, remainingHeight);
        
        pdf.addImage(
          imgData,
          'PNG',
          0,
          40 - yPosition * ratio,
          pdfWidth,
          scaledHeight
        );
        
        yPosition += currentPageHeight;
        
        if (yPosition < scaledHeight) {
          pdf.addPage();
        }
      }
      
      pdf.save(filename);
      return true;
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  }
};

export default pdfService;