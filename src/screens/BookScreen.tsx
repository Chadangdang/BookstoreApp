// src/screens/BookScreen.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Book } from '../types/Book';

type RootStackParamList = {
  Book: { book: Book };
};

export default function BookScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Book'>>();
  const { book } = route.params;

  // get screen dimensions
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // detect desktop (web + wide)
  const isDesktop = Platform.OS === 'web' && screenWidth > 768;

  // dynamic container for cover image
  const coverContainerStyle = {
    width: screenWidth,
    height: isDesktop ? screenHeight * 0.5 : 300,
    backgroundColor: isDesktop ? '#FFFFFF' : 'transparent',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Cover Image */}
        <View style={coverContainerStyle}>
          <Image
            source={{ uri: book.cover }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Book Details */}
        <View style={styles.details}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.meta}>
            {book.author} • {book.publisher}
          </Text>
          <Text style={styles.meta}>ISBN: {book.ISBN}</Text>
          <Text style={styles.price}>${book.price.toFixed(2)}</Text>
          <Text style={styles.stock}>
            {book.stock > 0 ? `In stock: ${book.stock}` : 'Sold out'}
          </Text>
          {book.description && (
            <Text style={styles.description}>{book.description}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9F5F2',
  },
  scroll: {
    backgroundColor: '#F9F5F2',
    paddingBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#936B38',
    marginVertical: 8,
  },
  stock: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
});