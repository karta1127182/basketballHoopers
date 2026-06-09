import { StyleSheet, Text, View } from 'react-native';

import { useLeague } from '@/lib/league';

export function LeagueCenter() {
  const { teams, schedules, loading, error } = useLeague();
  const nameFor = (id: number) => teams.find((team) => team.id === id)?.name ?? '未知球隊';

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>LEAGUE SCHEDULE</Text>
          <Text style={styles.title}>聯盟賽程</Text>
        </View>
        <Text style={styles.headerAside}>{teams.length} 支球隊</Text>
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {loading ? <Text style={styles.empty}>載入賽程中...</Text> : (
        <View style={styles.scheduleList}>
          {schedules.map((game) => (
            <View key={game.id} style={styles.scheduleRow}>
              <View style={styles.dateBlock}>
                <Text style={styles.date}>{game.date.slice(5).replace('-', '.')}</Text>
                <Text style={styles.time}>{game.time.slice(0, 5)}</Text>
              </View>
              <View style={styles.matchup}>
                <Text style={styles.matchupText}>{nameFor(game.homeTeamId)}</Text>
                <Text style={styles.versus}>VS</Text>
                <Text style={styles.matchupText}>{nameFor(game.awayTeamId)}</Text>
                <Text style={styles.venue}>{game.venue}</Text>
              </View>
              <Text style={styles.status}>{game.status === 'FINAL' ? game.score || '已完賽' : '尚未開賽'}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 42, borderTopWidth: 1, borderTopColor: '#30312f', paddingTop: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 18 },
  eyebrow: { color: '#dc9639', fontSize: 10, letterSpacing: 3, fontWeight: '900' },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 7 },
  headerAside: { color: '#a29a92', fontSize: 12, fontWeight: '800' },
  error: { color: '#e58070', paddingVertical: 12 },
  empty: { color: '#a29a92', paddingVertical: 18 },
  scheduleList: { borderTopWidth: 1, borderTopColor: '#30312f' },
  scheduleRow: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: 1, borderBottomColor: '#30312f' },
  dateBlock: { width: 54 },
  date: { color: '#fff', fontWeight: '900' },
  time: { color: '#d18e35', fontSize: 12, marginTop: 4 },
  matchup: { flex: 1 },
  matchupText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  versus: { color: '#8d857d', fontSize: 10, fontWeight: '900', marginVertical: 3 },
  venue: { color: '#99918a', fontSize: 11, marginTop: 6 },
  status: { color: '#d5943c', fontSize: 12, fontWeight: '900' },
});
