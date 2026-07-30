import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import PillSelector from '../../components/PillSelector';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';

const ROLE_TONE = { ADMIN: 'danger', ORGANIZADOR: 'warning', USUARIO: 'neutral' };
const ROLE_OPTIONS = ['Todos', 'ADMIN', 'ORGANIZADOR', 'USUARIO'];

export default function AdminUsuariosScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('Todos');
  const [q, setQ] = useState('');

  const fetchUsuarios = useCallback(() => {
    setLoading(true);
    const params = {};
    if (role !== 'Todos') params.role = role;
    if (q) params.q = q;
    api.get('/usuarios', { params }).then((r) => setUsuarios(r.data)).finally(() => setLoading(false));
  }, [role, q]);

  useFocusEffect(fetchUsuarios);

  return (
    <ScreenContainer>
      <SectionHeader eyebrow="Cuentas" title="Usuarios" subtitle={`${usuarios.length} cuentas registradas`} />

      <FormInput placeholder="Buscar por nombre o correo" value={q} onChangeText={setQ} onSubmitEditing={fetchUsuarios} />
      <PillSelector options={ROLE_OPTIONS} value={role} onChange={setRole} />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        usuarios.map((usuario) => (
          <ListRow
            key={usuario.id}
            icon="person-outline"
            title={`${usuario.nombre} ${usuario.apellido}`}
            subtitle={usuario.telefono ? `${usuario.email} · ${usuario.telefono}` : usuario.email}
            meta={`${usuario._count?.reservas ?? 0} reservas`}
            right={<Badge label={usuario.role} tone={ROLE_TONE[usuario.role]} />}
            onPress={() => navigation.navigate('AdminUsuarioForm', { usuario })}
          />
        ))
      )}

      <View style={styles.footer}>
        <PrimaryButton title="+ Nuevo usuario" onPress={() => navigation.navigate('AdminUsuarioForm')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: spacing.md,
  },
});
