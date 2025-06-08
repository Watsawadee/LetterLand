import { createTamagui } from 'tamagui'
import { defaultConfig } from '@tamagui/config/v4'

const config = createTamagui(defaultConfig)

// ✅ register early and on all environments (fixes web crash)
if (typeof globalThis !== 'undefined') {
  ;(globalThis as any).tamaguiConfig = config
}

export type Conf = typeof config
export default config
