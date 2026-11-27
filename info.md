# Catweb Interpreter
What is Catweb:
Catweb is a Roblox game where players can create fictional websites with a URL such as "domain".rbx.

Focus: Understand and create software that automates code generation from advanced languages such as Python, rather than using the node-based visual editor, which is slow and inefficient.

This system uses code to create valid JSON code or pages for the game to interpret. We analyze how the game itself uses JSON so we can reproduce it and push its potential further.

## Variables
Catweb supports inserting variables into text or STR fields using braces, as in `{variable}`. There are several types:
- global: `{var}` // stored for all scripts.
- local: `{l!var}` // available only in the block where it is used, then deleted.
- object: `{o!var}` // this object/script can use the variable; it does not exist outside it.

# Format Information (JSON)
The `globalid` can be any value; the game uses it to associate elements in parent-child relationships or within scripts.

# File Types (Related to `files.json`)
## Use [Type][? : optional variant marker][Variant]
TextLabel - Text
ImageLabel - An image with a DecalId
TextButton:
-none- Standard button usable in scripts
?link - Button that opens a link
?transfer - Roblox donation
?avatarItem - Roblox item (opens a dialog and allows purchase on click)
ImageButton
TextBox - Input field that may or may not be editable, based on "editable"
ScrollingFrame - A container for other elements that can be scrolled; can be used for inner canvases or to scroll through a website
Script - Script code is placed in the "content":[] field

## Scripts
The event usually used is "When website loaded..."; it executes first.

Scripts are programmed as nested nodes: blocks similar to Scratch are placed inside other blocks or below them.

These blocks require coordinates and width/height dimensions.

## Cookies
They are paid. If you use blocks from this category, make sure the user has unlocked them before adding them to JSON.

## Events (Related to `events.json`)

-- `"value":"tq"` indicates which object the script event is assigned to.
-- `"tq"` is the ID associated with an object.

The following events expose local variables (`l`) for use:

When donation completed:
- l.identifier
- l.robuxAmount
- l.purchasedNow

When <Object> changed:
- l.changedProperty

When cross-site message received:
- l.sourceDomain
- l.messageContent
- l.messageSenderId
- l.messageSenderName

When message received:
- l.messageContent
- l.messageSenderId
- l.messageSenderName

## All Properties Objects May Have
Each property applies to its respective object and specific data type.
- Absolute Position
- Absolute Rotation
- Absolute Size
- Alias
- Anchor Point
- Automatic Color
- Background Color
- Background Transparency
- Blur Radius
- Bottom Left Radius
- Bottom Padding
- Bottom Right Radius
- Canvas Position
- Canvas Size
- Cell Padding
- Cell Size
- Clips Descendants
- Content Text
- Cursor Position
- Direction
- Editable
- Flex Mode
- Font
- Font Style
- Font Weight
- Grow Ratio
- Height
- Horizontal Alignment
- Icon
- Identifier
- Image ID
- Image Rect Offset
- Image Rect Size
- Image Transparency
- Is Loaded
- Item ID
- Item Line Alignment
- Layer
- Left Padding
- Line Height
- List Horizontal Alignment
- List Horizontal Flex
- List Padding
- List Vertical Alignment
- List Vertical Flex
- Max Visible Graphemes
- Maximum Text Size
- Minimum Text Size
- Mouse Icon
- Name
- Offset
- Order
- Outline Color
- Outline Thickness
- Outline Transparency
- Placeholder
- Placeholder Color
- Position
- Product Type
- Radius
- Ratio
- Reference
- Resample Mode
- Rich
- Right Padding
- Robux Amount
- Rotation
- Scale Type
- Scrollbar Bottom Image
- Scrollbar Color
- Scrollbar Middle Image
- Scrollbar Thickness
- Scrollbar Top Image
- Scrollbar Transparency
- Selection Start
- Shadow Color
- Shadow Transparency
- Shrink Ratio
- Size
- Slice Center
- Slice Scale
- Sort Order
- Spread
- Stroke Mode
- Stroke Offset
- Stroke Position
- Stroke Sizing Mode
- Stroke Type
- Text
- Text Bounds
- Text Color
- Text Size
- Text Transparency
- Tile Size
- Tint
- Title
- Tooltip
- Top Left Radius
- Top Padding
- Top Right Radius
- Truncate Text
- Vertical Alignment
- Visible
- Width
- Wrap List
- Wrap Text

# Important: Roblox Text Filtering
Some Catweb users have observed long text being censored when sent between
websites. Roblox's [text-filtering documentation](https://create.roblox.com/docs/ui/text-filtering)
describes filtering user-provided or displayed text, not JSON structure
validation. The repository has no evidence that spaces in JSON, `raw` blocks,
variable names, or coordinates alone trigger censorship; the exact Catweb
runtime data flow needs to be tested.
For scripts that transmit or derive long text, keep the original input as the
only unrestricted text value and use compact, reversible numeric-token payloads
for intermediate values. Prefer short numeric-pattern variable names such as
`v0` and `v1` (CSL identifiers require a letter/underscore prefix), and avoid
duplicating long text in variables, logs, or messages.

Keep Catweb-required API names, object IDs, and schema strings unchanged.
Numeric encodings must define escaping and be tested for spaces, digits,
punctuation, empty text, and Unicode. The current catalog does not document a
general character-to-number conversion, so do not claim arbitrary Unicode is
fully numeric-encoded unless that mapping exists and is verified.
[`catweb_text_codec.py`](catweb_text_codec.py) is a strict Python port of the
Conn 00-96 character table; it rejects unsupported characters instead of
silently converting them to the legacy fallback value. It is not a Catweb
runtime function and does not provide general Unicode coverage.

# Styling
These are objects like Files, but nested inside other objects (including other styling objects); they add properties to the object they are in.
For example, a Frame could contain a Corner object, which could itself contain a color Gradient.