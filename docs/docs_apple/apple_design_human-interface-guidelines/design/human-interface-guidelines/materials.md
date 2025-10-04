September 9, 2025

Updated guidance for Liquid Glass.

# Materials

A material is a visual effect that creates a sense of depth, layering, and
hierarchy between foreground and background elements.

Materials help visually separate foreground elements, such as text and
controls, from background elements, such as content and solid colors. By
allowing color to pass through from background to foreground, a material
establishes visual hierarchy to help people more easily retain a sense of
place.

Apple platforms feature two types of materials: Liquid Glass, and standard
materials. [Liquid Glass](/design/human-interface-guidelines/materials#Liquid-
Glass) is a dynamic material that unifies the design language across Apple
platforms, allowing you to present controls and navigation without obscuring
underlying content. In contrast to Liquid Glass, the [standard
materials](/design/human-interface-guidelines/materials#Standard-materials)
help with visual differentiation within the content layer.

## [Liquid Glass](/design/human-interface-guidelines/materials#Liquid-Glass)

Liquid Glass forms a distinct functional layer for controls and navigation
elements — like tab bars and sidebars — that floats above the content layer,
establishing a clear visual hierarchy between functional elements and content.
Liquid Glass allows content to scroll and peek through from beneath these
elements to give the interface a sense of dynamism and depth, all while
maintaining legibility for controls and navigation.

**Don’t use Liquid Glass in the content layer.** Liquid Glass works best when
it provides a clear distinction between interactive elements and content, and
including it in the content layer can result in unnecessary complexity and a
confusing visual hierarchy. Instead, use [standard materials](/design/human-
interface-guidelines/materials#Standard-materials) for elements in the content
layer, such as app backgrounds. An exception to this is for controls in the
content layer with a transient interactive element like
[sliders](/design/human-interface-guidelines/sliders) and
[toggles](/design/human-interface-guidelines/toggles); in these cases, the
element takes on a Liquid Glass appearance to emphasize its interactivity when
a person activates it.

**Use Liquid Glass effects sparingly.** Standard components from system
frameworks pick up the appearance and behavior of this material automatically.
If you apply Liquid Glass effects to a custom control, do so sparingly. Liquid
Glass seeks to bring attention to the underlying content, and overusing this
material in multiple custom controls can provide a subpar user experience by
distracting from that content. Limit these effects to the most important
functional elements in your app. For developer guidance, see [Applying Liquid
Glass to custom views](/documentation/SwiftUI/Applying-Liquid-Glass-to-custom-
views).

**Only use clear Liquid Glass for components that appear over visually rich
backgrounds.** Liquid Glass provides two variants —
[`regular`](/documentation/SwiftUI/Glass/regular) and
[`clear`](/documentation/SwiftUI/Glass/clear) — that you can choose when
building custom components or styling some system components.

The _regular_ variant blurs and adjusts the luminosity of background content
to maintain legibility of text and other foreground elements. Scroll edge
effects further enhance legibility by blurring and reducing the opacity of
background content. Most system components use this variant. Use the regular
variant when background content might create legibility issues, or when
components have a significant amount of text, such as alerts, sidebars, or
popovers.

On dark background

On light background

The _clear_ variant is highly translucent, which is ideal for prioritizing the
visibility of the underlying content and ensuring visually rich background
elements remain prominent. Use this variant for components that float above
media backgrounds — such as photos and videos — to create a more immersive
content experience.

For optimal contrast and legibility, determine whether to add a dimming layer
behind components with clear Liquid Glass:

  * If the underlying content is bright, consider adding a dark dimming layer of 35% opacity. For developer guidance, see [`clear`](/documentation/SwiftUI/Glass/clear).

  * If the underlying content is sufficiently dark, or if you use standard media playback controls from AVKit that provide their own dimming layer, you don’t need to apply a dimming layer.

For guidance about the use of color, see [Liquid Glass color](/design/human-
interface-guidelines/color#Liquid-Glass-color).

## [Standard materials](/design/human-interface-guidelines/materials#Standard-
materials)

Use standard materials and effects — such as
[blur](/documentation/UIKit/UIBlurEffect),
[vibrancy](/documentation/UIKit/UIVibrancyEffect), and [blending
modes](/documentation/AppKit/NSVisualEffectView/BlendingMode-swift.enum) — to
convey a sense of structure in the content beneath Liquid Glass.

**Choose materials and effects based on semantic meaning and recommended
usage.** Avoid selecting a material or effect based on the apparent color it
imparts to your interface, because system settings can change its appearance
and behavior. Instead, match the material or vibrancy style to your specific
use case.

**Help ensure legibility by using vibrant colors on top of materials.** When
you use system-defined vibrant colors, you don’t need to worry about colors
seeming too dark, bright, saturated, or low contrast in different contexts.
Regardless of the material you choose, use vibrant colors on top of it. For
guidance, see [System colors](/design/human-interface-guidelines/color#System-
colors).

Poor contrast between the material and `systemGray3` label

Good contrast between the material and vibrant color label

**Consider contrast and visual separation when choosing a material to combine
with blur and vibrancy effects.** For example, consider that:

  * Thicker materials, which are more opaque, can provide better contrast for text and other elements with fine features.

  * Thinner materials, which are more translucent, can help people retain their context by providing a visible reminder of the content that’s in the background.

For developer guidance, see [`Material`](/documentation/SwiftUI/Material).

## [Platform considerations](/design/human-interface-
guidelines/materials#Platform-considerations)

### [iOS, iPadOS](/design/human-interface-guidelines/materials#iOS-iPadOS)

In addition to Liquid Glass, iOS and iPadOS continue to provide four standard
materials — ultra-thin, thin, regular (default), and thick — which you can use
in the content layer to help create visual distinction.

`ultraThin`

`thin`

`regular`

`thick`

iOS and iPadOS also define vibrant colors for labels, fills, and separators
that are specifically designed to work with each material. Labels and fills
both have several levels of vibrancy; separators have one level. The name of a
level indicates the relative amount of contrast between an element and the
background: The default level has the highest contrast, whereas quaternary
(when it exists) has the lowest contrast.

Except for quaternary, you can use the following vibrancy values for labels on
any material. In general, avoid using quaternary on top of the
[`thin`](/documentation/SwiftUI/Material/thin) and
[`ultraThin`](/documentation/SwiftUI/Material/ultraThin) materials, because
the contrast is too low.

  * [`UIVibrancyEffectStyle.label`](/documentation/UIKit/UIVibrancyEffectStyle/label) (default)

  * [`UIVibrancyEffectStyle.secondaryLabel`](/documentation/UIKit/UIVibrancyEffectStyle/secondaryLabel)

  * [`UIVibrancyEffectStyle.tertiaryLabel`](/documentation/UIKit/UIVibrancyEffectStyle/tertiaryLabel)

  * [`UIVibrancyEffectStyle.quaternaryLabel`](/documentation/UIKit/UIVibrancyEffectStyle/quaternaryLabel)

You can use the following vibrancy values for fills on all materials.

  * [`UIVibrancyEffectStyle.fill`](/documentation/UIKit/UIVibrancyEffectStyle/fill) (default)

  * [`UIVibrancyEffectStyle.secondaryFill`](/documentation/UIKit/UIVibrancyEffectStyle/secondaryFill)

  * [`UIVibrancyEffectStyle.tertiaryFill`](/documentation/UIKit/UIVibrancyEffectStyle/tertiaryFill)

The system provides a single, default vibrancy value for a
[separator](/documentation/UIKit/UIVibrancyEffectStyle/separator), which works
well on all materials.

### [macOS](/design/human-interface-guidelines/materials#macOS)

macOS provides several standard materials with designated purposes, and
vibrant versions of all [system colors](/design/human-interface-
guidelines/color#Specifications). For developer guidance, see
[`NSVisualEffectView.Material`](/documentation/AppKit/NSVisualEffectView/Material-
swift.enum).

**Choose when to allow vibrancy in custom views and controls.** Depending on
configuration and system settings, system views and controls use vibrancy to
make foreground content stand out against any background. Test your interface
in a variety of contexts to discover when vibrancy enhances the appearance and
improves communication.

**Choose a background blending mode that complements your interface design.**
macOS defines two modes that blend background content: behind window and
within window. For developer guidance, see
[`NSVisualEffectView.BlendingMode`](/documentation/AppKit/NSVisualEffectView/BlendingMode-
swift.enum).

### [tvOS](/design/human-interface-guidelines/materials#tvOS)

In tvOS, Liquid Glass appears throughout navigation elements and system
experiences such as Top Shelf and Control Center. Certain interface elements,
like image views and buttons, adopt Liquid Glass when they gain focus.

![A screenshot of the Destination Video app running in tvOS. The app shows a
screen with details about a video called A BOT-anist Adventure. The background
is a colorful image of the main character in a scene from the video. The
interface elements floating above the background adopt a Liquid Glass
appearance to allow background color to show through and create a more
immersive media experience.](https://docs-
assets.developer.apple.com/published/fd83bb7f079cac7b59cb692d8e1c6707/materials-
tvos-media-player%402x.png)

In addition to Liquid Glass, tvOS continues to provide standard materials,
which you can use to help define structure in the content layer. The thickness
of a standard material affects how prominently the underlying content shows
through. For example, consider using standard materials in the following ways:

Material| Recommended for  
---|---  
[`ultraThin`](/documentation/SwiftUI/Material/ultraThin)| Full-screen views
that require a light color scheme  
[`thin`](/documentation/SwiftUI/Material/thin)| Overlay views that partially
obscure onscreen content and require a light color scheme  
[`regular`](/documentation/SwiftUI/Material/regular)| Overlay views that
partially obscure onscreen content  
[`thick`](/documentation/SwiftUI/Material/thick)| Overlay views that partially
obscure onscreen content and require a dark color scheme  
  
### [visionOS](/design/human-interface-guidelines/materials#visionOS)

In visionOS, windows generally use an unmodifiable system-defined material
called _glass_ that helps people stay grounded by letting light, the current
Environment, virtual content, and objects in people’s surroundings show
through. Glass is an adaptive material that limits the range of background
color information so a window can continue to provide contrast for app content
while becoming brighter or darker depending on people’s physical surroundings
and other virtual content.

Video with custom controls.

Content description: A recording of the Music app window in visionOS. The
window uses the glass material and adapts as the viewing angle and lighting
change.

Play

Note

visionOS doesn’t have a distinct Dark Mode setting. Instead, glass
automatically adapts to the luminance of the objects and colors behind it.

**Avoid using opaque colors in a window.** Areas of opacity can block people’s
view, making them feel constricted and reducing their awareness of the virtual
and physical objects around them.

![An illustration of a field of view in visionOS with a window in the center.
The window has a translucent material background that allows its surroundings
to pass through.](https://docs-
assets.developer.apple.com/published/3f23b3476f6cf8cc77fdcb91a0c15063/materials-
visionos-glass-window%402x.png)

![A checkmark in a circle to indicate correct usage](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

![An illustration of a field of view in visionOS with a window in the center.
The window has an opaque background that obstructs its
surroundings.](https://docs-
assets.developer.apple.com/published/137ceb38a96227aa8a9d2021ee82a8e2/materials-
visionos-opaque-window-incorrect%402x.png)

![An X in a circle to indicate incorrect usage](https://docs-
assets.developer.apple.com/published/209f6f0fc8ad99d9bf59e12d82d06584/crossout%402x.png)

**If necessary, choose materials that help you create visual separations or
indicate interactivity in your app.** If you need to create a custom
component, you may need to specify a system material for it. Use the following
examples for guidance.

  * The [`thin`](/documentation/SwiftUI/Material/thin) material brings attention to interactive elements like buttons and selected items.

  * The [`regular`](/documentation/SwiftUI/Material/regular) material can help you visually separate sections of your app, like a sidebar or a grouped table view.

  * The [`thick`](/documentation/SwiftUI/Material/thick) material lets you create a dark element that remains visually distinct when it’s on top of an area that uses a `regular` background.

![An illustration of a field of view in visionOS with a window in the center.
The window is composed of a sidebar on the left and a content area on the
right, with a text field at the top and a button in the lower-right corner.
The sidebar uses regular material, while the text field uses thick material
and the button uses thin material.](https://docs-
assets.developer.apple.com/published/c3577aa1e00689431e49973173a151f9/visionos-
materials-window-example%402x.png)

To ensure foreground content remains legible when it displays on top of a
material, visionOS applies vibrancy to text, symbols, and fills. Vibrancy
enhances the sense of depth by pulling light and color forward from both
virtual and physical surroundings.

visionOS defines three vibrancy values that help you communicate a hierarchy
of text, symbols, and fills.

  * Use [`UIVibrancyEffectStyle.label`](/documentation/UIKit/UIVibrancyEffectStyle/label) for standard text.

  * Use [`UIVibrancyEffectStyle.secondaryLabel`](/documentation/UIKit/UIVibrancyEffectStyle/secondaryLabel) for descriptive text like footnotes and subtitles.

  * Use [`UIVibrancyEffectStyle.tertiaryLabel`](/documentation/UIKit/UIVibrancyEffectStyle/tertiaryLabel) for inactive elements, and only when text doesn’t need high legibility.

![An illustration of a Share button with a translucent background material and
a symbol. The symbol uses the default vibrant label color and has very high
contrast against the background material.](https://docs-
assets.developer.apple.com/published/8f850521ecc2e3953e8e693fe7b4887b/materials-
visionos-label-vibrant-primary%402x.png)`label`

![An illustration of a Share button with a translucent background material and
a symbol. The symbol uses the secondary vibrant label color and has high
contrast against the background material.](https://docs-
assets.developer.apple.com/published/876503f2b2b5fd1783e359128ffd2482/materials-
visionos-label-vibrant-secondary%402x.png)`secondaryLabel`

![An illustration of a Share button with a translucent background material and
a symbol. The symbol uses the tertiary vibrant label color and has muted
contrast against the background material.](https://docs-
assets.developer.apple.com/published/b3b80e5f23b286f6c7897780676e6dfe/materials-
visionos-label-vibrant-tertiary%402x.png)`tertiaryLabel`

### [watchOS](/design/human-interface-guidelines/materials#watchOS)

**Use materials to provide context in a full-screen modal view.** Because
full-screen modal views are common in watchOS, the contrast provided by
material layers can help orient people in your app and distinguish controls
and system elements from other content. Avoid removing or replacing material
backgrounds for modal sheets when they’re provided by default.

![An illustration of a modal view in watchOS with an example title,
descriptive text, and a single action button. The modal completely covers the
screen with a transparent material, and uses a thinner material for the button
along with vibrant label text.](https://docs-
assets.developer.apple.com/published/b9bdbaa947d461e98681c9fbb87a7052/watchos-
modal-view-material-background%402x.png)

## [Resources](/design/human-interface-guidelines/materials#Resources)

#### [Related](/design/human-interface-guidelines/materials#Related)

[Color](/design/human-interface-guidelines/color)

[Accessibility](/design/human-interface-guidelines/accessibility)

[Dark Mode](/design/human-interface-guidelines/dark-mode)

#### [Developer documentation](/design/human-interface-
guidelines/materials#Developer-documentation)

[Adopting Liquid Glass](/documentation/TechnologyOverviews/adopting-liquid-
glass)

[`glassEffect(_:in:)`](/documentation/SwiftUI/View/glassEffect\(_:in:\)) —
SwiftUI

[`Material`](/documentation/SwiftUI/Material) — SwiftUI

[`UIVisualEffectView`](/documentation/UIKit/UIVisualEffectView) — UIKit

[`NSVisualEffectView`](/documentation/AppKit/NSVisualEffectView) — AppKit

#### [Videos](/design/human-interface-guidelines/materials#Videos)

[![](https://devimages-cdn.apple.com/wwdc-
services/images/3055294D-836B-4513-B7B0-0BC5666246B0/5CD0E251-424E-490F-89CF-1E64848209A6/9910_wide_250x141_1x.jpg)
Meet Liquid Glass ](https://developer.apple.com/videos/play/wwdc2025/219)

[![](https://devimages-cdn.apple.com/wwdc-
services/images/3055294D-836B-4513-B7B0-0BC5666246B0/1AAA030E-2ECA-47D8-AE09-6D7B72A840F6/10044_wide_250x141_1x.jpg)
Get to know the new design system
](https://developer.apple.com/videos/play/wwdc2025/356)

## [Change log](/design/human-interface-guidelines/materials#Change-log)

Date| Changes  
---|---  
September 9, 2025| Updated guidance for Liquid Glass.  
June 9, 2025| Added guidance for Liquid Glass.  
August 6, 2024| Added platform-specific art.  
December 5, 2023| Updated descriptions of the various material types, and
clarified terms related to vibrancy and material thickness.  
June 21, 2023| Updated to include guidance for visionOS.  
June 5, 2023| Added guidance on using materials to provide context and
orientation in watchOS apps.

