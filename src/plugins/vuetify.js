import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const hpsTheme = {
  dark: true,
  colors: {
    background:  '#0A0A0A',
    surface:     '#111111',
    'surface-2': '#1A1A1A',
    'surface-3': '#222222',
    primary:     '#F5C518',
    'primary-darken-1': '#D4A800',
    secondary:   '#FFFFFF',
    accent:      '#F5C518',
    error:       '#FF5252',
    warning:     '#FFC107',
    success:     '#4CAF50',
    info:        '#2196F3',
    'on-primary': '#0A0A0A',
    'on-surface': '#FFFFFF',
    'on-background': '#FFFFFF',
    border:      '#2A2A2A',
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'hpsTheme',
    themes: { hpsTheme }
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      fontWeight: '600',
    },
    VCard: {
      rounded: 'lg',
      elevation: 0,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VChip: {
      rounded: 'md',
    }
  }
})