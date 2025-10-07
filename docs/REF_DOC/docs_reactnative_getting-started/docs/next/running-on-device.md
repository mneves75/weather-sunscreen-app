This is unreleased documentation for React Native **Next** version.

For up-to-date documentation, see the **[latest version](/docs/running-on-
device)** (0.81).

Version: Next

# Running On Device

It's always a good idea to test your app on an actual device before releasing
it to your users. This document will guide you through the necessary steps to
run your React Native app on a device and to get it ready for production.

tip

If you used `create-expo-app` to set up your project, you can run your app on
a device in Expo Go by scanning the QR code that is displayed when you run
`npm start`. Refer to the Expo guide for [running your project on your
device](https://docs.expo.dev/get-started/expo-go/) for more information.

  * Android
  * iOS

## Running your app on Android devices​

#### Development OS​

  * macOS
  * Windows
  * Linux

### 1\. Enable Debugging over USB​

Most Android devices can only install and run apps downloaded from Google
Play, by default. You will need to enable USB Debugging on your device in
order to install your app during development.

To enable USB debugging on your device, you will first need to enable the
"Developer options" menu by going to **Settings** → **About phone** →
**Software information** and then tapping the `Build number` row at the bottom
seven times. You can then go back to **Settings** → **Developer options** to
enable "USB debugging".

### 2\. Plug in your device via USB​

Let's now set up an Android device to run our React Native projects. Go ahead
and plug in your device via USB to your development machine.

Now check that your device is properly connecting to ADB, the Android Debug
Bridge, by running `adb devices`.

shell

    
    
    $ adb devices  
    List of devices attached  
    emulator-5554 offline   # Google emulator  
    14ed2fcc device         # Physical device  
    

Seeing `device` in the right column means the device is connected. You must
have **only one device connected** at a time.

note

If you see `unauthorized` in the list you will need to run `adb reverse
tcp:8081 tcp:8081` and press allow USB debugging on the device.

### 3\. Run your app​

From the root of your project; type the following in your command prompt to
install and launch your app on the device:

  * npm
  * Yarn

shell

    
    
    npm run android  
    

shell

    
    
    yarn android  
    

note

If you get a "bridge configuration isn't available" error, see [Using adb
reverse](/docs/next/running-on-device#method-1-using-adb-reverse-recommended).

tip

You can also use the `React Native CLI` to generate and run a `release` build
(e.g. from the root of your project: `yarn android --mode release`).

## Connecting to the development server

You can also iterate quickly on a device by connecting to the development
server running on your development machine. There are several ways of
accomplishing this, depending on whether you have access to a USB cable or a
Wi-Fi network.

### Method 1: Using adb reverse (recommended)​

You can use this method if your device is running Android 5.0 (Lollipop) or
newer, it has USB debugging enabled, and it is connected via USB to your
development machine.

Run the following in a command prompt:

shell

    
    
    $ adb -s <device name> reverse tcp:8081 tcp:8081  
    

To find the device name, run the following adb command:

shell

    
    
    $ adb devices  
    

You can now enable Fast Refresh from the [Dev
Menu](/docs/next/debugging#opening-the-dev-menu). Your app will reload
whenever your JavaScript code has changed.

### Method 2: Connect via Wi-Fi​

You can also connect to the development server over Wi-Fi. You'll first need
to install the app on your device using a USB cable, but once that has been
done you can debug wirelessly by following these instructions. You'll need
your development machine's current IP address before proceeding.

You can find the IP address in **System Settings (or System Preferences)** →
**Network**.

  1. Make sure your laptop and your phone are on the **same** Wi-Fi network.
  2. Open your React Native app on your device.
  3. You'll see a [red screen with an error](/docs/next/debugging#logbox). This is OK. The following steps will fix that.
  4. Open the in-app [Dev Menu](/docs/next/debugging#opening-the-dev-menu).
  5. Go to **Dev Settings** → **Debug server host & port for device**.
  6. Type in your machine's IP address and the port of the local dev server (e.g. `10.0.1.1:8081`).
  7. Go back to the **Dev Menu** and select **Reload JS**.

You can now enable Fast Refresh from the [Dev
Menu](/docs/next/debugging#opening-the-dev-menu). Your app will reload
whenever your JavaScript code has changed.

## Building your app for production​

You have built a great app using React Native, and you are now itching to
release it in the Play Store. The process is the same as any other native
Android app, with some additional considerations to take into account. Follow
the guide for [generating a signed APK](/docs/next/signed-apk-android) to
learn more.

### 1\. Enable Debugging over USB​

Most Android devices can only install and run apps downloaded from Google
Play, by default. You will need to enable USB Debugging on your device in
order to install your app during development.

To enable USB debugging on your device, you will first need to enable the
"Developer options" menu by going to **Settings** → **About phone** →
**Software information** and then tapping the `Build number` row at the bottom
seven times. You can then go back to **Settings** → **Developer options** to
enable "USB debugging".

### 2\. Plug in your device via USB​

Let's now set up an Android device to run our React Native projects. Go ahead
and plug in your device via USB to your development machine.

Now check that your device is properly connecting to ADB, the Android Debug
Bridge, by running `adb devices`.

shell

    
    
    $ adb devices  
    List of devices attached  
    emulator-5554 offline   # Google emulator  
    14ed2fcc device         # Physical device  
    

Seeing `device` in the right column means the device is connected. You must
have **only one device connected** at a time.

### 3\. Run your app​

From the root of your project, run the following in your command prompt to
install and launch your app on the device:

  * npm
  * Yarn

shell

    
    
    npm run android  
    

shell

    
    
    yarn android  
    

tip

You can also use the `React Native CLI` to generate and run a `release` build
(e.g. from the root of your project: `yarn android --mode release`).

## Connecting to the development server

You can also iterate quickly on a device by connecting to the development
server running on your development machine. There are several ways of
accomplishing this, depending on whether you have access to a USB cable or a
Wi-Fi network.

### Method 1: Using adb reverse (recommended)​

You can use this method if your device is running Android 5.0 (Lollipop) or
newer, it has USB debugging enabled, and it is connected via USB to your
development machine.

Run the following in a command prompt:

shell

    
    
    $ adb -s <device name> reverse tcp:8081 tcp:8081  
    

To find the device name, run the following adb command:

shell

    
    
    $ adb devices  
    

You can now enable Fast Refresh from the [Dev
Menu](/docs/next/debugging#opening-the-dev-menu). Your app will reload
whenever your JavaScript code has changed.

### Method 2: Connect via Wi-Fi​

You can also connect to the development server over Wi-Fi. You'll first need
to install the app on your device using a USB cable, but once that has been
done you can debug wirelessly by following these instructions. You'll need
your development machine's current IP address before proceeding.

Open the command prompt and type `ipconfig` to find your machine's IP address
([more info](https://windows.microsoft.com/en-us/windows/using-command-line-
tools-networking-information)).

  1. Make sure your laptop and your phone are on the **same** Wi-Fi network.
  2. Open your React Native app on your device.
  3. You'll see a [red screen with an error](/docs/next/debugging#logbox). This is OK. The following steps will fix that.
  4. Open the in-app [Dev Menu](/docs/next/debugging#opening-the-dev-menu).
  5. Go to **Dev Settings** → **Debug server host & port for device**.
  6. Type in your machine's IP address and the port of the local dev server (e.g. `10.0.1.1:8081`).
  7. Go back to the **Dev Menu** and select **Reload JS**.

You can now enable Fast Refresh from the [Dev
Menu](/docs/next/debugging#opening-the-dev-menu). Your app will reload
whenever your JavaScript code has changed.

## Building your app for production​

You have built a great app using React Native, and you are now itching to
release it in the Play Store. The process is the same as any other native
Android app, with some additional considerations to take into account. Follow
the guide for [generating a signed APK](/docs/next/signed-apk-android) to
learn more.

### 1\. Enable Debugging over USB​

Most Android devices can only install and run apps downloaded from Google
Play, by default. You will need to enable USB Debugging on your device in
order to install your app during development.

To enable USB debugging on your device, you will first need to enable the
"Developer options" menu by going to **Settings** → **About phone** →
**Software information** and then tapping the `Build number` row at the bottom
seven times. You can then go back to **Settings** → **Developer options** to
enable "USB debugging".

### 2\. Plug in your device via USB​

Let's now set up an Android device to run our React Native projects. Go ahead
and plug in your device via USB to your development machine.

Next, check the manufacturer code by using `lsusb` (on mac, you must first
[install lsusb](https://github.com/jlhonora/lsusb)). `lsusb` should output
something like this:

bash

    
    
    $ lsusb  
    Bus 002 Device 002: ID 8087:0024 Intel Corp. Integrated Rate Matching Hub  
    Bus 002 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub  
    Bus 001 Device 003: ID 22b8:2e76 Motorola PCS  
    Bus 001 Device 002: ID 8087:0024 Intel Corp. Integrated Rate Matching Hub  
    Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub  
    Bus 004 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub  
    Bus 003 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub  
    

These lines represent the USB devices currently connected to your machine.

You want the line that represents your phone. If you're in doubt, try
unplugging your phone and running the command again:

bash

    
    
    $ lsusb  
    Bus 002 Device 002: ID 8087:0024 Intel Corp. Integrated Rate Matching Hub  
    Bus 002 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub  
    Bus 001 Device 002: ID 8087:0024 Intel Corp. Integrated Rate Matching Hub  
    Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub  
    Bus 004 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub  
    Bus 003 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub  
    

You'll see that after removing the phone, the line which has the phone model
("Motorola PCS" in this case) disappeared from the list. This is the line that
we care about.

`Bus 001 Device 003: ID 22b8:2e76 Motorola PCS`

From the above line, you want to grab the first four digits from the device
ID:

`22b8:2e76`

In this case, it's `22b8`. That's the identifier for Motorola.

You'll need to input this into your udev rules in order to get up and running:

shell

    
    
    echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="22b8", MODE="0666", GROUP="plugdev"' | sudo tee /etc/udev/rules.d/51-android-usb.rules  
    

Make sure that you replace `22b8` with the identifier you get in the above
command.

Now check that your device is properly connecting to ADB, the Android Debug
Bridge, by running `adb devices`.

shell

    
    
    $ adb devices  
    List of devices attached  
    emulator-5554 offline   # Google emulator  
    14ed2fcc device         # Physical device  
    

Seeing `device` in the right column means the device is connected. You must
have **only one device connected** at a time.

### 3\. Run your app​

From the root of your project, type the following in your command prompt to
install and launch your app on the device:

  * npm
  * Yarn

shell

    
    
    npm run android  
    

shell

    
    
    yarn android  
    

note

If you get a "bridge configuration isn't available" error, see [Using adb
reverse](/docs/next/running-on-device#method-1-using-adb-reverse-recommended).

tip

You can also use the `React Native CLI` to generate and run a `release` build
(e.g. from the root of your project: `yarn android --mode release`).

## Connecting to the development server

You can also iterate quickly on a device by connecting to the development
server running on your development machine. There are several ways of
accomplishing this, depending on whether you have access to a USB cable or a
Wi-Fi network.

### Method 1: Using adb reverse (recommended)​

You can use this method if your device is running Android 5.0 (Lollipop) or
newer, it has USB debugging enabled, and it is connected via USB to your
development machine.

Run the following in a command prompt:

shell

    
    
    $ adb -s <device name> reverse tcp:8081 tcp:8081  
    

To find the device name, run the following adb command:

shell

    
    
    $ adb devices  
    

You can now enable Fast Refresh from the [Dev
Menu](/docs/next/debugging#opening-the-dev-menu). Your app will reload
whenever your JavaScript code has changed.

### Method 2: Connect via Wi-Fi​

You can also connect to the development server over Wi-Fi. You'll first need
to install the app on your device using a USB cable, but once that has been
done you can debug wirelessly by following these instructions. You'll need
your development machine's current IP address before proceeding.

Open a terminal and type `/sbin/ifconfig` to find your machine's IP address.

  1. Make sure your laptop and your phone are on the **same** Wi-Fi network.
  2. Open your React Native app on your device.
  3. You'll see a [red screen with an error](/docs/next/debugging#logbox). This is OK. The following steps will fix that.
  4. Open the in-app [Dev Menu](/docs/next/debugging#opening-the-dev-menu).
  5. Go to **Dev Settings** → **Debug server host & port for device**.
  6. Type in your machine's IP address and the port of the local dev server (e.g. `10.0.1.1:8081`).
  7. Go back to the **Dev Menu** and select **Reload JS**.

You can now enable Fast Refresh from the [Dev
Menu](/docs/next/debugging#opening-the-dev-menu). Your app will reload
whenever your JavaScript code has changed.

## Building your app for production​

You have built a great app using React Native, and you are now itching to
release it in the Play Store. The process is the same as any other native
Android app, with some additional considerations to take into account. Follow
the guide for [generating a signed APK](/docs/next/signed-apk-android) to
learn more.

## Running your app on iOS devices​

#### Development OS​

  * macOS
  * Windows
  * Linux

### 1\. Plug in your device via USB​

Connect your iOS device to your Mac using a USB to Lightning or USB-C cable.
Navigate to the `ios` folder in your project, then open the `.xcodeproj` file,
or if you are using CocoaPods open `.xcworkspace`, within it using Xcode.

If this is your first time running an app on your iOS device, you may need to
register your device for development. Open the **Product** menu from Xcode's
menubar, then go to **Destination**. Look for and select your device from the
list. Xcode will then register your device for development.

### 2\. Configure code signing​

Register for an [Apple developer account](https://developer.apple.com/) if you
don't have one yet.

Select your project in the Xcode Project Navigator, then select your main
target (it should share the same name as your project). Look for the "General"
tab. Go to "Signing" and make sure your Apple developer account or team is
selected under the Team dropdown. Do the same for the tests target (it ends
with Tests, and is below your main target).

**Repeat** this step for the **Tests** target in your project.

![](/assets/images/RunningOnDeviceCodeSigning-
daffe4c45a59c3f5031b35f6b24def1d.png)

### 3\. Build and Run your app​

If everything is set up correctly, your device will be listed as the build
target in the Xcode toolbar, and it will also appear in the Devices pane
(`Shift ⇧` \+ `Cmd ⌘` \+ `2`). You can now press the **Build and run** button
(`Cmd ⌘` \+ `R`) or select **Run** from the **Product** menu. Your app will
launch on your device shortly.

![](data:image/png;base64,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)

note

If you run into any issues, please take a look at Apple's [Launching Your App
on a
Device](https://developer.apple.com/library/content/documentation/IDEs/Conceptual/AppDistributionGuide/LaunchingYourApponDevices/LaunchingYourApponDevices.html#//apple_ref/doc/uid/TP40012582-CH27-SW4)
docs.

## Connecting to the development server

You can also iterate quickly on a device using the development server. You
only have to be on the same Wi-Fi network as your computer. Shake your device
to open the [Dev Menu](/docs/next/debugging#opening-the-dev-menu), then enable
Fast Refresh. Your app will reload whenever your JavaScript code has changed.

![](/assets/images/debugging-dev-
menu-076-0057c62ed9b02b1447966892b11ee39a.jpg)

### Troubleshooting​

tip

If you have any issues, ensure that your Mac and device are on the same
network and can reach each other. Many open wireless networks with captive
portals are configured to prevent devices from reaching other devices on the
network. You may use your device's Personal Hotspot feature in this case. You
may also share your internet (Wi-Fi/Ethernet) connection from your Mac to your
device via USB and connect to the bundler through this tunnel for very high
transfer speeds.

When trying to connect to the development server you might get a [red screen
with an error](/docs/next/debugging#logbox) saying:

note

Connection to `http://localhost:8081/debugger-proxy?role=client` timed out.
Are you running node proxy? If you are running on the device, check if you
have the right IP address in `RCTWebSocketExecutor.m`.

To solve this issue check the following points.

#### 1\. Wi-Fi network.​

Make sure your laptop and your phone are on the **same** Wi-Fi network.

#### 2\. IP address​

Make sure that the build script detected the IP address of your machine
correctly (e.g. `10.0.1.123`).

![](/assets/images/XcodeBuildIP-dfc8243436f5436466109acb8f9e0502.png)

Open the **Report navigator** tab, select the last **Build** and search for
`IP=` followed by an IP address. The IP address which gets embedded in the app
should match your machines IP address.

## Building your app for production​

You have built a great app using React Native, and you are now itching to
release it in the App Store. The process is the same as any other native iOS
app, with some additional considerations to take into account. Follow the
guide for [publishing to the Apple App Store](/docs/next/publishing-to-app-
store) to learn more.

info

A Mac is required in order to build your app for iOS devices. Alternatively,
you can refer to our [environment setup guide](/docs/next/environment-setup)
to learn how to build your app using Expo CLI, which will allow you to run
your app using the Expo client app.

info

A Mac is required in order to build your app for iOS devices. Alternatively,
you can refer to our [environment setup guide](/docs/next/environment-setup)
to learn how to build your app using Expo CLI, which will allow you to run
your app using the Expo client app.

[Edit this page](https://github.com/facebook/react-native-
website/edit/main/docs/running-on-device.md)

Last updated on **Aug 15, 2025**

[ PreviousOut-of-Tree Platforms](/docs/next/out-of-tree-platforms)[NextFast
Refresh](/docs/next/fast-refresh)

