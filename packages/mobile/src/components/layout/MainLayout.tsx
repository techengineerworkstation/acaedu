import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

interface MainLayoutProps {
  children: React.ReactNode;
  role: 'student' | 'lecturer' | 'admin';
}

export default function MainLayout({ children, role }: MainLayoutProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50]
  },
  content: {
    flex: 1
  }
});
