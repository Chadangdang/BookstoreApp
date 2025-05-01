// src/screens/CartScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';

import { getAuth } from 'firebase/auth';
import {
  collection,
  getDocs,
  doc as firestoreDoc,
  getDoc,
  updateDoc,
  increment,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';

const BOTTOM_NAV_HEIGHT = 60;

export default function CartScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const auth = getAuth();
  const userEmail = auth.currentUser?.email ?? 'unknown@domain.com';

  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchStocks = async () => {
      const newMap: Record<string, number> = {};
      await Promise.all(
        cart.map(async (item) => {
          const snap = await getDoc(firestoreDoc(db, 'books', item.id));
          if (snap.exists()) {
            newMap[item.id] = snap.data().stock;
          }
        })
      );
      setStockMap(newMap);
    };

    fetchStocks();
  }, [cart]);

  const [search, setSearch] = useState('');
  const handleSearch = () => {
    if (search.trim()) {
      navigation.navigate('BookList', { query: search.trim() });
    }
  };

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalPrice = cart
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      const ordersCol = collection(db, 'orders');
      const existing = await getDocs(ordersCol);
      let nextNum = existing.size + 1;

      for (const item of cart) {
        if (!selectedItems.includes(item.id)) continue;

        const bookRef = firestoreDoc(db, 'books', item.id);
        await updateDoc(bookRef, { stock: increment(-item.quantity) });

        const orderId = 'order' + String(nextNum).padStart(3, '0');
        await setDoc(firestoreDoc(db, 'orders', orderId), {
          bookcode: item.id,
          email: userEmail,
          quantity: item.quantity,
          createdAt: serverTimestamp(),
        });
        nextNum++;
      }

      cart
        .filter((i) => !selectedItems.includes(i.id))
        .forEach((i) => updateQuantity(i.id, i.quantity));
      selectedItems.forEach((id) => removeFromCart(id));
      setSelectedItems([]);

      navigation.navigate('MyBooks');
    } catch (err: any) {
      Alert.alert('Checkout failed', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar w/ Back + Search */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#444" />
        </TouchableOpacity>
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
          onPress={() => navigation.navigate('Cart')}
          style={{ marginLeft: 10 }}
        />
        <Ionicons
          name="notifications-outline"
          size={22}
          color="#444"
          style={{ marginLeft: 10 }}
        />
      </View>

      {/* Cart Items */}
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: insets.bottom + BOTTOM_NAV_HEIGHT + 80,
        }}
        renderItem={({ item }) => {
          const stock = stockMap[item.id] ?? 0;
          const canPlus = item.quantity < stock;

          return (
            <TouchableOpacity
              style={styles.cartCard}
              onPress={() => navigation.navigate('Book', { book: item })}
              activeOpacity={0.9}
            >
              <View style={styles.cardRow}>
                <Checkbox
                  value={selectedItems.includes(item.id)}
                  onValueChange={() => toggleSelection(item.id)}
                  style={styles.checkbox}
                  color={selectedItems.includes(item.id) ? '#6B4226' : undefined}
                />

                <Image source={{ uri: item.cover }} style={styles.bookImage} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.bookTitle}>{item.title}</Text>
                  <Text style={styles.bookAuthor}>Author: {item.author}</Text>
                  <Text style={styles.bookStock}>Stock: {stock} left</Text>
                  <Text style={styles.bookPrice}>${item.price.toFixed(2)}</Text>
                </View>

                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      const newQty = item.quantity - 1;
                      if (newQty <= 0) removeFromCart(item.id);
                      else updateQuantity(item.id, newQty);
                    }}
                  >
                    <Text style={styles.qtyText}>–</Text>
                  </TouchableOpacity>

                  <Text style={styles.qtyCount}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={[styles.qtyBtn, styles.plusBtn, !canPlus && styles.disabledBtn]}
                    onPress={() => {
                      if (canPlus) updateQuantity(item.id, item.quantity + 1);
                      else
                        Alert.alert(
                          'Out of stock',
                          `You can’t add more than ${stock}.`
                        );
                    }}
                    disabled={!canPlus}
                  >
                    <Text
                      style={[
                        styles.qtyText,
                        styles.plusText,
                        !canPlus && styles.disabledText,
                      ]}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Feather name="trash" size={20} color="#936B38" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Floating Footer */}
      <View
        style={[
          styles.footerContainer,
          { bottom: insets.bottom + BOTTOM_NAV_HEIGHT },
        ]}
      >
        <Text style={styles.total}>Total: ${totalPrice.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={handleCheckout}
          disabled={!selectedItems.length}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        {['Home', 'BookList', 'User'].map((route) => {
          const isActive = route === 'BookList';
          return (
            <TouchableOpacity
              key={route}
              onPress={() => navigation.navigate(route)}
            >
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
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#E9D8C8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  cartCard: {
    backgroundColor: '#E9D8C8',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 14,
    borderRadius: 20,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },

  checkbox: {
    marginRight: 10,
    width: 18,
    height: 18,
    borderRadius: 4,
    borderColor: '#936B38',
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },

  bookImage: { width: 60, height: 90, borderRadius: 10 },
  bookTitle: { fontSize: 16, fontWeight: '600', color: '#6B4226' },
  bookAuthor: { fontSize: 12, color: '#333', marginTop: 4 },
  bookStock: { fontSize: 12, color: '#444', marginTop: 4 },
  bookPrice: { fontSize: 14, color: '#6B4226', fontWeight: '500', marginTop: 4 },

  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  qtyBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qtyText: { fontSize: 16, fontWeight: 'bold', color: '#444' },
  qtyCount: { marginHorizontal: 6, fontSize: 16, fontWeight: '500', color: '#444' },

  plusBtn: { backgroundColor: '#936B38' },
  plusText: { color: '#fff' },
  disabledBtn: { backgroundColor: '#ccc' },
  disabledText: { color: '#888' },

  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  total: { fontSize: 16, fontWeight: '500', color: '#6B4226' },
  checkoutBtn: {
    backgroundColor: '#949B7A',
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 10,
  },
  checkoutText: { color: '#fff', fontSize: 16 },

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
