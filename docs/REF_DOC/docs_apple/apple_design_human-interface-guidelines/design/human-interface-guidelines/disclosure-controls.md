# Disclosure controls

Disclosure controls reveal and hide information and functionality related to
specific controls or views.

## [Best practices](/design/human-interface-guidelines/disclosure-
controls#Best-practices)

**Use a disclosure control to hide details until they’re relevant.** Place
controls that people are most likely to use at the top of the disclosure
hierarchy so they’re always visible, with more advanced functionality hidden
by default. This organization helps people quickly find the most essential
information without overwhelming them with too many detailed options.

## [Disclosure triangles](/design/human-interface-guidelines/disclosure-
controls#Disclosure-triangles)

A disclosure triangle shows and hides information and functionality associated
with a view or a list of items. For example, Keynote uses a disclosure
triangle to show advanced options when exporting a presentation, and the
Finder uses disclosure triangles to progressively reveal hierarchy when
navigating a folder structure in list view.

  * Collapsed 
  * Expanded 

![An illustration of three folders in a Finder list view. The first and third
folders are collapsed, with disclosure triangles on their leading edges
pointing inward to indicate that they can be expanded to reveal their
contents. The second folder is expanded, with its disclosure triangle pointing
down, revealing three subfolders inside.](https://docs-
assets.developer.apple.com/published/88c62732eba28e9f3233e0dedf6d0946/disclosure-
triangle-after%402x.png)

A disclosure triangle points inward from the leading edge when its content is
hidden and down when its content is visible. Clicking or tapping the
disclosure triangle switches between these two states, and the view expands or
collapses accordingly to accommodate the content.

**Provide a descriptive label when using a disclosure triangle.** Make sure
your labels indicate what is disclosed or hidden, like “Advanced Options.”

For developer guidance, see
[`NSButton.BezelStyle.disclosure`](/documentation/AppKit/NSButton/BezelStyle-
swift.enum/disclosure).

## [Disclosure buttons](/design/human-interface-guidelines/disclosure-
controls#Disclosure-buttons)

A disclosure button shows and hides functionality associated with a specific
control. For example, the macOS Save sheet shows a disclosure button next to
the Save As text field. When people click or tap this button, the Save dialog
expands to give advanced navigation options for selecting an output location
for their document.

A disclosure button points down when its content is hidden and up when its
content is visible. Clicking or tapping the disclosure button switches between
these two states, and the view expands or collapses accordingly to accommodate
the content.

  * Collapsed 
  * Expanded 

![A screenshot of an expanded save dialog in macOS. The dialog includes an
open disclosure button that collapses the dialog to hide some
options.](https://docs-
assets.developer.apple.com/published/1d543abc1f07f34a01c63a3aac067ccd/disclosure-
button-after%402x.png)

**Place a disclosure button near the content that it shows and hides.**
Establish a clear relationship between the control and the expanded choices
that appear when a person clicks or taps a button.

**Use no more than one disclosure button in a single view.** Multiple
disclosure buttons add complexity and can be confusing.

For developer guidance, see
[`NSButton.BezelStyle.pushDisclosure`](/documentation/AppKit/NSButton/BezelStyle-
swift.enum/pushDisclosure).

## [Platform considerations](/design/human-interface-guidelines/disclosure-
controls#Platform-considerations)

 _No additional considerations for macOS. Not supported in tvOS or watchOS._

### [iOS, iPadOS, visionOS](/design/human-interface-guidelines/disclosure-
controls#iOS-iPadOS-visionOS)

Disclosure controls are available in iOS, iPadOS, and visionOS with the
SwiftUI [`DisclosureGroup`](/documentation/SwiftUI/DisclosureGroup) view.

## [Resources](/design/human-interface-guidelines/disclosure-
controls#Resources)

#### [Related](/design/human-interface-guidelines/disclosure-controls#Related)

[Outline views](/design/human-interface-guidelines/outline-views)

[Lists and tables](/design/human-interface-guidelines/lists-and-tables)

[Buttons](/design/human-interface-guidelines/buttons)

#### [Developer documentation](/design/human-interface-guidelines/disclosure-
controls#Developer-documentation)

[`DisclosureGroup`](/documentation/SwiftUI/DisclosureGroup) — SwiftUI

[`NSButton.BezelStyle.disclosure`](/documentation/AppKit/NSButton/BezelStyle-
swift.enum/disclosure) — AppKit

[`NSButton.BezelStyle.pushDisclosure`](/documentation/AppKit/NSButton/BezelStyle-
swift.enum/pushDisclosure) — AppKit

#### [Videos](/design/human-interface-guidelines/disclosure-controls#Videos)

[ Stacks, Grids, and Outlines in SwiftUI
](https://developer.apple.com/videos/play/wwdc2020/10031)

