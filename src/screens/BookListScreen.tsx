// src/screens/BookListScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Book } from '../types/Book';
import { useCart } from '../context/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookListScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const insets     = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  // 1. “Mobile” card width (including right margin)
  const CARD_WIDTH = 180;
  // 2. Compute how many cards fit per row
  const numColumns = Math.max(1, Math.floor(screenWidth / CARD_WIDTH));

  const initialQuery = (route.params as any)?.query || '';
  const [books, setBooks]   = useState<Book[]>([]);
  const [search, setSearch] = useState(initialQuery);
  const { cart, addToCart } = useCart();

  useFocusEffect(
    React.useCallback(() => {
      const fetchBooks = async () => {
        const snapshot = await getDocs(collection(db, 'books'));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
        setBooks(list);
      };
      fetchBooks();
    }, [])
  );

  // filter by search term
  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.author.toLowerCase().includes(search.toLowerCase()) ||
    book.publisher.toLowerCase().includes(search.toLowerCase()) ||
    book.ISBN.toLowerCase().includes(search.toLowerCase())
  );

  // split available vs sold-out
  const available = filtered.filter(book => book.stock > 0);
  const soldOut   = filtered.filter(book => book.stock === 0);
  const displayList = [...available, ...soldOut];

  const handleAdd = (item: Book) => {
    const inCart = cart.find(x => x.id === item.id);
    const qty = inCart ? inCart.quantity : 0;

    if (item.stock === 0) {
      Alert.alert('Sold out', 'This book is out of stock.');
    } else if (qty >= item.stock) {
      Alert.alert(
        'Stock limit reached',
        `You already have ${qty} of "${item.title}" in your cart.`
      );
    } else {
      addToCart(item);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books"
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
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

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All</Text>
        <View style={styles.sectionLine} />
      </View>

      {/* Responsive Book Grid */}
      <FlatList
        data={displayList}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        key={numColumns} // force re-layout when columns change
        columnWrapperStyle={{
          justifyContent: 'flex-start',
          paddingHorizontal: 16,
          marginBottom: 20,
        }}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        renderItem={({ item }) => {
          const inCart = cart.find(x => x.id === item.id);
          const qty = inCart ? inCart.quantity : 0;
          const canAdd = item.stock > 0 && qty < item.stock;

          return (
            <View
              style={[
                styles.bookCard,
                { width: CARD_WIDTH - 16 /* subtract horizontal spacing */ }
              ]}
            >
              <TouchableOpacity
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
                <Text style={styles.bookMeta}>
                  ${item.price.toFixed(2)} | Stock: {item.stock}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cartButton, !canAdd && styles.cartButtonDisabled]}
                onPress={() => handleAdd(item)}
                disabled={!canAdd}
              >
                <Text style={styles.cartButtonText}>
                  {item.stock === 0
                    ? 'Sold Out'
                    : canAdd
                    ? 'Add to Cart'
                    : 'Max in Cart'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        {['Home', 'BookList', 'User'].map(routeName => {
          const isActive = routeName === 'BookList';
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
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#936B38',
    marginBottom: 4,
  },
  sectionLine: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
  },
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    paddingBottom: 10,
    marginRight: 8,
    marginLeft: 8,
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
  bookMeta: {
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#666',
  },
  cartButton: {
    backgroundColor: '#949B7A',
    margin: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  cartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: '600',
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
