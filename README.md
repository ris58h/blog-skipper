[![Build Status](https://travis-ci.org/ris58h/blog-skipper.svg?branch=master)](https://travis-ci.org/ris58h/blog-skipper)

# About

Blog Skipper is a Web Extension to skip longreads and comment threads. It works great for 'holy wars' and won't let your fingers get tired \o/.

# Get it

[Chrome](https://chrome.google.com/webstore/detail/blog-skipper/chjnbemclefhkdeihphnkkgacddeejom)

[Firefox](https://addons.mozilla.org/en-US/firefox/addon/blog-skipper/)

# How to use it

## Mouse

It scrolls a page to the next header in case of article click or to the next comment tree (last comment if there is no next comment tree) in case of comment click.

### Middle Click

Middle-click on a part of an article or a comment thread you want to skip.

### Context Menu

Right-click on a part of an article or a comment thread you want to skip. In the context menu click 'Skip'.

## Keyboard

There are shortcuts for BlogSkipper's actions. Defaults are 'z' for Skip and 'Z' for Undo (move to the position before Skip). You can reassign them on the extension's options page.

### Vimium

The shortcuts are great for [Vimium](https://vimium.github.io/) (or other similar extensions) users!

Note that there could be shortcuts collision between extensions. Vimium users can resolve it using "Excluded URLs
and keys" option in the Vimium's option page (for example, Patterns: *, Keys: z).

## Options

There are several settings on the extension's options page.
| Name | Description |
| - | - |
| Automatically detect comments | Check it to autodetect comments. See Sites option. |
| Add to Context Menu | Check it if you want to add BlogSkipper to Browser's Context Menu. |
| Skip on Middle Click | Check it if you want to do skip on Middle Click. |
| Sites | There you can manually define comment's CSS-selectors for sites. |
| Shortcuts | Shortcuts for BlogSkipper's actions. One letter per action. |

# Build

Run `npm install` to install the dependencies.

Run `npm test` to the run tests.

Run `npm run dist` to pack the extension.
