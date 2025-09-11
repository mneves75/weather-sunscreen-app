# How to upgrade to Expo SDK 54

# How to upgrade to Expo SDK 54

[Product](/blog/category/product)•[React Native](/blog/category/react-native)•[Development](/blog/category/development)•September 10, 2025•11 minutes read

![Keith Kurak](https://cdn.sanity.io/images/9r24npb8/production/4acdf911df64151706d36c3c767f5a02f3182ead-870x870.png?auto=format&fit=max&q=75&w=40)

Keith Kurak

Engineering

Upgrade to Expo SDK 54 with React Native 0.81, Reanimated v4, Android API 36, and iOS 26 support. Learn key changes, tips, and migration advice.

![How to upgrade to Expo SDK 54](https://cdn.sanity.io/images/9r24npb8/production/10ad32a82fc3a764e8cdd2c681bef8fb94707e9b-2400x1350.png?auto=format&fit=max&q=75&w=1200)

‘Tis the season for a new Expo SDK! Expo SDK 54 is here, bringing with it React Native 0.81, [Reanimated v4](https://blog.swmansion.com/reanimated-4-stable-release-the-future-of-react-native-animations-ba68210c3713), and more! Android API level 36 is supported, as are iOS 26 features. Just check out the [changelog](https://expo.dev/changelog/sdk-54)...there’s a lot going on!

Each SDK undergoes extensive testing and a beta test period, where the Expo team and the community collaborate to find issues that might stand in the way of a fast and smooth upgrade for others. A lot of Expo engineers maintain our own apps and try to upgrade those as soon as the beta is out.

Nonetheless, there’s practically infinite possibilities out there. Every app is unique, and has it’s own complexities that will need to be accounted for when upgrading. Therefore, we wanted to highlight some specific key changes that may affect your upgrade to SDK 54, as well as some evergreen advice when it comes to upgrading to the latest Expo SDK.  
  
If you prefer to consume your info via video check out this demo of an upgrade from SDK 53 to SDK 54:

<iframe frameborder="0" allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" title="How to upgrade from Expo SDK 53 to SDK 54 in 5 minutes" width="100%" height="100%" src="https://www.youtube.com/embed/QuN63BRRhAM?controls=1&amp;enablejsapi=1&amp;origin=https%3A%2F%2Fexpo.dev&amp;widgetid=1&amp;forigin=https%3A%2F%2Fexpo.dev%2Fblog%2Fexpo-sdk-upgrade-guide&amp;aoriginsup=1&amp;gporigin=https%3A%2F%2Fwww.google.com%2F&amp;vf=1" id="widget2" data-gtm-yt-inspected-8="true"></iframe>

Expo SDK Upgrade Demo

[

## Key things to know as you upgrade to SDK 54

](#key-things-to-know-as-you-upgrade-to-sdk-54)[

### iOS builds on EAS now use precompiled React Native

](#ios-builds-on-eas-now-use-precompiled-react-native)

React Native 0.81 now ships as an XCFramework, rather than source code that needs to be compiled into your app on every build. This could make the Fastlane step of your builds significantly faster. A small number of libraries may be referencing React Native core native components in a way that doesn’t work with this yet. If you do run into issues with this, we definitely appreciate issue submissions, and in the meantime you can switch back to compiling by source via `expo-build-properties` ’s `ios.buildReactNativeFromSource` property. We wrote a blog post about [precompiled React Native](https://expo.dev/blog/precompiled-react-native-for-ios) that you can reference for more info.

[

### Significant changes in Reanimated v4 / some projects should not upgrade yet

](#significant-changes-in-reanimated-v4--some-projects-should-not-upgrade-yet)

Be sure to check out the [migration guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/) for `react-native-reanimated` v4 . You can skip the **babel.config.js** steps, as `babel-preset-expo` handles them for you. If you use Nativewind, you will want to stay on Reanimated v3 for now.

[

### SDK 54 is the last SDK that will support React Native Old Architecture

](#sdk-54-is-the-last-sdk-that-will-support-react-native-old-architecture)

Check out our advice for upgrading to New Architecture below.

[

### Get ready for new Android UI features

](#get-ready-for-new-android-ui-features)

Android edge-to-edge support has been around since SDK 52, but it is now enabled by default in all Android apps. Functionality that previously required `react-native-edge-to-edge` is now shipped inside React Native. If you continue using the `react-native-edge-to-edge` config plugin, you’ll need to install the package directly in your project. Or, you can use built-in properties on `androidNavigationBar` in your app config to achieve the same effect. If you haven’t yet tested edge-to-edge support, now is the time to make sure everything looks good on Android.

Android predictive back support can also be enabled via the [`android.predictiveBackGestureEnabled`](https://docs.expo.dev/versions/v54.0.0/config/app/#predictivebackgestureenabled) app config property. It is [not yet enabled by default](https://developer.android.com/about/versions/16/behavior-changes-16#predictive-back) due to compatibility issues with `react-native-screens`.

[

### expo-file-system → expo-file-system/legacy

](#expo-file-system--expo-file-systemlegacy)

The rewrite of `expo-file-system` now the default. If you still would like to use the old version, though, [you can import `expo-file-system/legacy`](https://docs.expo.dev/versions/latest/sdk/filesystem-next/).

[

### Unhandled promise rejections are now logged as errors

](#unhandled-promise-rejections-are-now-logged-as-errors)

Don’t adjust your terminal! You might see new runtime errors if you have unhandled exceptions thrown from async code. These were always there; they just weren’t surfaced before. This behavior change aligns better with how web browsers work.

[

## Tips for upgrading your Expo SDK

](#tips-for-upgrading-your-expo-sdk)

We have written up [detailed advice for troubleshooting issues found during an upgrade](https://github.com/expo/fyi/blob/main/troubleshooting-sdk-upgrades.md). This includes considerations for both before and during your upgrade, with a list of suggestions, starting with the quickest/easiest to try. We recommend reading the entire guide, but we wanted to highlight a few key items in brief here:

[

### Check the changelog!

](#check-the-changelog)

Most SDK releases will have a list of known breaking changes, or notable changes where you may need to tweak configuration for a scenario specific to your app. The best time to read the [changelog](https://expo.dev/changelog/sdk-54) and breaking changes is before you upgrade, so you can make those tweaks before you test, but the next best time to read it is after you upgrade, particularly if you see a compilation error or crash.

[

### Using development builds over Expo Go

](#using-development-builds-over-expo-go)

Upgrades are best taken when you don’t feel rushed to complete them. As Expo Go automatically upgraded to the latest version after the SDK release on your phone, you may have noticed that your app no longer worked in Expo Go, and felt that you needed to upgrade right away in order to keep working on features.

[Development builds](https://docs.expo.dev/develop/development-builds/introduction/) help reduce the temperature, giving you time and space to take on an upgrade while not interrupting ongoing feature work. A development build works a lot like Expo Go, allowing you to scan a QR code to work on your code locally without rebuilding. But it’s your own app, so it will not get upgraded when a new version of Expo Go is released.

If you still feel that you need to use Expo Go, know that you don’t necessarily have to use the latest version on the Play and App Stores. You can go to [https://expo.dev/go](https://expo.dev/go) and download previous versions for use on Android devices and iOS simulators. Unfortunately, due to App Store restrictions, this does not work on iOS devices.

Still, another [reason to migrate to a development build](https://expo.dev/blog/expo-go-vs-development-builds) is because Expo Go is quite limited in how it can replicate your production app, leading to issues where it works in Expo Go but not when you build your production app. Expo Go can run your JavaScript, but it cannot apply most of your app.json / app.config.js configuration, because that would require modifying native code. In short, Expo Go can’t contain nearly everything that’s unique and special about your app. Development builds can. There's plenty of headroom in the [Free plan](https://expo.dev/pricing) to make some development builds, or you build locally `npx expo run:android` or `npx expo run:ios`.

[

### New Architecture advice

](#new-architecture-advice)

If you’re still on the Old Architecture, upgrade to the latest SDK, and then upgrade to New Architecture.

Expo SDK 54 will be the last SDK to support the Old Architecture, as the next version of React Native will only support the New Architecture. Therefore, if you haven’t upgraded to the New Architecture yet, now is the time! A number of the latest versions of major packages, such as `react-native-reanimated` v4 and `@shopify/flash-list` v4, only support New Architecture. 75% of SDK 53 projects built on EAS are using New Architecture, so it’s working well for most apps, and [major progress has been made on the few remaining blockers for apps that have not yet migrated](http://expo.fyi/new-arch-sdk-54-status).

However, there’s no need to rush. **Avoid upgrading both your Expo SDK and adopting New Architecture at the same time.** This makes it more difficult to isolate any issues. Compared to upgrading your Expo SDK, adopting New Architecture is the bigger change, so any issues are likely related to that- but it will be hard to tell if you upgrade to both at the same time.

With a development build, you can upgrade to SDK 54 / React Native 0.81 separately. Make a development build that just upgrades to SDK 54 first (e.g., by running `npx expo install expo@latest --fix` and follow the r[elease notes to address any breaking changes](https://expo.dev/changelog/2024/11-12-sdk-52#notable-breaking-changes)). Test against that and make sure everything is working with the SDK 54 upgrade. Then, [turn on New Architecture](https://docs.expo.dev/guides/new-architecture/#enable-the-new-architecture-in-an-existing-project) and make another development build and test against that. Also note that you will want to not upgrade Reanimated from v3 to v4 until after turning on New Architecture.

You could do that immediately, or even release your app on SDK 54 / old architecture and then release later on the New Architecture. There’s no hurry to do both at once, and, if you do each of them separately, you’ll be able to pinpoint more closely if the issue is SDK 54 / React Native 0.81 or New Architecture-related. If it’s New Architecture-related, you can use our [New Architecture troubleshooting guide to help](https://docs.expo.dev/guides/new-architecture/#troubleshooting).

[

### Check the troubleshooting guides

](#check-the-troubleshooting-guides)

We have a landing page of our [most popular troubleshooting guides](https://docs.expo.dev/troubleshooting/overview/) that you can browse depending on your issue. If your issue is an error when building, you’ll want to take different steps compared to a crash or performance issue. Even if you don’t fully get to the root cause, [using a tool like ADB Logcat or macOS console](https://docs.expo.dev/debugging/runtime-issues/#production-app-is-crashing) to find a native error that the operating system reports from a crash can be very helpful as you engage in further troubleshooting or ask others for help.

[

### Reach out if you need a hand!

](#reach-out-if-you-need-a-hand)

We appreciate your bug reports and feedback! The best way to surface an issue is and will always be a Github issue with a **minimal reproduction**, where you send us a link to a Github repo based on the default project template created with `npx create-expo-app` , plus just enough code to reproduce the issue.

A minimal reproduction ensures that our team can see exactly what you’re seeing and gives us a way to test that our fix will work for you. Even if that seems like a lot to do, often spending 15 or 30 minutes trying to make a minimal reproduction is more effective than hours spent debugging on your actual app, where there are a lot of moving pieces and it’s more difficult to isolate issues.

We also understand the value in discussing an issue in the moment, even before you’re ready to try to reproduce it. Other developers may be experiencing the same thing and already have an answer. Discussions about issues on [Discord](https://discord.com/invite/expo), [Reddit](https://www.reddit.com/r/expo/), [Bluesky](https://bsky.app/profile/expo.dev) and elsewhere can result in a sort of [collaborative virtual rubberducking](https://en.wikipedia.org/wiki/Rubber_duck_debugging) where we find the answer together while talking through it.

We encourage you to post screenshots or videos of the issues you’re facing, or at least descriptions of what exactly you’re seeing, what platforms are affected, etc. so we can see what is broken and help the community think through how to isolate that issue and find a solution. If you have detailed feedback about the upgrade process that doesn’t fit neatly into a minimal reproduction of a single issue, we’d love to hear about it, as well. Besides social forums, we always have someone checking on the messages received from our [support page](https://expo.dev/support).

Happy upgrading and we hope you love SDK 54!

[

## P.S. SDK 54 Livestream soon!

](#ps-sdk-54-livestream-soon)

We'll be livestreaming about SDK 54 next week. Join us!

<iframe frameborder="0" allowfullscreen="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" title="What's new in Expo SDK 54? Precompiled React Native for iOS, Liquid Glass, Router v6..." width="100%" height="100%" src="https://www.youtube.com/embed/KBlbkjqxNbM?controls=1&amp;enablejsapi=1&amp;origin=https%3A%2F%2Fexpo.dev&amp;widgetid=3&amp;forigin=https%3A%2F%2Fexpo.dev%2Fblog%2Fexpo-sdk-upgrade-guide&amp;aoriginsup=1&amp;gporigin=https%3A%2F%2Fwww.google.com%2F&amp;vf=1" id="widget4" data-gtm-yt-inspected-8="true"></iframe>

Join the team on a live stream about SDK 54 on September 17 at 10:00am PDT