import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, fonts, radius, spacing, typography } from '../../theme/colors';

const TIPOS = ['Fútbol 5', 'Fútbol 7', 'Fútbol 11'];
const CATEGORIAS = ['Libre', 'Sub-18', 'Sub-15', 'Veteranos'];
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function OrgTorneoFormScreen({ navigation, route }) {
  const torneo = route.params?.torneo;
  const [nombre, setNombre] = useState(torneo?.nombre || '');
  const [tipo, setTipo] = useState(torneo?.tipo || TIPOS[1]);
  const [categoria, setCategoria] = useState(torneo?.categoria || CATEGORIAS[0]);
  const [diasJuego, setDiasJuego] = useState(torneo?.diasJuego || ['Sáb', 'Dom']);
  const [fechaInicio, setFechaInicio] = useState(torneo?.fechaInicio ? torneo.fechaInicio.substring(0, 10) : '');
  const [fechaFin, setFechaFin] = useState(torneo?.fechaFin ? torneo.fechaFin.substring(0, 10) : '');
  const [saving, setSaving] = useState(false);

  const toggleDia = (dia) => {
    setDiasJuego((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]));
  };

  const handleGuardar = async () => {
    if (!nombre) {
      Alert.alert('Falta el nombre', 'Ingresa el nombre del torneo.');
      return;
    }
    if (!fechaInicio || !fechaFin) {
      Alert.alert('Faltan fechas', 'Ingresa las fechas de inicio y fin.');
      return;
    }
    setSaving(true);
    try {
      const body = { nombre, tipo, categoria, fechaInicio, fechaFin, diasJuego };
      if (torneo?.id) {
        await api.put(`/torneos/${torneo.id}`, body);
      } else {
        await api.post('/torneos', body);
      }
      Alert.alert('Torneo guardado', `${nombre} se guardó correctamente.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'No se pudo guardar el torneo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{torneo ? 'Editar torneo' : 'Nuevo torneo'}</Text>

      <FormInput label="Nombre" placeholder="Nombre del torneo" value={nombre} onChangeText={setNombre} />

      <PillSelector label="Tipo" options={TIPOS} value={tipo} onChange={setTipo} />

      <PillSelector label="Categoría" options={CATEGORIAS} value={categoria} onChange={setCategoria} />

      <View style={styles.rowInputs}>
        <FormInput label="Fecha inicio" placeholder="2026-08-01" value={fechaInicio} onChangeText={setFechaInicio} containerStyle={{ flex: 1, marginRight: spacing.sm }} />
        <FormInput label="Fecha fin" placeholder="2026-12-15" value={fechaFin} onChangeText={setFechaFin} containerStyle={{ flex: 1 }} />
      </View>

      <Text style={styles.label}>Días de juego</Text>
      <View style={styles.multiRow}>
        {DIAS.map((dia) => {
          const active = diasJuego.includes(dia);
          return (
            <TouchableOpacity key={dia} style={[styles.dayPill, active && styles.dayPillActive]} onPress={() => toggleDia(dia)}>
              <Text style={[styles.dayPillText, active && styles.dayPillTextActive]}>{dia}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Volver" variant="outline" onPress={() => navigation.goBack()} style={styles.actionBtn} />
        <PrimaryButton title={saving ? 'Guardando...' : 'Guardar'} onPress={handleGuardar} disabled={saving} style={styles.actionBtn} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  multiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dayPill: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dayPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  dayPillTextActive: {
    color: colors.accentText,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
