import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';
import { SKILLS } from '../math/curriculum';
import { skillProgress } from '../math/adaptive';
import { computeInsights, dailyStats, skillStats } from '../math/insights';
import { useMathProgress } from '../storage/progressStore';
import { colors, shadow } from '../theme';

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const CHART_HEIGHT = 140;

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function StatTile({ value, label }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

// Esercizi al giorno: una sola serie, il dettaglio compare toccando la barra
function ActivityChart({ days }) {
  const [selected, setSelected] = useState(days.length - 1);
  const max = Math.max(5, ...days.map((d) => d.exercises));
  const sel = days[selected];

  return (
    <View>
      <Text style={styles.chartDetail}>
        {sel.date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}:{' '}
        {sel.exercises === 0
          ? 'nessun esercizio'
          : `${sel.exercises} esercizi, ${sel.correct} giusti al primo colpo, ${sel.minutes} min`}
      </Text>
      <View style={styles.chart}>
        <View style={styles.baseline} />
        {days.map((d, i) => (
          <TouchableOpacity key={i} style={styles.barSlot} onPress={() => setSelected(i)} activeOpacity={0.7}>
            <View style={styles.barArea}>
              <View
                style={[
                  styles.bar,
                  { height: Math.max(d.exercises ? 4 : 0, (d.exercises / max) * CHART_HEIGHT) },
                  i === selected && styles.barSelected,
                ]}
              />
            </View>
            <Text style={[styles.barLabel, i === selected && styles.barLabelSelected]}>
              {WEEKDAYS[d.date.getDay()]} {d.date.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function skillStatus(skill, s) {
  if (!s.unlocked) return 'Non ancora aperta';
  if (s.mastered) return 'Acquisita ✓';
  return `Livello ${s.tier + 1} di ${skill.tiers.length}: ${skill.tiers[s.tier].label}`;
}

function SkillRow({ skill, state, onToggleUnlock }) {
  const [open, setOpen] = useState(false);
  const s = state.skills[skill.id];
  const stats = skillStats(state, skill.id);
  const progress = skillProgress(state, skill.id);

  return (
    <TouchableOpacity style={styles.skillRow} onPress={() => setOpen(!open)} activeOpacity={0.8}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillEmoji}>{skill.emoji}</Text>
        <View style={styles.skillMain}>
          <Text style={styles.skillTitle}>{skill.title}</Text>
          <Text style={styles.skillStatus}>{skillStatus(skill, s)}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
        </View>
        <View style={styles.skillStats}>
          <Text style={styles.skillStatValue}>{stats.accuracy == null ? '–' : `${Math.round(stats.accuracy * 100)}%`}</Text>
          <Text style={styles.skillStatLabel}>giuste (ultime 20)</Text>
        </View>
        <View style={styles.skillStats}>
          <Text style={styles.skillStatValue}>{stats.medianSeconds == null ? '–' : `${Math.round(stats.medianSeconds)}s`}</Text>
          <Text style={styles.skillStatLabel}>tempo medio</Text>
        </View>
      </View>
      {open && (
        <View style={styles.skillDetails}>
          <Text style={styles.detailText}>{skill.parentInfo}</Text>
          <Text style={styles.detailText}>🏠 {skill.homeTip}</Text>
          <Text style={styles.detailMuted}>Esercizi svolti in totale: {stats.attempts}</Text>
          {skill.prereqs.length > 0 && (
            <View style={styles.unlockRow}>
              <Text style={styles.detailText}>Aperta manualmente</Text>
              <Switch value={s.unlocked} onValueChange={(v) => onToggleUnlock(skill.id, v)} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ParentDashboardScreen({ navigation }) {
  const { state, setSetting, setSkillUnlocked, resetProgress } = useMathProgress();
  const days = dailyStats(state, 14);
  const week = days.slice(-7);
  const { difficulties, strengths } = computeInsights(state);

  const weekExercises = week.reduce((n, d) => n + d.exercises, 0);
  const weekCorrect = week.reduce((n, d) => n + d.correct, 0);
  const weekMinutes = week.reduce((n, d) => n + d.minutes, 0);
  const mastered = SKILLS.filter((sk) => state.skills[sk.id].mastered).length;

  const confirmReset = () =>
    Alert.alert('Azzerare i progressi?', 'Tutti i livelli e lo storico verranno cancellati. Non si può annullare.', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Azzera', style: 'destructive', onPress: resetProgress },
    ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>👪 Area genitori{state.childName ? ` · ${state.childName}` : ''}</Text>
        <View style={{ width: 110 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Ultimi 7 giorni">
          <View style={styles.tiles}>
            <StatTile value={weekExercises} label="esercizi" />
            <StatTile value={weekMinutes} label="minuti" />
            <StatTile
              value={weekExercises ? `${Math.round((weekCorrect / weekExercises) * 100)}%` : '–'}
              label="giusti al primo colpo"
            />
            <StatTile value={`${mastered}/${SKILLS.length}`} label="abilità acquisite" />
          </View>
        </Section>

        <Section title="Esercizi al giorno (ultime 2 settimane)">
          <ActivityChart days={days} />
        </Section>

        <Section title="Dove accompagnare">
          {difficulties.length === 0 ? (
            <Text style={styles.empty}>
              Nessuna difficoltà ricorrente per ora. Gli errori fanno parte della scoperta: il materiale aiuta a correggersi da soli.
            </Text>
          ) : (
            difficulties.map((d) => (
              <View key={d.id} style={styles.insight}>
                <Text style={styles.insightText}>🔎 {d.text}</Text>
                <Text style={styles.insightTip}>💡 {d.tip}</Text>
              </View>
            ))
          )}
        </Section>

        {strengths.length > 0 && (
          <Section title="Traguardi recenti">
            {strengths.map((s, i) => (
              <Text key={i} style={styles.strength}>
                🌱 {s.text} <Text style={styles.detailMuted}>({new Date(s.ts).toLocaleDateString('it-IT')})</Text>
              </Text>
            ))}
          </Section>
        )}

        <Section title="Il percorso (tocca un'abilità per i dettagli)">
          {SKILLS.map((skill) => (
            <SkillRow key={skill.id} skill={skill} state={state} onToggleUnlock={setSkillUnlocked} />
          ))}
        </Section>

        <Section title="Impostazioni">
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Nome del bambino</Text>
            <TextInput
              style={styles.input}
              defaultValue={state.childName}
              placeholder="Usato negli incoraggiamenti"
              onChangeText={(text) => setSetting('childName', text)}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Voce</Text>
            <Switch value={state.voice} onValueChange={(v) => setSetting('voice', v)} />
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={confirmReset}>
            <Text style={styles.resetText}>Azzera i progressi</Text>
          </TouchableOpacity>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    paddingBottom: 40,
    gap: 20,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    ...shadow,
    shadowOpacity: 0.08,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 14,
  },
  tiles: {
    flexDirection: 'row',
    gap: 16,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  tileValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  tileLabel: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
  },
  chartDetail: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  baseline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    height: 1,
    backgroundColor: '#D5DBDB',
  },
  barSlot: {
    flex: 1,
    alignItems: 'center',
  },
  barArea: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 22,
    backgroundColor: '#9DBFEA',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barSelected: {
    backgroundColor: colors.blue,
  },
  barLabel: {
    height: 24,
    paddingTop: 4,
    fontSize: 12,
    color: colors.muted,
  },
  barLabelSelected: {
    color: colors.text,
    fontWeight: 'bold',
  },
  empty: {
    fontSize: 17,
    color: colors.muted,
  },
  insight: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F4',
    gap: 4,
  },
  insightText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  insightTip: {
    fontSize: 16,
    color: colors.muted,
  },
  strength: {
    fontSize: 17,
    color: colors.text,
    paddingVertical: 4,
  },
  skillRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F4',
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skillEmoji: {
    fontSize: 34,
  },
  skillMain: {
    flex: 1,
    gap: 4,
  },
  skillTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: colors.text,
  },
  skillStatus: {
    fontSize: 15,
    color: colors.muted,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EEF1F4',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  skillStats: {
    width: 110,
    alignItems: 'center',
  },
  skillStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  skillStatLabel: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  skillDetails: {
    marginTop: 10,
    marginLeft: 50,
    gap: 6,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
  },
  detailMuted: {
    fontSize: 14,
    color: colors.muted,
  },
  unlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 18,
    color: colors.text,
  },
  input: {
    width: 320,
    borderWidth: 1,
    borderColor: '#D5DBDB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    color: colors.text,
  },
  resetButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: colors.red,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  resetText: {
    color: colors.red,
    fontSize: 17,
    fontWeight: '600',
  },
});
