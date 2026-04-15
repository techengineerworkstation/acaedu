import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useTheme } from '../components/providers/ThemeProvider';
import { COLORS } from '../constants/theme';
import { ROLE_TAB_CONFIG, NAVIGATION } from '../constants';

// Auth screens
import LoginScreen from '../app/(auth)/login';
import RegisterScreen from '../app/(auth)/register';
import RoleSelectionScreen from '../app/(auth)/role-selection';
import ForgotPasswordScreen from '../app/(auth)/forgot-password';

// Dashboard screens - will be created
import StudentDashboardScreen from '../app/(student)/dashboard';
import StudentScheduleScreen from '../app/(student)/schedule';
import StudentCoursesScreen from '../app/(student)/courses';
import StudentNotificationsScreen from '../app/(student)/notifications';
import StudentExamsScreen from '../app/(student)/exams';
import StudentProfileScreen from '../app/(student)/profile';

import LecturerDashboardScreen from '../app/(lecturer)/dashboard';
import LecturerCoursesScreen from '../app/(lecturer)/courses';
import LecturerScheduleScreen from '../app/(lecturer)/schedule';
import LecturerAnnouncementsScreen from '../app/(lecturer)/announcements';
import LecturerGradesScreen from '../app/(lecturer)/grades';
import LecturerProfileScreen from '../app/(lecturer)/profile';

import AdminDashboardScreen from '../app/(admin)/dashboard';
import AdminUsersScreen from '../app/(admin)/users';
import AdminCoursesScreen from '../app/(admin)/courses';
import AdminNotificationsScreen from '../app/(admin)/notifications';
import AdminBillingScreen from '../app/(admin)/billing';
import AdminProfileScreen from '../app/(admin)/profile';

// Icons (using simple text for now, or install @expo/vector-icons)
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text style={{ fontSize: 24, color: focused ? COLORS.primary[600] : COLORS.gray[500] }}>
    {name === 'home' ? '🏠' :
     name === 'calendar' ? '📅' :
     name === 'book' ? '📚' :
     name === 'bell' ? '🔔' :
     name === 'user' ? '👤' :
     name === 'users' ? '👥' :
     name === 'megaphone' ? '📢' :
     name === 'admin' ? '⚙️' : '📱'}
  </Text>
);

type Stack = createNativeStackNavigator<any>;
type Tab = createBottomTabNavigator<any>;

const StackNavigator = createNativeStackNavigator();
const TabNavigator = createBottomTabNavigator();

function getTabNavigator(role: 'student' | 'lecturer' | 'admin') {
  const tabs = ROLE_TAB_CONFIG[role];

  return (
    <TabNavigator.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: COLORS.text.primary,
        },
        headerRight: () => <ThemeToggleButton />,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingTop: 8,
          height: 60
        },
        tabBarActiveTintColor: COLORS.primary[600],
        tabBarInactiveTintColor: COLORS.gray[500]
      }}
    >
      {tabs.map(tab => (
        <TabNavigator.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ focused }) => <TabIcon name={tab.icon} focused={focused} />
          }}
        >
          {() => {
            // Return appropriate screen component
            switch (tab.name) {
              case NAVIGATION.MAIN_TABS.HOME:
                if (role === 'student') return <StudentDashboardScreen />;
                if (role === 'lecturer') return <LecturerDashboardScreen />;
                return <AdminDashboardScreen />;
              case NAVIGATION.MAIN_TABS.SCHEDULE:
                if (role === 'student') return <StudentScheduleScreen />;
                return <LecturerScheduleScreen />;
              case NAVIGATION.MAIN_TABS.COURSES:
                if (role === 'student') return <StudentCoursesScreen />;
                if (role === 'lecturer') return <LecturerCoursesScreen />;
                return <AdminCoursesScreen />;
              case NAVIGATION.MAIN_TABS.NOTIFICATIONS:
                if (role === 'student' || role === 'lecturer') return <StudentNotificationsScreen />;
                return <AdminNotificationsScreen />;
              case NAVIGATION.MAIN_TABS.PROFILE:
                if (role === 'student') return <StudentProfileScreen />;
                if (role === 'lecturer') return <LecturerProfileScreen />;
                return <AdminProfileScreen />;
              default:
                return <StudentDashboardScreen />;
            }
          }}
        </TabNavigator.Screen>
      ))}
    </TabNavigator.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { refresh: refreshNotifications } = useNotificationStore();

  // Refresh notifications on app focus
  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <StackNavigator.Navigator screenOptions={{ headerShown: false }}>
        <StackNavigator.Screen name="Loading" component={() => <LoadingScreen />} />
      </StackNavigator.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <StackNavigator.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth stack
          <>
            <StackNavigator.Screen name="Login" component={LoginScreen} />
            <StackNavigator.Screen name="Register" component={RegisterScreen} />
            <StackNavigator.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <StackNavigator.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          // Main app
          <StackNavigator.Screen name="Main">
            {() => {
              if (!user) return <LoginScreen />;
              return getTabNavigator(user.role as 'student' | 'lecturer' | 'admin');
            }}
          </StackNavigator.Screen>
        )}
      </StackNavigator.Navigator>
    </NavigationContainer>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
      <ActivityIndicator size="large" color={COLORS.primary[600]} />
    </View>
  );
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
      <Text style={styles.themeToggleIcon}>
        {theme === 'light' ? '🌙' : '☀️'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  themeToggle: {
    padding: 8,
    marginRight: 8,
  },
  themeToggleIcon: {
    fontSize: 20,
  },
});
