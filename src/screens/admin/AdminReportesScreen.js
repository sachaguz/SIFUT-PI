import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Alert from '../../services/alert';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import api, { formatDate, localDateString } from '../../services/api';
import { spacing } from '../../theme/colors';

const FORMATOS = ['CSV', 'Excel', 'PDF'];
const METODO_LABELS = { TARJETA: 'Tarjeta', EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia' };

function haceUnMesISO() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return localDateString(d);
}

function csvEscape(value) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function buildRows(pagos) {
  const total = pagos.reduce((sum, p) => sum + Number(p.monto), 0);
  return {
    headers: ['Folio', 'Concepto', 'Método', 'Fecha', 'Monto (MXN)', 'Estado'],
    rows: pagos.map((p) => [
      p.folio,
      p.concepto,
      METODO_LABELS[p.metodo] || p.metodo,
      formatDate(p.fecha),
      Number(p.monto).toFixed(2),
      p.estado,
    ]),
    total,
  };
}

function buildCSV(pagos) {
  const { headers, rows, total } = buildRows(pagos);
  const lines = [headers.join(',')];
  rows.forEach((r) => lines.push(r.map(csvEscape).join(',')));
  lines.push('');
  lines.push(`Total,,,,${total.toFixed(2)},`);
  return lines.join('\n');
}

// Excel opens an HTML <table> saved with a .xls extension as a real
// spreadsheet - a well-known dependency-free way to produce something
// Excel treats natively, without pulling in a binary xlsx writer.
function buildExcelHTML(pagos, desde, hasta) {
  const { headers, rows, total } = buildRows(pagos);
  const headerRow = headers.map((h) => `<th>${h}</th>`).join('');
  const bodyRows = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<html><head><meta charset="utf-8"></head><body>
    <table border="1">
      <caption>Reporte de ingresos ${desde} a ${hasta}</caption>
      <tr>${headerRow}</tr>
      ${bodyRows}
      <tr><td colspan="4"><b>Total</b></td><td><b>${total.toFixed(2)}</b></td><td></td></tr>
    </table>
  </body></html>`;
}

function buildPrintableHTML(pagos, desde, hasta) {
  const { headers, rows, total } = buildRows(pagos);
  const headerRow = headers.map((h) => `<th>${h}</th>`).join('');
  const bodyRows = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<html><head><meta charset="utf-8"><title>Reporte financiero</title>
    <style>
      body { font-family: sans-serif; padding: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 13px; }
      th { background: #f0efe6; }
      h1 { font-size: 18px; }
    </style>
  </head><body>
    <h1>Reporte de ingresos</h1>
    <p>Del ${desde} al ${hasta}</p>
    <table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>
    <p><b>Total: $${total.toFixed(2)} MXN</b></p>
  </body></html>`;
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminReportesScreen() {
  const [desde, setDesde] = useState(haceUnMesISO());
  const [hasta, setHasta] = useState(localDateString());
  const [formato, setFormato] = useState(FORMATOS[0]);
  const [loading, setLoading] = useState(false);

  const handleDescargar = async () => {
    setLoading(true);
    try {
      const { data: pagos } = await api.get('/pagos', { params: { desde, hasta, estado: 'APROBADO' } });

      if (pagos.length === 0) {
        Alert.alert('Sin datos', 'No hay pagos aprobados en ese rango de fechas.');
        return;
      }

      if (Platform.OS !== 'web') {
        const total = pagos.reduce((sum, p) => sum + Number(p.monto), 0);
        Alert.alert(
          'Reporte generado',
          `${pagos.length} transacciones del ${desde} al ${hasta}.\nTotal: $${total.toFixed(2)} MXN`
        );
        return;
      }

      const base = `reporte-ingresos_${desde}_a_${hasta}`;
      if (formato === 'CSV') {
        downloadBlob(buildCSV(pagos), `${base}.csv`, 'text/csv;charset=utf-8');
      } else if (formato === 'Excel') {
        downloadBlob(buildExcelHTML(pagos, desde, hasta), `${base}.xls`, 'application/vnd.ms-excel');
      } else {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          Alert.alert('Error', 'El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio.');
          return;
        }
        printWindow.document.write(buildPrintableHTML(pagos, desde, hasta));
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <SectionHeader title="Reportes financieros" subtitle="Consolidado de ingresos por fecha" />

      <View style={styles.rowInputs}>
        <FormInput label="Desde" value={desde} onChangeText={setDesde} containerStyle={{ flex: 1, marginRight: spacing.sm }} />
        <FormInput label="Hasta" value={hasta} onChangeText={setHasta} containerStyle={{ flex: 1 }} />
      </View>

      <PillSelector label="Formato" options={FORMATOS} value={formato} onChange={setFormato} />

      <PrimaryButton title="Descargar reporte" onPress={handleDescargar} loading={loading} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  rowInputs: {
    flexDirection: 'row',
  },
});
