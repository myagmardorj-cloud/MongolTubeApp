import { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, Image, ActivityIndicator, StatusBar,
  SafeAreaView, Dimensions, Alert
} from 'react-native';
import { WebView } from 'react-native-webview';

const API = 'http://127.0.0.1:5000';
const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#0D1117',
  surface: '#161B22',
  surface2: '#21262D',
  border: '#30363D',
  text: '#E6EDF3',
  text2: '#8B949E',
  blue: '#004BD8',
  gold: '#F5A623',
};

export default function App() {
  const [screen, setScreen] = useState('home'); // home, search, player
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/search?q=монгол дуу 2026`);
      const data = await res.json();
      setTrending(data);
    } catch (e) {
      console.log('Backend алдаа:', e);
    } finally {
      setLoading(false);
    }
  };

  const search = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setScreen('search');
      const res = await fetch(`${API}/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      Alert.alert('Алдаа', 'Сүлжээний алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const playVideo = (video) => {
    setCurrentVideo(video);
    setScreen('player');
  };

  const formatDuration = (sec) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatViews = (n) => {
    if (!n) return '';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  const VideoCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => playVideo(item)}>
      <View style={styles.thumb}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbImg} />
        ) : (
          <View style={[styles.thumbImg, styles.thumbPlaceholder]}>
            <Text style={{ fontSize: 32 }}>🎬</Text>
          </View>
        )}
        {item.duration && (
          <View style={styles.duration}>
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardMeta}>
          {item.uploader} {item.view_count ? `• ${formatViews(item.view_count)} үзсэн` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // PLAYER SCREEN
  if (screen === 'player' && currentVideo) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('search')}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <WebView
          source={{ uri: `https://www.youtube.com/embed/${currentVideo.id}?autoplay=1` }}
          style={styles.player}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
        />
        <View style={styles.playerInfo}>
          <Text style={styles.playerTitle} numberOfLines={2}>{currentVideo.title}</Text>
          <Text style={styles.playerMeta}>{currentVideo.uploader}</Text>
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => Alert.alert('Татах', 'MongolTube APK суулгаад MP3/MP4 татаарай!')}
          >
            <Text style={styles.downloadText}>⬇ MP3/MP4 татах</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          Mongol<Text style={{ color: COLORS.gold }}>Tube</Text>
        </Text>
        <Text style={styles.logoSub}>Монголын Видео Платформ</Text>
      </View>

      {/* SEARCH */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Хайх..."
          placeholderTextColor={COLORS.text2}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, screen === 'home' && styles.tabActive]}
          onPress={() => setScreen('home')}
        >
          <Text style={[styles.tabText, screen === 'home' && styles.tabTextActive]}>🏠 Нүүр</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, screen === 'search' && styles.tabActive]}
          onPress={() => setScreen('search')}
        >
          <Text style={[styles.tabText, screen === 'search' && styles.tabTextActive]}>🔍 Хайлт</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.blue} />
          <Text style={styles.loadingText}>Ачааллаж байна...</Text>
        </View>
      ) : (
        <FlatList
          data={screen === 'home' ? trending : results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <VideoCard item={item} />}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {screen === 'home' ? '🔥 Монгол дуу 2026' : `🔍 "${query}" хайлтын үр дүн`}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 48 }}>🎵</Text>
              <Text style={styles.emptyText}>Дуу хайгаарай</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logo: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -1 },
  logoSub: { fontSize: 11, color: COLORS.text2, marginTop: 2, letterSpacing: 2 },
  searchRow: { flexDirection: 'row', padding: 12, gap: 8 },
  searchInput: { flex: 1, backgroundColor: COLORS.surface, color: COLORS.text, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border, fontSize: 15 },
  searchBtn: { backgroundColor: COLORS.blue, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { fontSize: 18 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.blue },
  tabText: { color: COLORS.text2, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.blue },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', padding: 12 },
  card: { flexDirection: 'row', padding: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  thumb: { width: 120, height: 68, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  thumbImg: { width: 120, height: 68 },
  thumbPlaceholder: { backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  duration: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  durationText: { color: 'white', fontSize: 10, fontWeight: '600' },
  cardInfo: { flex: 1 },
  cardTitle: { color: COLORS.text, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  cardMeta: { color: COLORS.text2, fontSize: 11, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingText: { color: COLORS.text2, marginTop: 12 },
  emptyText: { color: COLORS.text2, fontSize: 16, marginTop: 12 },
  backBtn: { padding: 12 },
  backText: { color: COLORS.blue, fontSize: 15, fontWeight: '600' },
  player: { width: width, height: width * 9 / 16 },
  playerInfo: { padding: 16 },
  playerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  playerMeta: { color: COLORS.text2, fontSize: 13, marginBottom: 12 },
  downloadBtn: { backgroundColor: COLORS.blue, borderRadius: 10, padding: 12, alignItems: 'center' },
  downloadText: { color: 'white', fontSize: 14, fontWeight: '700' },
});