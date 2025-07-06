import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

export const pdfService = {
  // Exportar estadísticas básicas a PDF con contenido estructurado
  async exportarEstadisticasPDF(datos, titulo = 'Reporte de Estadísticas de Judo', filename = 'estadisticas.pdf') {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;
      
      // Configurar fuentes
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text(titulo, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Si los datos son estadísticas generales
      if (datos.estadisticas_generales) {
        yPosition = this.agregarEstadisticasGenerales(pdf, datos.estadisticas_generales, yPosition);
      }
      
      // Si los datos incluyen competidores
      if (datos.competidores && datos.competidores.length > 0) {
        yPosition = await this.agregarTablaCompetidores(pdf, datos.competidores, yPosition + 30);
      }
      
      // Si los datos incluyen técnicas más usadas
      if (datos.tecnicas_mas_usadas && datos.tecnicas_mas_usadas.length > 0) {
        yPosition = await this.agregarTablaTecnicas(pdf, datos.tecnicas_mas_usadas, yPosition + 30);
      }
      
      pdf.save(filename);
      return true;
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  },

  // Función auxiliar para agregar estadísticas generales
  agregarEstadisticasGenerales(pdf, estadisticas, yPosition) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Estadísticas Generales', 20, yPosition);
    
    yPosition += 15;
    
    // Crear tabla para estadísticas generales
    const statsData = [
      ['Total de Competidores', String(estadisticas.total_competidores || 0)],
      ['Total de Combates', String(estadisticas.total_combates || 0)],
      ['Total de Técnicas', String(estadisticas.total_tecnicas || 0)],
      ['Técnicas Efectivas', String(estadisticas.tecnicas_efectivas || 0)],
      ['Porcentaje de Efectividad', `${estadisticas.porcentaje_efectividad || 0}%`]
    ];
    
    autoTable(pdf, {
      startY: yPosition,
      head: [['Estadística', 'Valor']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'center' }
      },
      margin: { left: 20, bottom: 15 }
    });
    
    return pdf.lastAutoTable.finalY + 20;
  },

  // Función auxiliar para agregar tabla de competidores
  async agregarTablaCompetidores(pdf, competidores, yPosition) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Ranking de Competidores', 20, yPosition);
    const tableData = competidores.slice(0, 10).map((comp, index) => [
      index + 1,
      comp.nombre || 'N/A',
      comp.total_combates || 0,
      comp.combates_ganados || 0,
      comp.tecnicas_efectivas || 0,
      `${comp.porcentaje_efectividad || 0}%`
    ]);
    
    autoTable(pdf, {
      startY: yPosition + 10,
      head: [['#', 'Nombre', 'Combates', 'Ganados', 'Téc. Efectivas', 'Efectividad']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 30 },
        5: { halign: 'center', cellWidth: 25 }
      }
    });
    
    return pdf.lastAutoTable.finalY;
  },

  // Función auxiliar para agregar tabla de técnicas
  async agregarTablaTecnicas(pdf, tecnicas, yPosition) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Técnicas Más Utilizadas', 20, yPosition);
    const tableData = tecnicas.slice(0, 10).map((tec, index) => [
      index + 1,
      tec.tecnica || 'N/A',
      tec.tipo || 'N/A',
      tec.total_usos || 0,
      tec.usos_efectivos || 0,
      `${tec.porcentaje_efectividad || 0}%`
    ]);
    
    autoTable(pdf, {
      startY: yPosition + 10,
      head: [['#', 'Técnica', 'Tipo', 'Total Usos', 'Efectivos', 'Efectividad']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [46, 125, 50] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 45 },
        2: { cellWidth: 30 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 25 }
      }
    });
    
    return pdf.lastAutoTable.finalY;
  },

  // Exportar análisis avanzado a PDF con contenido estructurado
  async exportarAnalisisAvanzadoPDF(datos, competidorNombre, filename = 'analisis-avanzado.pdf', observaciones = '', recomendaciones = '', detallesCompetidor = null) {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;
      
      // Título principal
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Análisis Avanzado de Rendimiento', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      if (competidorNombre) {
        pdf.setFontSize(12);
        pdf.text(`Competidor: ${competidorNombre}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
      }
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Detalles del competidor
      if (detallesCompetidor) {
        yPosition = this.agregarDetallesCompetidor(pdf, detallesCompetidor, yPosition);
      }
      
      // Resumen de rendimiento
      if (datos.resumen) {
        yPosition = this.agregarResumenRendimiento(pdf, datos.resumen, yPosition + 10);
      }
      
      // Estadísticas por técnica
      if (datos.estadisticas_tecnicas && datos.estadisticas_tecnicas.length > 0) {
        yPosition = await this.agregarEstadisticasTecnicas(pdf, datos.estadisticas_tecnicas, yPosition + 10);
      }
      
      // Detalles de combinaciones
      if (datos.detalles_combinaciones) {
        yPosition = await this.agregarDetallesCombinaciones(pdf, datos.detalles_combinaciones, yPosition + 10);
      }
      
      // Evolución temporal
      if (datos.evolucion_temporal && datos.evolucion_temporal.length > 0) {
        yPosition = await this.agregarEvolucionTemporal(pdf, datos.evolucion_temporal, yPosition + 10);
      }
      
      // Gráficos de rendimiento (representados como tablas)
      yPosition = this.agregarGraficos(pdf, datos, yPosition + 10);
      
      // Observaciones del competidor
      if (observaciones && observaciones.trim()) {
        yPosition = this.agregarObservaciones(pdf, observaciones, yPosition + 10);
      }
      
      // Recomendaciones del entrenador
      if (recomendaciones && recomendaciones.trim()) {
        yPosition = this.agregarRecomendaciones(pdf, recomendaciones, yPosition + 10);
      }
      
      pdf.save(filename);
      return true;
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  },

  // Función auxiliar para agregar detalles del competidor
  agregarDetallesCompetidor(pdf, detalles, yPosition) {
    // Verificar si necesitamos una nueva página
    if (yPosition > 240) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Información del Competidor', 20, yPosition);
    
    yPosition += 15;
    
    const detallesData = [
      ['Nombre', detalles.nombre || 'N/A'],
      ['ID', detalles.id || detalles.competidor_id || 'N/A'],
      ['Peso', detalles.division_peso || detalles.peso || 'N/A'],
      ['Años de Experiencia', detalles.anos_experiencia ? `${detalles.anos_experiencia} años` : 'N/A'],
      ['Categoría', detalles.categoria || 'N/A']
    ];
    
    autoTable(pdf, {
      startY: yPosition,
      head: [['Campo', 'Información']],
      body: detallesData,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 80 }
      },
      margin: { left: 20 }
    });
    
    return pdf.lastAutoTable.finalY + 10;
  },

  // Función auxiliar para agregar observaciones
  agregarObservaciones(pdf, observaciones, yPosition) {
    // Verificar si necesitamos una nueva página
    if (yPosition > 230) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Observaciones del Competidor', 20, yPosition);
    
    yPosition += 15;
    
    // Dividir el texto en líneas para que quepa en el PDF
    const maxWidth = 170;
    const lines = pdf.splitTextToSize(observaciones, maxWidth);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    
    lines.forEach((line, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 6;
    });
    
    return yPosition + 10;
  },

  // Función auxiliar para agregar recomendaciones
  agregarRecomendaciones(pdf, recomendaciones, yPosition) {
    // Verificar si necesitamos una nueva página
    if (yPosition > 230) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Recomendaciones del Entrenador', 20, yPosition);
    
    yPosition += 15;
    
    // Dividir el texto en líneas para que quepa en el PDF
    const maxWidth = 170;
    const lines = pdf.splitTextToSize(recomendaciones, maxWidth);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    
    lines.forEach((line, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 6;
    });
    
    return yPosition + 10;
  },

  // Función auxiliar para agregar resumen de rendimiento
  agregarResumenRendimiento(pdf, resumen, yPosition) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Resumen de Rendimiento', 20, yPosition);
    
    yPosition += 15;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    
    const metricas = [
      ['Total de Combates:', resumen.total_combates || 0],
      ['Combates Ganados:', resumen.combates_ganados || 0],
      ['Porcentaje de Victoria:', `${resumen.porcentaje_victoria || 0}%`],
      ['Total de Técnicas:', resumen.total_tecnicas || 0],
      ['Técnicas Efectivas:', resumen.tecnicas_efectivas || 0],
      ['Efectividad General:', `${resumen.efectividad_general || 0}%`],
      ['Técnica Favorita:', resumen.tecnica_favorita || 'N/A'],
      ['Puntuación Promedio:', resumen.puntuacion_promedio || 'N/A']
    ];
    
    metricas.forEach(([label, value]) => {
      pdf.text(label, 25, yPosition);
      pdf.text(String(value), 120, yPosition);
      yPosition += 8;
    });
    
    return yPosition;
  },

  // Función auxiliar para agregar estadísticas por técnica
  async agregarEstadisticasTecnicas(pdf, tecnicas, yPosition) {
    // Verificar si necesitamos nueva página
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Estadísticas por Técnica', 20, yPosition);
    const tableData = tecnicas.slice(0, 15).map((tec, index) => [
      index + 1,
      this.formatearTecnica(tec.tecnica) || 'N/A',
      tec.tipo || 'N/A',
      tec.total_intentos || 0,
      tec.intentos_exitosos || 0,
      `${tec.porcentaje_exito || 0}%`,
      this.formatearPuntuacion(tec.puntuacion_mas_comun) || 'N/A'
    ]);
    
    autoTable(pdf, {
      startY: yPosition + 10,
      head: [['#', 'Técnica', 'Tipo', 'Intentos', 'Exitosos', 'Éxito %', 'Puntuación']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [156, 39, 176] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 20 },
        5: { halign: 'center', cellWidth: 20 },
        6: { halign: 'center', cellWidth: 25 }
      }
    });
    
    return pdf.lastAutoTable.finalY;
  },

  // Función auxiliar para agregar detalles de combinaciones
  async agregarDetallesCombinaciones(pdf, combinaciones, yPosition) {
    // Verificar si necesitamos nueva página
    if (yPosition > 180) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Análisis de Combinaciones', 20, yPosition);
    
    yPosition += 15;
    
    // Resumen de combinaciones
    if (combinaciones.resumen) {
      const resumen = combinaciones.resumen;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      
      const datosResumen = [
        ['Total de Combinaciones:', resumen.total_combinaciones || 0],
        ['Combinaciones Efectivas:', resumen.combinaciones_efectivas || 0],
        ['Porcentaje de Efectividad:', `${resumen.porcentaje_efectividad || 0}%`]
      ];
      
      datosResumen.forEach(([label, value]) => {
        pdf.text(label, 25, yPosition);
        pdf.text(String(value), 120, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
    }
    
    // Tabla de combinaciones detalladas
    if (combinaciones.detalles && combinaciones.detalles.length > 0) {
      const tableData = combinaciones.detalles.slice(0, 10).map((comb, index) => [
        index + 1,
        comb.descripcion || 'N/A',
        comb.efectiva ? 'Sí' : 'No',
        this.formatearPuntuacion(comb.puntuacion) || 'N/A',
        comb.total_tecnicas || 0,
        comb.tiempo || 'N/A'
      ]);
      
      autoTable(pdf, {
        startY: yPosition,
        head: [['#', 'Descripción', 'Efectiva', 'Puntuación', 'Técnicas', 'Tiempo']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [255, 152, 0] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          1: { cellWidth: 60 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'center', cellWidth: 20 },
          5: { halign: 'center', cellWidth: 25 }
        }
      });
      
      yPosition = pdf.lastAutoTable.finalY;
    }
    
    return yPosition;
  },

  // Función auxiliar para agregar evolución temporal
  async agregarEvolucionTemporal(pdf, evolucion, yPosition) {
    // Verificar si necesitamos nueva página
    if (yPosition > 180) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Evolución Temporal', 20, yPosition);
    const tableData = evolucion.slice(0, 12).map((periodo, index) => [
      index + 1,
      periodo.periodo || 'N/A',
      periodo.combates || 0,
      periodo.victorias || 0,
      `${periodo.porcentaje_victoria || 0}%`,
      periodo.tecnicas_efectivas || 0,
      `${periodo.efectividad || 0}%`
    ]);
    
    autoTable(pdf, {
      startY: yPosition + 10,
      head: [['#', 'Período', 'Combates', 'Victorias', 'Victoria %', 'Téc. Efect.', 'Efectividad %']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 30 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 22 },
        5: { halign: 'center', cellWidth: 25 },
        6: { halign: 'center', cellWidth: 25 }
      }
    });
    
    return pdf.lastAutoTable.finalY;
  },

  // Función auxiliar para formatear nombres de técnicas
  formatearTecnica(tecnica) {
    if (!tecnica) return 'N/A';
    return tecnica.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  // Función auxiliar para formatear puntuaciones
  formatearPuntuacion(puntuacion) {
    const puntuaciones = {
      'sin_puntuacion': 'Sin puntuación',
      'yuko': 'Yuko',
      'waza_ari': 'Waza-ari',
      'ippon': 'Ippon'
    };
    return puntuaciones[puntuacion] || puntuacion || 'N/A';
  },

  // Función legacy para compatibilidad (usando capturas de pantalla)
  async exportarEstadisticasPDFLegacy(elementId, filename = 'estadisticas.pdf') {
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
      const imgY = 30;
      
      pdf.setFontSize(16);
      pdf.text('Reporte de Estadísticas de Judo', pdfWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pdfWidth / 2, 25, { align: 'center' });
      
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

  // Función auxiliar para agregar representación de gráficos
  agregarGraficos(pdf, datos, yPosition) {
    // Verificar si necesitamos una nueva página
    if (yPosition > 180) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Análisis Gráfico de Rendimiento', 20, yPosition);
    
    yPosition += 15;
    
    // Gráfico de técnicas más utilizadas (representado como tabla)
    if (datos.estadisticas_tecnicas && datos.estadisticas_tecnicas.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Técnicas Más Utilizadas', 20, yPosition);
      yPosition += 10;
      
      const tecnicasData = datos.estadisticas_tecnicas.slice(0, 5).map(tec => [
        this.formatearTecnica(tec.tecnica),
        tec.total_intentos || 0,
        tec.intentos_exitosos || 0,
        `${tec.porcentaje_exito || 0}%`,
        '█'.repeat(Math.floor((tec.porcentaje_exito || 0) / 10)) // Barra visual simple
      ]);
      
      autoTable(pdf, {
        startY: yPosition,
        head: [['Técnica', 'Intentos', 'Exitosos', 'Efectividad', 'Gráfico']],
        body: tecnicasData,
        theme: 'grid',
        headStyles: { fillColor: [76, 175, 80], textColor: 255, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 35, halign: 'left', fontStyle: 'bold' }
        },
        margin: { left: 20 }
      });
      
      yPosition = pdf.lastAutoTable.finalY + 15;
    }
    
    // Evolución temporal (representado como tabla)
    if (datos.evolucion_temporal && datos.evolucion_temporal.length > 0) {
      // Verificar si necesitamos una nueva página para la segunda tabla
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Evolución Temporal del Rendimiento', 20, yPosition);
      yPosition += 10;
      
      const evolucionData = datos.evolucion_temporal.slice(0, 8).map(periodo => [
        periodo.periodo || 'N/A',
        periodo.combates || 0,
        periodo.victorias || 0,
        `${periodo.porcentaje_victoria || 0}%`,
        periodo.tecnicas_efectivas || 0,
        `${periodo.efectividad || 0}%`
      ]);
      
      autoTable(pdf, {
        startY: yPosition,
        head: [['Período', 'Combates', 'Victorias', '% Victoria', 'Téc. Efectivas', '% Efectividad']],
        body: evolucionData,
        theme: 'grid',
        headStyles: { fillColor: [156, 39, 176], textColor: 255, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 25, halign: 'center' }
        },
        margin: { left: 20 }
      });
      
      yPosition = pdf.lastAutoTable.finalY + 15;
    }
    
    return yPosition;
  }
};

export default pdfService;