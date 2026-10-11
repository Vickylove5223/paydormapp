import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParams } from '@/navigation/types';
import { Colors, Typography } from '@/theme';
import { Button } from '@/components/common/Button';
import { PayDormLogo } from '@/components/icons/PayDormLogo';
import { WelcomeIllustration } from '@/components/icons/WelcomeIllustration';

type Props = NativeStackScreenProps<AuthStackParams, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.green} />

      {/* ── Header: logo mark left-aligned ── */}
      <View style={styles.header}>
        <PayDormLogo variant="mark" size={40} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {/* Illustration */}
          <View style={styles.illustrationWrap}>
            <WelcomeIllustration width={280} height={155} />
          </View>

          <Text style={styles.tagline}>
            Share costs,{'\n'}not stress.
          </Text>
          <Text style={styles.subtitle}>
            We help groups split bills, not friendships.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Login"
            onPress={() => navigation.navigate('SignIn')}
            variant="primary"
            style={styles.btn}
          />
          <Button
            label="Create account"
            onPress={() => navigation.navigate('SignUp')}
            variant="outline"
            style={styles.btn}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('JoinCompound', {})}
            style={styles.textLink}
            activeOpacity={0.6}
          >
            <Text style={styles.textLinkText}>Join your compound</Text>
            <Text style={styles.textLinkArrow}> →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.green,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  hero: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  illustrationWrap: {
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tagline: {
    ...Typography.h1,
    color: Colors.ink,
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.ink,
    opacity: 0.75,
    maxWidth: 280,
    marginBottom: 12,
  },
  actions: {
    gap: 12,
    marginTop: 'auto',
    paddingTop: 16,
  },
  btn: {
    width: '100%',
  },
  textLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  textLinkText: {
    ...Typography.body,
    fontFamily: 'DMSans_700Bold',
    color: Colors.ink,
    textDecorationLine: 'underline',
    opacity: 0.75,
  },
  textLinkArrow: {
    ...Typography.body,
    fontFamily: 'DMSans_700Bold',
    color: Colors.ink,
    opacity: 0.75,
    fontSize: 18,
  },
});
