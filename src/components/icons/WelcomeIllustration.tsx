import React from 'react';
import Svg, { Rect, Circle, Path, Ellipse, G } from 'react-native-svg';

export function WelcomeIllustration({ width = 280, height = 155 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 245 135">

      {/* ── Doorie (left) ── */}
      <G transform="translate(8, 8) scale(0.80)">
        <Ellipse cx="60" cy="132" rx="34" ry="4" fill="#0C1822" opacity={0.10} />
        {/* left arm */}
        <Path d="M36 70Q24 78 22 94" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M36 70Q24 78 22 94" fill="none" stroke="#A98BFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        {/* right arm */}
        <Path d="M84 70Q96 62 100 46" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M84 70Q96 62 100 46" fill="none" stroke="#A98BFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        {/* left leg */}
        <Path d="M48 112V120" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M48 112V120" fill="none" stroke="#A98BFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        {/* right leg */}
        <Path d="M72 112V120" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M72 112V120" fill="none" stroke="#A98BFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        {/* feet */}
        <Ellipse cx="47" cy="123" rx="9" ry="5" fill="#A98BFF" stroke="#0C1822" strokeWidth="2" />
        <Ellipse cx="73" cy="123" rx="9" ry="5" fill="#A98BFF" stroke="#0C1822" strokeWidth="2" />
        {/* body (door shape) */}
        <Path d="M36 114V44a24 24 0 0 1 48 0V114Z" fill="#A98BFF" stroke="#0C1822" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M44 114V48a16 16 0 0 1 32 0V114" fill="none" stroke="#0C1822" strokeOpacity="0.2" strokeWidth="2.4" />
        {/* green badge */}
        <Circle cx="78" cy="86" r="4.5" fill="#40CE86" stroke="#0C1822" strokeWidth="2" />
        {/* eyes */}
        <Rect x="43" y="44" width="15" height="10" rx="2.5" fill="#0C1822" />
        <Rect x="62" y="44" width="15" height="10" rx="2.5" fill="#0C1822" />
        <Path d="M58 48H62" stroke="#0C1822" strokeWidth="2" />
        {/* smile */}
        <Path d="M52 64q8 8 16 0" fill="none" stroke="#0C1822" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* cheeks */}
        <Circle cx="46" cy="66" r="3.6" fill="#40CE86" opacity={0.8} />
        <Circle cx="74" cy="66" r="3.6" fill="#40CE86" opacity={0.8} />
      </G>

      {/* ── Flex (right) ── */}
      <G transform="translate(140, 8) scale(0.80)">
        <Ellipse cx="60" cy="132" rx="34" ry="4" fill="#0C1822" opacity={0.10} />
        {/* receipt on top */}
        <Rect x="44" y="26" width="32" height="22" rx="3" fill="#FFFFFF" stroke="#0C1822" strokeWidth="2" />
        <Path d="M52 34h16M52 40h16" stroke="#0C1822" strokeWidth="2" />
        {/* left arm */}
        <Path d="M30 66Q16 72 14 88" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M30 66Q16 72 14 88" fill="none" stroke="#40CE86" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        {/* right arm */}
        <Path d="M90 66Q104 60 106 44" fill="none" stroke="#0C1822" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M90 66Q104 60 106 44" fill="none" stroke="#40CE86" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        {/* left leg */}
        <Path d="M48 104V118" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M48 104V118" fill="none" stroke="#40CE86" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        {/* right leg */}
        <Path d="M72 104V118" fill="none" stroke="#0C1822" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M72 104V118" fill="none" stroke="#40CE86" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        {/* feet */}
        <Ellipse cx="47" cy="121" rx="9" ry="5" fill="#40CE86" stroke="#0C1822" strokeWidth="2" />
        <Ellipse cx="73" cy="121" rx="9" ry="5" fill="#40CE86" stroke="#0C1822" strokeWidth="2" />
        {/* body */}
        <Rect x="30" y="42" width="60" height="62" rx="14" fill="#40CE86" stroke="#0C1822" strokeWidth="2.2" />
        {/* purple top / hat */}
        <Path d="M30 58a16 16 0 0 1 16-16H74a16 16 0 0 1 16 16Z" fill="#A98BFF" stroke="#0C1822" strokeWidth="2.2" />
        {/* ear badge */}
        <Rect x="80" y="70" width="18" height="13" rx="6.5" fill="#A98BFF" stroke="#0C1822" strokeWidth="2.2" />
        <Circle cx="89" cy="76.5" r="2" fill="#0C1822" />
        {/* eyes */}
        <Rect x="37" y="66" width="15" height="10" rx="2.5" fill="#0C1822" />
        <Rect x="58" y="66" width="15" height="10" rx="2.5" fill="#0C1822" />
        <Path d="M52 70H58" stroke="#0C1822" strokeWidth="2" />
        {/* smile */}
        <Path d="M46 88q9 8 18 0" fill="none" stroke="#0C1822" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* cheeks */}
        <Circle cx="38" cy="90" r="3.6" fill="#A98BFF" opacity={0.8} />
        <Circle cx="70" cy="90" r="3.6" fill="#A98BFF" opacity={0.8} />
      </G>

      {/* ── Decorative elements in the gap ── */}
      <G transform="translate(128, 32)">
        <Path d="M0 -5 L0 5" stroke="#0C1822" strokeWidth="2" strokeLinecap="round" />
        <Path d="M-5 0 L5 0" stroke="#0C1822" strokeWidth="2" strokeLinecap="round" />
        <Path d="M-3.5 -3.5 L3.5 3.5" stroke="#0C1822" strokeWidth="1.5" strokeLinecap="round" />
        <Path d="M3.5 -3.5 L-3.5 3.5" stroke="#0C1822" strokeWidth="1.5" strokeLinecap="round" />
      </G>
      <Circle cx="122" cy="72" r="3" fill="#A98BFF" />
      <Circle cx="133" cy="88" r="2" fill="#40CE86" />
      <Circle cx="119" cy="100" r="1.5" fill="#89DCE4" />
      <G transform="translate(238, 16)">
        <Path d="M0 -3 L0 3" stroke="#A98BFF" strokeWidth="1.5" strokeLinecap="round" />
        <Path d="M-3 0 L3 0" stroke="#A98BFF" strokeWidth="1.5" strokeLinecap="round" />
      </G>
    </Svg>
  );
}
