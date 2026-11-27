# Catweb executable API v2

Static catalog reference: **126 callable actions, 11 events, and 1 language declaration** across 18 modules/categories.

> The catalog describes block templates and argument controls, not Catweb runtime semantics. Descriptions below are based on the visible catalog labels and the previous static inventory; examples are compiler-validated, not executed in the game. `type` is the catalog control type, not a stronger runtime type guarantee.

## Calling conventions

- Calls use positional literals; nested function calls and named arguments are not supported.
- Canonical API v2 parameter order is used by named calls. The compiler maps it to the original Catweb block field order; block IDs and import JSON shape remain unchanged.
- Every previous fully-qualified function/event name remains accepted with its original positional order. Decompilation emits the v2 name and canonical parameter order.
- `if`, `for`, `on`, and `def` are language syntax, not callable API functions. `functions.define_function` is retained as a generic legacy top-level catalog block, while normal source uses `def`.
- Outputs are catalog fields labeled as output destinations (usually `variable`); they are not Python-style return values.

## Module index

| Module | Entries |
|---|---:|
| `audio` | 10 |
| `color` | 5 |
| `console` | 3 |
| `cookies` | 4 |
| `functions` | 4 |
| `input` | 7 |
| `logic` | 15 |
| `loops` | 4 |
| `math` | 6 |
| `navigation` | 3 |
| `network` | 6 |
| `objects` | 11 |
| `tables` | 10 |
| `text` | 7 |
| `time` | 7 |
| `ui` | 17 |
| `variables` | 7 |
| `events` | 11 |

## Callable functions

### Module `audio`

#### `audio.get_property`

**Syntax:** `audio.get_property(audio, property, result)`  
**Kind:** `action`  
**Source block:** `audio/95`  
**Catalog label:** Getof→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `audio` | `string` | input | `variable` (2) |
| 2 | `property` | `string` | input | `property` (1) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Getof→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    audio.get_property("resultado", "Visible", "resultado")
```

#### `audio.pause`

**Syntax:** `audio.pause(audio)`  
**Kind:** `action`  
**Source block:** `audio/75`  
**Catalog label:** Pause audio

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `audio` | `string` | input | `variable` (1) |

**Observed behavior:** Pausa la reproducción indicada. Etiqueta del catálogo: «Pause audio».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    audio.pause("resultado")
```

#### `audio.play`

**Syntax:** `audio.play(asset_id, result)`  
**Kind:** `action`  
**Source block:** `audio/5`  
**Catalog label:** Play audio→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `asset_id` | `string` | input | `id` (1) |
| 2 | `result` | `string` | output | `variable?` (2) |

**Observed behavior:** Inicia la reproducción indicada. Etiqueta del catálogo: «Play audio→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    audio.play("ID_EXISTENTE", "resultado")
```

#### `audio.play_looped`

**Syntax:** `audio.play_looped(asset_id, result)`  
**Kind:** `action`  
**Source block:** `audio/26`  
**Catalog label:** Play looped audio→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `asset_id` | `string` | input | `id` (1) |
| 2 | `result` | `string` | output | `variable?` (2) |

**Observed behavior:** Inicia la reproducción indicada. Etiqueta del catálogo: «Play looped audio→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    audio.play_looped("ID_EXISTENTE", "resultado")
```

#### `audio.resume`

**Syntax:** `audio.resume(audio)`  
**Kind:** `action`  
**Source block:** `audio/76`  
**Catalog label:** Resume audio

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `audio` | `string` | input | `variable` (1) |

**Observed behavior:** Reanuda la reproducción indicada. Etiqueta del catálogo: «Resume audio».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    audio.resume("resultado")
```

#### `audio.set_property`

**Syntax:** `audio.set_property(audio, property, value)`  
**Kind:** `action`  
**Source block:** `audio/94`  
**Catalog label:** Setofto

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `audio` | `string` | input | `variable` (2) |
| 2 | `property` | `string` | input | `property` (1) |
| 3 | `value` | `any` | input | `unnamed` (3) |

**Observed behavior:** Establece el valor o propiedad indicados. Etiqueta del catálogo: «Setofto».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    audio.set_property("resultado", "Visible", "valor")
```

#### `audio.set_speed`

**Syntax:** `audio.set_speed(audio, speed)`  
**Kind:** `action`  
**Source block:** `audio/77`  
**Catalog label:** Set speed ofto

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `audio` | `string` | input | `variable` (1) |
| 2 | `speed` | `number` | input | `unnamed` (2) |

**Observed behavior:** Establece el valor o propiedad indicados. Etiqueta del catálogo: «Set speed ofto».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    audio.set_speed("resultado", 1)
```

#### `audio.set_volume`

**Syntax:** `audio.set_volume(audio, volume)`  
**Kind:** `action`  
**Source block:** `audio/73`  
**Catalog label:** Set volume ofto

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `audio` | `string` | input | `variable` (1) |
| 2 | `volume` | `number` | input | `unnamed` (2) |

**Observed behavior:** Establece el valor o propiedad indicados. Etiqueta del catálogo: «Set volume ofto».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    audio.set_volume("resultado", 1)
```

#### `audio.stop`

**Syntax:** `audio.stop(audio)`  
**Kind:** `action`  
**Source block:** `audio/74`  
**Catalog label:** Stop audio

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `audio` | `string` | input | `variable` (1) |

**Observed behavior:** Detiene la reproducción indicada. Etiqueta del catálogo: «Stop audio».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    audio.stop("resultado")
```

#### `audio.stop_all`

**Syntax:** `audio.stop_all()`  
**Kind:** `action`  
**Source block:** `audio/7`  
**Catalog label:** Stop all audio

**Parameters:**

_None._

**Observed behavior:** Detiene la reproducción indicada. Etiqueta del catálogo: «Stop all audio».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    audio.stop_all()
```

### Module `color`

#### `color.hsv_to_hex`

**Syntax:** `color.hsv_to_hex(hsv, result)`  
**Kind:** `action`  
**Source block:** `color/122`  
**Catalog label:** Convertto hex →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `hsv` | `string` | input | `HSV` (1) |
| 2 | `result` | `string` | input | `variable` (2) |

**Observed behavior:** Convierte el valor de entrada al formato indicado por la etiqueta. Etiqueta del catálogo: «Convertto hex →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    color.hsv_to_hex("valor", "resultado")
```

#### `color.lerp`

**Syntax:** `color.lerp(start, end, amount, result)`  
**Kind:** `action`  
**Source block:** `color/123`  
**Catalog label:** Lerptoby→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `start` | `string` | input | `hex` (1) |
| 2 | `end` | `string` | input | `hex` (2) |
| 3 | `amount` | `number` | input | `alpha` (3) |
| 4 | `result` | `string` | output | `variable` (4) |

**Observed behavior:** Interpola entre los valores indicados usando el factor suministrado. Etiqueta del catálogo: «Lerptoby→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    color.lerp("valor", "valor", 1, "resultado")
```

#### `color.rgb_to_hex`

**Syntax:** `color.rgb_to_hex(rgb, result)`  
**Kind:** `action`  
**Source block:** `color/121`  
**Catalog label:** Convertto hex →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `rgb` | `string` | input | `RGB` (1) |
| 2 | `result` | `string` | input | `variable` (2) |

**Observed behavior:** Convierte el valor de entrada al formato indicado por la etiqueta. Etiqueta del catálogo: «Convertto hex →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    color.rgb_to_hex("valor", "resultado")
```

#### `color.to_hsv`

**Syntax:** `color.to_hsv(hex, result)`  
**Kind:** `action`  
**Source block:** `color/120`  
**Catalog label:** Convertto HSV →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `hex` | `string` | input | `hex` (1) |
| 2 | `result` | `string` | input | `variable` (2) |

**Observed behavior:** Convierte el valor de entrada al formato indicado por la etiqueta. Etiqueta del catálogo: «Convertto HSV →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    color.to_hsv("valor", "resultado")
```

#### `color.to_rgb`

**Syntax:** `color.to_rgb(hex, result)`  
**Kind:** `action`  
**Source block:** `color/119`  
**Catalog label:** Convertto RGB →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `hex` | `string` | input | `hex` (1) |
| 2 | `result` | `string` | input | `variable` (2) |

**Observed behavior:** Convierte el valor de entrada al formato indicado por la etiqueta. Etiqueta del catálogo: «Convertto RGB →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    color.to_rgb("valor", "resultado")
```

### Module `console`

#### `console.error`

**Syntax:** `console.error(message)`  
**Kind:** `action`  
**Source block:** `console/2`  
**Catalog label:** Error

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `message` | `any` | input | `unnamed` (1) |

**Observed behavior:** Emite el error indicado. Etiqueta del catálogo: «Error».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    console.error("valor")
```

#### `console.log`

**Syntax:** `console.log(message)`  
**Kind:** `action`  
**Source block:** `console/0`  
**Catalog label:** Log

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `message` | `any` | input | `unnamed` (1) |

**Observed behavior:** Registra el valor indicado; el destino exacto depende de la categoría. Etiqueta del catálogo: «Log».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    console.log("valor")
```

#### `console.warn`

**Syntax:** `console.warn(message)`  
**Kind:** `action`  
**Source block:** `console/1`  
**Catalog label:** Warn

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `message` | `any` | input | `unnamed` (1) |

**Observed behavior:** Emite el aviso indicado. Etiqueta del catálogo: «Warn».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    console.warn("valor")
```

### Module `cookies`

#### `cookies.add`

**Syntax:** `cookies.add(cookie, amount)`  
**Kind:** `action`  
**Source block:** `cookies/35`  
**Catalog label:** Increaseby

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `cookie` | `string` | input | `cookie` (1) |
| 2 | `amount` | `number` | input | `unnamed` (2) |

**Observed behavior:** Incrementa el valor indicado. Etiqueta del catálogo: «Increaseby».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    cookies.add("mi_cookie", 1)
```

#### `cookies.delete`

**Syntax:** `cookies.delete(cookie)`  
**Kind:** `action`  
**Source block:** `cookies/62`  
**Catalog label:** Delete cookie

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `cookie` | `string` | input | `cookie` (1) |

**Observed behavior:** Elimina el elemento indicado. Etiqueta del catálogo: «Delete cookie».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    cookies.delete("mi_cookie")
```

#### `cookies.get`

**Syntax:** `cookies.get(cookie, result)`  
**Kind:** `action`  
**Source block:** `cookies/36`  
**Catalog label:** Get cookie→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `cookie` | `string` | input | `cookie` (1) |
| 2 | `result` | `string` | output | `variable` (2) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get cookie→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    cookies.get("mi_cookie", "resultado")
```

#### `cookies.set`

**Syntax:** `cookies.set(cookie, value)`  
**Kind:** `action`  
**Source block:** `cookies/34`  
**Catalog label:** Setto

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `cookie` | `string` | input | `cookie` (1) |
| 2 | `value` | `any` | input | `unnamed` (2) |

**Observed behavior:** Establece el valor o propiedad indicados. Etiqueta del catálogo: «Setto».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    cookies.set("mi_cookie", "valor")
```

### Module `functions`

#### `functions.return`

**Syntax:** `functions.return(value)`  
**Kind:** `action`  
**Source block:** `functions/115`  
**Catalog label:** Return

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `value` | `string` | input | `any` (1) |

**Observed behavior:** Devuelve el valor del parámetro desde la función en ejecución. La categoría no especifica un tipo de retorno fijo.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
def ejemplo_catweb():
    functions.return("valor")
```

#### `functions.run`

**Syntax:** `functions.run(function, arguments, result)`  
**Kind:** `action`  
**Source block:** `functions/132`  
**Catalog label:** Run function→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `function` | `string` | input | `function` (1) |
| 2 | `arguments` | `tuple` | input | `unnamed` (2) |
| 3 | `result` | `string` | output | `variable?` (3) |

**Observed behavior:** Invoca la función nombrada y, si se configura, guarda el resultado en la variable de salida. La implementación interna no está disponible en este repositorio.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
def ejemplo_catweb():
    functions.return(10)

on load:
    functions.run("ejemplo_catweb", [], "resultado")
```

#### `functions.run_background`

**Syntax:** `functions.run_background(function, arguments)`  
**Kind:** `action`  
**Source block:** `functions/133`  
**Catalog label:** Run function in background

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `function` | `string` | input | `function` (1) |
| 2 | `arguments` | `tuple` | input | `unnamed` (2) |

**Observed behavior:** Invoca la función nombrada en segundo plano, según la etiqueta del catálogo. La implementación interna no está disponible en este repositorio.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
def ejemplo_catweb():
    functions.return(10)

on load:
    functions.run_background("ejemplo_catweb", [])
```

#### `functions.run_protected`

**Syntax:** `functions.run_protected(function, arguments, success, result)`  
**Kind:** `action`  
**Source block:** `functions/134`  
**Catalog label:** Run function protected→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `function` | `string` | input | `function` (1) |
| 2 | `arguments` | `tuple` | input | `unnamed` (2) |
| 3 | `success` | `string` | output | `success_variable?` (3) |
| 4 | `result` | `string` | output | `variable?` (4) |

**Observed behavior:** Invoca la función en modo protegido; los campos de salida se etiquetan como éxito y variable de retorno. La implementación interna no está disponible en este repositorio.

**Result:** No Catweb runtime return type is specified; output field(s) write to `success`, `result`.

**Example:**

```text
def ejemplo_catweb():
    functions.return(10)

on load:
    functions.run_protected("ejemplo_catweb", [], "correcto", "resultado")
```

### Module `input`

#### `input.cursor_position`

**Syntax:** `input.cursor_position(x, y)`  
**Kind:** `action`  
**Source block:** `input/85`  
**Catalog label:** Get cursor position →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `x` | `string` | input | `x` (1) |
| 2 | `y` | `string` | input | `y` (2) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get cursor position →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    input.cursor_position("valor", "valor")
```

#### `input.hide_cursor`

**Syntax:** `input.hide_cursor()`  
**Kind:** `action`  
**Source block:** `input/136`  
**Catalog label:** Hide mouse cursor

**Parameters:**

_None._

**Observed behavior:** Oculta el cursor según la etiqueta. Etiqueta del catálogo: «Hide mouse cursor».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    input.hide_cursor()
```

#### `input.key_down`

**Syntax:** `if input.key_down(key):`  
**Kind:** `condition`  
**Source block:** `input/82`  
**Catalog label:** Ifdown

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `key` | `key` | input | `unnamed` (1) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifdown»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if input.key_down("Space"):
        console.log("cuerpo del bloque")
```

#### `input.left_mouse_down`

**Syntax:** `if input.left_mouse_down():`  
**Kind:** `condition`  
**Source block:** `input/79`  
**Catalog label:** If left mouse button down

**Parameters:**

_None._

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «If left mouse button down»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if input.left_mouse_down():
        console.log("cuerpo del bloque")
```

#### `input.set_mouse_icon`

**Syntax:** `input.set_mouse_icon(icon_id)`  
**Kind:** `action`  
**Source block:** `input/135`  
**Catalog label:** Set mouse icon to

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `icon_id` | `id` | input | `id?` (1) |

**Observed behavior:** Establece el valor o propiedad indicados. Etiqueta del catálogo: «Set mouse icon to».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    input.set_mouse_icon("ID_EXISTENTE")
```

#### `input.show_cursor`

**Syntax:** `input.show_cursor()`  
**Kind:** `action`  
**Source block:** `input/137`  
**Catalog label:** Show mouse cursor

**Parameters:**

_None._

**Observed behavior:** Muestra el cursor según la etiqueta. Etiqueta del catálogo: «Show mouse cursor».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    input.show_cursor()
```

#### `input.viewport_size`

**Syntax:** `input.viewport_size(width, height)`  
**Kind:** `action`  
**Source block:** `input/84`  
**Catalog label:** Get viewport size →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `width` | `string` | input | `x` (1) |
| 2 | `height` | `string` | input | `y` (2) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get viewport size →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    input.viewport_size("valor", "valor")
```

### Module `logic`

#### `logic.and`

**Syntax:** `if logic.and(left, right):`  
**Kind:** `condition`  
**Source block:** `logic/44`  
**Catalog label:** IfAND

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `left` | `string` | input | `variable` (1) |
| 2 | `right` | `string` | input | `variable` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «IfAND»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.and("resultado", "resultado"):
        console.log("cuerpo del bloque")
```

#### `logic.contains`

**Syntax:** `if logic.contains(text, part):`  
**Kind:** `condition`  
**Source block:** `logic/37`  
**Catalog label:** Ifcontains

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `text` | `string` | input | `unnamed` (1) |
| 2 | `part` | `string` | input | `unnamed` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifcontains»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.contains("valor", "valor"):
        console.log("cuerpo del bloque")
```

#### `logic.equals`

**Syntax:** `if logic.equals(left, right):`  
**Kind:** `condition`  
**Source block:** `logic/18`  
**Catalog label:** Ifis equal to

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `left` | `string` | input | `any` (1) |
| 2 | `right` | `string` | input | `any` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifis equal to»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.equals("valor", "valor"):
        console.log("cuerpo del bloque")
```

#### `logic.exists`

**Syntax:** `if logic.exists(variable):`  
**Kind:** `condition`  
**Source block:** `logic/92`  
**Catalog label:** Ifexists

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `variable` | `string` | input | `variable` (1) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifexists»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.exists("resultado"):
        console.log("cuerpo del bloque")
```

#### `logic.greater_or_equal`

**Syntax:** `if logic.greater_or_equal(left, right):`  
**Kind:** `condition`  
**Source block:** `logic/125`  
**Catalog label:** Ifis greater or equal to

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `left` | `string` | input | `any` (1) |
| 2 | `right` | `string` | input | `any` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifis greater or equal to»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.greater_or_equal("valor", "valor"):
        console.log("cuerpo del bloque")
```

#### `logic.greater_than`

**Syntax:** `if logic.greater_than(left, right):`  
**Kind:** `condition`  
**Source block:** `logic/20`  
**Catalog label:** Ifis greater than

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `left` | `string` | input | `any` (1) |
| 2 | `right` | `string` | input | `any` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifis greater than»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.greater_than("valor", "valor"):
        console.log("cuerpo del bloque")
```

#### `logic.log`

**Syntax:** `logic.log(message)`  
**Kind:** `action`  
**Source block:** `logic/0`  
**Catalog label:** Log

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `message` | `any` | input | `unnamed` (1) |

**Observed behavior:** Registra el valor indicado por el bloque de la categoría logic. El catálogo no especifica dónde se muestra este registro.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    logic.log("valor")
```

#### `logic.lower_or_equal`

**Syntax:** `if logic.lower_or_equal(left, right):`  
**Kind:** `condition`  
**Source block:** `logic/126`  
**Catalog label:** Ifis lower or equal to

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `left` | `string` | input | `any` (1) |
| 2 | `right` | `string` | input | `any` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifis lower or equal to»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.lower_or_equal("valor", "valor"):
        console.log("cuerpo del bloque")
```

#### `logic.lower_than`

**Syntax:** `if logic.lower_than(left, right):`  
**Kind:** `condition`  
**Source block:** `logic/21`  
**Catalog label:** Ifis lower than

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `left` | `string` | input | `any` (1) |
| 2 | `right` | `string` | input | `any` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifis lower than»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.lower_than("valor", "valor"):
        console.log("cuerpo del bloque")
```

#### `logic.nor`

**Syntax:** `if logic.nor(left, right):`  
**Kind:** `condition`  
**Source block:** `logic/46`  
**Catalog label:** IfNOR

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `left` | `string` | input | `variable` (1) |
| 2 | `right` | `string` | input | `variable` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «IfNOR»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.nor("resultado", "resultado"):
        console.log("cuerpo del bloque")
```

#### `logic.not_contains`

**Syntax:** `if logic.not_contains(text, part):`  
**Kind:** `condition`  
**Source block:** `logic/38`  
**Catalog label:** Ifdoesn't contain

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `text` | `string` | input | `unnamed` (1) |
| 2 | `part` | `string` | input | `unnamed` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifdoesn't contain»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.not_contains("valor", "valor"):
        console.log("cuerpo del bloque")
```

#### `logic.not_equals`

**Syntax:** `if logic.not_equals(left, right):`  
**Kind:** `condition`  
**Source block:** `logic/19`  
**Catalog label:** Ifis not equal to

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `left` | `string` | input | `any` (1) |
| 2 | `right` | `string` | input | `any` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifis not equal to»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.not_equals("valor", "valor"):
        console.log("cuerpo del bloque")
```

#### `logic.not_exists`

**Syntax:** `if logic.not_exists(variable):`  
**Kind:** `condition`  
**Source block:** `logic/93`  
**Catalog label:** Ifdoesn't exist

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `variable` | `string` | input | `variable` (1) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifdoesn't exist»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.not_exists("resultado"):
        console.log("cuerpo del bloque")
```

#### `logic.or`

**Syntax:** `if logic.or(left, right):`  
**Kind:** `condition`  
**Source block:** `logic/45`  
**Catalog label:** IfOR

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `left` | `string` | input | `variable` (1) |
| 2 | `right` | `string` | input | `variable` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «IfOR»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.or("resultado", "resultado"):
        console.log("cuerpo del bloque")
```

#### `logic.xor`

**Syntax:** `if logic.xor(left, right):`  
**Kind:** `condition`  
**Source block:** `logic/47`  
**Catalog label:** IfXOR

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `left` | `string` | input | `variable` (1) |
| 2 | `right` | `string` | input | `variable` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «IfXOR»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if logic.xor("resultado", "resultado"):
        console.log("cuerpo del bloque")
```

### Module `loops`

#### `loops.break`

**Syntax:** `loops.break()`  
**Kind:** `action`  
**Source block:** `loops/24`  
**Catalog label:** Break

**Parameters:**

_None._

**Observed behavior:** Bloque llamado «Break», destinado al control de un ciclo; el repositorio no precisa sus reglas de salida.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    for loops.repeat_times(3):
        loops.break()
```

#### `loops.forever`

**Syntax:** `for loops.forever():`  
**Kind:** `loop`  
**Source block:** `loops/23`  
**Catalog label:** Repeat forever

**Parameters:**

_None._

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Repeat forever»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    for loops.forever():
        console.log("cuerpo del bloque")
```

#### `loops.log`

**Syntax:** `loops.log(message)`  
**Kind:** `action`  
**Source block:** `loops/0`  
**Catalog label:** Log

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `message` | `any` | input | `unnamed` (1) |

**Observed behavior:** Registra el valor indicado; el destino exacto depende de la categoría. Etiqueta del catálogo: «Log».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    loops.log("valor")
```

#### `loops.repeat`

**Syntax:** `for loops.repeat(count):`  
**Kind:** `loop`  
**Source block:** `loops/22`  
**Catalog label:** Repeattimes

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `count` | `number` | input | `unnamed` (1) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Repeattimes»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    for loops.repeat(1):
        console.log("cuerpo del bloque")
```

### Module `math`

#### `math.apply`

**Syntax:** `math.apply(function, arguments, result)`  
**Kind:** `action`  
**Source block:** `math-variables/114`  
**Catalog label:** Run math function→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `function` | `string` | input | `function​` (1) |
| 2 | `arguments` | `tuple` | input | `unnamed` (2) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Operación matemática indicada por la etiqueta «Run math function→». El catálogo no documenta límites, coerciones ni precisión.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    math.apply("valor", [], "resultado")
```

#### `math.ceil`

**Syntax:** `math.ceil(value)`  
**Kind:** `action`  
**Source block:** `math-variables/78`  
**Catalog label:** Ceil

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `value` | `string` | input | `variable` (1) |

**Observed behavior:** Operación matemática indicada por la etiqueta «Ceil». El catálogo no documenta límites, coerciones ni precisión.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    math.ceil("resultado")
```

#### `math.floor`

**Syntax:** `math.floor(value)`  
**Kind:** `action`  
**Source block:** `math-variables/17`  
**Catalog label:** Floor

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `value` | `string` | input | `variable` (1) |

**Observed behavior:** Operación matemática indicada por la etiqueta «Floor». El catálogo no documenta límites, coerciones ni precisión.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    math.floor("resultado")
```

#### `math.mod`

**Syntax:** `math.mod(dividend, divisor)`  
**Kind:** `action`  
**Source block:** `math-variables/41`  
**Catalog label:** modulo

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `dividend` | `string` | input | `variable` (1) |
| 2 | `divisor` | `number` | input | `unnamed` (2) |

**Observed behavior:** Operación matemática indicada por la etiqueta «modulo». El catálogo no documenta límites, coerciones ni precisión.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    math.mod("resultado", 1)
```

#### `math.pow`

**Syntax:** `math.pow(base, exponent)`  
**Kind:** `action`  
**Source block:** `math-variables/40`  
**Catalog label:** Raiseto the power of

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `base` | `string` | input | `variable` (1) |
| 2 | `exponent` | `number` | input | `unnamed` (2) |

**Observed behavior:** Operación matemática indicada por la etiqueta «Raiseto the power of». El catálogo no documenta límites, coerciones ni precisión.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    math.pow("resultado", 1)
```

#### `math.round`

**Syntax:** `math.round(value)`  
**Kind:** `action`  
**Source block:** `math-variables/16`  
**Catalog label:** Round

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `value` | `string` | input | `variable` (1) |

**Observed behavior:** Operación matemática indicada por la etiqueta «Round». El catálogo no documenta límites, coerciones ni precisión.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    math.round("resultado")
```

### Module `navigation`

#### `navigation.query_param`

**Syntax:** `navigation.query_param(name, result)`  
**Kind:** `action`  
**Source block:** `navigation/67`  
**Catalog label:** Get query string parameter→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `name` | `string` | input | `unnamed` (1) |
| 2 | `result` | `string` | output | `variable` (2) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get query string parameter→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    navigation.query_param("valor", "resultado")
```

#### `navigation.redirect`

**Syntax:** `navigation.redirect(url)`  
**Kind:** `action`  
**Source block:** `navigation/4`  
**Catalog label:** Redirect to

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `url` | `string` | input | `unnamed` (1) |

**Observed behavior:** Redirige a la URL indicada. Etiqueta del catálogo: «Redirect to».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    navigation.redirect("valor")
```

#### `navigation.url`

**Syntax:** `navigation.url(result)`  
**Kind:** `action`  
**Source block:** `navigation/117`  
**Catalog label:** Get URL →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `result` | `string` | input | `variable` (1) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get URL →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    navigation.url("resultado")
```

### Module `network`

#### `network.display_name`

**Syntax:** `network.display_name(result)`  
**Kind:** `action`  
**Source block:** `network/53`  
**Catalog label:** Get local display name →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `result` | `string` | input | `variable` (1) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get local display name →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    network.display_name("resultado")
```

#### `network.send_page`

**Syntax:** `network.send_page(message)`  
**Kind:** `action`  
**Source block:** `network/32`  
**Catalog label:** Broadcastacross page

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `message` | `string` | input | `message` (1) |

**Observed behavior:** Envía o difunde el mensaje indicado; la referencia no garantiza entrega ni especifica filtros. Etiqueta del catálogo: «Broadcastacross page».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    network.send_page("mensaje")
```

#### `network.send_site`

**Syntax:** `network.send_site(message)`  
**Kind:** `action`  
**Source block:** `network/33`  
**Catalog label:** Broadcastacross site

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `message` | `string` | input | `message` (1) |

**Observed behavior:** Envía o difunde el mensaje indicado; la referencia no garantiza entrega ni especifica filtros. Etiqueta del catálogo: «Broadcastacross site».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    network.send_site("mensaje")
```

#### `network.send_to_site`

**Syntax:** `network.send_to_site(page, message)`  
**Kind:** `action`  
**Source block:** `network/130`  
**Catalog label:** Broadcastcross-site to

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `page` | `string` | input | `page` (2) |
| 2 | `message` | `string` | input | `message` (1) |

**Observed behavior:** Envía o difunde el mensaje indicado; la referencia no garantiza entrega ni especifica filtros. Etiqueta del catálogo: «Broadcastcross-site to».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    network.send_to_site("pagina-destino", "mensaje")
```

#### `network.user_id`

**Syntax:** `network.user_id(result)`  
**Kind:** `action`  
**Source block:** `network/52`  
**Catalog label:** Get local user ID →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `result` | `string` | input | `variable` (1) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get local user ID →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    network.user_id("resultado")
```

#### `network.username`

**Syntax:** `network.username(result)`  
**Kind:** `action`  
**Source block:** `network/51`  
**Catalog label:** Get local username →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `result` | `string` | input | `variable` (1) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get local username →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    network.username("resultado")
```

### Module `objects`

#### `objects.children`

**Syntax:** `objects.children(parent, result)`  
**Kind:** `action`  
**Source block:** `hierarchy/101`  
**Catalog label:** Get children of→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `parent` | `object` | input | `unnamed` (1) |
| 2 | `result` | `string` | output | `table` (2) |

**Observed behavior:** Consulta o modifica la jerarquía de objetos según la etiqueta «Get children of→». La referencia no detalla los criterios de búsqueda.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    objects.children("ID_OBJETO_EXISTENTE", "mi_tabla")
```

#### `objects.descendants`

**Syntax:** `objects.descendants(ancestor, result)`  
**Kind:** `action`  
**Source block:** `hierarchy/102`  
**Catalog label:** Get descendants of→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `ancestor` | `object` | input | `unnamed` (1) |
| 2 | `result` | `string` | output | `table` (2) |

**Observed behavior:** Consulta o modifica la jerarquía de objetos según la etiqueta «Get descendants of→». La referencia no detalla los criterios de búsqueda.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    objects.descendants("ID_OBJETO_EXISTENTE", "mi_tabla")
```

#### `objects.find_ancestor`

**Syntax:** `objects.find_ancestor(object, name, result)`  
**Kind:** `action`  
**Source block:** `hierarchy/98`  
**Catalog label:** Find ancestor namedin→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (2) |
| 2 | `name` | `string` | input | `unnamed` (1) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Consulta o modifica la jerarquía de objetos según la etiqueta «Find ancestor namedin→». La referencia no detalla los criterios de búsqueda.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    objects.find_ancestor("ID_OBJETO_EXISTENTE", "valor", "resultado")
```

#### `objects.find_child`

**Syntax:** `objects.find_child(parent, name, result)`  
**Kind:** `action`  
**Source block:** `hierarchy/99`  
**Catalog label:** Find child namedin→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `parent` | `object` | input | `unnamed` (2) |
| 2 | `name` | `string` | input | `unnamed` (1) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Consulta o modifica la jerarquía de objetos según la etiqueta «Find child namedin→». La referencia no detalla los criterios de búsqueda.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    objects.find_child("ID_OBJETO_EXISTENTE", "valor", "resultado")
```

#### `objects.find_descendant`

**Syntax:** `objects.find_descendant(ancestor, name, result)`  
**Kind:** `action`  
**Source block:** `hierarchy/100`  
**Catalog label:** Find descendant namedin→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `ancestor` | `object` | input | `unnamed` (2) |
| 2 | `name` | `string` | input | `unnamed` (1) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Consulta o modifica la jerarquía de objetos según la etiqueta «Find descendant namedin→». La referencia no detalla los criterios de búsqueda.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    objects.find_descendant("ID_OBJETO_EXISTENTE", "valor", "resultado")
```

#### `objects.is_ancestor`

**Syntax:** `if objects.is_ancestor(ancestor, object):`  
**Kind:** `condition`  
**Source block:** `hierarchy/103`  
**Catalog label:** Ifis ancestor of

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `ancestor` | `object` | input | `unnamed` (1) |
| 2 | `object` | `object` | input | `unnamed` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifis ancestor of»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if objects.is_ancestor("ID_OBJETO_EXISTENTE", "ID_OBJETO_EXISTENTE"):
        console.log("cuerpo del bloque")
```

#### `objects.is_child`

**Syntax:** `if objects.is_child(child, parent):`  
**Kind:** `condition`  
**Source block:** `hierarchy/104`  
**Catalog label:** Ifis child of

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `child` | `object` | input | `unnamed` (1) |
| 2 | `parent` | `object` | input | `unnamed` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifis child of»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if objects.is_child("ID_OBJETO_EXISTENTE", "ID_OBJETO_EXISTENTE"):
        console.log("cuerpo del bloque")
```

#### `objects.is_descendant`

**Syntax:** `if objects.is_descendant(descendant, ancestor):`  
**Kind:** `condition`  
**Source block:** `hierarchy/105`  
**Catalog label:** Ifis descendant of

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `descendant` | `object` | input | `unnamed` (1) |
| 2 | `ancestor` | `object` | input | `unnamed` (2) |

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «Ifis descendant of»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if objects.is_descendant("ID_OBJETO_EXISTENTE", "ID_OBJETO_EXISTENTE"):
        console.log("cuerpo del bloque")
```

#### `objects.log`

**Syntax:** `objects.log(message)`  
**Kind:** `action`  
**Source block:** `hierarchy/0`  
**Catalog label:** Log

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `message` | `any` | input | `unnamed` (1) |

**Observed behavior:** Consulta o modifica la jerarquía de objetos según la etiqueta «Log». La referencia no detalla los criterios de búsqueda.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    objects.log("valor")
```

#### `objects.parent`

**Syntax:** `objects.parent(object, result)`  
**Kind:** `action`  
**Source block:** `hierarchy/97`  
**Catalog label:** Get parent of→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (1) |
| 2 | `result` | `string` | output | `variable` (2) |

**Observed behavior:** Consulta o modifica la jerarquía de objetos según la etiqueta «Get parent of→». La referencia no detalla los criterios de búsqueda.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    objects.parent("ID_OBJETO_EXISTENTE", "resultado")
```

#### `objects.set_parent`

**Syntax:** `objects.set_parent(child, parent)`  
**Kind:** `action`  
**Source block:** `hierarchy/58`  
**Catalog label:** Parentunder

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `child` | `object` | input | `unnamed` (1) |
| 2 | `parent` | `object` | input | `unnamed` (2) |

**Observed behavior:** Consulta o modifica la jerarquía de objetos según la etiqueta «Parentunder». La referencia no detalla los criterios de búsqueda.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    objects.set_parent("ID_OBJETO_EXISTENTE", "ID_OBJETO_EXISTENTE")
```

### Module `tables`

#### `tables.create`

**Syntax:** `tables.create(table)`  
**Kind:** `action`  
**Source block:** `tables/54`  
**Catalog label:** Create table

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `table` | `string` | input | `table` (1) |

**Observed behavior:** Crea el elemento indicado. Etiqueta del catálogo: «Create table».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    tables.create("mi_tabla")
```

#### `tables.delete`

**Syntax:** `tables.delete(table, key)`  
**Kind:** `action`  
**Source block:** `tables/90`  
**Catalog label:** Delete entryof

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `table` | `string` | input | `table` (2) |
| 2 | `key` | `string` | input | `entry` (1) |

**Observed behavior:** Elimina el elemento indicado. Etiqueta del catálogo: «Delete entryof».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    tables.delete("mi_tabla", "clave")
```

#### `tables.each`

**Syntax:** `for tables.each(table):`  
**Kind:** `loop`  
**Source block:** `tables/113`  
**Catalog label:** Iterate through({l!index},{l!value})

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `table` | `string` | input | `table` (1) |

**Observed behavior:** Recorre la tabla indicada y expone el índice actual como {l!index} y el valor actual como {l!value}; esos nombres constan en la plantilla del catálogo.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    for tables.each("mi_tabla"):
        console.log("cuerpo del bloque")
```

#### `tables.get`

**Syntax:** `tables.get(table, key, result)`  
**Kind:** `action`  
**Source block:** `tables/56`  
**Catalog label:** Get entryof→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `table` | `string` | input | `table` (2) |
| 2 | `key` | `string` | input | `entry` (1) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get entryof→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    tables.get("mi_tabla", "clave", "resultado")
```

#### `tables.insert`

**Syntax:** `tables.insert(table, index, value)`  
**Kind:** `action`  
**Source block:** `tables/89`  
**Catalog label:** Insertat positionof

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `table` | `string` | input | `array` (3) |
| 2 | `index` | `number` | input | `number?` (2) |
| 3 | `value` | `string` | input | `any` (1) |

**Observed behavior:** Inserta un valor en la posición indicada. Etiqueta del catálogo: «Insertat positionof».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    tables.insert("mi_arreglo", 1, "valor")
```

#### `tables.join`

**Syntax:** `tables.join(table, separator, result)`  
**Kind:** `action`  
**Source block:** `tables/110`  
**Catalog label:** Joinusing→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `table` | `string` | input | `array` (1) |
| 2 | `separator` | `string` | input | `string` (2) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Une los elementos de la colección usando el separador indicado. Etiqueta del catálogo: «Joinusing→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    tables.join("mi_arreglo", ",", "resultado")
```

#### `tables.length`

**Syntax:** `tables.length(table, result)`  
**Kind:** `action`  
**Source block:** `tables/59`  
**Catalog label:** Get length of→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `table` | `string` | input | `array` (1) |
| 2 | `result` | `string` | output | `variable` (2) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get length of→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    tables.length("mi_arreglo", "resultado")
```

#### `tables.log`

**Syntax:** `tables.log(message)`  
**Kind:** `action`  
**Source block:** `tables/0`  
**Catalog label:** Log

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `message` | `any` | input | `unnamed` (1) |

**Observed behavior:** Registra el valor indicado; el destino exacto depende de la categoría. Etiqueta del catálogo: «Log».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    tables.log("valor")
```

#### `tables.remove`

**Syntax:** `tables.remove(table, index)`  
**Kind:** `action`  
**Source block:** `tables/91`  
**Catalog label:** Remove entry at positionof

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `table` | `string` | input | `array` (2) |
| 2 | `index` | `number` | input | `number?` (1) |

**Observed behavior:** Elimina la entrada indicada. Etiqueta del catálogo: «Remove entry at positionof».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    tables.remove("mi_arreglo", 1)
```

#### `tables.set`

**Syntax:** `tables.set(table, key, value)`  
**Kind:** `action`  
**Source block:** `tables/55`  
**Catalog label:** Set entryofto

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `table` | `string` | input | `table` (2) |
| 2 | `key` | `string` | input | `entry` (1) |
| 3 | `value` | `string` | input | `any` (3) |

**Observed behavior:** Establece el valor o propiedad indicados. Etiqueta del catálogo: «Set entryofto».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    tables.set("mi_tabla", "clave", "valor")
```

### Module `text`

#### `text.concat`

**Syntax:** `text.concat(first, second, result)`  
**Kind:** `action`  
**Source block:** `strings/109`  
**Catalog label:** Concatenatewith→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `first` | `string` | input | `unnamed` (1) |
| 2 | `second` | `string` | input | `unnamed` (2) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Concatena los valores indicados. Etiqueta del catálogo: «Concatenatewith→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    text.concat("valor", "valor", "resultado")
```

#### `text.length`

**Syntax:** `text.length(text, result)`  
**Kind:** `action`  
**Source block:** `strings/48`  
**Catalog label:** Get length of→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `text` | `string` | input | `unnamed` (1) |
| 2 | `result` | `string` | output | `variable` (2) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get length of→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    text.length("valor", "resultado")
```

#### `text.lower`

**Syntax:** `text.lower(text, result)`  
**Kind:** `action`  
**Source block:** `strings/69`  
**Catalog label:** Lower→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `text` | `string` | input | `unnamed` (1) |
| 2 | `result` | `string` | output | `variable` (2) |

**Observed behavior:** Convierte el texto a minúsculas. Etiqueta del catálogo: «Lower→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    text.lower("valor", "resultado")
```

#### `text.replace`

**Syntax:** `text.replace(text, search, replacement)`  
**Kind:** `action`  
**Source block:** `strings/43`  
**Catalog label:** Replaceinby

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `text` | `string` | input | `variable` (2) |
| 2 | `search` | `string` | input | `unnamed` (1) |
| 3 | `replacement` | `string` | input | `unnamed` (3) |

**Observed behavior:** Reemplaza texto según los argumentos indicados. Etiqueta del catálogo: «Replaceinby».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    text.replace("resultado", "valor", "valor")
```

#### `text.slice`

**Syntax:** `text.slice(text, start, end)`  
**Kind:** `action`  
**Source block:** `strings/42`  
**Catalog label:** Sub-

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `text` | `string` | input | `variable` (1) |
| 2 | `start` | `number` | input | `start` (2) |
| 3 | `end` | `number` | input | `end` (3) |

**Observed behavior:** Extrae el fragmento indicado según los límites suministrados. Etiqueta del catálogo: «Sub-».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    text.slice("resultado", 1, 1)
```

#### `text.split`

**Syntax:** `text.split(text, separator, table)`  
**Kind:** `action`  
**Source block:** `strings/57`  
**Catalog label:** Split→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `text` | `string` | input | `unnamed` (1) |
| 2 | `separator` | `string` | input | `separator` (2) |
| 3 | `table` | `string` | output | `table` (3) |

**Observed behavior:** Divide el texto usando el separador indicado y guarda el resultado en el destino. Etiqueta del catálogo: «Split→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `table`.

**Example:**

```text
on load:
    text.split("valor", " ", "mi_tabla")
```

#### `text.upper`

**Syntax:** `text.upper(text, result)`  
**Kind:** `action`  
**Source block:** `strings/70`  
**Catalog label:** Upper→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `text` | `string` | input | `unnamed` (1) |
| 2 | `result` | `string` | output | `variable` (2) |

**Observed behavior:** Convierte el texto a mayúsculas. Etiqueta del catálogo: «Upper→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    text.upper("valor", "resultado")
```

### Module `time`

#### `time.format_now`

**Syntax:** `time.format_now(format, result)`  
**Kind:** `action`  
**Source block:** `time/71`  
**Catalog label:** Format current date/time→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `format` | `string` | input | `format` (1) |
| 2 | `result` | `string` | output | `variable` (2) |

**Observed behavior:** Formatea la fecha/hora indicada según el patrón suministrado. Etiqueta del catálogo: «Format current date/time→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    time.format_now("yyyy-MM-dd", "resultado")
```

#### `time.format_unix`

**Syntax:** `time.format_unix(timestamp, format, result)`  
**Kind:** `action`  
**Source block:** `time/72`  
**Catalog label:** Format from unix→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `timestamp` | `number` | input | `unnamed` (1) |
| 2 | `format` | `string` | input | `format` (2) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Formatea la fecha/hora indicada según el patrón suministrado. Etiqueta del catálogo: «Format from unix→».

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    time.format_unix(1, "yyyy-MM-dd", "resultado")
```

#### `time.server_unix`

**Syntax:** `time.server_unix(result)`  
**Kind:** `action`  
**Source block:** `time/116`  
**Catalog label:** Get server unix timestamp →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `result` | `string` | input | `variable` (1) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get server unix timestamp →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    time.server_unix("resultado")
```

#### `time.tick`

**Syntax:** `time.tick(result)`  
**Kind:** `action`  
**Source block:** `time/83`  
**Catalog label:** Get tick →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `result` | `string` | input | `variable` (1) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get tick →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    time.tick("resultado")
```

#### `time.timezone`

**Syntax:** `time.timezone(result)`  
**Kind:** `action`  
**Source block:** `time/118`  
**Catalog label:** Get timezone →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `result` | `string` | input | `variable` (1) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get timezone →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    time.timezone("resultado")
```

#### `time.unix`

**Syntax:** `time.unix(result)`  
**Kind:** `action`  
**Source block:** `time/68`  
**Catalog label:** Get unix timestamp →

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `result` | `string` | input | `variable` (1) |

**Observed behavior:** Obtiene o lee el dato indicado; si el bloque muestra una salida, la escribe en el destino correspondiente. Etiqueta del catálogo: «Get unix timestamp →».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    time.unix("resultado")
```

#### `time.wait`

**Syntax:** `time.wait(seconds)`  
**Kind:** `action`  
**Source block:** `logic/3`  
**Catalog label:** Waitseconds

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `seconds` | `number` | input | `unnamed` (1) |

**Observed behavior:** Espera la cantidad de segundos indicada; la plantilla no documenta límites ni precisión.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    time.wait(1)
```

### Module `ui`

#### `ui.asset_info`

**Syntax:** `ui.asset_info(info, asset_id, result)`  
**Kind:** `action`  
**Source block:** `looks/129`  
**Catalog label:** Getof asset→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `info` | `string` | input | `info` (1) |
| 2 | `asset_id` | `string` | input | `id` (2) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Getof asset→». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    ui.asset_info("valor", "ID_EXISTENTE", "resultado")
```

#### `ui.attributes`

**Syntax:** `ui.attributes(object, result)`  
**Kind:** `action`  
**Source block:** `looks/140`  
**Catalog label:** Get all attributes of→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (1) |
| 2 | `result` | `string` | output | `table` (2) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Get all attributes of→». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    ui.attributes("ID_OBJETO_EXISTENTE", "mi_tabla")
```

#### `ui.dark_theme_enabled`

**Syntax:** `if ui.dark_theme_enabled():`  
**Kind:** `condition`  
**Source block:** `looks/108`  
**Catalog label:** If dark theme enabled

**Parameters:**

_None._

**Observed behavior:** Abre un bloque de control. La etiqueta del catálogo es «If dark theme enabled»; las acciones anidadas se ejecutan según esa condición o repetición.

**Result:** Control-flow block; it does not declare a direct return value.

**Example:**

```text
on load:
    if ui.dark_theme_enabled():
        console.log("cuerpo del bloque")
```

#### `ui.delete`

**Syntax:** `ui.delete(object)`  
**Kind:** `action`  
**Source block:** `looks/50`  
**Catalog label:** Delete

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (1) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Delete». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    ui.delete("ID_OBJETO_EXISTENTE")
```

#### `ui.duplicate`

**Syntax:** `ui.duplicate(object, result)`  
**Kind:** `action`  
**Source block:** `looks/49`  
**Catalog label:** Duplicate→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (1) |
| 2 | `result` | `string` | output | `variable?` (2) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Duplicate→». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    ui.duplicate("ID_OBJETO_EXISTENTE", "resultado")
```

#### `ui.get_attribute`

**Syntax:** `ui.get_attribute(object, name, result)`  
**Kind:** `action`  
**Source block:** `looks/139`  
**Catalog label:** Getof→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (2) |
| 2 | `name` | `string` | input | `attribute` (1) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Getof→». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    ui.get_attribute("ID_OBJETO_EXISTENTE", "mi_atributo", "resultado")
```

#### `ui.get_property`

**Syntax:** `ui.get_property(object, property, result)`  
**Kind:** `action`  
**Source block:** `looks/39`  
**Catalog label:** Getof→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (2) |
| 2 | `property` | `string` | input | `property` (1) |
| 3 | `result` | `string` | output | `variable` (3) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Getof→». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    ui.get_property("ID_OBJETO_EXISTENTE", "Visible", "resultado")
```

#### `ui.get_text`

**Syntax:** `ui.get_text(input, result)`  
**Kind:** `action`  
**Source block:** `looks/30`  
**Catalog label:** Get text from→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `input` | `object` | input | `input` (1) |
| 2 | `result` | `string` | output | `variable` (2) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Get text from→». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    ui.get_text("ID_OBJETO_EXISTENTE", "resultado")
```

#### `ui.hide`

**Syntax:** `ui.hide(object)`  
**Kind:** `action`  
**Source block:** `looks/8`  
**Catalog label:** Makeinvisible

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (1) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Makeinvisible». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    ui.hide("ID_OBJETO_EXISTENTE")
```

#### `ui.log`

**Syntax:** `ui.log(message)`  
**Kind:** `action`  
**Source block:** `looks/0`  
**Catalog label:** Log

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `message` | `any` | input | `unnamed` (1) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Log». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    ui.log("valor")
```

#### `ui.objects_at`

**Syntax:** `ui.objects_at(x, y, result)`  
**Kind:** `action`  
**Source block:** `looks/127`  
**Catalog label:** Get objects at position→

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `x` | `string` | input | `x​` (1) |
| 2 | `y` | `string` | input | `y​` (2) |
| 3 | `result` | `string` | output | `array` (3) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Get objects at position→». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** No Catweb runtime return type is specified; output field(s) write to `result`.

**Example:**

```text
on load:
    ui.objects_at("valor", "valor", "mi_arreglo")
```

#### `ui.set_attribute`

**Syntax:** `ui.set_attribute(object, name, value)`  
**Kind:** `action`  
**Source block:** `looks/138`  
**Catalog label:** Setofto

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (2) |
| 2 | `name` | `string` | input | `attribute` (1) |
| 3 | `value` | `any` | input | `any?` (3) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Setofto». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    ui.set_attribute("ID_OBJETO_EXISTENTE", "mi_atributo", "valor")
```

#### `ui.set_image`

**Syntax:** `ui.set_image(object, image_id)`  
**Kind:** `action`  
**Source block:** `looks/106`  
**Catalog label:** Setimage to

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (1) |
| 2 | `image_id` | `id` | input | `unnamed` (2) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Setimage to». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    ui.set_image("ID_OBJETO_EXISTENTE", "ID_EXISTENTE")
```

#### `ui.set_property`

**Syntax:** `ui.set_property(object, property, value)`  
**Kind:** `action`  
**Source block:** `looks/31`  
**Catalog label:** Setofto

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (2) |
| 2 | `property` | `string` | input | `property` (1) |
| 3 | `value` | `any` | input | `unnamed` (3) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Setofto». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    ui.set_property("ID_OBJETO_EXISTENTE", "Visible", "valor")
```

#### `ui.set_text`

**Syntax:** `ui.set_text(object, text)`  
**Kind:** `action`  
**Source block:** `looks/10`  
**Catalog label:** Settext to

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (1) |
| 2 | `text` | `string` | input | `unnamed` (2) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Settext to». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    ui.set_text("ID_OBJETO_EXISTENTE", "valor")
```

#### `ui.show`

**Syntax:** `ui.show(object)`  
**Kind:** `action`  
**Source block:** `looks/9`  
**Catalog label:** Makevisible

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (1) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Makevisible». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    ui.show("ID_OBJETO_EXISTENTE")
```

#### `ui.tween`

**Syntax:** `ui.tween(object, property, value, duration, style, direction)`  
**Kind:** `action`  
**Source block:** `looks/88`  
**Catalog label:** Tweenofto-

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (2) |
| 2 | `property` | `string` | input | `property` (1) |
| 3 | `value` | `any` | input | `unnamed` (3) |
| 4 | `duration` | `number` | input | `time` (4) |
| 5 | `style` | `string` | input | `style` (5) |
| 6 | `direction` | `string` | input | `direction` (6) |

**Observed behavior:** Lee o modifica una propiedad, atributo o estado de interfaz según la etiqueta «Tweenofto-». El catálogo no documenta el conjunto completo de propiedades válidas.

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    ui.tween("ID_OBJETO_EXISTENTE", "Visible", "valor", 1, "valor", "valor")
```

### Module `variables`

#### `variables.add`

**Syntax:** `variables.add(variable, amount)`  
**Kind:** `action`  
**Source block:** `math-variables/12`  
**Catalog label:** Increaseby

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `variable` | `string` | input | `variable` (1) |
| 2 | `amount` | `number` | input | `unnamed` (2) |

**Observed behavior:** Modifica o elimina la variable indicada; la operación específica es «Increaseby».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    variables.add("resultado", 1)
```

#### `variables.delete`

**Syntax:** `variables.delete(variable)`  
**Kind:** `action`  
**Source block:** `math-variables/96`  
**Catalog label:** Delete

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `variable` | `string` | input | `variable` (1) |

**Observed behavior:** Modifica o elimina la variable indicada; la operación específica es «Delete».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    variables.delete("resultado")
```

#### `variables.divide`

**Syntax:** `variables.divide(variable, amount)`  
**Kind:** `action`  
**Source block:** `math-variables/15`  
**Catalog label:** Divideby

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `variable` | `string` | input | `variable` (1) |
| 2 | `amount` | `number` | input | `unnamed` (2) |

**Observed behavior:** Modifica o elimina la variable indicada; la operación específica es «Divideby».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    variables.divide("resultado", 1)
```

#### `variables.multiply`

**Syntax:** `variables.multiply(variable, amount)`  
**Kind:** `action`  
**Source block:** `math-variables/14`  
**Catalog label:** Multiplyby

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `variable` | `string` | input | `variable` (1) |
| 2 | `amount` | `number` | input | `unnamed` (2) |

**Observed behavior:** Modifica o elimina la variable indicada; la operación específica es «Multiplyby».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    variables.multiply("resultado", 1)
```

#### `variables.random`

**Syntax:** `variables.random(variable, minimum, maximum)`  
**Kind:** `action`  
**Source block:** `math-variables/27`  
**Catalog label:** Setto random-

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `variable` | `string` | input | `var` (1) |
| 2 | `minimum` | `number` | input | `n` (2) |
| 3 | `maximum` | `number` | input | `n` (3) |

**Observed behavior:** Modifica o elimina la variable indicada; la operación específica es «Setto random-».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    variables.random("valor", 1, 1)
```

#### `variables.set`

**Syntax:** `variables.set(variable, value)`  
**Kind:** `action`  
**Source block:** `math-variables/11`  
**Catalog label:** Setto

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `variable` | `string` | input | `variable` (1) |
| 2 | `value` | `string` | input | `any` (2) |

**Observed behavior:** Modifica o elimina la variable indicada; la operación específica es «Setto».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    variables.set("resultado", "valor")
```

#### `variables.subtract`

**Syntax:** `variables.subtract(variable, amount)`  
**Kind:** `action`  
**Source block:** `math-variables/13`  
**Catalog label:** Decreaseby

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `variable` | `string` | input | `variable` (1) |
| 2 | `amount` | `number` | input | `unnamed` (2) |

**Observed behavior:** Modifica o elimina la variable indicada; la operación específica es «Decreaseby».

**Result:** The catalog template declares no output field or direct return value.

**Example:**

```text
on load:
    variables.subtract("resultado", 1)
```

## Events

### `on load`

**Syntax:** `on load:`  
**Source block:** `events/0`  
**Catalog label:** When website loaded...

**Parameters:**

_None._

**Behavior:** Se activa cuando carga el sitio.

**Example:**

```text
on load:
    console.log("evento")
```

### `on button_press`

**Syntax:** `on button_press(button):`  
**Source block:** `events/1`  
**Catalog label:** Whenpressed...

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `button` | `object` | input | `button` (1) |

**Behavior:** Se activa cuando se presiona el botón seleccionado.

**Example:**

```text
on button_press("ID_OBJETO_EXISTENTE"):
    console.log("evento")
```

### `on key_press`

**Syntax:** `on key_press(key):`  
**Source block:** `events/2`  
**Catalog label:** Whenpressed...

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `key` | `key` | input | `unnamed` (1) |

**Behavior:** Se activa al presionar la tecla seleccionada.

**Example:**

```text
on key_press("Space"):
    console.log("evento")
```

### `on mouse_enter`

**Syntax:** `on mouse_enter(object):`  
**Source block:** `events/3`  
**Catalog label:** When mouse enters...

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (1) |

**Behavior:** Se activa cuando el cursor entra en el objeto seleccionado.

**Example:**

```text
on mouse_enter("ID_OBJETO_EXISTENTE"):
    console.log("evento")
```

### `on mouse_down`

**Syntax:** `on mouse_down(object):`  
**Source block:** `events/11`  
**Catalog label:** When mouse down on...

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `button` (1) |

**Behavior:** Se activa cuando se presiona el botón del mouse sobre el objeto seleccionado.

**Example:**

```text
on mouse_down("ID_OBJETO_EXISTENTE"):
    console.log("evento")
```

### `on avatar_item_purchased`

**Syntax:** `on avatar_item_purchased(item):`  
**Source block:** `events/7`  
**Catalog label:** Whenbought...

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `item` | `object` | input | `avataritem` (1) |

**Behavior:** Se activa cuando se compra el avatar item seleccionado.

**Example:**

```text
on avatar_item_purchased("ID_OBJETO_EXISTENTE"):
    console.log("evento")
```

### `on input_submit`

**Syntax:** `on input_submit(input):`  
**Source block:** `events/8`  
**Catalog label:** Whensubmitted...

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `input` | `object` | input | `input` (1) |

**Behavior:** Se activa al enviar el input seleccionado.

**Example:**

```text
on input_submit("ID_OBJETO_EXISTENTE"):
    console.log("evento")
```

### `on message_received`

**Syntax:** `on message_received:`  
**Source block:** `events/9`  
**Catalog label:** When message received...

**Parameters:**

_None._

**Behavior:** Se activa al recibir un mensaje. Variables locales documentadas: l.messageContent, l.messageSenderId y l.messageSenderName (según info.md).

**Example:**

```text
on message_received:
    console.log("evento")
```

### `on object_change`

**Syntax:** `on object_change(object):`  
**Source block:** `events/10`  
**Catalog label:** Whenchanged...

**Parameters:**

| Position | Parameter | Type | Direction | Source field (catalog position) |
|---:|---|---|---|---|
| 1 | `object` | `object` | input | `unnamed` (1) |

**Behavior:** Se activa al cambiar el objeto seleccionado. Variables locales documentadas: l.changedProperty (según info.md).

**Example:**

```text
on object_change("ID_OBJETO_EXISTENTE"):
    console.log("evento")
```

### `on site_message_received`

**Syntax:** `on site_message_received:`  
**Source block:** `events/14`  
**Catalog label:** When cross-site message received...

**Parameters:**

_None._

**Behavior:** Se activa al recibir un mensaje entre sitios. Variables locales documentadas: l.sourceDomain, l.messageContent, l.messageSenderId y l.messageSenderName (según info.md).

**Example:**

```text
on site_message_received:
    console.log("evento")
```

### `on donation_complete`

**Syntax:** `on donation_complete:`  
**Source block:** `events/15`  
**Catalog label:** When donation completed...

**Parameters:**

_None._

**Behavior:** Se activa al completarse una donación. Variables locales documentadas: l.identifier, l.robuxAmount y l.purchasedNow (según info.md).

**Example:**

```text
on donation_complete:
    console.log("evento")
```

## Language declaration

### `def <function_name>([<parameter_name>, ...]):`

This maps to the catalog block `functions/6`. It declares a custom function and is not a callable function. Use `def name():` for a function without parameters; parameter names appear directly in the header and correspond to Catweb's function arguments. Legacy generic form `functions.define_function` / `top functions/6 [...]` remains supported.

**Example:**

```text
def api_v2_example():
    functions.return("done")
```
