import React, { useState, useCallback } from 'react';
import SettingsButton from './SettingsButton';
import SettingsDialog from './SettingsDialog';

export default function SettingsLauncher() {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <SettingsButton onPress={handleOpen} />
      <SettingsDialog visible={open} onClose={handleClose} />
    </>
  );
}
