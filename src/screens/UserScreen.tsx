// src/screens/UserScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const handleSearch = () => {
    navigation.navigate('BookList', { query: search });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        {/* Top Search Bar */}
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

        {/* Profile Info */}
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Profile</Text>

          <Text style={styles.label}>Email</Text>
          <View style={styles.emailBox}>
            <Text style={styles.emailText}>
              {currentUser?.email || '-'}
            </Text>
          </View>

          {/* My Books Button */}
          <TouchableOpacity
            style={styles.myBooksCard}
            onPress={() => navigation.navigate('MyBooks')}
          >
            <Text style={styles.myBooksCardText}>My Purchases</Text>
            <Feather name="chevron-right" size={20} color="#936B38" />
          </TouchableOpacity>

          {/* Log Out */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View
        style={[styles.bottomNav, { paddingBottom: -7 + insets.bottom }]}
      >
        {['Home', 'BookList', 'User'].map((route) => {
          const isActive = route === 'User';
          return (
            <TouchableOpacity
              key={route}
              onPress={() => navigation.navigate(route)}
            >
              <View
                style={isActive ? styles.activeCircle : styles.iconWrapper}
              >
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

  contentWrapper: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: 'BodoniModa-Regular',
    color: '#6B4226',
    textAlign: 'center',
    marginBottom: 36,
  },

  label: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
    marginLeft: 6,
  },
  emailBox: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  emailText: {
    fontSize: 16,
    color: '#936B38',
  },

  myBooksCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  myBooksCardText: {
    fontSize: 16,
    color: '#936B38',
  },

  logoutButton: {
    backgroundColor: '#949B7A',
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 13,
    alignSelf: 'flex-end',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 16,
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
