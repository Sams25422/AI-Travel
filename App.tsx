/**
 * Atlas - Automated Travel Journal
 * Main App Entry Point
 */

import React, {useEffect} from 'react';
import {StatusBar, SafeAreaView, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import {AppProvider, TripProvider} from './src/contexts';
import {TrackerService, CurationService, PermissionService} from './src/services';
import {COLORS} from './src/utils/constants';
import {log} from './src/utils/helpers';

const App: React.FC = () => {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      log('App: Initializing Atlas...');

      // Initialize services
      await Promise.all([
        TrackerService.initialize(),
        CurationService.initialize(),
        PermissionService.checkAllPermissions(),
      ]);

      log('App: Initialization complete');
    } catch (error) {
      console.error('App: Initialization error:', error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProvider>
        <TripProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <AppNavigator />
          </SafeAreaView>
        </TripProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
