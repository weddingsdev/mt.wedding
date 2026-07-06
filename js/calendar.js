export function generateSeptemberCalendar(year) {
  const daysInSeptember = new Date(year, 9, 0).getDate(); // 30
  const firstWeekdaySun0 = new Date(year, 8, 1).getDay(); // 0=Sun..6=Sat
  const leadingBlanks = (firstWeekdaySun0 + 6) % 7; // 0=Mon..6=Sun

  const grid = [];
  for (let i = 0; i < leadingBlanks; i++) grid.push(null);
  for (let day = 1; day <= daysInSeptember; day++) {
    grid.push({ day, isWeddingDay: day === 13 });
  }
  return grid;
}
