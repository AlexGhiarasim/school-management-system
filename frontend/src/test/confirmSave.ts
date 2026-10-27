import { fireEvent, screen } from '@testing-library/react';

// Confirms the dialog that follows a valid submit. Does nothing when the form
// was rejected by validation and no dialog was opened.
export function confirmSave() {
  const button = screen.queryByRole('button', { name: /^Yes, (add|save)$/ });
  if (button) fireEvent.click(button);
}
