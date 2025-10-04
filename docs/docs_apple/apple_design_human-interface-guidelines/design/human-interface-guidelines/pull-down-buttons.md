# Pull-down buttons

A pull-down button displays a menu of items or actions that directly relate to
the button’s purpose.

After people choose an item in a pull-down button’s menu, the menu closes, and
the app performs the chosen action.

## [Best practices](/design/human-interface-guidelines/pull-down-buttons#Best-
practices)

**Use a pull-down button to present commands or items that are directly
related to the button’s action.** The menu lets you help people clarify the
button’s target or customize its behavior without requiring additional buttons
in your interface. For example:

  * An Add button could present a menu that lets people specify the item they want to add.

  * A Sort button could use a menu to let people select an attribute on which to sort.

  * A Back button could let people choose a specific location to revisit instead of opening the previous one.

If you need to provide a list of mutually exclusive choices that aren’t
commands, use a [pop-up button](/design/human-interface-guidelines/pop-up-
buttons) instead.

**Avoid putting all of a view’s actions in one pull-down button.** A view’s
primary actions need to be easily discoverable, so you don’t want to hide them
in a pull-down button that people have to open before they can do anything.

**Balance menu length with ease of use.** Because people have to interact with
a pull-down button before they can view its menu, listing a minimum of three
items can help the interaction feel worthwhile. If you need to list only one
or two items, consider using alternative components to present them, such as
buttons to perform actions and toggles or switches to present selections. In
contrast, listing too many items in a pull-down button’s menu can slow people
down because it takes longer to find a specific item.

**Display a succinct menu title only if it adds meaning.** In general, a pull-
down button’s content — combined with descriptive menu items — provides all
the context people need, making a menu title unnecessary.

**Let people know when a pull-down button’s menu item is destructive, and ask
them to confirm their intent.** Menus use red text to highlight actions that
you identify as potentially destructive. When people choose a destructive
action, the system displays an [action sheet](/design/human-interface-
guidelines/action-sheets) (iOS) or [popover](/design/human-interface-
guidelines/popovers) (iPadOS) in which they can confirm their choice or cancel
the action. Because an action sheet appears in a different location from the
menu and requires deliberate dismissal, it can help people avoid losing data
by mistake.

**Include an interface icon with a menu item when it provides value.** If you
need to clarify an item’s meaning, you can display an [icon](/design/human-
interface-guidelines/icons) or image after its label. Using [SF
Symbols](/design/human-interface-guidelines/sf-symbols) for this purpose can
help you provide a familiar experience while ensuring that the symbol remains
aligned with the text at every scale.

## [Platform considerations](/design/human-interface-guidelines/pull-down-
buttons#Platform-considerations)

 _No additional considerations for macOS or visionOS. Not supported in tvOS or
watchOS._

### [iOS, iPadOS](/design/human-interface-guidelines/pull-down-buttons#iOS-
iPadOS)

Note

You can also let people reveal a pull-down menu by performing a specific
gesture on a button. For example, in iOS 14 and later, Safari responds to a
touch and hold gesture on the Tabs button by displaying a menu of tab-related
actions, like New Tab and Close All Tabs.

**Consider using a More pull-down button to present items that don’t need
prominent positions in the main interface.** A More button can help you offer
a range of items where space is constrained, but it can also hinder
discoverability. Although people generally understand that a More button
offers additional functionality related to the current context, the ellipsis
icon doesn’t necessarily help them predict its contents. To design an
effective More button, weigh the convenience of its size against its impact on
discoverability to find a balance that works in your app.

## [Resources](/design/human-interface-guidelines/pull-down-buttons#Resources)

#### [Related](/design/human-interface-guidelines/pull-down-buttons#Related)

[Pop-up buttons](/design/human-interface-guidelines/pop-up-buttons)

[Buttons](/design/human-interface-guidelines/buttons)

[Menus](/design/human-interface-guidelines/menus)

#### [Developer documentation](/design/human-interface-guidelines/pull-down-
buttons#Developer-documentation)

[`MenuPickerStyle`](/documentation/SwiftUI/MenuPickerStyle) — SwiftUI

[`showsMenuAsPrimaryAction`](/documentation/UIKit/UIControl/showsMenuAsPrimaryAction)
— UIKit

[`pullsDown`](/documentation/AppKit/NSPopUpButton/pullsDown) — AppKit

## [Change log](/design/human-interface-guidelines/pull-down-buttons#Change-
log)

Date| Changes  
---|---  
September 14, 2022| Refined guidance on designing a useful menu length.

