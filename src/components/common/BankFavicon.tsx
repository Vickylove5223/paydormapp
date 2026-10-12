import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface BankFaviconProps {
  bankName: string;
  size?: number;
}

const DOMAIN_MAP: Record<string, string> = {
  gtbank: 'gtbank.com',
  guaranty: 'gtbank.com',
  access: 'accessbankplc.com',
  zenith: 'zenithbank.com',
  'first bank': 'firstbanknigeria.com',
  kuda: 'kuda.com',
  opay: 'opayweb.com',
  palmpay: 'palmpay.com',
  uba: 'uba.com',
  'united bank': 'uba.com',
  providus: 'providusbank.com',
  moniepoint: 'moniepoint.com',
  wema: 'wemabank.com',
  sterling: 'sterlingbank.com',
  stanbic: 'stanbicibtc.com',
  fidelity: 'fidelitybank.ng',
  union: 'unionbankng.com',
  polaris: 'polarisbanklimited.com',
  keystone: 'keystonebankng.com',
  ecobank: 'ecobank.com',
  fcmb: 'fcmb.com',
  heritage: 'heritagebankplc.com',
};

function getDomain(bankName: string): string | null {
  const norm = bankName.toLowerCase();
  for (const [key, domain] of Object.entries(DOMAIN_MAP)) {
    if (norm.includes(key)) return domain;
  }
  return null;
}

function getFaviconUrl(domain: string, size: number): string {
  const px = Math.min(Math.max(size * 2, 32), 128);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${px}`;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function hashColor(name: string): string {
  const colors = ['#002D62', '#D12026', '#40196D', '#13B87D', '#DD4F05', '#2D0845', '#0056A2', '#1A1A2E'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}

export function BankFavicon({ bankName, size = 28 }: BankFaviconProps) {
  const [failed, setFailed] = useState(false);
  const radius = size * 0.24;
  const domain = getDomain(bankName);

  if (domain && !failed) {
    return (
      <Image
        source={{ uri: getFaviconUrl(domain, size) }}
        style={{ width: size, height: size, borderRadius: radius }}
        onError={() => setFailed(true)}
      />
    );
  }

  // Fallback: colored square with initials
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: radius, backgroundColor: hashColor(bankName) }]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{getInitials(bankName)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontFamily: 'DMSans_700Bold', lineHeight: undefined },
});
