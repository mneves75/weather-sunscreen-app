# Searching

People use various search techniques to find content on their device, within
an app, and within a document or file.

To search for content within an app, people generally expect to use a [search
field](/design/human-interface-guidelines/search-fields). When it makes sense,
you can personalize the search experience by using what you know about how
people interact with your app. For example, you might display recent searches,
search suggestions, completions, or corrections based on terms people searched
earlier in your app.

In some cases, people appreciate the ability to scope a search or filter the
results. For example, people might want to search for items by specifying
attributes like creation date, file size, or file type. For guidance, see
[Scope controls and tokens](/design/human-interface-guidelines/search-
fields#Scope-controls-and-tokens). You can also help people find content
within an open document or file by implementing ways to find content in a
window or page in your iOS, iPadOS, or macOS app.

In iOS, iPadOS, and macOS, Spotlight helps people find content across all apps
in the system and on the web. When you index and provide information about
your app’s content, people can use Spotlight to find content your app contains
without opening it first. For guidance, see [Systemwide search](/design/human-
interface-guidelines/searching#Systemwide-search).

## [Best practices](/design/human-interface-guidelines/searching#Best-
practices)

**If search is important, consider making it a primary action.** For example,
in the Apple TV, Photos, and Phone apps in iOS, search occupies a distinct tab
in the [tab bar](/design/human-interface-guidelines/tab-bars). In the Notes
app, a search field is in the [toolbar](/design/human-interface-
guidelines/toolbars), making search clearly visible and easily accessible.

**Aim to make your app’s content searchable through a single location.**
People appreciate having one clearly identified location they can use to find
anything in your app that they are looking for. For apps with clearly distinct
sections, it may still be useful to offer a local search. For example, search
acts as a filter on the current view when searching your Recents and Contacts
in the iOS Phone app.

**Use placeholder text to indicate what content is searchable.** For example,
the Apple TV app includes the placeholder text _Shows, Movies, and More_.

**Clearly display the current scope of a search.** Use a descriptive
placeholder text, a [scope control](/design/human-interface-guidelines/search-
fields#Scope-controls-and-tokens), or a title to help reinforce what someone
is currently searching. For example, in the Mail app there is always a clear
reference to the mailbox someone is searching.

**Provide suggestions to make searching easier.** When you display a personʼs
recent searches or offer search suggestions both before and while they’re
typing, you can help people search faster and type less. For developer
guidance, see
[`searchSuggestions(_:)`](/documentation/SwiftUI/View/searchSuggestions\(_:\)).

**Take privacy into consideration before displaying search history.** People
might not appreciate having their search history appear where others might see
it. Depending on the context, consider providing other ways to narrow the
search instead. If you do show search history, provide a way for people to
clear it if they want.

## [Systemwide search](/design/human-interface-
guidelines/searching#Systemwide-search)

**Make your app’s content searchable in Spotlight.** You can share content
with Spotlight by making it indexable and specifying descriptive attributes
known as _metadata_. Spotlight extracts, stores, and organizes this
information to allow for fast, comprehensive searches.

**Define metadata for custom file types you handle.** Supply a Spotlight File
Importer plug-in that describes the types of metadata your file format
contains. For developer guidance, see
[`CSImportExtension`](/documentation/CoreSpotlight/CSImportExtension).

**Use Spotlight to offer advanced file-search capabilities within the context
of your app.** For example, you might include a button that instantly
initiates a Spotlight search based on the current selection. You might then
display a custom view that presents the search results or a filtered subset of
them.

**Prefer using the system-provided open and save views.** The system-provided
open and save views generally include a built-in search field that people can
use to search and filter the entire system. For related guidance, see [File
management](/design/human-interface-guidelines/file-management).

**Implement a Quick Look generator if your app produces custom file types.** A
Quick Look generator helps Spotlight and other apps show previews of your
documents. For developer guidance, see [Quick Look](/documentation/QuickLook).

## [Platform considerations](/design/human-interface-
guidelines/searching#Platform-considerations)

 _No additional considerations for iOS, iPadOS, macOS, tvOS, visionOS, or
watchOS._

## [Resources](/design/human-interface-guidelines/searching#Resources)

#### [Related](/design/human-interface-guidelines/searching#Related)

[Search fields](/design/human-interface-guidelines/search-fields)

#### [Developer documentation](/design/human-interface-
guidelines/searching#Developer-documentation)

[Adding your app’s content to Spotlight
indexes](/documentation/CoreSpotlight/adding-your-app-s-content-to-spotlight-
indexes) — Core Spotlight

#### [Videos](/design/human-interface-guidelines/searching#Videos)

[ Support semantic search with Core Spotlight
](https://developer.apple.com/videos/play/wwdc2024/10131)

[ What’s new in iPad app design
](https://developer.apple.com/videos/play/wwdc2022/10009)

[ Craft search experiences in SwiftUI
](https://developer.apple.com/videos/play/wwdc2021/10176)

## [Change log](/design/human-interface-guidelines/searching#Change-log)

Date| Changes  
---|---  
June 9, 2025| Updated best practices with general guidance from Search fields,
and reorganized guidance for systemwide search.

