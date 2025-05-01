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
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Book } from '../types/Book';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const bannerImages = [
  '#949B7A',
  '#D0946F',
  '#D5E1C9',
  '#E9D8C8',
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [mustReads, setMustReads] = useState<Book[]>([]);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerImages.length;
      scrollRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    const fetchMustReadBooks = async () => {
      const mustReadSnapshot = await getDocs(collection(db, 'mustread'));
      const mustReadIds = mustReadSnapshot.docs.map(doc => doc.id);
      const booksSnapshot = await getDocs(collection(db, 'books'));
      const allBooks = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Book[];
      const filtered = allBooks.filter(book => mustReadIds.includes(book.id));
      setMustReads(filtered);
    };
    fetchMustReadBooks();
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
        <Feather name="shopping-cart" size={22} color="#444" style={{ marginLeft: 10 }} onPress={() => navigation.navigate('Cart')} />
        <Ionicons name="notifications-outline" size={22} color="#444" style={{ marginLeft: 10 }} />
      </View>

      {/* Swipeable Banner */}
      <FlatList
        data={bannerImages}
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.banner, { backgroundColor: item }]} />
        )}
      />
      {/* Dots Indicator */}
      <View style={styles.dotsWrapper}>
        {bannerImages.map((_, i) => (
          <View key={i} style={[styles.dot, currentIndex === i && styles.activeDot]} />
        ))}
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>This Month’s Must-Reads</Text>

      {/* Books Grid */}
      <FlatList
        data={mustReads}
        numColumns={2}
        columnWrapperStyle={styles.bookRow}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.bookCard} onPress={() => navigation.navigate('Book', { book: item })}>
            {item.cover ? (
              <Image source={{ uri: item.cover }} style={styles.bookImage} resizeMode="cover" />
            ) : (
              <View style={[styles.bookImage, { backgroundColor: '#ccc' }]} />
            )}
            <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: -7 + insets.bottom }]}>
        {['Home', 'BookList', 'User'].map((route) => {
          const isActive = route === 'Home';
          return (
            <TouchableOpacity key={route} onPress={() => navigation.navigate(route)}>
              <View style={isActive ? styles.activeCircle : styles.iconWrapper}>
                <Feather
                  name={
                    route === 'Home'
                      ? 'home'
                      : route === 'BookList'
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
  container: { flex: 1, backgroundColor: '#F9F5F2' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#E9D8C8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  banner: {
    width: width,
    height: 200,
    borderRadius: 0,
  },
  dotsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#ccc',
  },
  activeDot: {
    backgroundColor: '#333',
    width: 16,
  },
  sectionTitle: {
    fontFamily: 'BodoniModa-Regular',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
    color: '#333',
  },
  bookRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  bookCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  bookImage: {
    width: '100%',
    height: 160,
  },
  bookTitle: {
    padding: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bottomNav: {
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
  activeCircle: {
    backgroundColor: '#936B38',
    padding: 12,
    borderRadius: 999,
  },
  iconWrapper: {
    padding: 12,
  },
});
