// import original module declarations
import 'styled-components'

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
        background: string,
        backgroundSecondary: string,
        primary: string,
        secondary: string,
        border: string,
        borderSecondary: string
    }
  }
}