import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker'
import { createGlobalStyle, ThemeProvider, DefaultTheme } from 'styled-components';

declare global {
  interface Window {
    require: any;
  }
}

const GlobalStyle = createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    background-color: ${props => props.theme.colors.background};
    font-size: 1.1rem;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }
`

const theme: DefaultTheme = {
  colors: {
    background: '#191a1d',
    backgroundSecondary: '#333437',
    primary: 'white',
    secondary: 'grey',
    border: '#cccccc',
    borderSecondary: 'white',
    error: '#B00020'
  }
}

ReactDOM.render(<React.Fragment>
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <App />
  </ThemeProvider>
</React.Fragment>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
