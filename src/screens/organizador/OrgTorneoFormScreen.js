import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import { EQUIPOS } from '../../data/torneos';
import { colors, fonts, radius, spacing, typography } from '../../theme/colors';

const TIPOS = ['Fútbol 5', 'Fútbol 7', 'Fútbol 11'];
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function OrgTorneoFormScreen({ navigation, route }) {
  const torneo = route.params?.torneo;
  const [nombre, setNombre] = useState(torneo?.nombre || '');
  const [tipo, setTipo] = useState(torneo?.tipo || TIPOS[1]);
  const [diasJuego, setDiasJuego] = useState(['Sáb', 'Dom']);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('21:00');
  const [equiposSeleccionados, setEquiposSeleccionados] = useState(torneo?.equipos || []);

  const toggleDia = (dia) => {
    setDiasJuego((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]));
  };

  const toggleEquipo = (nombreEquipo) => {
    setEquiposSeleccionados((prev) =>
      prev.includes(nombreEquipo) ? prev.filter((e) => e !== nombreEquipo) : [...prev, nombreEquipo]
    );
  };

  const handleGuardar = () => {
    if (!nombre) {
      Alert.alert('Falta el nombre', 'Ingresa el nombre del torneo.');
      return;
    }
    Alert.alert('Torneo guardado', `${nombre} se guardó correctamente.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{torneo ? 'Editar torneo' : 'Nuevo torneo'}</Text>

      <FormInput label="Nombre" placeholder="Nombre del torneo" value={nombre} onChangeText={setNombre} />

      <PillSelector label="Tipo" options={TIPOS} value={tipo} onChange={setTipo} />

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

      <View style={styles.rowInputs}>
        <FormInput label="Hora inicio" value={horaInicio} onChangeText={setHoraInicio} containerStyle={{ flex: 1, marginRight: spacing.sm }} />
        <FormInput label="Hora fin" value={horaFin} onChangeText={setHoraFin} containerStyle={{ flex: 1 }} />
      </View>

      <Text style={styles.label}>Agregar equipos existentes</Text>
      <ScrollView style={styles.equiposList} nestedScrollEnabled>
        {EQUIPOS.map((equipo) => {
          const active = equiposSeleccionados.includes(equipo.nombre);
          return (
            <TouchableOpacity key={equipo.id} style={styles.equipoRow} onPress={() => toggleEquipo(equipo.nombre)}>
              <Text style={styles.equipoText}>{equipo.nombre}</Text>
              <View style={[styles.checkbox, active && styles.checkboxActive]} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton title="Volver" variant="outline" onPress={() => navigation.goBack()} style={styles.actionBtn} />
        <PrimaryButton title="Guardar" onPress={handleGuardar} style={styles.actionBtn} />
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
  equiposList: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  equipoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  equipoText: {
    ...typography.body,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
