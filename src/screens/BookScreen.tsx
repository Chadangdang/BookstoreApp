// src/screens/BookScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';

export default function BookScreen({ route }: any) {
  const navigation = useNavigation();
  const { book } = route.params;
  const insets = useSafeAreaInsets();

  const { cart, addToCart } = useCart();
  const existing = cart.find(item => item.id === book.id);
  const cartQty = existing ? existing.quantity : 0;
  const canAdd = cartQty < book.stock;

  const handleAdd = () => {
    if (canAdd) {
      addToCart(book);
    } else {
      Alert.alert(
        'Stock limit reached',
        `You already have ${cartQty} in your cart and only ${book.stock} available.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#444" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books"
          placeholderTextColor="#444"
          onSubmitEditing={e =>
            navigation.navigate('BookList', { query: e.nativeEvent.text })
          }
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Book Cover */}
        {book.cover && (
          <Image source={{ uri: book.cover }} style={styles.bookImage} resizeMode="cover" />
        )}

        {/* Book Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.details}>Author: {book.author}</Text>
          <Text style={styles.details}>Publisher: {book.publisher}</Text>
          <Text style={styles.details}>ISBN: {book.ISBN}</Text>

          <View style={styles.bottomRow}>
            <Text style={styles.stockText}>Remaining: {book.stock} left</Text>
            <Text style={styles.priceText}>{book.price} USD</Text>
          </View>

          <TouchableOpacity
            style={[styles.cartButton, !canAdd && styles.cartButtonDisabled]}
            onPress={handleAdd}
            disabled={!canAdd}
          >
            <Text style={styles.cartButtonText}>
              {book.stock === 0
                ? 'Sold Out'
                : canAdd
                ? 'Add to Cart'
                : 'Max in Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: -7 + insets.bottom }]}>
        {['Home', 'BookList', 'User'].map(routeName => {
          const isActive = routeName === 'BookList';
          return (
            <TouchableOpacity key={routeName} onPress={() => navigation.navigate(routeName)}>
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
  scrollContent: {
    paddingBottom: 120, // prevent cut-off from bottom nav
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: { padding: 8, marginRight: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: '#E9D8C8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  bookImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#EADDCB',
  },
  infoSection: { backgroundColor: '#F9F5F2', padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'BodoniModa-Regular',
    color: '#6B4226',
    marginBottom: 16,
  },
  details: { fontSize: 14, color: '#222', marginBottom: 4 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  stockText: { fontSize: 13, color: '#444' },
  priceText: { fontSize: 15, color: '#333', fontWeight: '600' },
  cartButton: {
    backgroundColor: '#949B7A',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  cartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  cartButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
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
  iconWrapper: { padding: 12 },
});
