import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export type Team = {
  id: number;
  name: string;
  members: { id: number; userId?: number; name: string; birthday: string; linked: boolean }[];
};

export type Schedule = {
  id: number;
  date: string;
  time: string;
  venue: string;
  homeTeamId: number;
  awayTeamId: number;
  status: 'UPCOMING' | 'FINAL';
  score?: string;
  playerStats: PlayerGameStats[];
};

export type PlayerGameStats = {
  teamMemberId: number;
  userId?: number;
  playerName: string;
  points: number;
  twoPointMade: number;
  twoPointAttempts: number;
  twoPointPercentage: number;
  threePointMade: number;
  threePointAttempts: number;
  threePointPercentage: number;
  freeThrowMade: number;
  freeThrowAttempts: number;
  freeThrowPercentage: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  efficiency: number;
  minutesPlayed: string;
};

export type PlayerGameStatsInput = Omit<PlayerGameStats,
  'userId' | 'playerName' | 'points' | 'twoPointPercentage' | 'threePointPercentage' | 'freeThrowPercentage' | 'efficiency'>;

export type ScheduleInput = Omit<Schedule, 'id' | 'playerStats'> & {
  playerStats?: PlayerGameStatsInput[];
};

type LeagueContextValue = {
  teams: Team[];
  schedules: Schedule[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addTeam: (name: string) => Promise<void>;
  renameTeam: (id: number, name: string) => Promise<void>;
  deleteTeam: (id: number) => Promise<void>;
  addMember: (teamId: number, name: string, birthday: string) => Promise<void>;
  saveSchedule: (schedule: ScheduleInput, id?: number) => Promise<void>;
  deleteSchedule: (id: number) => Promise<void>;
};

const LeagueContext = createContext<LeagueContextValue | undefined>(undefined);

export function LeagueProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const adminOptions = useCallback((method: string, body?: object) => ({
    method,
    headers: { 'X-Auth-Token': user?.token ?? '' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }), [user?.token]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [nextTeams, nextSchedules] = await Promise.all([
        api<Team[]>('/league/teams'),
        api<Schedule[]>('/league/schedules'),
      ]);
      setTeams(nextTeams);
      setSchedules(nextSchedules);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '無法讀取聯賽資料');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function mutate(path: string, options: RequestInit) {
    await api(path, options);
    await refresh();
  }

  const value: LeagueContextValue = {
    teams, schedules, loading, error, refresh,
    addTeam: (name) => mutate('/league/teams', adminOptions('POST', { name })),
    renameTeam: (id, name) => mutate(`/league/teams/${id}`, adminOptions('PUT', { name })),
    deleteTeam: (id) => mutate(`/league/teams/${id}`, adminOptions('DELETE')),
    addMember: (teamId, name, birthday) => mutate(`/league/teams/${teamId}/members`, adminOptions('POST', { name, birthday })),
    saveSchedule: (schedule, id) => mutate(id ? `/league/schedules/${id}` : '/league/schedules', adminOptions(id ? 'PUT' : 'POST', schedule)),
    deleteSchedule: (id) => mutate(`/league/schedules/${id}`, adminOptions('DELETE')),
  };

  return <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>;
}

export function useLeague() {
  const league = useContext(LeagueContext);
  if (!league) throw new Error('useLeague must be used within LeagueProvider');
  return league;
}
