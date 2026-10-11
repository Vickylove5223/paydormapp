import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Layout, Radius } from '@/theme';
import { ScreenHeader } from '@/components/common/ScreenHeader';

const FAQS = [
  { q: 'How do I join a compound?', a: 'Ask your landlord or estate manager for the estate code, then go to Me → Properties → Join with code.' },
  { q: 'Can I split a bill differently for each person?', a: 'Yes. The master tenant can set equal, percentage, or fixed splits per bill from the Co-partner screen.' },
  { q: 'What happens if direct debit fails?', a: 'The bill stays due and you get a notification. Fund your wallet and pay manually.' },
  { q: 'Can I withdraw my wallet balance?', a: 'Yes. Go to Wallet, tap Withdraw and choose a verified bank account.' },
];

export function HelpSupportScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Help & support" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Frequently asked questions</Text>
        {FAQS.map((faq, i) => (
          <View key={i} style={styles.faqCard}>
            <Text style={styles.question}>{faq.q}</Text>
            <Text style={styles.answer}>{faq.a}</Text>
          </View>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSubtitle}>Send us a message on WhatsApp.</Text>
          <TouchableOpacity style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>Chat on WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.screen },
  content: { padding: Layout.screenPadding, paddingBottom: Layout.contentBottomPadding, gap: 12 },
  sectionTitle: { ...Typography.label, color: Colors.ink, marginBottom: 4 },
  faqCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.cardSm,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
    gap: 6,
  },
  question: { ...Typography.label, color: Colors.ink },
  answer: { ...Typography.body, color: Colors.textSecondary, fontSize: 14 },
  contactCard: {
    backgroundColor: Colors.green,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    padding: 20,
    gap: 8,
    marginTop: 8,
  },
  contactTitle: { ...Typography.title, color: Colors.ink },
  contactSubtitle: { ...Typography.body, color: Colors.ink, opacity: 0.8 },
  contactBtn: {
    backgroundColor: Colors.ink,
    borderRadius: 99,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  contactBtnText: { ...Typography.button, color: Colors.green },
});
