// src/screens/HomeScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Book } from '../types/Book';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const bannerImages = ['#949B7A', '#D0946F', '#D5E1C9', '#E9D8C8'];

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();
  const scrollRef  = useRef<FlatList>(null);
  const [search, setSearch]     = useState('');
  const [mustReads, setMustReads] = useState<Book[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // responsive grid setup
  const { width: screenWidth } = useWindowDimensions();
  const CARD_WIDTH  = 180; // your "mobile" card size + spacing
  const numColumns  = Math.max(1, Math.floor(screenWidth / CARD_WIDTH));

  // Auto-slide banner
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentIndex + 1) % bannerImages.length;
      scrollRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Fetch must-read books
  useEffect(() => {
    (async () => {
      const mustSnap = await getDocs(collection(db, 'mustread'));
      const ids = mustSnap.docs.map(d => d.id);
      const allSnap = await getDocs(collection(db, 'books'));
      const all = allSnap.docs.map(d => ({ id: d.id, ...d.data() } as Book));
      setMustReads(all.filter(b => ids.includes(b.id)));
    })();
  }, []);

  const handleSearch = () => {
    navigation.navigate('BookList', { query: search });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books"
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <Feather
          name="shopping-cart"
          size={22}
          color="#444"
          style={{ marginLeft: 10 }}
          onPress={() => navigation.navigate('Cart')}
        />
        <Ionicons
          name="notifications-outline"
          size={22}
          color="#444"
          style={{ marginLeft: 10 }}
        />
      </View>

      {/* Swipeable Banner */}
      <FlatList
        data={bannerImages}
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
          setCurrentIndex(idx);
        }}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.banner, { width: screenWidth, backgroundColor: item }]} />
        )}
      />

      {/* Dots */}
      <View style={styles.dotsWrapper}>
        {bannerImages.map((_, i) => (
          <View key={i} style={[styles.dot, currentIndex === i && styles.activeDot]} />
        ))}
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>This Month’s Must-Reads</Text>

      {/* Responsive Book Grid */}
      <FlatList
        data={mustReads}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        key={numColumns}  // rebuild when columns change
        columnWrapperStyle={{
          justifyContent: 'flex-start',
          paddingHorizontal: 16,
          marginBottom: 20,
        }}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.bookCard, { width: CARD_WIDTH - 16 }]}
            onPress={() => navigation.navigate('Book', { book: item })}
          >
            {item.cover ? (
              <Image
                source={{ uri: item.cover }}
                style={styles.bookImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.bookImage, { backgroundColor: '#ccc' }]} />
            )}
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        {['Home', 'BookList', 'User'].map(routeName => {
          const isActive = routeName === 'Home';
          return (
            <TouchableOpacity
              key={routeName}
              onPress={() => navigation.navigate(routeName)}
            >
              <View style={isActive ? styles.activeCircle : styles.iconWrapper}>
                <Feather
                  name={
                    routeName === 'Home'
                      ? 'home'
                      : routeName === 'BookList'
                      ? 'shopping-bag'
                      : 'user'
                  }
                  size={24}
                  color={isActive ? '#fff' : '#936B38'}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F9F5F2' },
  topBar:         {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 12,
                  },
  searchInput:    {
                    flex: 1,
                    backgroundColor: '#E9D8C8',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                  },
  banner:         { height: 200 },
  dotsWrapper:    {
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 8,
                  },
  dot:            {
                    width: 6,
                    height: 6,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor: '#ccc',
                  },
  activeDot:      { backgroundColor: '#333', width: 16 },
  sectionTitle:   {
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginHorizontal: 16,
                    marginTop: 20,
                    marginBottom: 12,
                    color: '#333',
                  },
  bookCard:       {
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    elevation: 2,
                    marginRight: 8,
                    marginLeft: 8,
                  },
  bookImage:      { width: '100%', height: 160 },
  bookTitle:      {
                    padding: 10,
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#333',
                  },
  bottomNav:      {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    paddingTop: 10,
                    borderTopColor: '#eee',
                    borderTopWidth: 1,
                  },
  activeCircle:   {
                    backgroundColor: '#936B38',
                    padding: 12,
                    borderRadius: 999,
                  },
  iconWrapper:    { padding: 12 },
});