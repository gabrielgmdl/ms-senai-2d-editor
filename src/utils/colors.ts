export const colorFromString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue} 65% 60%)`
}

