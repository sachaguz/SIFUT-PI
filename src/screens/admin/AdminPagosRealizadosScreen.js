import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import PillSelector from '../../components/PillSelector';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import api, { formatDate } from '../../services/api';
import { colors } from '../../theme/colors';

const FILTROS = ['Todos', 'TARJETA', 'EFECTIVO', 'TRANSFERENCIA'];
const FILTRO_LABELS = { Todos: 'Todos', TARJETA: 'Tarjeta', EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia' };

export default function AdminPagosRealizadosScreen() {
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/pagos?estado=APROBADO').then((r) => setPagos(r.data)).finally(() => setLoading(false));
    }, [])
  );

  const pagosFiltrados = useMemo(
    () => (filtro === 'Todos' ? pagos : pagos.filter((p) => p.metodo === filtro)),
    [filtro, pagos]
  );

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader title="Pagos realizados" subtitle="Historial de transacciones" />

      <PillSelector options={FILTROS.map((f) => FILTRO_LABELS[f])} value={FILTRO_LABELS[filtro]} onChange={(label) => {
        const key = Object.keys(FILTRO_LABELS).find((k) => FILTRO_LABELS[k] === label);
        setFiltro(key || 'Todos');
      }} />

      {pagosFiltrados.map((pago) => (
        <ListRow
          key={pago.id}
          icon="receipt-outline"
          title={pago.concepto}
          subtitle={`${FILTRO_LABELS[pago.metodo] || pago.metodo} · ${formatDate(pago.fecha)}`}
          meta={pago.folio}
          right={<Badge label={`$${Number(pago.monto)}`} tone="success" />}
        />
      ))}
    </ScreenContainer>
  );
}
