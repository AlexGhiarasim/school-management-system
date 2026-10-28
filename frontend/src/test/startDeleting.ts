import { fireEvent, screen, within } from '@testing-library/react';

// Opens the edit window of the first row and starts the deletion from it.
export async function startDeleting() {
  fireEvent.click((await screen.findAllByRole('button', { name: 'Edit' }))[0]);
  const editWindow = await screen.findByRole('dialog');

  fireEvent.click(within(editWindow).getByRole('button', { name: /^Delete/ }));
}
