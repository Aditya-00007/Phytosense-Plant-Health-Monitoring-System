import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import CropChips from '../../components/CropChips';
import { ErrorText } from '../../components/StateViews';
import { useProfileController } from '../../controllers/ProfileController';
import { FARMING_TYPES, IRRIGATION_METHODS, LANGUAGES, WATER_LEVELS } from '../../utils/profile';
import { colors, radius, spacing } from '../../theme';

function DetailRow({ label, value }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value || 'Not set'}</Text>
    </View>
  );
}

export default function ProfileView() {
  const c = useProfileController();
  const { user, form } = c;

  return (
    <ScreenContainer>
      <Card style={s.headerCard}>
        <Ionicons name="person-circle" size={72} color={colors.primary} />
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.badges}>
          {c.region ? <Badge label={c.region} color={colors.primary} /> : null}
          {c.sizeCategory !== 'Unknown' ? <Badge label={`${c.sizeCategory} Farm`} color={colors.primaryMid} /> : null}
          {user?.farmingType ? <Badge label={user.farmingType} color={colors.accent} /> : null}
        </View>
      </Card>

      {c.savedNotice ? (
        <View style={s.successBox}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={s.successText}>Farmer profile updated successfully!</Text>
        </View>
      ) : null}

      {c.editing ? (
        <>
          <Card style={s.section}>
            <Text style={s.sectionTitle}>Personal Information</Text>
            <TextField label="Full Name" value={form.name} onChangeText={(v) => c.setField('name', v)} />
            <TextField label="Phone Number" value={form.phone} onChangeText={(v) => c.setField('phone', v)} keyboardType="phone-pad" placeholder="e.g., +91 98765 43210" />
            <TextField label="Farm Location" value={form.farmLocation} onChangeText={(v) => c.setField('farmLocation', v)} placeholder="e.g., Pune, Maharashtra" />
          </Card>

          <Card style={s.section}>
            <Text style={s.sectionTitle}>Farm Details</Text>
            <TextField label="Farm Size (acres)" value={form.farmSize} onChangeText={(v) => c.setField('farmSize', v)} keyboardType="decimal-pad" placeholder="e.g., 4.5" />
            <Text style={s.fieldLabel}>Farming Type</Text>
            <CropChips options={FARMING_TYPES} value={form.farmingType} onChange={(v) => c.setField('farmingType', v)} />
            <Text style={s.fieldLabel}>Irrigation Method</Text>
            <CropChips options={IRRIGATION_METHODS} value={form.irrigation} onChange={(v) => c.setField('irrigation', v)} />
            <Text style={s.fieldLabel}>Water Availability</Text>
            <CropChips options={WATER_LEVELS} value={form.waterAvailability} onChange={(v) => c.setField('waterAvailability', v)} />
            <TextField label="Estimated Annual Income (₹)" value={form.income} onChangeText={(v) => c.setField('income', v)} keyboardType="numeric" placeholder="e.g., 250000" />
          </Card>

          <Card style={s.section}>
            <Text style={s.sectionTitle}>Crops</Text>
            <TextField label="Primary Crops (comma-separated)" value={form.primaryCrops} onChangeText={(v) => c.setField('primaryCrops', v)} placeholder="e.g., Tomato, Onion, Wheat" />
            <TextField label="Secondary Crops (comma-separated)" value={form.secondaryCrops} onChangeText={(v) => c.setField('secondaryCrops', v)} placeholder="e.g., Potato, Soybean" />
          </Card>

          <Card style={s.section}>
            <Text style={s.sectionTitle}>Preferences</Text>
            <View style={s.switchRow}>
              <Text style={s.switchLabel}>Receive Weather Alerts</Text>
              <Switch
                value={form.receiveWeatherAlerts}
                onValueChange={(v) => c.setField('receiveWeatherAlerts', v)}
                trackColor={{ false: colors.border, true: colors.primaryMid }}
                thumbColor={colors.card}
              />
            </View>
            <Text style={s.fieldLabel}>Preferred Language</Text>
            <CropChips options={LANGUAGES} value={form.preferredLanguage} onChange={(v) => c.setField('preferredLanguage', v)} />
          </Card>

          <ErrorText message={c.error} />
          <View style={s.actions}>
            <Button title="Cancel" variant="outline" onPress={c.cancel} style={s.half} />
            <Button title="Save Profile" onPress={c.save} loading={c.saving} style={s.half} />
          </View>
        </>
      ) : (
        <>
          <Card style={s.section}>
            <Text style={s.sectionTitle}>Farm Profile</Text>
            <DetailRow label="Phone" value={user?.phone} />
            <DetailRow label="Location" value={user?.farmLocation} />
            <DetailRow
              label="Farm Size"
              value={user?.farmSize ? `${user.farmSize} acres${c.sizeCategory !== 'Unknown' ? ` (${c.sizeCategory})` : ''}` : ''}
            />
            <DetailRow label="Farming Type" value={user?.farmingType} />
            <DetailRow label="Irrigation" value={user?.irrigation} />
            <DetailRow label="Water Availability" value={user?.waterAvailability} />
            <DetailRow label="Annual Income" value={user?.income ? `₹${user.income}` : ''} />
            <DetailRow label="Primary Crops" value={user?.primaryCrops} />
            <DetailRow label="Secondary Crops" value={user?.secondaryCrops} />
            <DetailRow label="Language" value={user?.preferredLanguage} />
            <DetailRow label="Weather Alerts" value={user?.receiveWeatherAlerts ? 'Enabled' : 'Disabled'} />
          </Card>

          <Button title="Edit Farmer Profile" onPress={c.startEdit} style={{ marginTop: spacing.md }} />
        </>
      )}

      <Button title="Sign out" variant="outline" onPress={c.signOut} style={{ marginTop: spacing.sm }} />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  headerCard: { alignItems: 'center', marginBottom: spacing.md },
  name: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  email: { color: colors.muted, marginTop: 2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.sm },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  successText: { color: colors.primary, fontWeight: '600' },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  fieldLabel: { color: colors.text, fontWeight: '600', marginBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceTint,
    gap: spacing.md,
  },
  rowLabel: { color: colors.muted, fontWeight: '600' },
  rowValue: { color: colors.text, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  switchLabel: { color: colors.text, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
});
