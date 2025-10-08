# Develop websites with Expo

[Edit](https://github.com/expo/expo/edit/main/docs/pages/workflow/web.mdx)

Copy

Learn how to develop your app for the web so you can build a universal app.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/workflow/web.mdx)

Copy

* * *

Expo has first-class support for building full-stack websites with React. Expo
websites can be [statically rendered](/router/reference/static-rendering) for
SEO and performance, or client-rendered for a more app-like experience in the
browser.

Universal

Web-only

Render text on any platform with the `<Text>` component from [React Native for
web](https://github.com/necolas/react-native-web).

app/index.js

Copy

    
    
    import { Text } from 'react-native';
    
    export default function Page() {
      return <Text>Home page</Text>;
    }
    

React Native for web (RNW) is a set of component libraries such as `<View>`,
and `<Text>`, that wrap `react-dom` primitives such as `<div>`, `<p>`, and
`<img>`. RNW is optional when developing for web since you can use React DOM
directly, but we often recommended it when building across platforms as it
maximizes code reuse.

> React Native for web is used to power the entire [X](https://x.com/)
> website.

Alternatively, you can write web-only React DOM components such as `<div>`,
`<p>`, and so on, however, these components won't render on native platforms.

app/index.js

Copy

    
    
    export default function Page() {
      return <p>Home page</p>;
    }
    

Building web-only components is fully supported by Expo, however, you may want
to organize your code to better support building for both web and native
platforms simultaneously. Learn more in [platform-specific
modules](/router/advanced/platform-specific-modules).

All of the libraries in the Expo SDK are built to support both browser and
server rendering environments (when applicable). Libraries are also optimized
for the individual platforms they target.

Development features like Fast Refresh, debugging, environment variables, and
[bundling](/guides/customizing-metro) are also fully universal, enabling a
unified developer experience. Expo CLI automatically optimizes code for
individual platforms when you build for production, using techniques like
[platform shaking](/guides/tree-shaking#platform-shaking).

## Getting started

### Install web dependencies

Terminal

Copy

`- ``npx expo install react-dom react-native-web @expo/metro-runtime`

Not using the `expo` package in your app yet?

If you haven't added Expo to your React Native app yet, you can either
[install Expo modules](/bare/installing-expo-modules) (recommended) or just
install the `expo` package and configure the app entry file. This will allow
you to target web, but it will not include support for the Expo SDK.

  1. Install [Expo CLI](/more/expo-cli) in your project:

Terminal

Copy

`- ``npm install expo`

  2. Modify the entry file to use [`registerRootComponent`](/versions/latest/sdk/expo#registerrootcomponentcomponent) instead of `AppRegistry.registerComponent`:

    
    
    + import {registerRootComponent} from 'expo';
    
    import App from './App';
    - import {AppRegistry} from 'react-native';
    - import {name as appName} from './app.json';
    
    - AppRegistry.registerComponent(appName, () => App);
    + registerRootComponent(App);
    

### Start the dev server

You can now start the dev server and develop in the browser with:

Terminal

Copy

`- ``npx expo start --web`

The app can be exported as a production website with:

Terminal

Copy

`- ``npx expo export --platform web`

## Next

[File-based routingBuild routes and navigation with Expo
Router.](/router/introduction) [Static rendering and SEORender your website as
static HTML with Expo Router to improve SEO and
performance.](/router/reference/static-rendering) [Deploy instantly with EAS
HostingEAS Hosting is the best way to deploy your Expo Router and React Native
web apps with support for custom domains, SSL, and more.](/eas/hosting/get-
started) [Customizing the JavaScript bundlerCustomize Metro bundler for your
project.](/guides/customizing-metro)

