import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import DialogCloseButton from '@/components/ui/DialogCloseButton';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';
import { useAuth } from '@/hooks/useAuth';
import { findUidByHandle } from '@/lib/users/handles';
import { getAvatarIdentity, ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SearchState =
  | { kind: 'idle' }
  | { kind: 'searching' }
  | { kind: 'notFound' }
  | { kind: 'self' }
  | { kind: 'match'; uid: string; displayName: string; animalKey: AnimalKey };

export default function AddFriendScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const styles = useThemedStyles(makeStyles);
  const [input, setInput] = useState('');
  const [state, setState] = useState<SearchState>({ kind: 'idle' });

  const handleSearch = async () => {
    setState({ kind: 'searching' });
    try {
      const matchUid = await findUidByHandle(input);
      if (!matchUid) {
        setState({ kind: 'notFound' });
        return;
      }
      if (matchUid === user?.uid) {
        setState({ kind: 'self' });
        return;
      }
      const profile = await getAvatarIdentity(matchUid);
      if (!profile) {
        setState({ kind: 'notFound' });
        return;
      }
      setState({
        kind: 'match',
        uid: matchUid,
        displayName: profile.displayName,
        animalKey: profile.animalKey,
      });
    } catch {
      setState({ kind: 'notFound' });
    }
  };

  const handleViewProfile = () => {
    if (state.kind !== 'match') return;
    navigation.navigate('UserProfile', { uid: state.uid });
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.heading}>{t('addFriend.heading')}</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder={t('addFriend.placeholder')}
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={[styles.searchButton, state.kind === 'searching' && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={state.kind === 'searching'}
            accessibilityRole="button"
          >
            <Text style={styles.searchButtonText}>{t('addFriend.search')}</Text>
          </TouchableOpacity>
        </View>

        {state.kind === 'searching' && <ActivityIndicator style={styles.loading} />}

        {state.kind === 'notFound' && (
          <Text style={styles.message}>{t('addFriend.notFound')}</Text>
        )}

        {state.kind === 'self' && (
          <Text style={styles.message}>{t('addFriend.selfMatch')}</Text>
        )}

        {state.kind === 'match' && (
          <View style={styles.matchCard} testID="match-card">
            <Image source={ANIMAL_ASSETS[state.animalKey]} style={styles.avatar} />
            <Text style={styles.matchLabel}>{state.displayName}</Text>
            <TouchableOpacity
              style={styles.viewProfileButton}
              onPress={handleViewProfile}
              accessibilityRole="button"
            >
              <Text style={styles.viewProfileText}>{t('addFriend.viewProfile')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <DialogCloseButton
          testID="add-friend-close-button"
          label={t('addFriend.close')}
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        />
      </View>
    </ScreenContainer>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    heading: {
      fontSize: yomoyoTypography.screenTitleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 24,
    },
    searchRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 24,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.text,
    },
    searchButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      justifyContent: 'center',
    },
    searchButtonDisabled: {
      opacity: 0.5,
    },
    searchButtonText: {
      color: colors.surface,
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
    loading: {
      marginTop: 16,
    },
    message: {
      marginTop: 16,
      textAlign: 'center',
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.muted,
    },
    matchCard: {
      marginTop: 16,
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      marginBottom: 12,
    },
    matchLabel: {
      fontSize: yomoyoTypography.titleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
      marginBottom: 16,
    },
    viewProfileButton: {
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 20,
    },
    viewProfileText: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.primary,
    },
    closeButton: {
      marginTop: 'auto',
    },
  });
