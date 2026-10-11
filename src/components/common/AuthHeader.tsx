import React from 'react';
import { ScreenHeader } from './ScreenHeader';
import { GetHelpBtn } from './GetHelpBtn';

interface AuthHeaderProps {
  backgroundColor?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function AuthHeader({ backgroundColor, onBack, showBack = true }: AuthHeaderProps) {
  return (
    <ScreenHeader
      noBorder
      showBack={showBack}
      onBack={onBack}
      rightAction={<GetHelpBtn />}
      backgroundColor={backgroundColor}
    />
  );
}
