import { useMemo, useState } from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import PillSelector from '../../components/PillSelector';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';

const FILTROS = ['Todos', 'Tarjeta', 'Efectivo', 'Transferencia'];

const PAGOS = [
  { id: '1', concepto: 'Renta Cancha 1 - Sede Centro Histórico', metodo: 'Tarjeta', monto: 450, fecha: '05/07/2026', folio: 'PAG-1042' },
  { id: '2', concepto: 'Inscripción Equipo Halcones', metodo: 'Transferencia', monto: 1200, fecha: '04/07/2026', folio: 'PAG-1041' },
  { id: '3', concepto: 'Renta Cancha 1 - Sede Juriquilla', metodo: 'Efectivo', monto: 450, fecha: '03/07/2026', folio: 'PAG-1040' },
  { id: '4', concepto: 'Renta Cancha 2 - Sede Centro Histórico', metodo: 'Tarjeta', monto: 750, fecha: '03/07/2026', folio: 'PAG-1039' },
];

export default function AdminPagosRealizadosScreen() {
  const [filtro, setFiltro] = useState('Todos');

  const pagosFiltrados = useMemo(
    () => (filtro === 'Todos' ? PAGOS : PAGOS.filter((pago) => pago.metodo === filtro)),
    [filtro]
  );

  return (
    <ScreenContainer>
      <SectionHeader title="Pagos realizados" subtitle="Historial de transacciones" />

      <PillSelector options={FILTROS} value={filtro} onChange={setFiltro} />

      {pagosFiltrados.map((pago) => (
        <ListRow
          key={pago.id}
          icon="receipt-outline"
          title={pago.concepto}
          subtitle={`${pago.metodo} · ${pago.fecha}`}
          meta={pago.folio}
          right={<Badge label={`$${pago.monto}`} tone="success" />}
        />
      ))}
    </ScreenContainer>
  );
}
