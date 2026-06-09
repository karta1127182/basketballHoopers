import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoldButton } from '@/components/gold-button';
import { LeagueCenter } from '@/components/league-center';
import { api } from '@/lib/api';
import { AuthUser, useAuth } from '@/lib/auth';

type PlayerStats = {
  gamesPlayed: number;
  points: number;
  rebounds: number;
  assists: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  steals: number;
  blocks: number;
  heightCm: number;
  weightKg: number;
  position: string;
};

type RecentSchedule = {
  id: number;
  date: string;
  time: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  status: 'UPCOMING' | 'FINAL';
  score?: string;
};

type PlayerDashboard = {
  teamName?: string;
  stats: PlayerStats;
  recentSchedules: RecentSchedule[];
};

type ActiveMenu = 'home' | 'profile' | 'teams' | 'players' | 'schedule' | 'course' | 'videos' | 'notifications' | 'coaches' | 'orders' | 'notificationSettings';

const menuItems: { key: ActiveMenu; label: string; eyebrow: string }[] = [
  { key: 'home', label: '首頁', eyebrow: 'HOME' },
  { key: 'profile', label: '個人資料', eyebrow: 'PLAYER' },
  { key: 'teams', label: '球隊數據', eyebrow: 'TEAMS' },
  { key: 'players', label: '球員排行', eyebrow: 'STATS' },
  { key: 'schedule', label: '查看賽程', eyebrow: 'SCHEDULE' },
  { key: 'course', label: '查看課程', eyebrow: 'COURSE' },
  { key: 'videos', label: '影片', eyebrow: 'VIDEO' },
  { key: 'notifications', label: '通知', eyebrow: 'NOTICE' },
  { key: 'coaches', label: '教練頁', eyebrow: 'COACH' },
  { key: 'orders', label: '我的訂單', eyebrow: 'ORDER' },
  { key: 'notificationSettings', label: '通知設定', eyebrow: 'SETTING' },
];

type Course = {
  id: number;
  title: string;
  coachUserId: number;
  coachName: string;
  timeText: string;
  location: string;
  level: string;
  capacity: number;
  price: number;
  status: string;
  registrationCount: number;
  description: string;
};

type CourseRegistration = {
  id: number;
  courseId: number;
  courseTitle: string;
  userId: number;
  name: string;
  phone: string;
  status: string;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  checkedIn: boolean;
  orderId: number;
  amount: number;
  createdAt: string;
};

type HomeGame = {
  id: number;
  date: string;
  time: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  status: 'UPCOMING' | 'LIVE' | 'FINAL';
  score?: string;
  liveYoutubeUrl?: string;
  replayYoutubeUrl?: string;
};

type HomeCourse = {
  id: number;
  title: string;
  coachName: string;
  timeText: string;
  location: string;
  level: string;
  capacity: number;
  price: number;
  registrationCount: number;
};

type HomeVideo = {
  id: number;
  title: string;
  youtubeUrl: string;
  type: 'LIVE' | 'REPLAY' | 'HIGHLIGHT' | 'TRAINING';
  sourceName?: string;
  scheduleId?: number;
  teamId?: number;
  playerUserId?: number;
  createdAt?: string;
};

type HomeFeed = {
  liveGames: HomeGame[];
  upcomingGames: HomeGame[];
  latestResults: HomeGame[];
  featuredCourses: HomeCourse[];
  latestVideos: HomeVideo[];
};

type CourseOrder = {
  orderId: number;
  registrationId: number;
  courseId: number;
  courseTitle: string;
  studentName: string;
  studentPhone: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'CANCELLED';
  paymentProvider?: string;
  receiptNo: string;
  paidAt?: string;
  createdAt: string;
};

type CourseRevenue = {
  courseCount: number;
  registrationCount: number;
  paidCount: number;
  unpaidCount: number;
  refundedCount: number;
  paidRevenue: number;
  expectedRevenue: number;
};

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  body: string;
  targetType?: string;
  targetId?: number;
  read: boolean;
  createdAt: string;
};

type NotificationFeed = {
  unreadCount: number;
  notifications: NotificationItem[];
};

type CourseReview = {
  id: number;
  courseId: number;
  courseTitle: string;
  coachUserId: number;
  userId: number;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type CoachProfile = {
  userId: number;
  name: string;
  bio: string;
  specialties: string;
  courseCount: number;
  registrationCount: number;
  paidCount: number;
  paidRevenue: number;
  averageRating: number;
  reviewCount: number;
  ratingBreakdown: { rating: number; count: number }[];
  reviews: { id: number; courseTitle: string; reviewerName: string; rating: number; comment: string; createdAt: string }[];
  courses: { id: number; title: string; timeText: string; location: string; price: number; registrationCount: number }[];
};

type NotificationSettings = {
  courseRemindersEnabled: boolean;
  gameRemindersEnabled: boolean;
  liveNotificationsEnabled: boolean;
};

type LeagueStats = {
  teams: TeamStats[];
  players: PlayerRank[];
};

type TeamStats = {
  teamId: number;
  teamName: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  roster: PlayerRank[];
};

type PlayerRank = {
  teamMemberId: number;
  userId?: number;
  playerName: string;
  teamId?: number;
  teamName: string;
  gamesPlayed: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  efficiency: number;
  gameLogs: PlayerGameLog[];
};

type PlayerGameLog = {
  scheduleId: number;
  date: string;
  opponent: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  efficiency: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [dashboard, setDashboard] = useState<PlayerDashboard>();
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('home');
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST', headers: { 'X-Auth-Token': user?.token ?? '' } });
    } finally {
      setMenuOpen(false);
      setUser(null);
      router.replace('/');
    }
  }

  function selectMenu(nextMenu: ActiveMenu) {
    setActiveMenu(nextMenu);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!user) {
      setDashboard(undefined);
      return;
    }
    api<PlayerDashboard | undefined>('/profile/dashboard', { headers: { 'X-Auth-Token': user.token } })
      .then(setDashboard)
      .catch(() => setDashboard(undefined));
  }, [user]);

  if (!user) {
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.publicContent}>
        <SafeAreaView style={styles.publicSafe}>
          <View style={styles.nav}>
            <Image source={require('../../assets/images/logo-glow.png')} style={styles.navLogo} contentFit="contain" />
            <Pressable onPress={() => router.push('/login')}><Text style={styles.navLink}>會員登入</Text></Pressable>
          </View>
          <View style={styles.hero}>
            <Image source={require('../../assets/images/logo-glow.png')} style={styles.heroLogo} contentFit="contain" />
            <Text style={styles.eyebrow}>HOOPERS BASKETBALL ACADEMY</Text>
            <Text style={styles.heroTitle}>熱血籃球{'\n'}一起上場</Text>
            <Text style={styles.heroSubtitle}>加入會員，查看你的球員數據與聯盟近期賽程。</Text>
            <View style={styles.heroActions}>
              <GoldButton label="立即加入" onPress={() => router.push('/register')} />
              <Pressable style={styles.secondaryButton} onPress={() => router.push('/login')}>
                <Text style={styles.secondaryText}>已有帳號？會員登入</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.dashboardContent}>
      <SafeAreaView style={styles.dashboardSafe}>
        <View style={styles.nav}>
          <Image source={require('../../assets/images/logo-glow.png')} style={styles.navLogo} contentFit="contain" />
          <View style={styles.navActions}>
            <Pressable onPress={() => setMenuOpen((open) => !open)} style={styles.menuToggle}>
              <Text style={styles.menuToggleText}>{menuOpen ? '關閉' : '選單'}</Text>
            </Pressable>
            <View style={styles.avatar}><Text style={styles.avatarText}>{user.name.slice(0, 1)}</Text></View>
            <Pressable onPress={logout}><Text style={styles.logout}>登出</Text></Pressable>
          </View>
        </View>
        {menuOpen && (
          <>
            <Pressable onPress={() => setMenuOpen(false)} style={styles.menuBackdrop} />
            <View style={styles.sideMenu}>
              <View style={styles.sideProfile}>
                <View style={styles.avatarLarge}><Text style={styles.avatarText}>{user.name.slice(0, 1)}</Text></View>
                <Text style={styles.sideName}>{user.name}</Text>
                <Text style={styles.sideTeam}>{dashboard?.teamName || '尚未加入球隊'}</Text>
              </View>
              {menuItems.map((item) => (
                <Pressable key={item.key} onPress={() => selectMenu(item.key)} style={styles.menuPressable}>
                  <View style={[styles.menuItem, activeMenu === item.key && styles.menuItemActive]}>
                    <Text style={[styles.menuEyebrow, activeMenu === item.key && styles.menuEyebrowActive]}>{item.eyebrow}</Text>
                    <Text style={[styles.menuLabel, activeMenu === item.key && styles.menuLabelActive]}>{item.label}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
        <View style={styles.appShell}>
          <View style={styles.mainPanel}>
            {activeMenu === 'home' && <HomePanel userName={user.name} />}
            {activeMenu === 'profile' && <ProfilePanel dashboard={dashboard} userName={user.name} />}
            {activeMenu === 'teams' && <TeamStatsPanel />}
            {activeMenu === 'players' && <PlayerStatsPanel />}
            {activeMenu === 'schedule' && <SchedulePanel dashboard={dashboard} />}
            {activeMenu === 'course' && <CoursePanelV2 user={user} />}
            {activeMenu === 'videos' && <VideoPanel />}
            {activeMenu === 'notifications' && <NotificationPanel user={user} />}
            {activeMenu === 'coaches' && <CoachProfilesPanelV2 user={user} />}
            {activeMenu === 'orders' && <MyOrdersPanel user={user} />}
            {activeMenu === 'notificationSettings' && <NotificationSettingsPanel user={user} />}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

function HomePanel({ userName }: { userName: string }) {
  const [feed, setFeed] = useState<HomeFeed>();
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<HomeFeed>('/home/feed')
      .then(setFeed)
      .catch((error) => setMessage(error instanceof Error ? error.message : '首頁資料載入失敗'));
  }, []);

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>LEAGUE HOME</Text>
          <Text style={styles.welcome}>你好，{userName}</Text>
          <Text style={styles.profileMeta}>直播、賽程、課程與最新影片</Text>
        </View>
      </View>
      {!!message && <Text style={styles.courseMessage}>{message}</Text>}
      <HomeSection title="現在直播" aside={`${feed?.liveGames.length || 0} 場`}>
        {feed?.liveGames.map((game) => <HomeGameCard key={game.id} game={game} highlight />)}
        {!feed?.liveGames.length && <Text style={styles.empty}>目前沒有直播中的比賽</Text>}
      </HomeSection>
      <HomeSection title="下一場比賽" aside={`${feed?.upcomingGames.length || 0} 場`}>
        {feed?.upcomingGames.map((game) => <HomeGameCard key={game.id} game={game} />)}
        {!feed?.upcomingGames.length && <Text style={styles.empty}>目前沒有 upcoming 賽程</Text>}
      </HomeSection>
      <HomeSection title="最新結果" aside={`${feed?.latestResults.length || 0} 場`}>
        {feed?.latestResults.map((game) => <HomeGameCard key={game.id} game={game} />)}
        {!feed?.latestResults.length && <Text style={styles.empty}>目前尚無完賽結果</Text>}
      </HomeSection>
      <HomeSection title="熱門課程" aside={`${feed?.featuredCourses.length || 0} 堂`}>
        <View style={styles.homeGrid}>
          {feed?.featuredCourses.map((course) => (
            <View key={course.id} style={styles.homeCard}>
              <Text style={styles.courseLevel}>{course.level}</Text>
              <Text style={styles.homeCardTitle}>{course.title}</Text>
              <Text style={styles.homeCardMeta}>{course.coachName} · {course.timeText}</Text>
              <Text style={styles.homeCardMeta}>NT$ {course.price}</Text>
              <Text style={styles.homeCardMeta}>{course.registrationCount}/{course.capacity} 報名</Text>
            </View>
          ))}
        </View>
        {!feed?.featuredCourses.length && <Text style={styles.empty}>目前尚無課程</Text>}
      </HomeSection>
      <HomeSection title="最新影片" aside={`${feed?.latestVideos.length || 0} 支`}>
        <View style={styles.videoList}>
          {feed?.latestVideos.map((video) => (
            <Pressable key={video.id} style={styles.videoRow} onPress={() => Linking.openURL(video.youtubeUrl)}>
              <View>
                <Text style={styles.videoType}>{video.type}</Text>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.homeCardMeta}>{video.sourceName || 'Hoopers'}</Text>
              </View>
              <Text style={styles.videoAction}>YouTube</Text>
            </Pressable>
          ))}
        </View>
        {!feed?.latestVideos.length && <Text style={styles.empty}>目前尚無影片</Text>}
      </HomeSection>
    </>
  );
}

function HomeSection({ title, aside, children }: { title: string; aside: string; children: ReactNode }) {
  return (
    <View style={styles.homeSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionAside}>{aside}</Text>
      </View>
      {children}
    </View>
  );
}

function HomeGameCard({ game, highlight = false }: { game: HomeGame; highlight?: boolean }) {
  const youtubeUrl = game.status === 'FINAL' ? game.replayYoutubeUrl : game.liveYoutubeUrl;

  return (
    <View style={[styles.homeGameCard, highlight && styles.homeGameLive]}>
      <View>
        <Text style={styles.scheduleDate}>{game.date} {game.time.slice(0, 5)}</Text>
        <Text style={styles.scheduleMatch}>{game.homeTeam} VS {game.awayTeam}</Text>
        <Text style={styles.scheduleVenue}>{game.venue}</Text>
      </View>
      <View style={styles.homeGameActions}>
        <Text style={styles.scheduleStatus}>{game.status === 'FINAL' ? game.score || '已完賽' : game.status === 'LIVE' ? '直播中' : '尚未開賽'}</Text>
        {!!youtubeUrl && (
          <Pressable style={styles.courseActionButton} onPress={() => Linking.openURL(youtubeUrl)}>
            <Text style={styles.courseActionText}>{game.status === 'FINAL' ? '回放' : '直播'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function ProfilePanel({ dashboard, userName }: { dashboard?: PlayerDashboard; userName: string }) {
  const stats = dashboard?.stats;

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>PLAYER DASHBOARD</Text>
          <Text style={styles.welcome}>你好，{userName}</Text>
          <Text style={styles.profileMeta}>{dashboard?.teamName || '尚未加入球隊'}</Text>
        </View>
        <View style={styles.season}>
          <Text style={styles.seasonLabel}>2026 SUMMER</Text>
          <Text style={styles.seasonValue}>例行賽</Text>
        </View>
      </View>

      {stats ? (
        <>
          <View style={styles.bioGrid}>
            <BioItem label="所屬球隊" value={dashboard?.teamName || '尚未加入'} />
            <BioItem label="位置" value={stats.position} />
            <BioItem label="身高" value={`${stats.heightCm} cm`} />
            <BioItem label="體重" value={`${stats.weightKg} kg`} />
          </View>
          <View style={styles.statGrid}>
            <StatCard label="平均得分" value={stats.points} unit="PTS" />
            <StatCard label="平均籃板" value={stats.rebounds} unit="REB" />
            <StatCard label="平均助攻" value={stats.assists} unit="AST" />
            <StatCard label="投籃命中率" value={stats.fieldGoalPercentage} unit="%" />
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>進階數據</Text>
            <Text style={styles.sectionAside}>出賽 {stats.gamesPlayed} 場</Text>
          </View>
          <View style={styles.skillGrid}>
            <SkillItem label="三分命中率" value={`${stats.threePointPercentage}%`} />
            <SkillItem label="罰球命中率" value={`${stats.freeThrowPercentage}%`} />
            <SkillItem label="平均抄截" value={stats.steals} />
            <SkillItem label="平均阻攻" value={stats.blocks} />
          </View>
        </>
      ) : (
        <Text style={styles.empty}>個人資料載入中...</Text>
      )}
    </>
  );
}

function SchedulePanel({ dashboard }: { dashboard?: PlayerDashboard }) {
  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>MY SCHEDULE</Text>
          <Text style={styles.welcome}>查看賽程</Text>
          <Text style={styles.profileMeta}>追蹤近期比賽與聯盟完整賽程</Text>
        </View>
        <View style={styles.season}>
          <Text style={styles.seasonLabel}>UPCOMING</Text>
          <Text style={styles.seasonValue}>{dashboard?.recentSchedules.length || 0} 場</Text>
        </View>
      </View>
      <RecentScheduleList dashboard={dashboard} />
      <LeagueCenter />
    </>
  );
}

function useLeagueStats() {
  const [stats, setStats] = useState<LeagueStats>();
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<LeagueStats>('/stats/league')
      .then(setStats)
      .catch((error) => setMessage(error instanceof Error ? error.message : '數據載入失敗'));
  }, []);

  return { stats, message };
}

function TeamStatsPanel() {
  const { stats, message } = useLeagueStats();

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>TEAM STANDINGS</Text>
          <Text style={styles.welcome}>球隊數據</Text>
          <Text style={styles.profileMeta}>戰績、場均與隊內主要球員</Text>
        </View>
      </View>
      {!!message && <Text style={styles.courseMessage}>{message}</Text>}
      <View style={styles.statsList}>
        {stats?.teams.map((team) => (
          <View key={team.teamId} style={styles.teamStatsCard}>
            <View style={styles.teamStatsHead}>
              <View>
                <Text style={styles.teamRankName}>{team.teamName}</Text>
                <Text style={styles.homeCardMeta}>出賽 {team.gamesPlayed} 場</Text>
              </View>
              <Text style={styles.recordText}>{team.wins}W - {team.losses}L</Text>
            </View>
            <View style={styles.statGrid}>
              <StatCard label="場均得分" value={team.pointsPerGame} unit="PTS" />
              <StatCard label="場均籃板" value={team.reboundsPerGame} unit="REB" />
              <StatCard label="場均助攻" value={team.assistsPerGame} unit="AST" />
            </View>
            <View style={styles.miniRoster}>
              {team.roster.slice(0, 3).map((player) => (
                <View key={player.teamMemberId} style={styles.playerMiniRow}>
                  <Text style={styles.registrationName}>{player.playerName}</Text>
                  <Text style={styles.registrationPhone}>{player.points} PTS · {player.rebounds} REB · {player.assists} AST</Text>
                </View>
              ))}
              {!team.roster.length && <Text style={styles.empty}>尚無球員數據</Text>}
            </View>
          </View>
        ))}
        {!stats?.teams.length && <Text style={styles.empty}>目前尚無球隊數據</Text>}
      </View>
    </>
  );
}

function PlayerStatsPanel() {
  const { stats, message } = useLeagueStats();

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>PLAYER RANKING</Text>
          <Text style={styles.welcome}>球員排行</Text>
          <Text style={styles.profileMeta}>聯盟主要球員場均數據與近期紀錄</Text>
        </View>
      </View>
      {!!message && <Text style={styles.courseMessage}>{message}</Text>}
      <View style={styles.statsList}>
        {stats?.players.map((player, index) => (
          <View key={player.teamMemberId} style={styles.playerStatsCard}>
            <View style={styles.teamStatsHead}>
              <View>
                <Text style={styles.courseLevel}>#{index + 1} · {player.teamName}</Text>
                <Text style={styles.teamRankName}>{player.playerName}</Text>
              </View>
              <Text style={styles.recordText}>{player.points} PTS</Text>
            </View>
            <View style={styles.playerStatLine}>
              <Text style={styles.registrationPhone}>{player.rebounds} REB</Text>
              <Text style={styles.registrationPhone}>{player.assists} AST</Text>
              <Text style={styles.registrationPhone}>{player.steals} STL</Text>
              <Text style={styles.registrationPhone}>{player.blocks} BLK</Text>
              <Text style={styles.registrationPhone}>{player.efficiency} EFF</Text>
            </View>
            <View style={styles.registrationList}>
              {player.gameLogs.slice(0, 3).map((log) => (
                <View key={log.scheduleId} style={styles.registrationRow}>
                  <Text style={styles.registrationName}>{log.date} vs {log.opponent}</Text>
                  <Text style={styles.registrationPhone}>{log.points}分 {log.rebounds}板 {log.assists}助</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
        {!stats?.players.length && <Text style={styles.empty}>目前尚無球員數據</Text>}
      </View>
    </>
  );
}

function VideoPanel() {
  const [videos, setVideos] = useState<HomeVideo[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<HomeVideo[]>('/videos')
      .then(setVideos)
      .catch((error) => setMessage(error instanceof Error ? error.message : '影片載入失敗'));
  }, []);

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>YOUTUBE LIBRARY</Text>
          <Text style={styles.welcome}>影片</Text>
          <Text style={styles.profileMeta}>直播、回放、精華與訓練影片</Text>
        </View>
      </View>
      {!!message && <Text style={styles.courseMessage}>{message}</Text>}
      <View style={styles.videoList}>
        {videos.map((video) => (
          <Pressable key={video.id} style={styles.videoRow} onPress={() => Linking.openURL(video.youtubeUrl)}>
            <View>
              <Text style={styles.videoType}>{videoTypeLabel(video.type)}{video.scheduleId ? ` · 賽程 #${video.scheduleId}` : ''}</Text>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.homeCardMeta}>{video.sourceName || 'Hoopers'}</Text>
            </View>
            <Text style={styles.videoAction}>YouTube</Text>
          </Pressable>
        ))}
        {!videos.length && <Text style={styles.empty}>目前尚無影片</Text>}
      </View>
    </>
  );
}

function videoTypeLabel(type: HomeVideo['type']) {
  return ({ LIVE: '直播', REPLAY: '回放', HIGHLIGHT: '精華', TRAINING: '訓練' })[type];
}

function RecentScheduleList({ dashboard }: { dashboard?: PlayerDashboard }) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>近期賽程</Text>
        <Text style={styles.sectionAside}>{dashboard?.recentSchedules.length || 0} 場</Text>
      </View>
      <View style={styles.scheduleList}>
        {dashboard?.recentSchedules.map((game) => (
          <View key={game.id} style={styles.scheduleRow}>
            <View>
              <Text style={styles.scheduleDate}>{game.date} {game.time.slice(0, 5)}</Text>
              <Text style={styles.scheduleMatch}>{game.homeTeam} VS {game.awayTeam}</Text>
              <Text style={styles.scheduleVenue}>{game.venue}</Text>
            </View>
            <Text style={styles.scheduleStatus}>{game.status === 'FINAL' ? game.score || '已完賽' : '尚未開賽'}</Text>
          </View>
        ))}
        {!dashboard?.recentSchedules.length && <Text style={styles.empty}>目前沒有近期賽程</Text>}
      </View>
    </>
  );
}

function CoursePanelV2({ user }: { user: AuthUser }) {
  const userRoles = user.roles ?? [user.role];
  const canManageCourses = userRoles.includes('COACH') || userRoles.includes('ADMIN');
  const canRegisterCourses = userRoles.includes('MEMBER');
  const [courses, setCourses] = useState<Course[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<CourseRegistration[]>([]);
  const [paymentTarget, setPaymentTarget] = useState<{ course: Course; registration: CourseRegistration }>();
  const [registrations, setRegistrations] = useState<Record<number, CourseRegistration[]>>({});
  const [reviews, setReviews] = useState<Record<number, CourseReview[]>>({});
  const [reviewDrafts, setReviewDrafts] = useState<Record<number, { rating: string; comment: string }>>({});
  const [orders, setOrders] = useState<CourseOrder[]>([]);
  const [revenue, setRevenue] = useState<CourseRevenue>();
  const [title, setTitle] = useState('');
  const [timeText, setTimeText] = useState('');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('');
  const [capacity, setCapacity] = useState('12');
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadCourses() {
    try {
      const [nextCourses, nextRegistrations] = await Promise.all([
        api<Course[]>('/courses'),
        api<CourseRegistration[]>('/courses/registrations/me', { headers: { 'X-Auth-Token': user.token } }),
      ]);
      setCourses(nextCourses);
      setMyRegistrations(nextRegistrations);
      if (canManageCourses) await loadCoachSummary();
      return nextRegistrations;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '課程載入失敗');
      return [];
    }
  }

  async function loadCoachSummary() {
    const [nextOrders, nextRevenue] = await Promise.all([
      api<CourseOrder[]>('/courses/orders/coach', { headers: { 'X-Auth-Token': user.token } }),
      api<CourseRevenue>('/courses/revenue/me', { headers: { 'X-Auth-Token': user.token } }),
    ]);
    setOrders(nextOrders);
    setRevenue(nextRevenue);
  }

  async function loadRegistrations(courseId: number) {
    const list = await api<CourseRegistration[]>(`/courses/${courseId}/registrations`, { headers: { 'X-Auth-Token': user.token } });
    setRegistrations((current) => ({ ...current, [courseId]: list }));
  }

  useEffect(() => { loadCourses(); }, []);

  async function createCourse() {
    setLoading(true);
    setMessage('');
    try {
      await api<Course>('/courses', {
        method: 'POST',
        headers: { 'X-Auth-Token': user.token },
        body: JSON.stringify({ title, timeText, location, level, capacity: Number(capacity || 0), price: Number(price || 0), status: 'OPEN', description }),
      });
      setTitle('');
      setTimeText('');
      setLocation('');
      setLevel('');
      setCapacity('12');
      setPrice('0');
      setDescription('');
      setMessage('課程已新增');
      await loadCourses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '新增課程失敗');
    } finally {
      setLoading(false);
    }
  }

  async function registerCourse(course: Course) {
    setMessage('');
    try {
      await api<Course>(`/courses/${course.id}/registrations`, { method: 'POST', headers: { 'X-Auth-Token': user.token } });
      const nextRegistrations = await api<CourseRegistration[]>('/courses/registrations/me', { headers: { 'X-Auth-Token': user.token } });
      setMyRegistrations(nextRegistrations);
      const registration = nextRegistrations.find((item) => item.courseId === course.id);
      if (!registration) return setMessage('報名已送出，請重新整理後查看付款狀態');
      if (registration.paymentStatus === 'PAID') setMessage('報名成功，免費課程已完成付款');
      else setPaymentTarget({ course, registration });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '報名失敗');
    }
  }

  async function payRegistration(registrationId: number) {
    setMessage('');
    try {
      await api<CourseRegistration>(`/courses/registrations/${registrationId}/pay`, { method: 'POST', headers: { 'X-Auth-Token': user.token } });
      setPaymentTarget(undefined);
      setMessage('付款成功，已完成報名');
      await loadCourses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '付款失敗');
    }
  }

  async function checkIn(courseId: number, registrationId: number) {
    setMessage('');
    try {
      await api<CourseRegistration>(`/courses/${courseId}/registrations/${registrationId}/check-in`, { method: 'POST', headers: { 'X-Auth-Token': user.token } });
      setMessage('簽到完成');
      await loadRegistrations(courseId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '簽到失敗');
    }
  }

  async function deleteCourse(courseId: number) {
    setMessage('');
    try {
      await api(`/courses/${courseId}`, { method: 'DELETE', headers: { 'X-Auth-Token': user.token } });
      setMessage('課程已刪除');
      await loadCourses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '刪除課程失敗');
    }
  }

  async function sendReminder(courseId: number) {
    setMessage('');
    try {
      await api(`/courses/${courseId}/reminders`, { method: 'POST', headers: { 'X-Auth-Token': user.token } });
      setMessage('課程提醒已送出');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '課程提醒發送失敗');
    }
  }

  async function submitReview(registration: CourseRegistration) {
    const draft = reviewDrafts[registration.id] || { rating: '5', comment: '' };
    setMessage('');
    try {
      await api<CourseReview>(`/courses/registrations/${registration.id}/reviews`, {
        method: 'POST',
        headers: { 'X-Auth-Token': user.token },
        body: JSON.stringify({ rating: Number(draft.rating || 5), comment: draft.comment }),
      });
      setMessage('評價已送出，謝謝你的回饋');
      setReviewDrafts((current) => ({ ...current, [registration.id]: { rating: '5', comment: '' } }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '評價送出失敗');
    }
  }

  async function toggleReviews(courseId: number) {
    if (reviews[courseId]) {
      setReviews((current) => {
        const next = { ...current };
        delete next[courseId];
        return next;
      });
      return;
    }
    try {
      const list = await api<CourseReview[]>(`/courses/${courseId}/reviews`, { headers: { 'X-Auth-Token': user.token } });
      setReviews((current) => ({ ...current, [courseId]: list }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '評價載入失敗');
    }
  }

  async function updateOrder(order: CourseOrder, action: 'confirm' | 'refund') {
    setMessage('');
    try {
      await api<CourseRegistration>(`/courses/orders/${order.orderId}/${action}`, { method: 'POST', headers: { 'X-Auth-Token': user.token } });
      setMessage(action === 'confirm' ? '付款已確認' : '退款已完成');
      await loadCourses();
      if (registrations[order.courseId]) await loadRegistrations(order.courseId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '訂單更新失敗');
    }
  }

  async function toggleRegistrations(courseId: number) {
    if (registrations[courseId]) {
      setRegistrations((current) => {
        const next = { ...current };
        delete next[courseId];
        return next;
      });
      return;
    }
    try {
      await loadRegistrations(courseId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '報名名單載入失敗');
    }
  }

  if (paymentTarget) {
    return (
      <PaymentPanelV2
        course={paymentTarget.course}
        registration={paymentTarget.registration}
        loading={loading}
        onCancel={() => setPaymentTarget(undefined)}
        onPay={async () => {
          setLoading(true);
          try {
            await payRegistration(paymentTarget.registration.id);
          } finally {
            setLoading(false);
          }
        }}
      />
    );
  }

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>TRAINING COURSE</Text>
          <Text style={styles.welcome}>課程系統</Text>
          <Text style={styles.profileMeta}>訓練師開課、會員報名付款、簽到與收入管理</Text>
        </View>
      </View>

      {canManageCourses && (
        <>
          <View style={styles.metricsRow}>
            <MetricTile label="已收收入" value={`NT$ ${revenue?.paidRevenue ?? 0}`} />
            <MetricTile label="已付款" value={`${revenue?.paidCount ?? 0} 人`} />
            <MetricTile label="未付款" value={`${revenue?.unpaidCount ?? 0} 人`} />
            <MetricTile label="退款" value={`${revenue?.refundedCount ?? 0} 筆`} />
          </View>
          <View style={styles.courseForm}>
            <Text style={styles.sectionTitle}>新增課程</Text>
            <TextInput style={styles.courseInput} value={title} onChangeText={setTitle} placeholder="課程名稱" placeholderTextColor="#756b62" />
            <TextInput style={styles.courseInput} value={timeText} onChangeText={setTimeText} placeholder="課程時間，例如 6/21 19:00" placeholderTextColor="#756b62" />
            <TextInput style={styles.courseInput} value={location} onChangeText={setLocation} placeholder="課程地點" placeholderTextColor="#756b62" />
            <View style={styles.courseFormRow}>
              <TextInput style={[styles.courseInput, styles.courseFormField]} value={level} onChangeText={setLevel} placeholder="程度" placeholderTextColor="#756b62" />
              <TextInput style={[styles.courseInput, styles.courseFormField]} value={capacity} onChangeText={setCapacity} keyboardType="number-pad" placeholder="名額" placeholderTextColor="#756b62" />
              <TextInput style={[styles.courseInput, styles.courseFormField]} value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="價格" placeholderTextColor="#756b62" />
            </View>
            <TextInput style={[styles.courseInput, styles.courseTextarea]} value={description} onChangeText={setDescription} multiline placeholder="課程說明" placeholderTextColor="#756b62" />
            <GoldButton label={loading ? '新增中...' : '新增課程'} onPress={createCourse} disabled={loading} />
          </View>
        </>
      )}

      {!!message && <Text style={styles.courseMessage}>{message}</Text>}

      <View style={styles.courseList}>
        {courses.map((course) => {
          const myRegistration = myRegistrations.find((registration) => registration.courseId === course.id);
          const canManageThisCourse = userRoles.includes('ADMIN') || course.coachUserId === user.userId;
          return (
            <View key={course.id} style={styles.courseCard}>
              <View>
                <Text style={styles.courseLevel}>{course.level}</Text>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseMeta}>{course.coachName} · {course.timeText}</Text>
                <Text style={styles.courseMeta}>{course.location}</Text>
                <Text style={styles.courseMeta}>NT$ {course.price} · {course.status === 'OPEN' ? '開放報名' : course.status}</Text>
                {!!myRegistration && <Text style={styles.courseMeta}>{paymentStatusText(myRegistration.paymentStatus)} · {myRegistration.checkedIn ? '已簽到' : '尚未簽到'}</Text>}
                <Text style={styles.courseDescription}>{course.description}</Text>
              </View>
              <View style={styles.courseActions}>
                <Text style={styles.courseStatus}>{course.registrationCount}/{course.capacity} 報名</Text>
                {canManageThisCourse ? (
                  <>
                    <Pressable style={styles.courseActionButton} onPress={() => toggleRegistrations(course.id)}>
                      <Text style={styles.courseActionText}>{registrations[course.id] ? '收合名單' : '報名名單'}</Text>
                    </Pressable>
                    <Pressable style={styles.courseActionButton} onPress={() => sendReminder(course.id)}>
                      <Text style={styles.courseActionText}>發送提醒</Text>
                    </Pressable>
                    <Pressable style={styles.courseActionButton} onPress={() => toggleReviews(course.id)}>
                      <Text style={styles.courseActionText}>{reviews[course.id] ? '收合評價' : '查看評價'}</Text>
                    </Pressable>
                    <Pressable style={styles.dangerButton} onPress={() => deleteCourse(course.id)}>
                      <Text style={styles.dangerText}>刪除</Text>
                    </Pressable>
                  </>
                ) : myRegistration?.paymentStatus !== 'PAID' && myRegistration ? (
                  <Pressable style={styles.courseActionButton} onPress={() => setPaymentTarget({ course, registration: myRegistration })}>
                    <Text style={styles.courseActionText}>付款</Text>
                  </Pressable>
                ) : myRegistration ? (
                  <Text style={styles.courseMuted}>{myRegistration.checkedIn ? '可評價' : '已報名'}</Text>
                ) : canRegisterCourses ? (
                  <Pressable style={styles.courseActionButton} onPress={() => registerCourse(course)}>
                    <Text style={styles.courseActionText}>我要報名</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.courseMuted}>僅會員可報名</Text>
                )}
              </View>
              {!!registrations[course.id] && (
                <View style={styles.registrationList}>
                  {registrations[course.id].map((registration) => {
                    const order = orders.find((item) => item.registrationId === registration.id);
                    return (
                      <View key={registration.id} style={styles.registrationRow}>
                        <View>
                          <Text style={styles.registrationName}>{registration.name}</Text>
                          <Text style={styles.registrationPhone}>{registration.phone} · {paymentStatusText(registration.paymentStatus)} · {registration.checkedIn ? '已簽到' : '未簽到'}</Text>
                          {!!order && <Text style={styles.registrationPhone}>訂單 #{order.orderId} · NT$ {order.amount}</Text>}
                        </View>
                        <View style={styles.registrationActions}>
                          {order?.status === 'PENDING' && (
                            <Pressable style={styles.courseActionButton} onPress={() => updateOrder(order, 'confirm')}>
                              <Text style={styles.courseActionText}>確認付款</Text>
                            </Pressable>
                          )}
                          {order?.status === 'PAID' && (
                            <Pressable style={styles.dangerButton} onPress={() => updateOrder(order, 'refund')}>
                              <Text style={styles.dangerText}>退款</Text>
                            </Pressable>
                          )}
                          {!registration.checkedIn && (
                            <Pressable style={styles.courseActionButton} onPress={() => checkIn(course.id, registration.id)}>
                              <Text style={styles.courseActionText}>簽到</Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    );
                  })}
                  {!registrations[course.id].length && <Text style={styles.empty}>目前沒有報名</Text>}
                </View>
              )}
              {!!myRegistration?.checkedIn && (
                <View style={styles.registrationList}>
                  <Text style={styles.sectionTitle}>課程評價</Text>
                  <View style={styles.courseFormRow}>
                    <StarRatingInput
                      value={Number(reviewDrafts[myRegistration.id]?.rating || 5)}
                      onChange={(rating) => setReviewDrafts((current) => ({ ...current, [myRegistration.id]: { rating: String(rating), comment: current[myRegistration.id]?.comment || '' } }))}
                    />
                    <Pressable style={styles.courseActionButton} onPress={() => submitReview(myRegistration)}>
                      <Text style={styles.courseActionText}>送出評價</Text>
                    </Pressable>
                  </View>
                  <TextInput
                    style={[styles.courseInput, styles.courseTextarea]}
                    value={reviewDrafts[myRegistration.id]?.comment || ''}
                    onChangeText={(value) => setReviewDrafts((current) => ({ ...current, [myRegistration.id]: { rating: current[myRegistration.id]?.rating || '5', comment: value } }))}
                    multiline
                    placeholder="留下給教練的回饋"
                    placeholderTextColor="#756b62"
                  />
                </View>
              )}
              {!!reviews[course.id] && (
                <View style={styles.registrationList}>
                  {reviews[course.id].map((review) => (
                    <View key={review.id} style={styles.registrationRow}>
                      <View>
                        <Text style={styles.registrationName}>{review.reviewerName} · {review.rating}/5</Text>
                        <Text style={styles.registrationPhone}>{review.comment || '沒有留言'}</Text>
                      </View>
                    </View>
                  ))}
                  {!reviews[course.id].length && <Text style={styles.empty}>目前尚無評價</Text>}
                </View>
              )}
            </View>
          );
        })}
        {!courses.length && <Text style={styles.empty}>目前尚無課程</Text>}
      </View>
    </>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function paymentStatusText(status: CourseRegistration['paymentStatus'] | CourseOrder['status']) {
  if (status === 'PAID') return '已付款';
  if (status === 'REFUNDED') return '退款';
  if (status === 'CANCELLED') return '已取消';
  return '未付款';
}

function NotificationPanel({ user }: { user: AuthUser }) {
  const [feed, setFeed] = useState<NotificationFeed>();
  const [message, setMessage] = useState('');

  async function loadNotifications() {
    try {
      setFeed(await api<NotificationFeed>('/notifications', { headers: { 'X-Auth-Token': user.token } }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '通知載入失敗');
    }
  }

  useEffect(() => { loadNotifications(); }, []);

  async function markRead(id: number) {
    try {
      await api<NotificationItem>(`/notifications/${id}/read`, { method: 'POST', headers: { 'X-Auth-Token': user.token } });
      await loadNotifications();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '通知更新失敗');
    }
  }

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>NOTIFICATIONS</Text>
          <Text style={styles.welcome}>通知中心</Text>
          <Text style={styles.profileMeta}>報名、課程提醒、比賽異動與直播開始通知</Text>
        </View>
      </View>
      {!!message && <Text style={styles.courseMessage}>{message}</Text>}
      <Text style={styles.courseMessage}>未讀通知：{feed?.unreadCount ?? 0}</Text>
      <View style={styles.courseList}>
        {feed?.notifications.map((notification) => (
          <View key={notification.id} style={styles.courseCard}>
            <View>
              <Text style={styles.courseLevel}>{notification.read ? '已讀' : '未讀'}</Text>
              <Text style={styles.courseTitle}>{notification.title}</Text>
              <Text style={styles.courseDescription}>{notification.body}</Text>
            </View>
            {!notification.read && (
              <Pressable style={styles.courseActionButton} onPress={() => markRead(notification.id)}>
                <Text style={styles.courseActionText}>標示已讀</Text>
              </Pressable>
            )}
          </View>
        ))}
        {!feed?.notifications.length && <Text style={styles.empty}>目前沒有通知</Text>}
      </View>
    </>
  );
}

function CoachProfilesPanel({ user }: { user: AuthUser }) {
  const userRoles = user.roles ?? [user.role];
  const canEdit = userRoles.includes('COACH') || userRoles.includes('ADMIN');
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [myProfile, setMyProfile] = useState<CoachProfile>();
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [message, setMessage] = useState('');

  async function loadCoaches() {
    try {
      const list = await api<CoachProfile[]>('/coaches');
      setCoaches(list);
      if (canEdit) {
        const profile = await api<CoachProfile>('/coaches/me', { headers: { 'X-Auth-Token': user.token } });
        setMyProfile(profile);
        setBio(profile.bio || '');
        setSpecialties(profile.specialties || '');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '教練資料載入失敗');
    }
  }

  useEffect(() => { loadCoaches(); }, []);

  async function saveProfile() {
    setMessage('');
    try {
      const profile = await api<CoachProfile>('/coaches/me', {
        method: 'PUT',
        headers: { 'X-Auth-Token': user.token },
        body: JSON.stringify({ bio, specialties }),
      });
      setMyProfile(profile);
      setMessage('教練個人頁已更新');
      await loadCoaches();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '教練個人頁更新失敗');
    }
  }

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>COACH PROFILE</Text>
          <Text style={styles.welcome}>教練個人頁</Text>
          <Text style={styles.profileMeta}>介紹、專長、評價、開課紀錄與收入統計</Text>
        </View>
      </View>
      {canEdit && (
        <View style={styles.courseForm}>
          <Text style={styles.sectionTitle}>編輯我的教練頁</Text>
          <TextInput style={[styles.courseInput, styles.courseTextarea]} value={bio} onChangeText={setBio} multiline placeholder="教練介紹" placeholderTextColor="#756b62" />
          <TextInput style={styles.courseInput} value={specialties} onChangeText={setSpecialties} placeholder="專長，例如投籃、體能、控球" placeholderTextColor="#756b62" />
          {!!myProfile && <Text style={styles.courseMeta}>目前評價 {myProfile.averageRating || 0}/5 · {myProfile.reviewCount} 則</Text>}
          <GoldButton label="儲存教練頁" onPress={saveProfile} />
        </View>
      )}
      {!!message && <Text style={styles.courseMessage}>{message}</Text>}
      <View style={styles.courseList}>
        {coaches.map((coach) => (
          <View key={coach.userId} style={styles.courseCard}>
            <View>
              <Text style={styles.courseLevel}>評價 {coach.averageRating || 0}/5 · {coach.reviewCount} 則</Text>
              <Text style={styles.courseTitle}>{coach.name}</Text>
              <Text style={styles.courseMeta}>{coach.specialties || '尚未填寫專長'}</Text>
              <Text style={styles.courseDescription}>{coach.bio || '尚未填寫教練介紹'}</Text>
              <Text style={styles.courseMeta}>開課 {coach.courseCount} 堂 · 報名 {coach.registrationCount} 人 · 已收 NT$ {coach.paidRevenue}</Text>
              {coach.courses.slice(0, 3).map((course) => (
                <Text key={course.id} style={styles.registrationPhone}>{course.title} · {course.timeText} · {course.location}</Text>
              ))}
            </View>
          </View>
        ))}
        {!coaches.length && <Text style={styles.empty}>目前尚無教練資料</Text>}
      </View>
    </>
  );
}

function CoachProfilesPanelV2({ user }: { user: AuthUser }) {
  const userRoles = user.roles ?? [user.role];
  const canEdit = userRoles.includes('COACH') || userRoles.includes('ADMIN');
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [myProfile, setMyProfile] = useState<CoachProfile>();
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [message, setMessage] = useState('');

  async function loadCoaches() {
    try {
      const list = await api<CoachProfile[]>('/coaches');
      setCoaches(list);
      if (canEdit) {
        const profile = await api<CoachProfile>('/coaches/me', { headers: { 'X-Auth-Token': user.token } });
        setMyProfile(profile);
        setBio(profile.bio || '');
        setSpecialties(profile.specialties || '');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '教練資料載入失敗');
    }
  }

  useEffect(() => { loadCoaches(); }, []);

  async function saveProfile() {
    setMessage('');
    try {
      const profile = await api<CoachProfile>('/coaches/me', {
        method: 'PUT',
        headers: { 'X-Auth-Token': user.token },
        body: JSON.stringify({ bio, specialties }),
      });
      setMyProfile(profile);
      setMessage('教練個人頁已更新');
      await loadCoaches();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '教練個人頁更新失敗');
    }
  }

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>COACH PROFILE</Text>
          <Text style={styles.welcome}>教練個人頁</Text>
          <Text style={styles.profileMeta}>評分、評論、專長、課程紀錄與收入統計</Text>
        </View>
      </View>
      {canEdit && (
        <View style={styles.courseForm}>
          <Text style={styles.sectionTitle}>編輯我的教練頁</Text>
          <TextInput style={[styles.courseInput, styles.courseTextarea]} value={bio} onChangeText={setBio} multiline placeholder="教練介紹" placeholderTextColor="#756b62" />
          <TextInput style={styles.courseInput} value={specialties} onChangeText={setSpecialties} placeholder="專長，例如投籃、體能、控球" placeholderTextColor="#756b62" />
          {!!myProfile && <Text style={styles.courseMeta}>目前評分 {myProfile.averageRating || 0}/5 · {myProfile.reviewCount} 則評論</Text>}
          <GoldButton label="儲存教練頁" onPress={saveProfile} />
        </View>
      )}
      {!!message && <Text style={styles.courseMessage}>{message}</Text>}
      <View style={styles.courseList}>
        {coaches.map((coach) => (
          <View key={coach.userId} style={styles.courseCard}>
            <View style={styles.fullWidth}>
              <Text style={styles.courseTitle}>{coach.name}</Text>
              <Text style={styles.courseMeta}>{coach.specialties || '尚未填寫專長'}</Text>
              <Text style={styles.courseDescription}>{coach.bio || '尚未填寫教練介紹'}</Text>
              <GoogleRatingSummary coach={coach} />
              <Text style={styles.courseMeta}>開課 {coach.courseCount} 堂 · 報名 {coach.registrationCount} 人 · 已收 NT$ {coach.paidRevenue}</Text>
              {coach.courses.slice(0, 3).map((course) => (
                <Text key={course.id} style={styles.registrationPhone}>{course.title} · {course.timeText} · {course.location}</Text>
              ))}
              {!!coach.reviews?.length && (
                <View style={styles.reviewList}>
                  {coach.reviews.slice(0, 3).map((review) => (
                    <View key={review.id} style={styles.reviewItem}>
                      <Text style={styles.registrationName}>{review.reviewerName} · <StarText rating={review.rating} /></Text>
                      <Text style={styles.registrationPhone}>{review.courseTitle}</Text>
                      <Text style={styles.courseDescription}>{review.comment || '沒有留言'}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
        {!coaches.length && <Text style={styles.empty}>目前尚無教練資料</Text>}
      </View>
    </>
  );
}

function GoogleRatingSummary({ coach }: { coach: CoachProfile }) {
  const breakdown = coach.ratingBreakdown || [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0 }));
  const maxCount = Math.max(1, ...breakdown.map((item) => item.count));
  return (
    <View style={styles.ratingSummary}>
      <View style={styles.ratingScoreBox}>
        <Text style={styles.ratingScore}>{coach.averageRating || 0}</Text>
        <StarText rating={Math.round(coach.averageRating || 0)} />
        <Text style={styles.registrationPhone}>{coach.reviewCount} 則評論</Text>
      </View>
      <View style={styles.ratingBars}>
        {breakdown.map((item) => (
          <View key={item.rating} style={styles.ratingBarRow}>
            <Text style={styles.ratingBarLabel}>{item.rating}</Text>
            <View style={styles.ratingBarTrack}>
              <View style={[styles.ratingBarFill, { width: `${Math.round((item.count / maxCount) * 100)}%` }]} />
            </View>
            <Text style={styles.ratingBarCount}>{item.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StarText({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, rating));
  return <Text style={styles.starText}>{'★'.repeat(filled)}{'☆'.repeat(5 - filled)}</Text>;
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const selected = Math.max(1, Math.min(5, value || 5));
  return (
    <View style={styles.starRatingInput}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <Pressable key={rating} onPress={() => onChange(rating)} hitSlop={8} style={styles.starButton}>
          <Text style={[styles.starButtonText, rating <= selected && styles.starButtonTextActive]}>
            {rating <= selected ? '★' : '☆'}
          </Text>
        </Pressable>
      ))}
      <Text style={styles.starRatingValue}>{selected}/5</Text>
    </View>
  );
}

function MyOrdersPanel({ user }: { user: AuthUser }) {
  const [orders, setOrders] = useState<CourseOrder[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<CourseOrder[]>('/courses/orders/me', { headers: { 'X-Auth-Token': user.token } })
      .then(setOrders)
      .catch((error) => setMessage(error instanceof Error ? error.message : '訂單載入失敗'));
  }, []);

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>MY ORDERS</Text>
          <Text style={styles.welcome}>我的訂單</Text>
          <Text style={styles.profileMeta}>查看課程訂單、付款狀態與收據資訊</Text>
        </View>
      </View>
      {!!message && <Text style={styles.courseMessage}>{message}</Text>}
      <View style={styles.courseList}>
        {orders.map((order) => (
          <View key={order.orderId} style={styles.courseCard}>
            <View>
              <Text style={styles.courseLevel}>{paymentStatusText(order.status)}</Text>
              <Text style={styles.courseTitle}>{order.courseTitle}</Text>
              <Text style={styles.courseMeta}>訂單 #{order.orderId} · 收據 {order.receiptNo}</Text>
              <Text style={styles.courseMeta}>NT$ {order.amount} · {order.paymentProvider || '尚未付款'}</Text>
              {!!order.paidAt && <Text style={styles.registrationPhone}>付款時間 {new Date(order.paidAt).toLocaleString()}</Text>}
            </View>
          </View>
        ))}
        {!orders.length && <Text style={styles.empty}>目前沒有課程訂單</Text>}
      </View>
    </>
  );
}

function NotificationSettingsPanel({ user }: { user: AuthUser }) {
  const [settings, setSettings] = useState<NotificationSettings>();
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<NotificationSettings>('/notifications/settings', { headers: { 'X-Auth-Token': user.token } })
      .then(setSettings)
      .catch((error) => setMessage(error instanceof Error ? error.message : '通知設定載入失敗'));
  }, []);

  async function toggle(key: keyof NotificationSettings) {
    if (!settings) return;
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    try {
      setSettings(await api<NotificationSettings>('/notifications/settings', {
        method: 'PUT',
        headers: { 'X-Auth-Token': user.token },
        body: JSON.stringify(next),
      }));
      setMessage('通知設定已更新');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '通知設定更新失敗');
    }
  }

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>NOTICE SETTING</Text>
          <Text style={styles.welcome}>我的通知設定</Text>
          <Text style={styles.profileMeta}>選擇要接收的課程、比賽與直播通知</Text>
        </View>
      </View>
      {!!message && <Text style={styles.courseMessage}>{message}</Text>}
      {!!settings && (
        <View style={styles.courseList}>
          <SettingRow label="課程提醒" enabled={settings.courseRemindersEnabled} onPress={() => toggle('courseRemindersEnabled')} />
          <SettingRow label="比賽提醒與賽程異動" enabled={settings.gameRemindersEnabled} onPress={() => toggle('gameRemindersEnabled')} />
          <SettingRow label="直播開始通知" enabled={settings.liveNotificationsEnabled} onPress={() => toggle('liveNotificationsEnabled')} />
        </View>
      )}
    </>
  );
}

function SettingRow({ label, enabled, onPress }: { label: string; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.courseCard} onPress={onPress}>
      <View>
        <Text style={styles.courseTitle}>{label}</Text>
        <Text style={styles.courseMeta}>{enabled ? '已開啟' : '已關閉'}</Text>
      </View>
      <View style={[styles.courseStatus, !enabled && styles.courseStatusMuted]}>
        <Text style={styles.courseStatusText}>{enabled ? 'ON' : 'OFF'}</Text>
      </View>
    </Pressable>
  );
}

function CoursePanel({ user }: { user: AuthUser }) {
  const userRoles = user.roles ?? [user.role];
  const canManageCourses = userRoles.includes('COACH') || userRoles.includes('ADMIN');
  const canRegisterCourses = userRoles.includes('MEMBER');
  const [courses, setCourses] = useState<Course[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<CourseRegistration[]>([]);
  const [paymentTarget, setPaymentTarget] = useState<{ course: Course; registration: CourseRegistration }>();
  const [registrations, setRegistrations] = useState<Record<number, CourseRegistration[]>>({});
  const [title, setTitle] = useState('');
  const [timeText, setTimeText] = useState('');
  const [level, setLevel] = useState('');
  const [capacity, setCapacity] = useState('12');
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadCourses() {
    try {
      const [nextCourses, nextRegistrations] = await Promise.all([
        api<Course[]>('/courses'),
        api<CourseRegistration[]>('/courses/registrations/me', {
          headers: { 'X-Auth-Token': user.token },
        }),
      ]);
      setCourses(nextCourses);
      setMyRegistrations(nextRegistrations);
      return { nextCourses, nextRegistrations };
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '課程載入失敗');
      return { nextCourses: [] as Course[], nextRegistrations: [] as CourseRegistration[] };
    }
  }

  async function loadMyRegistrations() {
    const nextRegistrations = await api<CourseRegistration[]>('/courses/registrations/me', {
        headers: { 'X-Auth-Token': user.token },
    });
    setMyRegistrations(nextRegistrations);
    return nextRegistrations;
  }

  useEffect(() => { loadCourses(); }, []);

  async function createCourse() {
    setLoading(true);
    setMessage('');
    try {
      await api<Course>('/courses', {
        method: 'POST',
        headers: { 'X-Auth-Token': user.token },
        body: JSON.stringify({ title, timeText, level, capacity: Number(capacity || 0), price: Number(price || 0), status: 'OPEN', description }),
      });
      setTitle('');
      setTimeText('');
      setLevel('');
      setCapacity('12');
      setPrice('0');
      setDescription('');
      setMessage('課程已新增');
      await loadCourses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '新增課程失敗');
    } finally {
      setLoading(false);
    }
  }

  async function registerCourse(course: Course) {
    setMessage('');
    try {
      await api<Course>(`/courses/${course.id}/registrations`, {
        method: 'POST',
        headers: { 'X-Auth-Token': user.token },
      });
      const nextRegistrations = await loadMyRegistrations();
      const registration = nextRegistrations.find((item) => item.courseId === course.id);
      if (!registration) {
        setMessage('報名已建立，請重新整理課程');
        return;
      }
      if (registration.paymentStatus === 'PAID') {
        setMessage('已報名');
      } else {
        setPaymentTarget({ course, registration });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '報名失敗');
    }
  }

  async function payRegistration(registrationId: number) {
    setMessage('');
    try {
      await api<CourseRegistration>(`/courses/registrations/${registrationId}/pay`, {
        method: 'POST',
        headers: { 'X-Auth-Token': user.token },
      });
      setPaymentTarget(undefined);
      setMessage('付款完成');
      await loadCourses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '付款失敗');
    }
  }

  async function checkIn(courseId: number, registrationId: number) {
    setMessage('');
    try {
      await api<CourseRegistration>(`/courses/${courseId}/registrations/${registrationId}/check-in`, {
        method: 'POST',
        headers: { 'X-Auth-Token': user.token },
      });
      setMessage('簽到完成');
      const list = await api<CourseRegistration[]>(`/courses/${courseId}/registrations`, {
        headers: { 'X-Auth-Token': user.token },
      });
      setRegistrations((current) => ({ ...current, [courseId]: list }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '簽到失敗');
    }
  }

  async function deleteCourse(courseId: number) {
    setMessage('');
    try {
      await api(`/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'X-Auth-Token': user.token },
      });
      setMessage('課程已刪除');
      await loadCourses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '刪除課程失敗');
    }
  }

  async function toggleRegistrations(courseId: number) {
    if (registrations[courseId]) {
      setRegistrations((current) => {
        const next = { ...current };
        delete next[courseId];
        return next;
      });
      return;
    }
    setMessage('');
    try {
      const list = await api<CourseRegistration[]>(`/courses/${courseId}/registrations`, {
        headers: { 'X-Auth-Token': user.token },
      });
      setRegistrations((current) => ({ ...current, [courseId]: list }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '報名名單載入失敗');
    }
  }

  if (paymentTarget) {
    return (
      <PaymentPanel
        course={paymentTarget.course}
        registration={paymentTarget.registration}
        loading={loading}
        onCancel={() => setPaymentTarget(undefined)}
        onPay={async () => {
          setLoading(true);
          try {
            await payRegistration(paymentTarget.registration.id);
          } finally {
            setLoading(false);
          }
        }}
      />
    );
  }

  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>TRAINING COURSE</Text>
          <Text style={styles.welcome}>查看課程</Text>
          <Text style={styles.profileMeta}>選擇適合你的訓練時段與強度</Text>
        </View>
      </View>
      {canManageCourses && (
        <View style={styles.courseForm}>
          <Text style={styles.sectionTitle}>新增課程</Text>
          <TextInput style={styles.courseInput} value={title} onChangeText={setTitle} placeholder="課程名稱" placeholderTextColor="#756b62" />
          <TextInput style={styles.courseInput} value={timeText} onChangeText={setTimeText} placeholder="上課時間，例如 每週二 19:00" placeholderTextColor="#756b62" />
          <View style={styles.courseFormRow}>
            <TextInput style={[styles.courseInput, styles.courseFormField]} value={level} onChangeText={setLevel} placeholder="程度" placeholderTextColor="#756b62" />
            <TextInput style={[styles.courseInput, styles.courseFormField]} value={capacity} onChangeText={setCapacity} keyboardType="number-pad" placeholder="名額" placeholderTextColor="#756b62" />
            <TextInput style={[styles.courseInput, styles.courseFormField]} value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="價格" placeholderTextColor="#756b62" />
          </View>
          <TextInput style={[styles.courseInput, styles.courseTextarea]} value={description} onChangeText={setDescription} multiline placeholder="課程說明" placeholderTextColor="#756b62" />
          <GoldButton label={loading ? '新增中...' : '新增課程'} onPress={createCourse} disabled={loading} />
        </View>
      )}
      {!!message && <Text style={styles.courseMessage}>{message}</Text>}
      <View style={styles.courseList}>
        {courses.map((course) => (
          <View key={course.id} style={styles.courseCard}>
            {(() => {
              const myRegistration = myRegistrations.find((registration) => registration.courseId === course.id);
              return (
                <>
            <View>
              <Text style={styles.courseLevel}>{course.level}</Text>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseMeta}>{course.coachName} · {course.timeText}</Text>
              <Text style={styles.courseMeta}>NT$ {course.price} · {course.status === 'OPEN' ? '開放報名' : course.status}</Text>
              {!!myRegistration && <Text style={styles.courseMeta}>{myRegistration.paymentStatus === 'PAID' ? '已付款' : '未付款'} · {myRegistration.checkedIn ? '已簽到' : '尚未簽到'}</Text>}
              <Text style={styles.courseDescription}>{course.description}</Text>
            </View>
            <View style={styles.courseActions}>
              <Text style={styles.courseStatus}>{course.registrationCount}/{course.capacity} 報名</Text>
              {userRoles.includes('ADMIN') || course.coachUserId === user.userId ? (
                <>
                  <Pressable style={styles.courseActionButton} onPress={() => toggleRegistrations(course.id)}>
                    <Text style={styles.courseActionText}>{registrations[course.id] ? '收合名單' : '報名情況'}</Text>
                  </Pressable>
                  <Pressable style={styles.dangerButton} onPress={() => deleteCourse(course.id)}>
                    <Text style={styles.dangerText}>刪除</Text>
                  </Pressable>
                </>
              ) : myRegistration?.paymentStatus !== 'PAID' && myRegistration ? (
                <Pressable style={styles.courseActionButton} onPress={() => setPaymentTarget({ course, registration: myRegistration })}>
                  <Text style={styles.courseActionText}>付款</Text>
                </Pressable>
              ) : myRegistration ? (
                <Text style={styles.courseMuted}>已報名</Text>
              ) : canRegisterCourses ? (
                <Pressable style={styles.courseActionButton} onPress={() => registerCourse(course)}>
                  <Text style={styles.courseActionText}>我要報名</Text>
                </Pressable>
              ) : (
                <Text style={styles.courseMuted}>其他教練課程</Text>
              )}
            </View>
                </>
              );
            })()}
            {!!registrations[course.id] && (
              <View style={styles.registrationList}>
                {registrations[course.id].map((registration) => (
                  <View key={registration.id} style={styles.registrationRow}>
                    <View>
                      <Text style={styles.registrationName}>{registration.name}</Text>
                      <Text style={styles.registrationPhone}>{registration.phone} · {registration.paymentStatus === 'PAID' ? '已付款' : '未付款'} · {registration.checkedIn ? '已簽到' : '未簽到'}</Text>
                    </View>
                    <View style={styles.registrationActions}>
                      {registration.paymentStatus !== 'PAID' && registration.userId === user.userId && (
                        <Pressable style={styles.courseActionButton} onPress={() => setPaymentTarget({ course, registration })}>
                          <Text style={styles.courseActionText}>付款</Text>
                        </Pressable>
                      )}
                      {!registration.checkedIn && (userRoles.includes('ADMIN') || course.coachUserId === user.userId) && (
                        <Pressable style={styles.courseActionButton} onPress={() => checkIn(course.id, registration.id)}>
                          <Text style={styles.courseActionText}>簽到</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))}
                {!registrations[course.id].length && <Text style={styles.empty}>目前尚無報名</Text>}
              </View>
            )}
          </View>
        ))}
        {!courses.length && <Text style={styles.empty}>目前尚無課程</Text>}
      </View>
    </>
  );
}

function PaymentPanelV2({
  course,
  registration,
  loading,
  onCancel,
  onPay,
}: {
  course: Course;
  registration: CourseRegistration;
  loading: boolean;
  onCancel: () => void;
  onPay: () => Promise<void>;
}) {
  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>COURSE PAYMENT</Text>
          <Text style={styles.welcome}>課程付款</Text>
          <Text style={styles.profileMeta}>目前為模擬付款，完成後會更新報名與訂單狀態</Text>
        </View>
      </View>
      <View style={styles.paymentCard}>
        <Text style={styles.courseLevel}>{course.level}</Text>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseMeta}>{course.coachName} · {course.timeText}</Text>
        <Text style={styles.courseMeta}>{course.location}</Text>
        <View style={styles.paymentSummary}>
          <PaymentRow label="報名人" value={registration.name} />
          <PaymentRow label="訂單編號" value={`#${registration.orderId}`} />
          <PaymentRow label="付款狀態" value={paymentStatusText(registration.paymentStatus)} />
          <PaymentRow label="應付金額" value={`NT$ ${registration.amount ?? course.price}`} important />
        </View>
        <View style={styles.paymentActions}>
          <Pressable style={styles.secondaryOutlineButton} onPress={onCancel}>
            <Text style={styles.secondaryOutlineText}>返回課程</Text>
          </Pressable>
          <GoldButton label={loading ? '付款中...' : '模擬付款'} onPress={onPay} disabled={loading} />
        </View>
      </View>
    </>
  );
}

function PaymentPanel({
  course,
  registration,
  loading,
  onCancel,
  onPay,
}: {
  course: Course;
  registration: CourseRegistration;
  loading: boolean;
  onCancel: () => void;
  onPay: () => Promise<void>;
}) {
  return (
    <>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.eyebrow}>COURSE PAYMENT</Text>
          <Text style={styles.welcome}>課程付款</Text>
          <Text style={styles.profileMeta}>付款完成後即完成報名</Text>
        </View>
      </View>
      <View style={styles.paymentCard}>
        <Text style={styles.courseLevel}>{course.level}</Text>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseMeta}>{course.coachName} · {course.timeText}</Text>
        <View style={styles.paymentSummary}>
          <PaymentRow label="報名人" value={registration.name} />
          <PaymentRow label="訂單編號" value={`#${registration.orderId}`} />
          <PaymentRow label="付款狀態" value={registration.paymentStatus === 'PAID' ? '已付款' : '待付款'} />
          <PaymentRow label="應付金額" value={`NT$ ${registration.amount ?? course.price}`} important />
        </View>
        <View style={styles.paymentActions}>
          <Pressable style={styles.secondaryOutlineButton} onPress={onCancel}>
            <Text style={styles.secondaryOutlineText}>返回課程</Text>
          </Pressable>
          <GoldButton label={loading ? '付款中...' : '確認付款'} onPress={onPay} disabled={loading} />
        </View>
      </View>
    </>
  );
}

function PaymentRow({ label, value, important = false }: { label: string; value: string; important?: boolean }) {
  return (
    <View style={styles.paymentRow}>
      <Text style={styles.paymentLabel}>{label}</Text>
      <Text style={[styles.paymentValue, important && styles.paymentValueImportant]}>{value}</Text>
    </View>
  );
}

function BioItem({ label, value }: { label: string; value: string }) {
  return <View style={styles.bioItem}><Text style={styles.bioLabel}>{label}</Text><Text style={styles.bioValue}>{value}</Text></View>;
}

function StatCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return <View style={styles.statCard}><Text style={styles.statLabel}>{label}</Text><View style={styles.statValueRow}><Text style={styles.statValue}>{value}</Text><Text style={styles.statUnit}>{unit}</Text></View></View>;
}

function SkillItem({ label, value }: { label: string; value: string | number }) {
  return <View style={styles.skillItem}><Text style={styles.skillLabel}>{label}</Text><Text style={styles.skillValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#080908' },
  publicContent: { minHeight: '100%' },
  publicSafe: { minHeight: 720 },
  nav: { height: 74, paddingHorizontal: 2, borderBottomWidth: 1, borderBottomColor: '#322315', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navLogo: { width: 90, height: 54 },
  navLink: { color: '#f4ad42', fontSize: 14, fontWeight: '800' },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuToggle: { borderWidth: 1, borderColor: '#d5943c', backgroundColor: '#241a10', paddingHorizontal: 12, paddingVertical: 8 },
  menuToggleText: { color: '#f0a642', fontSize: 13, fontWeight: '900' },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#e79b34', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#140e08', fontWeight: '900' },
  logout: { color: '#b9ada1', fontSize: 13, fontWeight: '700' },
  hero: { minHeight: 620, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  heroLogo: { width: 230, height: 218 },
  eyebrow: { color: '#e69d38', fontSize: 11, letterSpacing: 3, fontWeight: '900' },
  heroTitle: { color: '#fff', fontSize: 46, lineHeight: 56, fontWeight: '900', fontStyle: 'italic', textAlign: 'center', marginTop: 12 },
  heroSubtitle: { color: '#bdb3a8', textAlign: 'center', lineHeight: 24, marginTop: 14 },
  heroActions: { width: '100%', maxWidth: 340, gap: 8, marginTop: 28 },
  secondaryButton: { paddingVertical: 16, alignItems: 'center' },
  secondaryText: { color: '#e7ded5', fontWeight: '700' },
  dashboardContent: { minHeight: '100%' },
  dashboardSafe: { width: '100%', maxWidth: 1080, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 48, position: 'relative' },
  menuBackdrop: { position: 'absolute', top: 74, left: 0, right: 0, bottom: 0, minHeight: 900, backgroundColor: 'rgba(0, 0, 0, 0.42)', zIndex: 10 },
  appShell: { paddingTop: 22 },
  sideMenu: { position: 'absolute', top: 86, left: 22, width: '82%', maxWidth: 300, backgroundColor: '#121312', borderWidth: 1, borderColor: '#30312f', padding: 14, gap: 10, zIndex: 20 },
  sideProfile: { paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#30312f', marginBottom: 4 },
  avatarLarge: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#e79b34', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  sideName: { color: '#fff', fontSize: 18, fontWeight: '900' },
  sideTeam: { color: '#a79e94', fontSize: 12, fontWeight: '700', marginTop: 5 },
  menuPressable: { width: '100%' },
  menuItem: { borderWidth: 1, borderColor: '#272827', backgroundColor: '#171815', paddingVertical: 13, paddingHorizontal: 12 },
  menuItemActive: { borderColor: '#d5943c', backgroundColor: '#241a10' },
  menuEyebrow: { color: '#7e766f', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  menuEyebrowActive: { color: '#f0a642' },
  menuLabel: { color: '#d7cfc6', fontSize: 15, fontWeight: '900', marginTop: 4 },
  menuLabelActive: { color: '#fff' },
  mainPanel: { flex: 1, minWidth: 0 },
  profileHeader: { paddingVertical: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 },
  welcome: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 8 },
  profileMeta: { color: '#a79e94', fontSize: 12, fontWeight: '700', marginTop: 8 },
  season: { alignItems: 'flex-start' },
  seasonLabel: { color: '#df9635', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  seasonValue: { color: '#d7cfc6', fontSize: 13, fontWeight: '700', marginTop: 5 },
  bioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  bioItem: { minWidth: 140, flexGrow: 1, padding: 14, backgroundColor: '#1b1712', borderWidth: 1, borderColor: '#52391f' },
  bioLabel: { color: '#b8aa9b', fontSize: 11, fontWeight: '700' },
  bioValue: { color: '#f0a642', fontSize: 18, fontWeight: '900', marginTop: 7 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { minWidth: 150, flexGrow: 1, flexBasis: 180, padding: 18, backgroundColor: '#121312', borderWidth: 1, borderColor: '#30312f' },
  statLabel: { color: '#aaa198', fontSize: 12, fontWeight: '700' },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 10 },
  statValue: { color: '#fff', fontSize: 35, fontWeight: '900' },
  statUnit: { color: '#dc9639', fontSize: 11, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 34, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  sectionAside: { color: '#a79d93', fontSize: 12, fontWeight: '700' },
  homeSection: { marginBottom: 2 },
  homeGameCard: { padding: 16, borderWidth: 1, borderColor: '#30312f', backgroundColor: '#121312', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  homeGameLive: { borderColor: '#d5943c', backgroundColor: '#1f1710' },
  homeGameActions: { alignItems: 'flex-start', gap: 10 },
  homeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  homeCard: { minWidth: 190, flex: 1, borderWidth: 1, borderColor: '#30312f', backgroundColor: '#121312', padding: 16 },
  homeCardTitle: { color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 8 },
  homeCardMeta: { color: '#a79e94', fontSize: 12, fontWeight: '700', marginTop: 7 },
  videoList: { borderWidth: 1, borderColor: '#30312f', backgroundColor: '#121312' },
  videoRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#30312f', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14 },
  videoType: { color: '#d5943c', fontSize: 11, fontWeight: '900' },
  videoTitle: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 7 },
  videoAction: { color: '#f0a642', fontSize: 12, fontWeight: '900' },
  statsList: { gap: 12 },
  teamStatsCard: { borderWidth: 1, borderColor: '#30312f', backgroundColor: '#121312', padding: 16, gap: 12 },
  playerStatsCard: { borderWidth: 1, borderColor: '#30312f', backgroundColor: '#121312', padding: 16, gap: 10 },
  teamStatsHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  teamRankName: { color: '#fff', fontSize: 20, fontWeight: '900' },
  recordText: { color: '#f0a642', fontSize: 20, fontWeight: '900' },
  miniRoster: { borderTopWidth: 1, borderTopColor: '#30312f', paddingTop: 8 },
  playerMiniRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 7, flexWrap: 'wrap' },
  playerStatLine: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#121312', borderWidth: 1, borderColor: '#30312f' },
  skillItem: { minWidth: 130, flexGrow: 1, flexBasis: 160, padding: 18, borderRightWidth: 1, borderRightColor: '#30312f' },
  skillLabel: { color: '#aaa198', fontSize: 12, fontWeight: '700' },
  skillValue: { color: '#f0a642', fontSize: 23, fontWeight: '900', marginTop: 8 },
  scheduleList: { borderWidth: 1, borderColor: '#30312f', backgroundColor: '#121312' },
  scheduleRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#30312f', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  scheduleDate: { color: '#d18e35', fontSize: 12, fontWeight: '900' },
  scheduleMatch: { color: '#fff', fontSize: 14, fontWeight: '800', marginTop: 7 },
  scheduleVenue: { color: '#99918a', fontSize: 11, marginTop: 5 },
  scheduleStatus: { color: '#d5943c', fontSize: 12, fontWeight: '900' },
  courseForm: { borderWidth: 1, borderColor: '#30312f', backgroundColor: '#121312', padding: 16, gap: 10, marginBottom: 18 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  metricTile: { flex: 1, minWidth: 135, borderWidth: 1, borderColor: '#30312f', backgroundColor: '#121312', padding: 14 },
  metricLabel: { color: '#a79e94', fontSize: 12, fontWeight: '800' },
  metricValue: { color: '#f0a642', fontSize: 20, fontWeight: '900', marginTop: 6 },
  courseFormRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  courseFormField: { flex: 1, minWidth: 130 },
  courseInput: { minHeight: 46, borderWidth: 1, borderColor: '#3b332b', backgroundColor: '#0b0c0b', color: '#fff', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontWeight: '700' },
  courseTextarea: { minHeight: 88, textAlignVertical: 'top' },
  courseMessage: { color: '#f3ae4e', marginBottom: 12, fontWeight: '800' },
  courseList: { gap: 12 },
  courseCard: { minHeight: 102, padding: 18, borderWidth: 1, borderColor: '#30312f', backgroundColor: '#121312', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 },
  fullWidth: { width: '100%' },
  courseLevel: { color: '#d5943c', fontSize: 11, fontWeight: '900' },
  courseTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 8 },
  courseMeta: { color: '#a79e94', fontSize: 12, fontWeight: '700', marginTop: 8 },
  courseDescription: { color: '#d7cfc6', fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 520 },
  courseActions: { alignItems: 'flex-start', gap: 10 },
  courseStatus: { color: '#140e08', backgroundColor: '#e79b34', paddingHorizontal: 12, paddingVertical: 8, fontSize: 12, fontWeight: '900' },
  courseStatusMuted: { backgroundColor: '#474540' },
  courseStatusText: { color: '#140e08', fontSize: 12, fontWeight: '900' },
  courseActionButton: { borderWidth: 1, borderColor: '#d5943c', paddingHorizontal: 12, paddingVertical: 9 },
  courseActionText: { color: '#f0a642', fontSize: 12, fontWeight: '900' },
  dangerButton: { borderWidth: 1, borderColor: '#7f3f38', paddingHorizontal: 12, paddingVertical: 9 },
  dangerText: { color: '#df9185', fontSize: 12, fontWeight: '900' },
  courseMuted: { color: '#8d857d', fontSize: 12, fontWeight: '800' },
  paymentCard: { borderWidth: 1, borderColor: '#d5943c', backgroundColor: '#121312', padding: 18, gap: 12 },
  paymentSummary: { borderTopWidth: 1, borderTopColor: '#30312f', borderBottomWidth: 1, borderBottomColor: '#30312f', paddingVertical: 8, marginTop: 6 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 9 },
  paymentLabel: { color: '#a79e94', fontSize: 13, fontWeight: '800' },
  paymentValue: { color: '#fff', fontSize: 14, fontWeight: '900' },
  paymentValueImportant: { color: '#f0a642', fontSize: 20 },
  paymentActions: { gap: 10, marginTop: 4 },
  secondaryOutlineButton: { borderWidth: 1, borderColor: '#474540', paddingVertical: 14, alignItems: 'center' },
  secondaryOutlineText: { color: '#ddd4ca', fontSize: 13, fontWeight: '900' },
  registrationList: { width: '100%', borderTopWidth: 1, borderTopColor: '#30312f', marginTop: 4, paddingTop: 10 },
  registrationRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8 },
  registrationActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  registrationName: { color: '#fff', fontWeight: '900' },
  registrationPhone: { color: '#a79e94', fontWeight: '700' },
  ratingSummary: { flexDirection: 'row', gap: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#30312f', paddingVertical: 14, marginTop: 12, marginBottom: 8, flexWrap: 'wrap' },
  ratingScoreBox: { minWidth: 92, alignItems: 'flex-start' },
  ratingScore: { color: '#fff', fontSize: 42, fontWeight: '900' },
  starText: { color: '#f0a642', fontSize: 15, fontWeight: '900', letterSpacing: 0 },
  starRatingInput: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 46, borderWidth: 1, borderColor: '#3b332b', backgroundColor: '#0b0c0b', paddingHorizontal: 10 },
  starButton: { width: 34, height: 38, alignItems: 'center', justifyContent: 'center' },
  starButtonText: { color: '#6c665f', fontSize: 25, fontWeight: '900', letterSpacing: 0 },
  starButtonTextActive: { color: '#f0a642' },
  starRatingValue: { color: '#d7cfc6', fontSize: 13, fontWeight: '900', marginLeft: 4 },
  ratingBars: { flex: 1, minWidth: 210, gap: 6 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingBarLabel: { color: '#d7cfc6', width: 14, fontSize: 12, fontWeight: '900' },
  ratingBarTrack: { flex: 1, height: 8, backgroundColor: '#2d2e2b', overflow: 'hidden' },
  ratingBarFill: { height: 8, backgroundColor: '#f0a642' },
  ratingBarCount: { color: '#a79e94', width: 28, fontSize: 12, fontWeight: '800', textAlign: 'right' },
  reviewList: { marginTop: 12, gap: 10 },
  reviewItem: { borderTopWidth: 1, borderTopColor: '#30312f', paddingTop: 10 },
  empty: { color: '#a29a92', padding: 16 },
});
