import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  List, ListItem, ListItemText, Box, Alert, TextField, Snackbar, Paper,
  Chip, Checkbox, FormControlLabel, IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, PlayArrow as PlayArrowIcon, Pause as PauseIcon, Stop as StopIcon } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import combatesService from '../../services/combatesService';
import BackButton from '../layout/BackButton';


// ==================== CONSTANTES OPTIMIZADAS ====================
const TECNICAS_TASHI = {
  kata_te_waza: [
    { value: 'seoi_nage', label: 'Seoi-nage' },
    { value: 'ippon_seoi_nage', label: 'Ippon-seoi-nage' },
    { value: 'kata_guruma', label: 'Kata-guruma' },
    { value: 'sukui_nage', label: 'Sukui-nage' },
    { value: 'tai_otoshi', label: 'Tai-otoshi' },
    { value: 'uchi_mata', label: 'Uchi-mata' },
    { value: 'morote_gari', label: 'Morote-gari' },
    { value: 'kuchiki_taoshi', label: 'Kuchiki-taoshi' },
    { value: 'kibisu_gaeshi', label: 'Kibisu-gaeshi' },
    { value: 'kouchi_gaeshi', label: 'Kouchi-gaeshi' },
    { value: 'ouchi_gaeshi', label: 'Ouchi-gaeshi' },
    { value: 'osoto_gaeshi', label: 'Osoto-gaeshi' },
    { value: 'harai_goshi_gaeshi', label: 'Harai-goshi-gaeshi' },
    { value: 'uchi_mata_gaeshi', label: 'Uchi-mata-gaeshi' },
    { value: 'hane_goshi_gaeshi', label: 'Hane-goshi-gaeshi' }
  ],
  koshi_waza: [
    { value: 'uki_goshi', label: 'Uki-goshi' },
    { value: 'o_goshi', label: 'O-goshi' },
    { value: 'koshi_guruma', label: 'Koshi-guruma' },
    { value: 'tsurikomi_goshi', label: 'Tsurikomi-goshi' },
    { value: 'harai_goshi', label: 'Harai-goshi' },
    { value: 'tsuri_goshi', label: 'Tsuri-goshi' },
    { value: 'hane_goshi', label: 'Hane-goshi' },
    { value: 'utsuri_goshi', label: 'Utsuri-goshi' },
    { value: 'daki_wakare', label: 'Daki-wakare' },
    { value: 'koshi_nage', label: 'Koshi-nage' },
    { value: 'ushiro_goshi', label: 'Ushiro-goshi' }
  ],
  ashi_waza: [
    { value: 'de_ashi_harai', label: 'De-ashi-harai' },
    { value: 'hiza_guruma', label: 'Hiza-guruma' },
    { value: 'sasae_tsurikomi_ashi', label: 'Sasae-tsurikomi-ashi' },
    { value: 'osoto_gari', label: 'O-soto-gari' },
    { value: 'ouchi_gari', label: 'O-uchi-gari' },
    { value: 'kosoto_gari', label: 'Ko-soto-gari' },
    { value: 'kouchi_gari', label: 'Ko-uchi-gari' },
    { value: 'okuri_ashi_harai', label: 'Okuri-ashi-harai' },
    { value: 'uchi_mata', label: 'Uchi-mata' },
    { value: 'kosoto_gake', label: 'Kosoto-gake' },
    { value: 'ashi_guruma', label: 'Ashi-guruma' },
    { value: 'harai_tsurikomi_ashi', label: 'Harai-tsurikomi-ashi' },
    { value: 'osoto_guruma', label: 'O-soto-guruma' },
    { value: 'osoto_otoshi', label: 'O-soto-otoshi' },
    { value: 'tsubame_gaeshi', label: 'Tsubame-gaeshi' },
    { value: 'kani_basami', label: 'Kani-basami' },
    { value: 'kawazu_gake', label: 'Kawazu-gake' }
  ],
  ma_sutemi_waza: [
    { value: 'tomoe_nage', label: 'Tomoe-nage' },
    { value: 'ura_nage', label: 'Ura-nage' },
    { value: 'sumi_gaeshi', label: 'Sumi-gaeshi' },
    { value: 'hikikomi_gaeshi', label: 'Hikikomi-gaeshi' },
    { value: 'tawara_gaeshi', label: 'Tawara-gaeshi' }
  ],
  yoko_sutemi_waza: [
    { value: 'yoko_otoshi', label: 'Yoko-otoshi' },
    { value: 'tani_otoshi', label: 'Tani-otoshi' },
    { value: 'hane_makikomi', label: 'Hane-makikomi' },
    { value: 'sukui_nage', label: 'Sukui-nage' },
    { value: 'utsuri_goshi', label: 'Utsuri-goshi' },
    { value: 'o_soto_makikomi', label: 'O-soto-makikomi' },
    { value: 'uchi_makikomi', label: 'Uchi-makikomi' },
    { value: 'harai_makikomi', label: 'Harai-makikomi' },
    { value: 'ko_soto_makikomi', label: 'Ko-soto-makikomi' },
    { value: 'uchi_mata_makikomi', label: 'Uchi-mata-makikomi' },
    { value: 'soto_makikomi', label: 'Soto-makikomi' },
    { value: 'daki_wakare', label: 'Daki-wakare' }
  ]
};

const TECNICAS_NE = {
  osaekomi_waza: [
    { value: 'kesa_gatame', label: 'Kesa-gatame' },
    { value: 'kata_gatame', label: 'Kata-gatame' },
    { value: 'kami_shiho_gatame', label: 'Kami-shiho-gatame' },
    { value: 'kuzure_kami_shiho_gatame', label: 'Kuzure-kami-shiho-gatame' },
    { value: 'yoko_shiho_gatame', label: 'Yoko-shiho-gatame' },
    { value: 'tate_shiho_gatame', label: 'Tate-shiho-gatame' },
    { value: 'kuzure_kesa_gatame', label: 'Kuzure-kesa-gatame' },
    { value: 'uki_gatame', label: 'Uki-gatame' },
    { value: 'ura_gatame', label: 'Ura-gatame' },
    { value: 'ushiro_kesa_gatame', label: 'Ushiro-kesa-gatame' }
  ],
  shime_waza: [
    { value: 'nami_juji_jime', label: 'Nami-juji-jime' },
    { value: 'gyaku_juji_jime', label: 'Gyaku-juji-jime' },
    { value: 'kata_juji_jime', label: 'Kata-juji-jime' },
    { value: 'hadaka_jime', label: 'Hadaka-jime' },
    { value: 'okuri_eri_jime', label: 'Okuri-eri-jime' },
    { value: 'kataha_jime', label: 'Kataha-jime' },
    { value: 'do_jime', label: 'Do-jime' },
    { value: 'sode_guruma_jime', label: 'Sode-guruma-jime' },
    { value: 'kata_te_jime', label: 'Kata-te-jime' },
    { value: 'ryo_te_jime', label: 'Ryo-te-jime' },
    { value: 'tsukkomi_jime', label: 'Tsukkomi-jime' },
    { value: 'sankaku_jime', label: 'Sankaku-jime' }
  ],
  kansetsu_waza: [
    { value: 'ude_garami', label: 'Ude-garami' },
    { value: 'ude_hishigi_juji_gatame', label: 'Ude-hishigi-juji-gatame' },
    { value: 'ude_hishigi_ude_gatame', label: 'Ude-hishigi-ude-gatame' },
    { value: 'ude_hishigi_hiza_gatame', label: 'Ude-hishigi-hiza-gatame' },
    { value: 'ude_hishigi_waki_gatame', label: 'Ude-hishigi-waki-gatame' },
    { value: 'ude_hishigi_hara_gatame', label: 'Ude-hishigi-hara-gatame' },
    { value: 'ude_hishigi_ashi_gatame', label: 'Ude-hishigi-ashi-gatame' },
    { value: 'ude_hishigi_te_gatame', label: 'Ude-hishigi-te-gatame' },
    { value: 'ude_hishigi_sankaku_gatame', label: 'Ude-hishigi-sankaku-gatame' },
    { value: 'ashi_garami', label: 'Ashi-garami' }
  ]
};

const TIPOS_AMONESTACION = [
  { value: 'shido', label: 'Shido' },
  { value: 'hansokumake', label: 'Hansoku-make' }
];

const CATEGORIA_LABELS = {
  kata_te_waza: 'Kata te waza',
  koshi_waza: 'Koshi waza',
  ashi_waza: 'Ashi waza',
  ma_sutemi_waza: 'Ma sutemi waza',
  yoko_sutemi_waza: 'Yoko sutemi waza',
  osaekomi_waza: 'Osaekomi waza',
  shime_waza: 'Shime waza',
  kansetsu_waza: 'Kansetsu waza'
};

const CODIGOS_COMBINACION = {
  ashi_waza: 'A',
  koshi_waza: 'K',
  kata_te_waza: 'KTW',
  ma_sutemi_waza: 'MS',
  yoko_sutemi_waza: 'YS',
  osaekomi_waza: 'O',
  shime_waza: 'S',
  kansetsu_waza: 'KN'
};

// ==================== HOOKS OPTIMIZADOS ====================
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
};

const useCombateTimer = (id, combate, finalizarCombateAutomatico) => {
  const TIEMPO_TOTAL_COMBATE = 240; // 4 minutos en segundos
  const [tiempo, setTiempo] = useLocalStorage(`combate_${id}_tiempo`, TIEMPO_TOTAL_COMBATE);
  const [cronometroActivo, setCronometroActivo] = useLocalStorage(`combate_${id}_activo`, false);
  
  const iniciarCronometro = useCallback(() => setCronometroActivo(true), [setCronometroActivo]);
  const pausarCronometro = useCallback(() => setCronometroActivo(false), [setCronometroActivo]);
  
  useEffect(() => {
    if (cronometroActivo && combate?.iniciado && !combate?.finalizado && tiempo > 0) {
      const interval = setInterval(() => {
        setTiempo(prevTiempo => {
          const nuevoTiempo = prevTiempo - 1;
          // FINALIZACIÓN AUTOMÁTICA IMPLEMENTADA
          if (nuevoTiempo <= 0) {
            setCronometroActivo(false);
            // Finalizar combate automáticamente cuando se agote el tiempo
            setTimeout(() => {
              if (typeof finalizarCombateAutomatico === 'function') {
                finalizarCombateAutomatico('tiempo_agotado');
              }
            }, 100);
            return 0;
          }
          return nuevoTiempo;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cronometroActivo, combate, setTiempo, setCronometroActivo, tiempo, finalizarCombateAutomatico]);
  
  return { tiempo, cronometroActivo, iniciarCronometro, pausarCronometro, tiempoRestante: tiempo };
};

// ==================== UTILIDADES ====================
const formatTiempo = (segundos) => {
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
};

// Función para formatear tiempo transcurrido (para las acciones)
const formatTiempoTranscurrido = (tiempoRestante) => {
  const TIEMPO_TOTAL = 240; // 4 minutos
  const tiempoTranscurrido = TIEMPO_TOTAL - tiempoRestante;
  const minutos = Math.floor(tiempoTranscurrido / 60);
  const segs = tiempoTranscurrido % 60;
  return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
};

const calcularPuntuacionNe = (categoria, duracion, efectiva) => {
  if (!efectiva) return 'sin_puntuacion';
  if (categoria === 'osaekomi_waza') {
    const dur = parseInt(duracion);
    if (dur >= 20) return 'ippon';
    if (dur >= 10) return 'waza_ari';
    return 'sin_puntuacion';
  }
  if (categoria === 'shime_waza' || categoria === 'kansetsu_waza') {
    return efectiva ? 'ippon' : 'sin_puntuacion';
  }
  return 'sin_puntuacion';
};

const generarNombreCombinacion = (acciones) => {
  if (!acciones || acciones.length === 0) return 'Sin acciones';
  
  // Filtrar acciones válidas que tengan categoría O técnica
  const accionesValidas = acciones.filter(a => a.categoria || a.tecnica || a.nombre_tecnica);
  
  if (accionesValidas.length === 0) return 'Combinación sin datos válidos';
  
  // Si no hay categorías pero sí técnicas, mostrar las técnicas
  const accionesConCategoria = accionesValidas.filter(a => a.categoria);
  
  if (accionesConCategoria.length === 0) {
    // Si no hay categorías, mostrar las técnicas directamente
    const tecnicas = accionesValidas.map(a => a.tecnica || a.nombre_tecnica).filter(Boolean);
    return tecnicas.length > 0 ? `Combinación: ${tecnicas.join(' + ')}` : 'Combinación sin categorías válidas';
  }
  
  const categorias = [...new Set(accionesConCategoria.map(a => a.categoria))];
  const nombres = categorias.map(cat => CATEGORIA_LABELS[cat] || cat);
  const codigos = categorias.map(cat => CODIGOS_COMBINACION[cat] || cat.substring(0, 2).toUpperCase());
  
  return `${nombres.join(' - ')} (${codigos.join('-')})`;
};

const determinarResultadoAutomatico = (accionesTashi, accionesNe) => {
  const todasLasAcciones = [...accionesTashi, ...accionesNe];
  const accionesEfectivas = todasLasAcciones.filter(accion => accion.efectiva);
  
  if (accionesEfectivas.length === 0) return 'sin_puntuacion';
  
  const puntuaciones = accionesEfectivas.map(a => a.puntuacion);
  if (puntuaciones.includes('ippon')) return 'ippon';
  if (puntuaciones.includes('waza_ari')) return 'waza_ari';
  if (puntuaciones.includes('yuko')) return 'yuko';
  
  return 'sin_puntuacion';
};

// Nueva función para determinar el ganador automáticamente
const determinarGanadorAutomatico = (combate) => {
  if (!combate) return null;

  const calcularPuntuacionCompetidor = (competidorId) => {
    let puntuacion = { ippon: 0, waza_ari: 0, yuko: 0, shidos: 0 };
    
    // Contar acciones Tashi Waza
    (combate.acciones_tashi_waza || []).forEach(accion => {
      if (accion.competidor === competidorId && accion.efectiva) {
        if (accion.resultado === 'ippon') puntuacion.ippon++;
        else if (accion.resultado === 'waza_ari') puntuacion.waza_ari++;
        else if (accion.resultado === 'yuko') puntuacion.yuko++;
      }
    });
    
    // Contar acciones Ne Waza
    (combate.acciones_ne_waza || []).forEach(accion => {
      if (accion.competidor === competidorId && accion.efectiva) {
        if (accion.resultado === 'ippon') puntuacion.ippon++;
        else if (accion.resultado === 'waza_ari') puntuacion.waza_ari++;
        else if (accion.resultado === 'yuko') puntuacion.yuko++;
      }
    });
    
    // Contar acciones combinadas
    (combate.acciones_combinadas || []).forEach(accion => {
      if (accion.competidor === competidorId) {
        if (accion.resultado_final === 'ippon') puntuacion.ippon++;
        else if (accion.resultado_final === 'waza_ari') puntuacion.waza_ari++;
        else if (accion.resultado_final === 'yuko') puntuacion.yuko++;
      }
    });
    
    // Contar amonestaciones
    (combate.amonestaciones || []).forEach(accion => {
      if (accion.competidor === competidorId) {
        if (accion.tipo === 'shido') puntuacion.shidos++;
        else if (accion.tipo === 'hansokumake') puntuacion.shidos = 4; // Hansoku-make = descalificación
      }
    });
    
    return puntuacion;
  };

  const puntuacion1 = calcularPuntuacionCompetidor(combate.competidor1.id);
  const puntuacion2 = calcularPuntuacionCompetidor(combate.competidor2.id);
  
  // Verificar descalificación por Hansoku-make
  if (puntuacion1.shidos >= 4) return combate.competidor2.id;
  if (puntuacion2.shidos >= 4) return combate.competidor1.id;
  
  // Verificar Ippon
  if (puntuacion1.ippon > 0 && puntuacion2.ippon === 0) return combate.competidor1.id;
  if (puntuacion2.ippon > 0 && puntuacion1.ippon === 0) return combate.competidor2.id;
  
  // Si ambos tienen Ippon, gana quien tenga más
  if (puntuacion1.ippon > 0 && puntuacion2.ippon > 0) {
    if (puntuacion1.ippon > puntuacion2.ippon) return combate.competidor1.id;
    if (puntuacion2.ippon > puntuacion1.ippon) return combate.competidor2.id;
  }
  
  // Verificar Waza-ari
  if (puntuacion1.waza_ari > puntuacion2.waza_ari) return combate.competidor1.id;
  if (puntuacion2.waza_ari > puntuacion1.waza_ari) return combate.competidor2.id;
  
  // Verificar Yuko
  if (puntuacion1.yuko > puntuacion2.yuko) return combate.competidor1.id;
  if (puntuacion2.yuko > puntuacion1.yuko) return combate.competidor2.id;
  
  // Verificar por menor cantidad de Shidos
  if (puntuacion1.shidos < puntuacion2.shidos) return combate.competidor1.id;
  if (puntuacion2.shidos < puntuacion1.shidos) return combate.competidor2.id;
  
  // En caso de empate, retornar null (empate)
  return null;
};

// ==================== COMPONENTE PRINCIPAL ====================
function CombateControl() {
  const { id } = useParams();
  
  // Estados principales
  const [combate, setCombate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accionesCombate, setAccionesCombate] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [puntuaciones, setPuntuaciones] = useState(null);
  
  // Función para finalizar combate automáticamente
  const finalizarCombateAutomatico = useCallback(async (motivo = 'tiempo_agotado') => {
    try {
      console.log('🏁 Finalizando combate automáticamente por:', motivo);
      
      const ganadorAutomatico = determinarGanadorAutomatico(combate);
      
      if (ganadorAutomatico) {
        await combatesService.finalizarCombate(id, { ganador: ganadorAutomatico });
        const nombreGanador = combate.competidor1.id === ganadorAutomatico 
          ? combate.competidor1.nombre 
          : combate.competidor2.nombre;
        mostrarMensajeExito(`¡Combate finalizado! Ganador: ${nombreGanador}`);
      } else {
        // En caso de empate, mostrar diálogo para selección manual
        mostrarMensajeExito('Tiempo agotado. El combate está empatado. Seleccione un ganador.');
        toggleDialog('finalizar', true);
      }
      
      await fetchCombate();
    } catch (error) {
      console.error('Error al finalizar combate automáticamente:', error);
    }
  }, [combate, id]);
  
  // Timer personalizado
  const { tiempo, cronometroActivo, iniciarCronometro, pausarCronometro, tiempoRestante } = useCombateTimer(id, combate, finalizarCombateAutomatico);
  
  // Estados de diálogos
  const [dialogs, setDialogs] = useState({
    tashi: false,
    ne: false,
    amonestacion: false,
    combinada: false,
    finalizar: false
  });
  
  // Estados de formularios consolidados
  const [forms, setForms] = useState({
    tashi: { competidor: '', categoria: '', tecnica: '', puntuacion: '', efectiva: true },
    ne: { competidor: '', categoria: '', tecnica: '', duracion: '', efectiva: true },
    amonestacion: { competidor: '', tipo: '' },
    combinada: { competidor: '', observaciones: '', acciones: [] }
  });
  
  // Estado para nueva acción en combinada
  const [nuevaAccion, setNuevaAccion] = useState({
    tipo: 'tashi', // 'tashi' o 'ne'
    categoria: '',
    tecnica: '',
    puntuacion: '',
    efectiva: true,
    duracion: '' // solo para ne-waza
  });
  
  const [ganadorSeleccionado, setGanadorSeleccionado] = useState('');

  // ==================== FUNCIONES AUXILIARES ====================
  const mostrarMensajeExito = useCallback((mensaje) => {
    setMensajeExito(mensaje);
    setSnackbarOpen(true);
  }, []);
  
  const toggleDialog = useCallback((dialogName, value = null) => {
    setDialogs(prev => ({
      ...prev,
      [dialogName]: value !== null ? value : !prev[dialogName]
    }));
  }, []);
  
  const updateForm = useCallback((formType, field, value) => {
    setForms(prev => ({
      ...prev,
      [formType]: { ...prev[formType], [field]: value }
    }));
  }, []);
  
  const limpiarFormularios = useCallback(() => {
    setForms({
      tashi: { competidor: '', categoria: '', tecnica: '', puntuacion: '', efectiva: true },
      ne: { competidor: '', categoria: '', tecnica: '', duracion: '', efectiva: true },
      amonestacion: { competidor: '', tipo: '' },
      combinada: { competidor: '', observaciones: '', acciones: [] }
    });
    setNuevaAccion({
      tipo: 'tashi',
      categoria: '',
      tecnica: '',
      puntuacion: '',
      efectiva: true,
      duracion: ''
    });
    setGanadorSeleccionado('');
  }, []);

  const obtenerTecnicas = useCallback((tipo, categoria) => {
    if (tipo === 'tashi') return TECNICAS_TASHI[categoria] || [];
    if (tipo === 'ne') return TECNICAS_NE[categoria] || [];
    return [];
  }, []);

  // ==================== FUNCIONES DE API ====================
  const fetchCombate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await combatesService.getCombate(id);
      
      if (!response) {
        throw new Error('No se recibieron datos del combate');
      }
      
      setCombate(response);
      
      // Combinar y ordenar todas las acciones con nombres descriptivos
      const todasLasAcciones = [
        ...(response.acciones_tashi_waza || []).map(accion => ({
          ...accion,
          tipo_accion: 'Tashi Waza',
          descripcion: `${accion.tipo || 'N/A'} - ${accion.resultado || 'N/A'}${accion.efectiva ? ' (Efectiva)' : ''}`,
          tiempo_mostrar: accion.tiempo || 'N/A'
        })),
        ...(response.acciones_ne_waza || []).map(accion => ({
          ...accion,
          tipo_accion: 'Ne Waza',
          descripcion: `${accion.tipo || 'N/A'}${accion.efectiva ? ' (Efectiva)' : ''}`,
          tiempo_mostrar: accion.tiempo || 'N/A'
        })),
        ...(response.amonestaciones || []).map(accion => ({
          ...accion,
          tipo_accion: 'Amonestación',
          descripcion: accion.tipo || 'N/A',
          tiempo_mostrar: accion.tiempo || 'N/A'
        })),
        ...(response.acciones_combinadas || []).map(accion => {
          // LOG TEMPORAL PARA DEPURACIÓN
          console.log('Acción combinada recibida:', accion);
          
          // Generar nombre descriptivo para acciones combinadas
          let todasAcciones;
          
          if (accion.acciones && Array.isArray(accion.acciones)) {
            // Si las acciones vienen en un array llamado 'acciones'
            todasAcciones = accion.acciones;
          } else if (accion.acciones_tashi || accion.acciones_ne) {
            // Si vienen separadas en tashi y ne
            todasAcciones = [...(accion.acciones_tashi || []), ...(accion.acciones_ne || [])];
          } else if (accion.descripcion && accion.descripcion !== 'Combinación sin categorías válidas') {
            // Si ya tiene una descripción válida del backend, usarla
            return {
              ...accion,
              tipo_accion: 'Acción Combinada',
              descripcion: accion.descripcion,
              tiempo_mostrar: accion.tiempo || 'N/A'
            };
          } else {
            // Si la acción combinada tiene las propiedades directamente
            todasAcciones = [{
              categoria: accion.categoria,
              tecnica: accion.tecnica || accion.nombre_tecnica
            }];
          }
          
          const nombreCombinacion = generarNombreCombinacion(todasAcciones);
          
          return {
            ...accion,
            tipo_accion: 'Acción Combinada',
            descripcion: nombreCombinacion,
            tiempo_mostrar: accion.tiempo || 'N/A'
          };
        })
      ];
      
      todasLasAcciones.sort((a, b) => {
        const tiempoA = a.tiempo || '00:00';
        const tiempoB = b.tiempo || '00:00';
        return tiempoA.localeCompare(tiempoB);
      });
      
      setAccionesCombate(todasLasAcciones);
      setError('');
    } catch (error) {
      console.error('Error al cargar el combate:', error);
      setError('Error al cargar el combate');
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  const iniciarCombate = useCallback(async () => {
    try {
      await combatesService.iniciarCombate(id);
      iniciarCronometro();
      await fetchCombate();
      mostrarMensajeExito('Combate iniciado exitosamente');
    } catch (error) {
      console.error('Error al iniciar combate:', error);
      setError('Error al iniciar el combate');
    }
  }, [id, iniciarCronometro, fetchCombate, mostrarMensajeExito]);
  
  const registrarAccion = useCallback(async (tipo) => {
    const formData = forms[tipo];
    
    // Validaciones específicas por tipo
    if (tipo === 'tashi' || tipo === 'ne') {
      if (!formData.competidor || !formData.categoria || !formData.tecnica) {
        setError('Todos los campos son obligatorios');
        return;
      }
    } else if (tipo === 'amonestacion') {
      if (!formData.competidor || !formData.tipo) {
        setError('Todos los campos son obligatorios');
        return;
      }
    } else if (tipo === 'combinada') {
      if (!formData.competidor || formData.acciones.length === 0) {
        setError('Debe seleccionar un competidor y agregar al menos una acción');
        return;
      }
    }
  
    try {
      let data = {
        competidor: formData.competidor,
        tiempo: formatTiempoTranscurrido(tiempo) // Usar tiempo transcurrido en lugar de tiempo restante
      };
      
      let serviceFunction;
      
      switch (tipo) {
        case 'tashi':
          data = {
            ...data,
            tipo: formData.categoria,
            tecnica: formData.tecnica,
            puntuacion: formData.puntuacion, // Ya está correcto - mantener la puntuación seleccionada
            efectiva: formData.efectiva
          };
          serviceFunction = combatesService.registrarAccionTashi;
          break;
          
        case 'ne':
          data = {
            ...data,
            tipo: formData.categoria,
            tecnica: formData.tecnica,
            puntuacion: calcularPuntuacionNe(formData.categoria, formData.duracion, formData.efectiva),
            efectiva: formData.efectiva,
            duracion_control: formData.duracion || null
          };
          serviceFunction = combatesService.registrarAccionNe;
          break;
          
        case 'amonestacion':
          data = {
            ...data,
            tipo: formData.tipo
          };
          serviceFunction = combatesService.registrarAmonestacion;
          break;
          
        case 'combinada':
          // Preparar acciones separadas por tipo
          const accionesTashi = formData.acciones.filter(a => 
            ['ashi_waza', 'koshi_waza', 'kata_te_waza', 'ma_sutemi_waza', 'yoko_sutemi_waza'].includes(a.categoria)
          ).map(accion => ({
            competidor: formData.competidor,
            categoria: accion.categoria,
            tecnica: accion.tecnica,
            tiempo: formatTiempo(tiempo),
            efectiva: accion.efectiva,
            puntuacion: accion.puntuacion // CAMBIO: Usar la puntuación real de cada acción
          }));
          
          const accionesNe = formData.acciones.filter(a => 
            ['osaekomi_waza', 'shime_waza', 'kansetsu_waza'].includes(a.categoria)
          ).map(accion => ({
            competidor: formData.competidor,
            categoria: accion.categoria,
            tecnica: accion.tecnica,
            tiempo: formatTiempo(tiempo),
            efectiva: accion.efectiva,
            puntuacion: accion.puntuacion // CAMBIO: Usar la puntuación real de cada acción
          }));
          
          // LOG TEMPORAL PARA DEPURACIÓN
          console.log('Datos enviados al backend para acción combinada:', {
            competidor: formData.competidor,
            acciones: formData.acciones, // Enviar todas las acciones para generar descripción
            observaciones: formData.observaciones,
            tiempo: formatTiempo(tiempo),
            acciones_tashi: accionesTashi,
            acciones_ne: accionesNe,
            resultado_final: determinarResultadoAutomatico(accionesTashi, accionesNe)
          });
          
          data = {
            ...data,
            acciones: formData.acciones, // IMPORTANTE: Enviar todas las acciones para generar descripción
            observaciones: formData.observaciones,
            tiempo: formatTiempo(tiempo),
            acciones_tashi: accionesTashi,
            acciones_ne: accionesNe,
            resultado_final: determinarResultadoAutomatico(
              accionesTashi,
              accionesNe
            )
          };
          serviceFunction = combatesService.registrarAccionCombinada;
          break;
          
        default:
          throw new Error('Tipo de acción no válido');
      }
      
      const response = await serviceFunction(id, data);
      
      // Actualizar puntuaciones locales
      manejarRespuestaAccion(response);
      
      // Manejar finalización automática del combate según reglas IJF
      if (response?.data?.combate_finalizado && response.data.ganador) {
        const ganador = combate.competidor1.id === response.data.ganador 
          ? combate.competidor1 
          : combate.competidor2;
        
        let mensajeVictoria = '';
        switch (response.data.motivo_victoria) {
          case 'ippon':
            mensajeVictoria = `¡IPPON! ${ganador.nombre} gana el combate`;
            break;
          case 'waza_ari_awasete_ippon':
            mensajeVictoria = `¡WAZA-ARI AWASETE IPPON! ${ganador.nombre} gana el combate (dos waza-ari)`;
            break;
          case 'hansoku_make_oponente':
            mensajeVictoria = `¡HANSOKU-MAKE! ${ganador.nombre} gana por descalificación del oponente`;
            break;
          default:
            mensajeVictoria = `¡${ganador.nombre} gana el combate!`;
        }
        
        mostrarMensajeExito(mensajeVictoria);
        if (cronometroActivo) {
          pausarCronometro();
        }
      } else {
        mostrarMensajeExito(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} registrada exitosamente`);
      }
      
      limpiarFormularios();
      toggleDialog(tipo, false);
      await fetchCombate();
    } catch (error) {
      console.error(`Error al registrar ${tipo}:`, error);
      const errorMessage = error.response?.data?.error || 
                          JSON.stringify(error.response?.data) || 
                          `Error al registrar ${tipo}`;
      setError(errorMessage);
    }
  }, [forms, tiempo, id, combate, cronometroActivo, pausarCronometro, mostrarMensajeExito, limpiarFormularios, toggleDialog, fetchCombate]);

  const finalizarCombate = useCallback(async () => {
    try {
      // Determinar ganador automáticamente basado en los resultados
      const ganadorAutomatico = determinarGanadorAutomatico(combate);
      
      if (ganadorAutomatico === null) {
        // En caso de empate, mostrar diálogo para selección manual
        if (!ganadorSeleccionado) {
          setError('El combate está empatado. Debe seleccionar un ganador manualmente.');
          return;
        }
      }
      
      const ganadorFinal = ganadorAutomatico || ganadorSeleccionado;
      
      if (!ganadorFinal) {
        setError('No se puede determinar el ganador del combate');
        return;
      }

      await combatesService.finalizarCombate(id, { ganador: ganadorFinal });
      pausarCronometro();
      await fetchCombate();
      
      const nombreGanador = combate.competidor1.id === ganadorFinal 
        ? combate.competidor1.nombre 
        : combate.competidor2.nombre;
      
      mostrarMensajeExito(`Combate finalizado. Ganador: ${nombreGanador}`);
      toggleDialog('finalizar', false);
    } catch (error) {
      console.error('Error al finalizar combate:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error al finalizar el combate';
      setError(errorMessage);
    }
  }, [combate, ganadorSeleccionado, id, pausarCronometro, fetchCombate, mostrarMensajeExito, toggleDialog]);

  // ==================== FUNCIONES PARA ACCIONES COMBINADAS ====================
  const agregarAccionCombinada = useCallback(() => {
    const { tipo, categoria, tecnica, puntuacion, efectiva, duracion } = nuevaAccion;
    
    if (!categoria || !tecnica) {
      setError('Debe seleccionar categoría y técnica');
      return;
    }
    
    let puntuacionFinal = puntuacion;
    if (tipo === 'ne') {
      puntuacionFinal = calcularPuntuacionNe(categoria, duracion, efectiva);
    }
    
    const accion = {
      id: Date.now(),
      tipo,
      categoria,
      tecnica,
      puntuacion: puntuacionFinal,
      efectiva,
      ...(tipo === 'ne' && { duracion })
    };
    
    updateForm('combinada', 'acciones', [...forms.combinada.acciones, accion]);
    
    // Limpiar formulario de nueva acción
    setNuevaAccion({
      tipo: 'tashi',
      categoria: '',
      tecnica: '',
      puntuacion: '',
      efectiva: true,
      duracion: ''
    });
  }, [nuevaAccion, forms.combinada.acciones, updateForm]);

  const eliminarAccionCombinada = useCallback((id) => {
    const nuevasAcciones = forms.combinada.acciones.filter(accion => accion.id !== id);
    updateForm('combinada', 'acciones', nuevasAcciones);
  }, [forms.combinada.acciones, updateForm]);

  // Función para manejar respuestas de acciones y actualizar puntuaciones
  const manejarRespuestaAccion = useCallback((response) => {
    // Manejar tanto response.data como response directo
    const data = response.data || response;
    
    if (data && data.puntuaciones) {
      // Preservar los nombres de los competidores
      const puntuacionesActualizadas = {
        competidor1: {
          id: data.puntuaciones.competidor1.id,
          nombre: data.puntuaciones.competidor1.nombre || combate?.competidor1?.nombre || 'Competidor 1',
          puntuacion: data.puntuaciones.competidor1.puntuacion
        },
        competidor2: {
          id: data.puntuaciones.competidor2.id,
          nombre: data.puntuaciones.competidor2.nombre || combate?.competidor2?.nombre || 'Competidor 2',
          puntuacion: data.puntuaciones.competidor2.puntuacion
        }
      };
      setPuntuaciones(puntuacionesActualizadas);
    }
    
    // Corregir el mensaje de finalización
    if (data && data.combate_finalizado) {
      let nombreGanador = 'Empate';
      
      if (data.ganador && combate) {
        nombreGanador = combate.competidor1?.id === data.ganador 
          ? combate.competidor1.nombre 
          : combate.competidor2.nombre;
      }
      
      // Usar mostrarMensajeExito en lugar de alert
      const mensaje = `¡Combate finalizado! Ganador: ${nombreGanador}`;
      if (typeof mostrarMensajeExito === 'function') {
        mostrarMensajeExito(mensaje);
      } else {
        alert(mensaje);
      }
    }
  }, [combate, mostrarMensajeExito]);
  
  // Función para calcular puntuaciones localmente (SIN LOGS DE DEPURACIÓN)
  const calcularPuntuacionesLocales = useCallback(() => {
    if (!combate) {
      return null;
    }
    
    // VALORES DE PUNTOS PARA CADA TÉCNICA
    const VALORES_PUNTOS = {
      ippon: 10,
      waza_ari: 5,
      yuko: 3,
      shido: -1
    };
    
    const calcularPuntuacionCompetidor = (competidorId) => {
      let puntuacion = { ippon: 0, waza_ari: 0, yuko: 0, shidos: 0 };
      let puntosTotal = 0;
      
      // Contar acciones Tashi Waza
      (combate.acciones_tashi_waza || []).forEach(accion => {
        if (accion.competidor === competidorId && accion.efectiva) {
          if (accion.puntuacion === 'ippon') {
            puntuacion.ippon++;
            puntosTotal += VALORES_PUNTOS.ippon;
          } else if (accion.puntuacion === 'waza_ari') {
            puntuacion.waza_ari++;
            puntosTotal += VALORES_PUNTOS.waza_ari;
          } else if (accion.puntuacion === 'yuko') {
            puntuacion.yuko++;
            puntosTotal += VALORES_PUNTOS.yuko;
          }
        }
      });
      
      // Contar acciones Ne Waza
      (combate.acciones_ne_waza || []).forEach(accion => {
        if (accion.competidor === competidorId && accion.efectiva) {
          if (accion.puntuacion === 'ippon') {
            puntuacion.ippon++;
            puntosTotal += VALORES_PUNTOS.ippon;
          } else if (accion.puntuacion === 'waza_ari') {
            puntuacion.waza_ari++;
            puntosTotal += VALORES_PUNTOS.waza_ari;
          } else if (accion.puntuacion === 'yuko') {
            puntuacion.yuko++;
            puntosTotal += VALORES_PUNTOS.yuko;
          }
        }
      });
      
      // Contar acciones combinadas
      (combate.acciones_combinadas || []).forEach(accion => {
        if (accion.competidor === competidorId) {
          if (accion.resultado_final === 'ippon') {
            puntuacion.ippon++;
            puntosTotal += VALORES_PUNTOS.ippon;
          } else if (accion.resultado_final === 'waza_ari') {
            puntuacion.waza_ari++;
            puntosTotal += VALORES_PUNTOS.waza_ari;
          } else if (accion.resultado_final === 'yuko') {
            puntuacion.yuko++;
            puntosTotal += VALORES_PUNTOS.yuko;
          }
        }
      });
      
      // Contar amonestaciones
      (combate.amonestaciones || []).forEach(accion => {
        if (accion.competidor === competidorId) {
          if (accion.tipo === 'shido') {
            puntuacion.shidos++;
            puntosTotal += VALORES_PUNTOS.shido;
          } else if (accion.tipo === 'hansokumake') {
            puntuacion.shidos = 4; // Hansoku-make = descalificación directa
            puntosTotal += VALORES_PUNTOS.shido * 4;
          }
        }
      });
      
      return { ...puntuacion, puntosTotal };
    };
    
    // Verificar que tenemos datos de competidores
    if (!combate.competidor1 || !combate.competidor2) {
      return null;
    }
    
    const puntuacionesCalculadas = {
      competidor1: {
        id: combate.competidor1.id || combate.competidor1_id || combate.competidor1,
        nombre: combate.competidor1.nombre || combate.competidor1_nombre || 'Competidor 1',
        puntuacion: calcularPuntuacionCompetidor(combate.competidor1.id || combate.competidor1_id || combate.competidor1)
      },
      competidor2: {
        id: combate.competidor2.id || combate.competidor2_id || combate.competidor2,
        nombre: combate.competidor2.nombre || combate.competidor2_nombre || 'Competidor 2',
        puntuacion: calcularPuntuacionCompetidor(combate.competidor2.id || combate.competidor2_id || combate.competidor2)
      }
    };
    
    // Verificar condiciones de finalización automática
    const comp1 = puntuacionesCalculadas.competidor1.puntuacion;
    const comp2 = puntuacionesCalculadas.competidor2.puntuacion;
    
    // Verificar Ippon
    if (comp1.ippon > 0) {
      setTimeout(() => finalizarCombateAutomatico('ippon'), 1000);
    } else if (comp2.ippon > 0) {
      setTimeout(() => finalizarCombateAutomatico('ippon'), 1000);
    }
    // Verificar dos Waza-ari (Waza-ari awasete ippon)
    else if (comp1.waza_ari >= 2) {
      setTimeout(() => finalizarCombateAutomatico('waza_ari_awasete_ippon'), 1000);
    } else if (comp2.waza_ari >= 2) {
      setTimeout(() => finalizarCombateAutomatico('waza_ari_awasete_ippon'), 1000);
    }
    // Verificar cuatro Shidos (Hansoku-make)
    else if (comp1.shidos >= 4) {
      setTimeout(() => finalizarCombateAutomatico('hansoku_make'), 1000);
    } else if (comp2.shidos >= 4) {
      setTimeout(() => finalizarCombateAutomatico('hansoku_make'), 1000);
    }
    
    return puntuacionesCalculadas;
  }, [combate, finalizarCombateAutomatico]);

  // ==================== EFECTOS ====================
  useEffect(() => {
    fetchCombate();
  }, [fetchCombate]);

  // useEffect CORREGIDO para actualizar puntuaciones (SIN BUCLE INFINITO)
  useEffect(() => {
    if (combate) {
      const nuevasPuntuaciones = calcularPuntuacionesLocales();
      
      if (nuevasPuntuaciones) {
        setPuntuaciones(nuevasPuntuaciones);
      }
    }
  }, [
    combate?.id, 
    combate?.acciones_tashi_waza?.length, 
    combate?.acciones_ne_waza?.length, 
    combate?.acciones_combinadas?.length, 
    combate?.amonestaciones?.length
    // REMOVIDO: calcularPuntuacionesLocales - esto causaba el bucle infinito
  ]);

  // ==================== COMPONENTES DE RENDERIZADO ====================
  // Función renderEstadoCombate (SIMPLIFICADA)
  const renderEstadoCombate = () => {
    if (!combate) return null;
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Control de Combate
          </Typography>
          
          {/* Información del combate */}
          <Box mb={2} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              Competición: {combate.competicion_nombre}
            </Typography>
            <Chip 
              label={combate.finalizado ? 'Finalizado' : combate.iniciado ? 'En curso' : 'No iniciado'}
              color={combate.finalizado ? 'error' : combate.iniciado ? 'success' : 'default'}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
          
          {!combate.iniciado && (
            <Box mt={2} textAlign="center">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={iniciarCombate}
                size="large"
              >
                Iniciar Combate
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };
  
  const renderMarcadorCombate = () => {
    if (!combate?.iniciado || combate?.finalizado) {
      return null;
    }

    return (
      <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          
          {/* MARCADOR CON SISTEMA DE PUNTOS */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
              MARCADOR - SISTEMA DE PUNTOS
            </Typography>
            
            <Grid container spacing={2} justifyContent="center">
              {/* Competidor 1 */}
              <Grid item xs={5}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {puntuaciones?.competidor1?.nombre || combate.competidor1.nombre}
                  </Typography>
                  
                  {/* PUNTOS TOTALES - DISPLAY PRINCIPAL */}
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'white',
                      fontFamily: 'monospace',
                      my: 1
                    }}
                  >
                    {puntuaciones?.competidor1?.puntuacion?.puntosTotal || 0}
                  </Typography>
                  
                  <Typography variant="caption" sx={{ color: 'white', display: 'block', mb: 1 }}>
                    PUNTOS TOTALES
                  </Typography>
                  
                  {/* DESGLOSE DE PUNTUACIONES */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`I: ${puntuaciones?.competidor1?.puntuacion?.ippon || 0} (${(puntuaciones?.competidor1?.puntuacion?.ippon || 0) * 10}pts)`} 
                      color="error" 
                      size="small" 
                    />
                    <Chip 
                      label={`W: ${puntuaciones?.competidor1?.puntuacion?.waza_ari || 0} (${(puntuaciones?.competidor1?.puntuacion?.waza_ari || 0) * 5}pts)`} 
                      color="warning" 
                      size="small" 
                    />
                    <Chip 
                      label={`Y: ${puntuaciones?.competidor1?.puntuacion?.yuko || 0} (${(puntuaciones?.competidor1?.puntuacion?.yuko || 0) * 3}pts)`} 
                      color="info" 
                      size="small" 
                    />
                    <Chip 
                      label={`S: ${puntuaciones?.competidor1?.puntuacion?.shidos || 0} (${(puntuaciones?.competidor1?.puntuacion?.shidos || 0) * -1}pts)`} 
                      color="default" 
                      size="small" 
                    />
                  </Box>
                </Paper>
              </Grid>
              
              {/* VS */}
              <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>VS</Typography>
              </Grid>
              
              {/* Competidor 2 */}
              <Grid item xs={5}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {puntuaciones?.competidor2?.nombre || combate.competidor2.nombre}
                  </Typography>
                  
                  {/* PUNTOS TOTALES - DISPLAY PRINCIPAL */}
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'white',
                      fontFamily: 'monospace',
                      my: 1
                    }}
                  >
                    {puntuaciones?.competidor2?.puntuacion?.puntosTotal || 0}
                  </Typography>
                  
                  <Typography variant="caption" sx={{ color: 'white', display: 'block', mb: 1 }}>
                    PUNTOS TOTALES
                  </Typography>
                  
                  {/* DESGLOSE DE PUNTUACIONES */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`I: ${puntuaciones?.competidor2?.puntuacion?.ippon || 0} (${(puntuaciones?.competidor2?.puntuacion?.ippon || 0) * 10}pts)`} 
                      color="error" 
                      size="small" 
                    />
                    <Chip 
                      label={`W: ${puntuaciones?.competidor2?.puntuacion?.waza_ari || 0} (${(puntuaciones?.competidor2?.puntuacion?.waza_ari || 0) * 5}pts)`} 
                      color="warning" 
                      size="small" 
                    />
                    <Chip 
                      label={`Y: ${puntuaciones?.competidor2?.puntuacion?.yuko || 0} (${(puntuaciones?.competidor2?.puntuacion?.yuko || 0) * 3}pts)`} 
                      color="info" 
                      size="small" 
                    />
                    <Chip 
                      label={`S: ${puntuaciones?.competidor2?.puntuacion?.shidos || 0} (${(puntuaciones?.competidor2?.puntuacion?.shidos || 0) * -1}pts)`} 
                      color="default" 
                      size="small" 
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            
            {/* LEYENDA DE PUNTOS */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                Sistema de Puntos: Ippon = 10pts | Waza-ari = 5pts | Yuko = 3pts | Shido = -1pt
              </Typography>
            </Box>
          </Box>

          {/* CRONÓMETRO */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: tiempo <= 30 ? 'error.main' : tiempo <= 60 ? 'warning.main' : 'success.main',
              }}
            >
              {formatTiempo(tiempo)}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant={cronometroActivo ? "outlined" : "contained"}
                color={cronometroActivo ? "secondary" : "primary"}
                onClick={cronometroActivo ? pausarCronometro : iniciarCronometro}
                startIcon={cronometroActivo ? <PauseIcon /> : <PlayArrowIcon />}
              >
                {cronometroActivo ? 'Pausar' : 'Iniciar'}
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                onClick={() => toggleDialog('finalizar', true)}
                startIcon={<StopIcon />}
              >
                Finalizar Combate
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderBotonesAccion = () => {
    if (!combate?.iniciado || combate?.finalizado) return null;
    
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => toggleDialog('tashi', true)}
            size="large"
          >
            Registrar Tashi Waza
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => toggleDialog('ne', true)}
            size="large"
          >
            Registrar Ne Waza
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => toggleDialog('amonestacion', true)}
            size="large"
          >
            Registrar Amonestación
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            variant="outlined" 
            color="secondary"
            onClick={() => toggleDialog('combinada', true)}
            size="large"
          >
            Acción Combinada
          </Button>
        </Grid>
      </Grid>
    );
  };

  const renderAccionesRegistradas = () => {
    if (!combate?.iniciado || accionesCombate.length === 0) return null;
    
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Acciones Registradas
          </Typography>
          <List>
            {accionesCombate.map((accion, index) => {
              // Determinar el color de la puntuación
              const getPuntuacionColor = (puntuacion) => {
                switch(puntuacion) {
                  case 'ippon': return '#d32f2f'; // Rojo
                  case 'waza_ari': return '#ed6c02'; // Naranja
                  case 'yuko': return '#2e7d32'; // Verde
                  case 'shido': return '#9c27b0'; // Púrpura
                  case 'hansokumake': return '#000000'; // Negro
                  default: return '#757575'; // Gris
                }
              };

              const puntuacionTexto = accion.puntuacion ? 
                accion.puntuacion.replace('_', ' ').toUpperCase() : 'SIN PUNTUACIÓN';

              return (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span">
                          {accion.tipo_accion}: {accion.descripcion}
                        </Typography>
                        <Chip 
                          label={puntuacionTexto}
                          size="small"
                          sx={{ 
                            backgroundColor: getPuntuacionColor(accion.puntuacion),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    }
                    secondary={`Competidor: ${accion.competidor === combate.competidor1.id ? combate.competidor1_nombre : combate.competidor2_nombre} - Tiempo: ${accion.tiempo_mostrar}${accion.efectiva !== undefined ? ` - Efectiva: ${accion.efectiva ? 'Sí' : 'No'}` : ''}`}
                  />
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>
    );
  };

  // ==================== DIÁLOGOS OPTIMIZADOS ====================
  const renderDialogTashi = () => (
    <Dialog open={dialogs.tashi} onClose={() => toggleDialog('tashi', false)} maxWidth="md" fullWidth>
      <DialogTitle>Registrar Tashi Waza (Técnica de Proyección)</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Competidor</InputLabel>
              <Select
                value={forms.tashi.competidor}
                onChange={(e) => updateForm('tashi', 'competidor', e.target.value)}
              >
                <MenuItem value={combate?.competidor1}>{combate?.competidor1_nombre}</MenuItem>
                <MenuItem value={combate?.competidor2}>{combate?.competidor2_nombre}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Categoría de Técnica</InputLabel>
              <Select
                value={forms.tashi.categoria}
                onChange={(e) => {
                  updateForm('tashi', 'categoria', e.target.value);
                  updateForm('tashi', 'tecnica', '');
                }}
              >
                <MenuItem value="kata_te_waza">Kata-te-waza (Técnicas de mano)</MenuItem>
                <MenuItem value="koshi_waza">Koshi-waza (Técnicas de cadera)</MenuItem>
                <MenuItem value="ashi_waza">Ashi-waza (Técnicas de pie)</MenuItem>
                <MenuItem value="ma_sutemi_waza">Ma-sutemi-waza (Sacrificio frontal)</MenuItem>
                <MenuItem value="yoko_sutemi_waza">Yoko-sutemi-waza (Sacrificio lateral)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!forms.tashi.categoria}>
              <InputLabel>Técnica Específica</InputLabel>
              <Select
                value={forms.tashi.tecnica}
                onChange={(e) => updateForm('tashi', 'tecnica', e.target.value)}
              >
                {obtenerTecnicas('tashi', forms.tashi.categoria).map((tecnica) => (
                  <MenuItem key={tecnica.value} value={tecnica.value}>
                    {tecnica.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Puntuación</InputLabel>
              <Select
                value={forms.tashi.puntuacion}
                onChange={(e) => updateForm('tashi', 'puntuacion', e.target.value)}
              >
                <MenuItem value="ippon">Ippon</MenuItem>
                <MenuItem value="waza_ari">Waza-ari</MenuItem>
                <MenuItem value="yuko">Yuko</MenuItem>
                <MenuItem value="sin_puntuacion">Sin puntuación</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={forms.tashi.efectiva}
                  onChange={(e) => updateForm('tashi', 'efectiva', e.target.checked)}
                />
              }
              label="¿Efectiva?"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => toggleDialog('tashi', false)}>Cancelar</Button>
        <Button onClick={() => registrarAccion('tashi')} variant="contained">Registrar</Button>
      </DialogActions>
    </Dialog>
  );

  const renderDialogNe = () => (
    <Dialog open={dialogs.ne} onClose={() => toggleDialog('ne', false)} maxWidth="md" fullWidth>
      <DialogTitle>Registrar Ne Waza (Técnica de Suelo)</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Competidor</InputLabel>
              <Select
                value={forms.ne.competidor}
                onChange={(e) => updateForm('ne', 'competidor', e.target.value)}
              >
                <MenuItem value={combate?.competidor1}>{combate?.competidor1_nombre}</MenuItem>
                <MenuItem value={combate?.competidor2}>{combate?.competidor2_nombre}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Categoría de Técnica</InputLabel>
              <Select
                value={forms.ne.categoria}
                onChange={(e) => {
                  updateForm('ne', 'categoria', e.target.value);
                  updateForm('ne', 'tecnica', '');
                }}
              >
                <MenuItem value="osaekomi_waza">Osaekomi-waza (Inmovilizaciones)</MenuItem>
                <MenuItem value="shime_waza">Shime-waza (Estrangulaciones)</MenuItem>
                <MenuItem value="kansetsu_waza">Kansetsu-waza (Luxaciones)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!forms.ne.categoria}>
              <InputLabel>Técnica Específica</InputLabel>
              <Select
                value={forms.ne.tecnica}
                onChange={(e) => updateForm('ne', 'tecnica', e.target.value)}
              >
                {obtenerTecnicas('ne', forms.ne.categoria).map((tecnica) => (
                  <MenuItem key={tecnica.value} value={tecnica.value}>
                    {tecnica.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {forms.ne.categoria === 'osaekomi_waza' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duración del Control (segundos)"
                type="number"
                value={forms.ne.duracion}
                onChange={(e) => updateForm('ne', 'duracion', e.target.value)}
                helperText="Mínimo 10 seg para Waza-ari, 20 seg para Ippon"
              />
            </Grid>
          )}
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={forms.ne.efectiva}
                  onChange={(e) => updateForm('ne', 'efectiva', e.target.checked)}
                />
              }
              label="¿Efectiva?"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Puntuación Calculada"
              value={calcularPuntuacionNe(forms.ne.categoria, forms.ne.duracion, forms.ne.efectiva)}
              disabled
              helperText="La puntuación se calcula automáticamente"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => toggleDialog('ne', false)}>Cancelar</Button>
        <Button onClick={() => registrarAccion('ne')} variant="contained">Registrar</Button>
      </DialogActions>
    </Dialog>
  );

  const renderDialogAmonestacion = () => (
    <Dialog open={dialogs.amonestacion} onClose={() => toggleDialog('amonestacion', false)} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar Amonestación</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Competidor</InputLabel>
              <Select
                value={forms.amonestacion.competidor}
                onChange={(e) => updateForm('amonestacion', 'competidor', e.target.value)}
              >
                <MenuItem value={combate?.competidor1}>{combate?.competidor1_nombre}</MenuItem>
                <MenuItem value={combate?.competidor2}>{combate?.competidor2_nombre}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Amonestación</InputLabel>
              <Select
                value={forms.amonestacion.tipo}
                onChange={(e) => updateForm('amonestacion', 'tipo', e.target.value)}
              >
                {TIPOS_AMONESTACION.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => toggleDialog('amonestacion', false)}>Cancelar</Button>
        <Button onClick={() => registrarAccion('amonestacion')} variant="contained">Registrar</Button>
      </DialogActions>
    </Dialog>
  );

  const renderDialogCombinada = () => (
    <Dialog open={dialogs.combinada} onClose={() => toggleDialog('combinada', false)} maxWidth="lg" fullWidth>
      <DialogTitle>Registrar Acción Combinada (Sin Límite de Técnicas)</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Información básica */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Competidor</InputLabel>
              <Select
                value={forms.combinada.competidor}
                onChange={(e) => updateForm('combinada', 'competidor', e.target.value)}
              >
                <MenuItem value={combate?.competidor1}>{combate?.competidor1_nombre}</MenuItem>
                <MenuItem value={combate?.competidor2}>{combate?.competidor2_nombre}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Resultado Final (Automático)"
              value={determinarResultadoAutomatico(
                forms.combinada.acciones.filter(a => a.tipo === 'tashi'),
                forms.combinada.acciones.filter(a => a.tipo === 'ne')
              )}
              disabled
              helperText="El resultado se determina automáticamente"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observaciones (Opcional)"
              value={forms.combinada.observaciones}
              onChange={(e) => updateForm('combinada', 'observaciones', e.target.value)}
              placeholder="Ej: Excelente transición entre técnicas..."
              multiline
              rows={2}
            />
          </Grid>

          {/* Sección para agregar nuevas acciones */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Agregar Técnicas a la Combinación:
            </Typography>
            
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={nuevaAccion.tipo}
                      onChange={(e) => setNuevaAccion(prev => ({ 
                        ...prev, 
                        tipo: e.target.value, 
                        categoria: '', 
                        tecnica: '',
                        puntuacion: '',
                        duracion: ''
                      }))}
                    >
                      <MenuItem value="tashi">Tashi-waza</MenuItem>
                      <MenuItem value="ne">Ne-waza</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Categoría</InputLabel>
                    <Select
                      value={nuevaAccion.categoria}
                      onChange={(e) => setNuevaAccion(prev => ({ 
                        ...prev, 
                        categoria: e.target.value, 
                        tecnica: '' 
                      }))}
                      disabled={!nuevaAccion.tipo}
                    >
                      {nuevaAccion.tipo === 'tashi' ? [
                        <MenuItem key="kata_te_waza" value="kata_te_waza">Kata-te-waza</MenuItem>,
                        <MenuItem key="koshi_waza" value="koshi_waza">Koshi-waza</MenuItem>,
                        <MenuItem key="ashi_waza" value="ashi_waza">Ashi-waza</MenuItem>,
                        <MenuItem key="ma_sutemi_waza" value="ma_sutemi_waza">Ma-sutemi-waza</MenuItem>,
                        <MenuItem key="yoko_sutemi_waza" value="yoko_sutemi_waza">Yoko-sutemi-waza</MenuItem>
                      ] : [
                        <MenuItem key="osaekomi_waza" value="osaekomi_waza">Osaekomi-waza</MenuItem>,
                        <MenuItem key="shime_waza" value="shime_waza">Shime-waza</MenuItem>,
                        <MenuItem key="kansetsu_waza" value="kansetsu_waza">Kansetsu-waza</MenuItem>
                      ]}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Técnica</InputLabel>
                    <Select
                      value={nuevaAccion.tecnica}
                      onChange={(e) => setNuevaAccion(prev => ({ ...prev, tecnica: e.target.value }))}
                      disabled={!nuevaAccion.categoria}
                    >
                      {obtenerTecnicas(nuevaAccion.tipo, nuevaAccion.categoria).map(tecnica => (
                        <MenuItem key={tecnica.value} value={tecnica.value}>
                          {tecnica.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {nuevaAccion.tipo === 'tashi' && (
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Puntuación</InputLabel>
                      <Select
                        value={nuevaAccion.puntuacion}
                        onChange={(e) => setNuevaAccion(prev => ({ ...prev, puntuacion: e.target.value }))}
                      >
                        <MenuItem value="ippon">Ippon</MenuItem>
                        <MenuItem value="waza_ari">Waza-ari</MenuItem>
                        <MenuItem value="yuko">Yuko</MenuItem>
                        <MenuItem value="sin_puntuacion">Sin puntuación</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                {nuevaAccion.tipo === 'ne' && nuevaAccion.categoria === 'osaekomi_waza' && (
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Duración (seg)"
                      type="number"
                      value={nuevaAccion.duracion}
                      onChange={(e) => setNuevaAccion(prev => ({ ...prev, duracion: e.target.value }))}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} sm={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={nuevaAccion.efectiva}
                        onChange={(e) => setNuevaAccion(prev => ({ ...prev, efectiva: e.target.checked }))}
                        size="small"
                      />
                    }
                    label="Efectiva"
                  />
                </Grid>
                
                <Grid item xs={12} sm={1}>
                  <IconButton 
                    onClick={agregarAccionCombinada}
                    color="primary"
                    disabled={!nuevaAccion.categoria || !nuevaAccion.tecnica}
                  >
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Lista de acciones agregadas */}
          {forms.combinada.acciones.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Técnicas en la Combinación ({forms.combinada.acciones.length}):
              </Typography>
              
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Nombre de la combinación: {generarNombreCombinacion(forms.combinada.acciones)}
                </Typography>
                
                <List dense>
                  {forms.combinada.acciones.map((accion, index) => (
                    <ListItem key={accion.id} divider>
                      <ListItemText
                        primary={`${index + 1}. ${CATEGORIA_LABELS[accion.categoria]} - ${accion.tecnica}`}
                        secondary={`Tipo: ${accion.tipo === 'tashi' ? 'Tashi-waza' : 'Ne-waza'} | Puntuación: ${accion.puntuacion} | Efectiva: ${accion.efectiva ? 'Sí' : 'No'}${accion.duracion ? ` | Duración: ${accion.duracion}s` : ''}`}
                      />
                      <IconButton 
                        onClick={() => eliminarAccionCombinada(accion.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => toggleDialog('combinada', false)}>Cancelar</Button>
        <Button 
          onClick={() => registrarAccion('combinada')} 
          variant="contained"
          disabled={forms.combinada.acciones.length === 0}
        >
          Registrar Combinación
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDialogFinalizar = () => {
    return (
      <Dialog open={dialogs.finalizar} onClose={() => toggleDialog('finalizar', false)} maxWidth="sm" fullWidth>
        <DialogTitle>Finalizar Combate</DialogTitle>
        <DialogContent>
          {(() => {
            const ganadorAutomatico = determinarGanadorAutomatico(combate);
            if (ganadorAutomatico) {
              const nombreGanador = combate?.competidor1?.id === ganadorAutomatico 
                ? combate.competidor1.nombre 
                : combate.competidor2.nombre;
              return (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Ganador determinado automáticamente:</strong> {nombreGanador}
                </Alert>
              );
            } else {
              return (
                <>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    El combate está empatado. Seleccione el ganador manualmente.
                  </Alert>
                  <FormControl fullWidth>
                    <InputLabel>Seleccionar Ganador</InputLabel>
                    <Select
                      value={ganadorSeleccionado}
                      onChange={(e) => setGanadorSeleccionado(e.target.value)}
                      label="Seleccionar Ganador"
                    >
                      {combate && (
                        <>
                          <MenuItem value={combate.competidor1.id}>
                            {combate.competidor1.nombre}
                          </MenuItem>
                          <MenuItem value={combate.competidor2.id}>
                            {combate.competidor2.nombre}
                          </MenuItem>
                        </>
                      )}
                    </Select>
                  </FormControl>
                </>
              );
            }
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleDialog('finalizar', false)}>Cancelar</Button>
          <Button onClick={finalizarCombate} variant="contained" color="primary">
            Finalizar Combate
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // ==================== RENDER PRINCIPAL ====================
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Cargando combate...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <BackButton />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {renderEstadoCombate()}
      {renderMarcadorCombate()}
      {renderBotonesAccion()}
      {renderAccionesRegistradas()}
      
      {/* Diálogos */}
      {renderDialogTashi()}
      {renderDialogNe()}
      {renderDialogAmonestacion()}
      {renderDialogCombinada()}
      {renderDialogFinalizar()}
      
      {/* Snackbar para mensajes de éxito */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={mensajeExito}
      />
    </Container>
  );
}

export default CombateControl;