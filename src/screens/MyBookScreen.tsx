// src/screens/MyBooksScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Book } from '../types/Book';

interface Purchase {
  orderId: string;
  book: Book;
  quantity: number;
  createdAt: Date;
}

export default function MyBooksScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      const user = auth.currentUser;
      if (!user?.email) {
        setPurchases([]);
        return;
      }

      // 1) Query all orders for this user
      const q = query(
        collection(db, 'orders'),
        where('email', '==', user.email)
      );
      const snap = await getDocs(q);

      // 2) Build Purchase[] by fetching each book and reading quantity
      const results: Purchase[] = await Promise.all(
        snap.docs.map(async (orderDoc) => {
          const data = orderDoc.data();
          // handle both "quantity" and possible typo "qunatity"
          const qty: number = data.quantity ?? data.qunatity ?? 1;
          const createdAt = data.createdAt?.toDate?.() ?? new Date();

          // fetch book details
          const bookSnap = await getDoc(doc(db, 'books', data.bookcode));
          if (!bookSnap.exists()) return null;
          const bookData = {
            id: bookSnap.id,
            ...(bookSnap.data() as Omit<Book, 'id'>),
          } as Book;

          return {
            orderId: orderDoc.id,
            book: bookData,
            quantity: qty,
            createdAt,
          };
        })
      ).then(arr => arr.filter((x): x is Purchase => x !== null));

      setPurchases(results);
    };

    fetchPurchases();
  }, []);

  if (purchases === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#936B38" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color="#444" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Purchases</Text>
      </View>

      {purchases.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            You haven't purchased any books yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item) => item.orderId}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.book.cover }} style={styles.cover} />
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.book.title}
                </Text>
                <Text style={styles.author}>{item.book.author}</Text>
                <Text style={styles.meta}>
                  Qty: {item.quantity} • {item.createdAt.toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F5F2',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'BodoniModa_600SemiBold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  cover: {
    width: 80,
    height: 120,
    backgroundColor: '#E9D8C8',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B4226',
  },
  author: {
    fontSize: 13,
    color: '#444',
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});
