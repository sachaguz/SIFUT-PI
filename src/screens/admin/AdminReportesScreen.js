import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Alert from '../../services/alert';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import { spacing } from '../../theme/colors';

const FORMATOS = ['CSV', 'Excel', 'PDF'];

export default function AdminReportesScreen() {
  const [desde, setDesde] = useState('01/07/2026');
  const [hasta, setHasta] = useState('05/07/2026');
  const [formato, setFormato] = useState(FORMATOS[0]);

  const handleDescargar = () => {
    Alert.alert('Reporte generado', `Descargando ingresos del ${desde} al ${hasta} en formato ${formato}.`);
  };

  return (
    <ScreenContainer>
      <SectionHeader title="Reportes financieros" subtitle="Consolidado de ingresos por fecha" />

      <View style={styles.rowInputs}>
        <FormInput label="Desde" value={desde} onChangeText={setDesde} containerStyle={{ flex: 1, marginRight: spacing.sm }} />
        <FormInput label="Hasta" value={hasta} onChangeText={setHasta} containerStyle={{ flex: 1 }} />
      </View>

      <PillSelector label="Formato" options={FORMATOS} value={formato} onChange={setFormato} />

      <PrimaryButton title="Descargar reporte" onPress={handleDescargar} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  rowInputs: {
    flexDirection: 'row',
  },
});
