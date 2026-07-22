export function formatDate(date) {
  if (!date) return ''

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(date))
}
