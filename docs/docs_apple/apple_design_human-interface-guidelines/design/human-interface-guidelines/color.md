# Color

Judicious use of color can enhance communication, evoke your brand, provide
visual continuity, communicate status and feedback, and help people understand
information.

The system defines colors that look good on various backgrounds and appearance
modes, and can automatically adapt to vibrancy and accessibility settings.
Using system colors is a convenient way to make your experience feel at home
on the device.

You may also want to use custom colors to enhance the visual experience of
your app or game and express its unique personality. The following guidelines
can help you use color in ways that people appreciate, regardless of whether
you use system-defined or custom colors.

## [Best practices](/design/human-interface-guidelines/color#Best-practices)

**Avoid using the same color to mean different things.** Use color
consistently throughout your interface, especially when you use it to help
communicate information like status or interactivity. For example, if you use
your brand color to indicate that a borderless button is interactive, using
the same or similar color to stylize noninteractive text is confusing.

**Make sure your app’s colors work well in both light and dark contexts.**
iOS, iPadOS, macOS, and tvOS offer both light and [dark](/design/human-
interface-guidelines/dark-mode) appearance settings. System colors vary subtly
depending on the system appearance, adjusting to ensure proper color
differentiation and contrast for text, symbols, and other elements. With the
Increase Contrast setting turned on, the color differences become far more
apparent. If you use a custom color, supply light and dark variants, and an
increased contrast option for each variant.

**Test your app’s color scheme under a variety of lighting conditions.**
Colors can look different when you view your app outside on a sunny day or in
dim light. In bright surroundings, colors look darker and more muted. In dark
environments, colors appear bright and saturated. In visionOS, colors can look
different depending on the colors of a wall or object in a person’s physical
surroundings and how it reflects light. Adjust app colors to provide an
optimal viewing experience in the majority of use cases.

**Test your app on different devices.** For example, the True Tone display —
available on certain iPhone, iPad, and Mac models — uses ambient light sensors
to automatically adjust the white point of the display to adapt to the
lighting conditions of the current environment. Apps that primarily support
reading, photos, video, and gaming can strengthen or weaken this effect by
specifying a white point adaptivity style (for developer guidance, see
[`UIWhitePointAdaptivityStyle`](/documentation/BundleResources/Information-
Property-List/UIWhitePointAdaptivityStyle)). Test tvOS apps on multiple brands
of HD and 4K TVs, and with different display settings. You can also test the
appearance of your app using different color profiles on a Mac — such as P3
and Standard RGB (sRGB) — by choosing a profile in System Settings > Displays.
For guidance, see [Color management](/design/human-interface-
guidelines/color#Color-management).

**Consider how artwork and translucency affect nearby colors.** Variations in
artwork sometimes warrant changes to nearby colors to maintain visual
continuity and prevent interface elements from becoming overpowering or
underwhelming. Maps, for example, displays a light color scheme when in map
mode but switches to a dark color scheme when in satellite mode. Colors can
also appear different when placed behind or applied to a translucent element
like a toolbar.

**If your app lets people choose colors, prefer system-provided color controls
where available.** Using built-in color pickers provides a consistent user
experience, in addition to letting people save a set of colors they can access
from any app. For developer guidance, see
[`ColorPicker`](/documentation/SwiftUI/ColorPicker).

## [Inclusive color](/design/human-interface-guidelines/color#Inclusive-color)

**Avoid relying solely on color to differentiate between objects, indicate
interactivity, or communicate essential information.** When you use color to
convey information, be sure to provide the same information in alternative
ways so people with color blindness or other visual disabilities can
understand it. For example, you can use text labels or glyph shapes to
identify objects or states.

**Avoid using colors that make it hard to perceive content in your app.** For
example, insufficient contrast can cause icons and text to blend with the
background and make content hard to read, and people who are color blind might
not be able to distinguish some color combinations. For guidance, see
[Accessibility](/design/human-interface-guidelines/accessibility).

**Consider how the colors you use might be perceived in other countries and
cultures.** For example, red communicates danger in some cultures, but has
positive connotations in other cultures. Make sure the colors in your app send
the message you intend.

Green indicates a positive trend in the Stocks app in English.

Red indicates a positive trend in the Stocks app in Chinese.

## [System colors](/design/human-interface-guidelines/color#System-colors)

**Avoid hard-coding system color values in your app.** Documented color values
are for your reference during the app design process. The actual color values
may fluctuate from release to release, based on a variety of environmental
variables. Use APIs like [`Color`](/documentation/SwiftUI/Color) to apply
system colors.

iOS, iPadOS, macOS, and visionOS also define sets of _dynamic system colors_
that match the color schemes of standard UI components and automatically adapt
to both light and dark contexts. Each dynamic color is semantically defined by
its purpose, rather than its appearance or color values. For example, some
colors represent view backgrounds at different levels of hierarchy and other
colors represent foreground content, such as labels, links, and separators.

**Avoid redefining the semantic meanings of dynamic system colors.** To ensure
a consistent experience and ensure your interface looks great when the
appearance of the platform changes, use dynamic system colors as intended. For
example, don’t use the
[separator](https://developer.apple.com/documentation/uikit/uicolor/separator)
color as a text color, or [secondary text
label](https://developer.apple.com/documentation/uikit/uicolor/secondarylabel)
color as a background color.

## [Liquid Glass color](/design/human-interface-guidelines/color#Liquid-Glass-
color)

For smaller elements like toolbars and tab bars, the system can adapt [Liquid
Glass](/design/human-interface-guidelines/materials#Liquid-Glass) between a
light and dark appearance in response to the underlying content. Symbols and
text on these elements follow a monochromatic color scheme, becoming darker
when the underlying content is light, and lighter when it’s dark.

Liquid Glass appears more opaque in larger elements like sidebars to preserve
legibility over complex backgrounds and accommodate richer content on the
material’s surface.

**Use color sparingly in Liquid Glass.** To reduce visual noise, limit the
amount of color you apply to the material, and to symbols or text on the
material. If you apply color, reserve it for elements that truly benefit from
emphasis, such as status indicators or key actions. For example, the system
applies tint color to the material backing in prominent buttons — such as the
Done button — to draw attention and elevate their visual prominence.

![An X in a circle to indicate incorrect usage.](https://docs-
assets.developer.apple.com/published/209f6f0fc8ad99d9bf59e12d82d06584/crossout%402x.png)

![A checkmark in a circle to indicate correct usage.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

**Consider using color in the content layer to evoke your brand.** If your app
feels visually muted or lacks sufficient brand emphasis, consider adjusting
the color palette in your content layer, such as adding a colorful header to
the scrollable content. This approach allows your app to continue expressing
its unique personality without distracting from content. Refrain from adding
color throughout Liquid Glass solely to evoke your brand.

![A screenshot of the top half of an iPhone app with a uniform blank
appearance throughout the content layer, with the toolbar the same color as
other content areas.](https://docs-
assets.developer.apple.com/published/0a86e0d9b1b405cbcc0fdbdf4d04c658/color-
empty-background-glass-buttons%402x.png)

Liquid Glass elements over a simple background.

![A screenshot of the top half of an iPhone app that shows a colorful teal
header in the area of the content layer beneath the toolbar.](https://docs-
assets.developer.apple.com/published/bf2e1b55f73478a85996cab873ae417c/color-
filled-background-glass-buttons%402x.png)

Color in the content layer can help highlight your brand.

## [Color management](/design/human-interface-guidelines/color#Color-
management)

A _color space_ represents the colors in a _color model_ like RGB or CMYK.
Common color spaces — sometimes called _gamuts_ — are sRGB and Display P3.

![Diagram showing the colors included in the sRGB space, compared to the
larger number of colors included in the P3 color space.](https://docs-
assets.developer.apple.com/published/c10d0ec4c78a6b824552058caac031b5/color-
graphic-wide-color%402x.png)

A _color profile_ describes the colors in a color space using, for example,
mathematical formulas or tables of data that map colors to numerical
representations. An image embeds its color profile so that a device can
interpret the image’s colors correctly and reproduce them on a display.

**Apply color profiles to your images.** Color profiles help ensure that your
app’s colors appear as intended on different displays. The sRGB color space
produces accurate colors on most displays.

**Use wide color to enhance the visual experience on compatible displays.**
Wide color displays support a P3 color space, which can produce richer, more
saturated colors than sRGB. As a result, photos and videos that use wide color
are more lifelike, and visual data and status indicators that use wide color
can be more meaningful. When appropriate, use the Display P3 color profile at
16 bits per pixel (per channel) and export images in PNG format. Note that you
need to use a wide color display to design wide color images and select P3
colors.

**Provide color space–specific image and color variations if necessary.** In
general, P3 colors and images appear fine on sRGB displays. Occasionally, it
may be hard to distinguish two very similar P3 colors when viewing them on an
sRGB display. Gradients that use P3 colors can also sometimes appear clipped
on sRGB displays. To avoid these issues and to ensure visual fidelity on both
wide color and sRGB displays, you can use the asset catalog of your Xcode
project to provide different versions of images and colors for each color
space.

## [Platform considerations](/design/human-interface-
guidelines/color#Platform-considerations)

### [iOS, iPadOS](/design/human-interface-guidelines/color#iOS-iPadOS)

iOS defines two sets of dynamic background colors — _system_ and _grouped_ —
each of which contains primary, secondary, and tertiary variants that help you
convey a hierarchy of information. In general, use the grouped background
colors
([`systemGroupedBackground`](/documentation/UIKit/UIColor/systemGroupedBackground),
[`secondarySystemGroupedBackground`](/documentation/UIKit/UIColor/secondarySystemGroupedBackground),
and
[`tertiarySystemGroupedBackground`](/documentation/UIKit/UIColor/tertiarySystemGroupedBackground))
when you have a grouped table view; otherwise, use the system set of
background colors
([`systemBackground`](/documentation/UIKit/UIColor/systemBackground),
[`secondarySystemBackground`](/documentation/UIKit/UIColor/secondarySystemBackground),
and
[`tertiarySystemBackground`](/documentation/UIKit/UIColor/tertiarySystemBackground)).

With both sets of background colors, you generally use the variants to
indicate hierarchy in the following ways:

  * Primary for the overall view

  * Secondary for grouping content or elements within the overall view

  * Tertiary for grouping content or elements within secondary elements

For foreground content, iOS defines the following dynamic colors:

Color| Use for…| UIKit API  
---|---|---  
Label| A text label that contains primary content.|
[`label`](/documentation/UIKit/UIColor/label)  
Secondary label| A text label that contains secondary content.|
[`secondaryLabel`](/documentation/UIKit/UIColor/secondaryLabel)  
Tertiary label| A text label that contains tertiary content.|
[`tertiaryLabel`](/documentation/UIKit/UIColor/tertiaryLabel)  
Quaternary label| A text label that contains quaternary content.|
[`quaternaryLabel`](/documentation/UIKit/UIColor/quaternaryLabel)  
Placeholder text| Placeholder text in controls or text views.|
[`placeholderText`](/documentation/UIKit/UIColor/placeholderText)  
Separator| A separator that allows some underlying content to be visible.|
[`separator`](/documentation/UIKit/UIColor/separator)  
Opaque separator| A separator that doesn’t allow any underlying content to be
visible.| [`opaqueSeparator`](/documentation/UIKit/UIColor/opaqueSeparator)  
Link| Text that functions as a link.|
[`link`](/documentation/UIKit/UIColor/link)  
  
### [macOS](/design/human-interface-guidelines/color#macOS)

macOS defines the following dynamic system colors (you can also view them in
the Developer palette of the standard Color panel):

Color| Use for…| AppKit API  
---|---|---  
Alternate selected control text color| The text on a selected surface in a
list or table.|
[`alternateSelectedControlTextColor`](/documentation/AppKit/NSColor/alternateSelectedControlTextColor)  
Alternating content background colors| The backgrounds of alternating rows or
columns in a list, table, or collection view.|
[`alternatingContentBackgroundColors`](/documentation/AppKit/NSColor/alternatingContentBackgroundColors)  
Control accent| The accent color people select in System Settings.|
[`controlAccentColor`](/documentation/AppKit/NSColor/controlAccentColor)  
Control background color| The background of a large interface element, such as
a browser or table.|
[`controlBackgroundColor`](/documentation/AppKit/NSColor/controlBackgroundColor)  
Control color| The surface of a control.|
[`controlColor`](/documentation/AppKit/NSColor/controlColor)  
Control text color| The text of a control that is available.|
[`controlTextColor`](/documentation/AppKit/NSColor/controlTextColor)  
Current control tint| The system-defined control tint.|
[`currentControlTint`](/documentation/AppKit/NSColor/currentControlTint)  
Unavailable control text color| The text of a control that’s unavailable.|
[`disabledControlTextColor`](/documentation/AppKit/NSColor/disabledControlTextColor)  
Find highlight color| The color of a find indicator.|
[`findHighlightColor`](/documentation/AppKit/NSColor/findHighlightColor)  
Grid color| The gridlines of an interface element, such as a table.|
[`gridColor`](/documentation/AppKit/NSColor/gridColor)  
Header text color| The text of a header cell in a table.|
[`headerTextColor`](/documentation/AppKit/NSColor/headerTextColor)  
Highlight color| The virtual light source onscreen.|
[`highlightColor`](/documentation/AppKit/NSColor/highlightColor)  
Keyboard focus indicator color| The ring that appears around the currently
focused control when using the keyboard for interface navigation.|
[`keyboardFocusIndicatorColor`](/documentation/AppKit/NSColor/keyboardFocusIndicatorColor)  
Label color| The text of a label containing primary content.|
[`labelColor`](/documentation/AppKit/NSColor/labelColor)  
Link color| A link to other content.|
[`linkColor`](/documentation/AppKit/NSColor/linkColor)  
Placeholder text color| A placeholder string in a control or text view.|
[`placeholderTextColor`](/documentation/AppKit/NSColor/placeholderTextColor)  
Quaternary label color| The text of a label of lesser importance than a
tertiary label, such as watermark text.|
[`quaternaryLabelColor`](/documentation/AppKit/NSColor/quaternaryLabelColor)  
Secondary label color| The text of a label of lesser importance than a primary
label, such as a label used to represent a subheading or additional
information.|
[`secondaryLabelColor`](/documentation/AppKit/NSColor/secondaryLabelColor)  
Selected content background color| The background for selected content in a
key window or view.|
[`selectedContentBackgroundColor`](/documentation/AppKit/NSColor/selectedContentBackgroundColor)  
Selected control color| The surface of a selected control.|
[`selectedControlColor`](/documentation/AppKit/NSColor/selectedControlColor)  
Selected control text color| The text of a selected control.|
[`selectedControlTextColor`](/documentation/AppKit/NSColor/selectedControlTextColor)  
Selected menu item text color| The text of a selected menu.|
[`selectedMenuItemTextColor`](/documentation/AppKit/NSColor/selectedMenuItemTextColor)  
Selected text background color| The background of selected text.|
[`selectedTextBackgroundColor`](/documentation/AppKit/NSColor/selectedTextBackgroundColor)  
Selected text color| The color for selected text.|
[`selectedTextColor`](/documentation/AppKit/NSColor/selectedTextColor)  
Separator color| A separator between different sections of content.|
[`separatorColor`](/documentation/AppKit/NSColor/separatorColor)  
Shadow color| The virtual shadow cast by a raised object onscreen.|
[`shadowColor`](/documentation/AppKit/NSColor/shadowColor)  
Tertiary label color| The text of a label of lesser importance than a
secondary label.|
[`tertiaryLabelColor`](/documentation/AppKit/NSColor/tertiaryLabelColor)  
Text background color| The background color behind text.|
[`textBackgroundColor`](/documentation/AppKit/NSColor/textBackgroundColor)  
Text color| The text in a document.|
[`textColor`](/documentation/AppKit/NSColor/textColor)  
Under page background color| The background behind a document’s content.|
[`underPageBackgroundColor`](/documentation/AppKit/NSColor/underPageBackgroundColor)  
Unemphasized selected content background color| The selected content in a non-
key window or view.|
[`unemphasizedSelectedContentBackgroundColor`](/documentation/AppKit/NSColor/unemphasizedSelectedContentBackgroundColor)  
Unemphasized selected text background color| A background for selected text in
a non-key window or view.|
[`unemphasizedSelectedTextBackgroundColor`](/documentation/AppKit/NSColor/unemphasizedSelectedTextBackgroundColor)  
Unemphasized selected text color| Selected text in a non-key window or view.|
[`unemphasizedSelectedTextColor`](/documentation/AppKit/NSColor/unemphasizedSelectedTextColor)  
Window background color| The background of a window.|
[`windowBackgroundColor`](/documentation/AppKit/NSColor/windowBackgroundColor)  
Window frame text color| The text in the window’s title bar area.|
[`windowFrameTextColor`](/documentation/AppKit/NSColor/windowFrameTextColor)  
  
#### [App accent colors](/design/human-interface-guidelines/color#App-accent-
colors)

Beginning in macOS 11, you can specify an _accent color_ to customize the
appearance of your app’s buttons, selection highlighting, and sidebar icons.
The system applies your accent color when the current value in General >
Accent color settings is _multicolor_.

![A screenshot of the accent color picker in the System Settings
app.](https://docs-
assets.developer.apple.com/published/93ebe4b08af4e94a5c4479459fc7905b/colors-
accent-colors-picker-multicolor%402x.png)

If people set their accent color setting to a value other than multicolor, the
system applies their chosen color to the relevant items throughout your app,
replacing your accent color. The exception is a sidebar icon that uses a fixed
color you specify. Because a fixed-color sidebar icon uses a specific color to
provide meaning, the system doesn’t override its color when people change the
value of accent color settings. For guidance, see [Sidebars](/design/human-
interface-guidelines/sidebars).

### [tvOS](/design/human-interface-guidelines/color#tvOS)

**Consider choosing a limited color palette that coordinates with your app
logo.** Subtle use of color can help you communicate your brand while
deferring to the content.

**Avoid using only color to indicate focus.** Subtle scaling and responsive
animation are the primary ways to denote interactivity when an element is in
focus.

### [visionOS](/design/human-interface-guidelines/color#visionOS)

**Use color sparingly, especially on glass.** Standard visionOS windows
typically use the system-defined glass [material](/design/human-interface-
guidelines/materials), which lets light and objects from people’s physical
surroundings and their space show through. Because the colors in these
physical and virtual objects are visible through the glass, they can affect
the legibility of colorful app content in the window. Prefer using color in
places where it can help call attention to important information or show the
relationship between parts of the interface.

**Prefer using color in bold text and large areas.** Color in lightweight text
or small areas can make them harder to see and understand.

**In a fully immersive experience, help people maintain visual comfort by
keeping brightness levels balanced.** Although using high contrast can help
direct people’s attention to important content, it can also cause visual
discomfort if people’s eyes have adjusted to low light or darkness. Consider
making content fully bright only when the rest of the visual context is also
bright. For example, avoid displaying a bright object on a very dark or black
background, especially if the object flashes or moves.

### [watchOS](/design/human-interface-guidelines/color#watchOS)

**Use background color to support existing content or supply additional
information.** Background color can establish a sense of place and help people
recognize key content. For example, in Activity, each infographic view for the
Move, Exercise, and Stand Activity rings has a background that matches the
color of the ring. Use background color when you have something to
communicate, rather than as a solely visual flourish. Avoid using full-screen
background color in views that are likely to remain onscreen for long periods
of time, such as in a workout or audio-playing app.

**Recognize that people might prefer graphic complications to use tinted mode
instead of full color.** The system can use a single color that’s based on the
wearer’s selected color in a graphic complication’s images, gauges, and text.
For guidance, see [Complications](/design/human-interface-
guidelines/complications).

## [Specifications](/design/human-interface-guidelines/color#Specifications)

### [System colors](/design/human-interface-guidelines/color#System-colors)

Name| SwiftUI API| Default (light)| Default (dark)| Increased contrast
(light)| Increased contrast (dark)  
---|---|---|---|---|---  
Red| [`red`](/documentation/SwiftUI/Color/red)|
![R-255,G-56,B-60](https://docs-
assets.developer.apple.com/published/56ba9eebe119d2e1b3063503a2eb45b7/colors-
unified-red-light%402x.png)| ![R-255,G-66,B-69](https://docs-
assets.developer.apple.com/published/9d7a7df4db48b0dcbd2915724d010235/colors-
unified-red-dark%402x.png)| ![R-233,G-21,B-45](https://docs-
assets.developer.apple.com/published/5b3473fcd986facfdee26a24601c7082/colors-
unified-accessible-red-light%402x.png)| ![R-255,G-97,B-101](https://docs-
assets.developer.apple.com/published/d097760a50a181eb7f688e9d62f4e710/colors-
unified-accessible-red-dark%402x.png)  
Orange| [`orange`](/documentation/SwiftUI/Color/orange)|
![R-255,G-141,B-40](https://docs-
assets.developer.apple.com/published/57f431ec786e31e33f578ace3dbb8c78/colors-
unified-orange-light%402x.png)| ![R-255,G-146,B-48](https://docs-
assets.developer.apple.com/published/e906c25c1cadcb9cf7514d01b83f3bb7/colors-
unified-orange-dark%402x.png)| ![R-197,G-83,B-0](https://docs-
assets.developer.apple.com/published/2222321d0b29cad6987f0f6e26d198c1/colors-
unified-accessible-orange-light%402x.png)| ![R-255,G-160,B-86](https://docs-
assets.developer.apple.com/published/c82984219db600ea8396f4fd1933fc19/colors-
unified-accessible-orange-dark%402x.png)  
Yellow| [`yellow`](/documentation/SwiftUI/Color/yellow)|
![R-255,G-204,B-0](https://docs-
assets.developer.apple.com/published/bebac431675840fa7e0e70cce0a6eb76/colors-
unified-yellow-light%402x.png)| ![R-255,G-214,B-0](https://docs-
assets.developer.apple.com/published/80c02086ccc5f013058932129cf9c6d3/colors-
unified-yellow-dark%402x.png)| ![R-161,G-106,B-0](https://docs-
assets.developer.apple.com/published/a51b94b82d9ea46e9de2ab8da5a57bbe/colors-
unified-accessible-yellow-light%402x.png)| ![R-254,G-223,B-67](https://docs-
assets.developer.apple.com/published/cd06b12d9e053739b089fb102b70901e/colors-
unified-accessible-yellow-dark%402x.png)  
Green| [`green`](/documentation/SwiftUI/Color/green)|
![R-52,G-199,B-89](https://docs-
assets.developer.apple.com/published/b4226cfcf596812d46bd084322f47e65/colors-
unified-green-light%402x.png)| ![R-48,G-209,B-88](https://docs-
assets.developer.apple.com/published/7724e5dd4f60d300eaffe45c9a5e1f9d/colors-
unified-green-dark%402x.png)| ![R-0,G-137,B-50](https://docs-
assets.developer.apple.com/published/51471c6578d192e9dae6f40d8ace1835/colors-
unified-accessible-green-light%402x.png)| ![R-74,G-217,B-104](https://docs-
assets.developer.apple.com/published/aff6bca03c74050c6b78015925c8fd21/colors-
unified-accessible-green-dark%402x.png)  
Mint| [`mint`](/documentation/SwiftUI/Color/mint)|
![R-0,G-200,B-179](https://docs-
assets.developer.apple.com/published/5d07acb38b9d0d7098f0b92456a7d27c/colors-
unified-mint-light%402x.png)| ![R-0,G-218,B-195](https://docs-
assets.developer.apple.com/published/851d8c0c2bea51a9377ae31520097e8c/colors-
unified-mint-dark%402x.png)| ![R-0,G-133,B-117](https://docs-
assets.developer.apple.com/published/d24198fce4dd42183e7b35abc9b67c20/colors-
unified-accessible-mint-light%402x.png)| ![R-84,G-223,B-203](https://docs-
assets.developer.apple.com/published/72586072586bb6d91589cc4ab78177b1/colors-
unified-accessible-mint-dark%402x.png)  
Teal| [`teal`](/documentation/SwiftUI/Color/teal)|
![R-0,G-195,B-208](https://docs-
assets.developer.apple.com/published/6b8e5d90758cc858b4d3e20110a31f53/colors-
unified-teal-light%402x.png)| ![R-0,G-210,B-224](https://docs-
assets.developer.apple.com/published/d02bd29f4ba3580e84756f8c332fd677/colors-
unified-teal-dark%402x.png)| ![R-0,G-129,B-152](https://docs-
assets.developer.apple.com/published/f2137be89fb79e4822b633a450d6fc2c/colors-
unified-accessible-teal-light%402x.png)| ![R-59,G-221,B-236](https://docs-
assets.developer.apple.com/published/9a76a2333c746ded944e6610a01d4daf/colors-
unified-accessible-teal-dark%402x.png)  
Cyan| [`cyan`](/documentation/SwiftUI/Color/cyan)|
![R-0,G-192,B-232](https://docs-
assets.developer.apple.com/published/3eb3076ca71a16ce1bede399e815e736/colors-
unified-cyan-light%402x.png)| ![R-60,G-211,B-254](https://docs-
assets.developer.apple.com/published/34399c5683f58d0710a50625f2fbca64/colors-
unified-cyan-dark%402x.png)| ![R-0,G-126,B-174](https://docs-
assets.developer.apple.com/published/e54287c8eb8d532283dac9d646886953/colors-
unified-accessible-cyan-light%402x.png)| ![R-109,G-217,B-255](https://docs-
assets.developer.apple.com/published/6d3ef826eb37c61642d57f798de4d14f/colors-
unified-accessible-cyan-dark%402x.png)  
Blue| [`blue`](/documentation/SwiftUI/Color/blue)|
![R-0,G-136,B-255](https://docs-
assets.developer.apple.com/published/6ea9cabe180214ed99be04320df3501b/colors-
unified-blue-light%402x.png)| ![R-0,G-145,B-255](https://docs-
assets.developer.apple.com/published/580c321f95c59b2b4479be066d24f10f/colors-
unified-blue-dark%402x.png)| ![R-30,G-110,B-244](https://docs-
assets.developer.apple.com/published/f46653318bcfae105ff78fe412d64da2/colors-
unified-accessible-blue-light%402x.png)| ![R-92,G-184,B-255](https://docs-
assets.developer.apple.com/published/07b7bcb2d65911636342cee25db1f953/colors-
unified-accessible-blue-dark%402x.png)  
Indigo| [`indigo`](/documentation/SwiftUI/Color/indigo)|
![R-97,G-85,B-245](https://docs-
assets.developer.apple.com/published/2da5c45a0e483dcaac4447464da4b6a7/colors-
unified-indigo-light%402x.png)| ![R-107,G-93,B-255](https://docs-
assets.developer.apple.com/published/3a417943c86af9a79391fe6d2299d973/colors-
unified-indigo-dark%402x.png)| ![R-86,G-74,B-222](https://docs-
assets.developer.apple.com/published/e326f52473ede4e5427208f9929196d9/colors-
unified-accessible-indigo-light%402x.png)| ![R-167,G-170,B-255](https://docs-
assets.developer.apple.com/published/d19249c65dab279c41f16c802365df10/colors-
unified-accessible-indigo-dark%402x.png)  
Purple| [`purple`](/documentation/SwiftUI/Color/purple)|
![R-203,G-48,B-224](https://docs-
assets.developer.apple.com/published/2f07dfc6c397fba6d0abda5f5051a025/colors-
unified-purple-light%402x.png)| ![R-219,G-52,B-242](https://docs-
assets.developer.apple.com/published/04bce86fef3077014010ce6cfceb659f/colors-
unified-purple-dark%402x.png)| ![R-176,G-47,B-194](https://docs-
assets.developer.apple.com/published/a63779bec8a313582e11c6bbe348fc10/colors-
unified-accessible-purple-light%402x.png)| ![R-234,G-141,B-255](https://docs-
assets.developer.apple.com/published/82c3b96b548cbc455ef685f3e44d01d1/colors-
unified-accessible-purple-dark%402x.png)  
Pink| [`pink`](/documentation/SwiftUI/Color/pink)|
![R-255,G-45,B-85](https://docs-
assets.developer.apple.com/published/1486931dce50d7610a397607afc0fb4d/colors-
unified-pink-light%402x.png)| ![R-255,G-55,B-95](https://docs-
assets.developer.apple.com/published/d68a9dbf37bab028b011f68fdd794e9c/colors-
unified-pink-dark%402x.png)| ![R-231,G-18,B-77](https://docs-
assets.developer.apple.com/published/d696af68031ce91a63330e0469ff592b/colors-
unified-accessible-pink-light%402x.png)| ![R-255,G-138,B-196](https://docs-
assets.developer.apple.com/published/a64993da9a61253e266e411d76c2cefd/colors-
unified-accessible-pink-dark%402x.png)  
Brown| [`brown`](/documentation/SwiftUI/Color/brown)|
![R-172,G-127,B-94](https://docs-
assets.developer.apple.com/published/366eca06d26c2f759d6200a1e9b0a56f/colors-
unified-brown-light%402x.png)| ![R-183,G-138,B-102](https://docs-
assets.developer.apple.com/published/df6c5da440560b2054af5b55fe9b87f4/colors-
unified-brown-dark%402x.png)| ![R-149,G-109,B-81](https://docs-
assets.developer.apple.com/published/c80a760835a2bc94a68337d0208a469e/colors-
unified-accessible-brown-light%402x.png)| ![R-219,G-166,B-121](https://docs-
assets.developer.apple.com/published/3c6062e007c9d60e4684d063b3618786/colors-
unified-accessible-brown-dark%402x.png)  
  
visionOS system colors use the default dark color values.

### [iOS, iPadOS system gray colors](/design/human-interface-
guidelines/color#iOS-iPadOS-system-gray-colors)

Name| UIKit API| Default (light)| Default (dark)| Increased contrast (light)|
Increased contrast (dark)  
---|---|---|---|---|---  
Gray| [`systemGray`](/documentation/UIKit/UIColor/systemGray)|
![R-142,G-142,B-147](https://docs-
assets.developer.apple.com/published/cc1289b6fd4b76c79bbeda356463232a/ios-
default-systemgray%402x.png)| ![R-142,G-142,B-147](https://docs-
assets.developer.apple.com/published/cc1289b6fd4b76c79bbeda356463232a/ios-
default-systemgraydark%402x.png)| ![R-108,G-108,B-112](https://docs-
assets.developer.apple.com/published/5d86cbc8b4ddef8b68954882b4c87a18/ios-
accessible-systemgray%402x.png)| ![R-174,G-174,B-178](https://docs-
assets.developer.apple.com/published/d00617ff05181a53d2cb5ddf143d502e/ios-
accessible-systemgraydark%402x.png)  
Gray (2)| [`systemGray2`](/documentation/UIKit/UIColor/systemGray2)|
![R-174,G-174,B-178](https://docs-
assets.developer.apple.com/published/d00617ff05181a53d2cb5ddf143d502e/ios-
default-systemgray2%402x.png)| ![R-99,G-99,B-102](https://docs-
assets.developer.apple.com/published/1f681e808c0f4f35a2e7642872719c8b/ios-
default-systemgray2dark%402x.png)| ![R-142,G-142,B-147](https://docs-
assets.developer.apple.com/published/cc1289b6fd4b76c79bbeda356463232a/ios-
accessible-systemgray2%402x.png)| ![R-124,G-124,B-128](https://docs-
assets.developer.apple.com/published/f941ec556140a435aa9556a993e57e63/ios-
accessible-systemgray2dark%402x.png)  
Gray (3)| [`systemGray3`](/documentation/UIKit/UIColor/systemGray3)|
![R-199,G-199,B-204](https://docs-
assets.developer.apple.com/published/bcbb9fb97382e52aa09de7239a6edcf7/ios-
default-systemgray3%402x.png)| ![R-72,G-72,B-74](https://docs-
assets.developer.apple.com/published/d99ad33dcdd426585e7107e1b130d713/ios-
default-systemgray3dark%402x.png)| ![R-174,G-174,B-178](https://docs-
assets.developer.apple.com/published/d00617ff05181a53d2cb5ddf143d502e/ios-
accessible-systemgray3%402x.png)| ![R-84,G-84,B-86](https://docs-
assets.developer.apple.com/published/693c40b65e2752b3a2b7741d61ebbb3b/ios-
accessible-systemgray3dark%402x.png)  
Gray (4)| [`systemGray4`](/documentation/UIKit/UIColor/systemGray4)|
![R-209,G-209,B-214](https://docs-
assets.developer.apple.com/published/5e1c546e8c78d9700b1ee58ce3a39972/ios-
default-systemgray4%402x.png)| ![R-58,G-58,B-60](https://docs-
assets.developer.apple.com/published/983cdcdfa9a664db0c5ff7c09905582a/ios-
default-systemgray4dark%402x.png)| ![R-188,G-188,B-192](https://docs-
assets.developer.apple.com/published/93644725b33daf923f7e3a146e9b2d42/ios-
accessible-systemgray4%402x.png)| ![R-68,G-68,B-70](https://docs-
assets.developer.apple.com/published/6439d861c1fe8a41615d5f09d3cde938/ios-
accessible-systemgray4dark%402x.png)  
Gray (5)| [`systemGray5`](/documentation/UIKit/UIColor/systemGray5)|
![R-229,G-229,B-234](https://docs-
assets.developer.apple.com/published/91f296b3990bfe6dcd28b1804c803581/ios-
default-systemgray5%402x.png)| ![R-44,G-44,B-46](https://docs-
assets.developer.apple.com/published/a8b1d65979b02865c203f18019b1084d/ios-
default-systemgray5dark%402x.png)| ![R-216,G-216,B-220](https://docs-
assets.developer.apple.com/published/616159815cf002c39f570affa027c298/ios-
accessible-systemgray5%402x.png)| ![R-54,G-54,B-56](https://docs-
assets.developer.apple.com/published/aacb35c6af213ef544f77d26df56df39/ios-
accessible-systemgray5dark%402x.png)  
Gray (6)| [`systemGray6`](/documentation/UIKit/UIColor/systemGray6)|
![R-242,G-242,B-247](https://docs-
assets.developer.apple.com/published/3d60e2b1bf4771610453a31de912647b/ios-
default-systemgray6%402x.png)| ![R-28,G-28,B-30](https://docs-
assets.developer.apple.com/published/5d86f031014f556ef2d26da001c1f639/ios-
default-systemgray6dark%402x.png)| ![R-235,G-235,B-240](https://docs-
assets.developer.apple.com/published/82102708ad5dc7921fc0473f6ace4613/ios-
accessible-systemgray6%402x.png)| ![R-36,G-36,B-38](https://docs-
assets.developer.apple.com/published/5dc6249020925c5ec09f88f8adc9bbaa/ios-
accessible-systemgray6dark%402x.png)  
  
In SwiftUI, the equivalent of `systemGray` is
[`gray`](/documentation/SwiftUI/Color/gray).

## [Resources](/design/human-interface-guidelines/color#Resources)

#### [Related](/design/human-interface-guidelines/color#Related)

[Dark Mode](/design/human-interface-guidelines/dark-mode)

[Accessibility](/design/human-interface-guidelines/accessibility)

[Materials](/design/human-interface-guidelines/materials)

[Apple Design Resources](https://developer.apple.com/design/resources/)

#### [Developer documentation](/design/human-interface-
guidelines/color#Developer-documentation)

[`Color`](/documentation/SwiftUI/Color) — SwiftUI

[`UIColor`](/documentation/UIKit/UIColor) — UIKit

[Color](/documentation/AppKit/color) — AppKit

#### [Videos](/design/human-interface-guidelines/color#Videos)

[![](https://devimages-cdn.apple.com/wwdc-
services/images/3055294D-836B-4513-B7B0-0BC5666246B0/5CD0E251-424E-490F-89CF-1E64848209A6/9910_wide_250x141_1x.jpg)
Meet Liquid Glass ](https://developer.apple.com/videos/play/wwdc2025/219)

## [Change log](/design/human-interface-guidelines/color#Change-log)

Date| Changes  
---|---  
June 9, 2025| Updated system color values, and added guidance for Liquid
Glass.  
February 2, 2024| Distinguished UIKit and SwiftUI gray colors in iOS and
iPadOS, and added guidance for balancing brightness levels in visionOS apps.  
September 12, 2023| Enhanced guidance for using background color in watchOS
views, and added color swatches for tvOS.  
June 21, 2023| Updated to include guidance for visionOS.  
June 5, 2023| Updated guidance for using background color in watchOS.  
December 19, 2022| Corrected RGB values for system mint color (Dark Mode) in
iOS and iPadOS.

