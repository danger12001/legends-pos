export function confirmManagerCode(expected: string | undefined): boolean {
  if (!expected) {
    window.alert('Manager code is not configured yet.')
    return false
  }
  const entered = window.prompt('Enter manager code:')
  if (entered === null) return false
  if (entered !== expected) {
    window.alert('Incorrect manager code.')
    return false
  }
  return true
}
