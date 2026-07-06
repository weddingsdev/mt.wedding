export function validateRsvp({ name, attending }) {
  const errors = {};
  if (!name || !name.trim()) {
    errors.name = "Вкажіть ім'я та прізвище";
  }
  if (attending !== 'yes' && attending !== 'no') {
    errors.attending = 'Оберіть один із варіантів відповіді';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
