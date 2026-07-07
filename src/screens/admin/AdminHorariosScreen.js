import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import PillSelector from '../../components/PillSelector';
import Badge from '../../components/Badge';
import { spacing } from '../../theme/colors';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const BLOQUES = {
  Lun: [
    { hora: '08:00 - 09:00', cancha: 'Cancha 1', precio: 450, disponible: true },
    { hora: '15:00 - 16:00', cancha: 'Cancha 1', precio: 500, disponible: false },
    { hora: '16:00 - 17:00', cancha: 'Cancha 2', precio: 650, disponible: true },
  ],
  Mar: [
    { hora: '09:00 - 10:00', cancha: 'Cancha 1', precio: 450, disponible: true },
    { hora: '18:00 - 19:00', cancha: 'Cancha 2', precio: 650, disponible: false },
  ],
  Mié: [{ hora: '17:00 - 18:00', cancha: 'Cancha 1', precio: 500, disponible: true }],
  Jue: [{ hora: '19:00 - 20:00', cancha: 'Cancha 2', precio: 650, disponible: true }],
  Vie: [
    { hora: '20:00 - 21:00', cancha: 'Cancha 1', precio: 500, disponible: false },
    { hora: '21:00 - 22:00', cancha: 'Cancha 2', precio: 650, disponible: true },
  ],
  Sáb: [
    { hora: '10:00 - 11:00', cancha: 'Cancha 1', precio: 450, disponible: true },
    { hora: '11:00 - 12:00', cancha: 'Cancha 2', precio: 650, disponible: true },
  ],
  Dom: [{ hora: '12:00 - 13:00', cancha: 'Cancha 1', precio: 450, disponible: true }],
};

export default function AdminHorariosScreen({ route }) {
  const sede = route.params?.sede || 'Sede seleccionada';
  const [dia, setDia] = useState('Lun');

  const bloques = BLOQUES[dia] || [];

  return (
    <ScreenContainer>
      <SectionHeader title="Horarios" subtitle={sede} />

      <PillSelector options={DIAS} value={dia} onChange={setDia} />

      {bloques.length === 0 ? (
        <Text style={styles.empty}>No hay bloques configurados este día.</Text>
      ) : (
        bloques.map((bloque, index) => (
          <ListRow
            key={`${bloque.hora}-${index}`}
            icon="time-outline"
            title={bloque.hora}
            subtitle={bloque.cancha}
            meta={`$${bloque.precio} MXN/hora`}
            right={
              <Badge label={bloque.disponible ? 'Disponible' : 'Ocupado'} tone={bloque.disponible ? 'success' : 'danger'} />
            }
          />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    marginTop: spacing.lg,
    color: '#6B7570',
  },
});
