# Catweb API v1 to v2 migration

All old canonical names remain compiler aliases. A legacy call is interpreted in the original catalog field order; canonical calls use the v2 parameter order. The mapping below lists every inventory entry.

## Callable functions

| Old name | API v2 name | v2 syntax | Mapping |
|---|---|---|---|
| `audio.get_of` | `audio.get_property` | `audio.get_property(audio, property, result)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `audio.pause_audio` | `audio.pause` | `audio.pause(audio)` | identity; legacy alias retained |
| `audio.play_audio` | `audio.play` | `audio.play(asset_id, result)` | identity; legacy alias retained |
| `audio.play_looped_audio` | `audio.play_looped` | `audio.play_looped(asset_id, result)` | identity; legacy alias retained |
| `audio.resume_audio` | `audio.resume` | `audio.resume(audio)` | identity; legacy alias retained |
| `audio.set_of_to` | `audio.set_property` | `audio.set_property(audio, property, value)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `audio.set_speed_of_to` | `audio.set_speed` | `audio.set_speed(audio, speed)` | identity; legacy alias retained |
| `audio.set_volume_of_to` | `audio.set_volume` | `audio.set_volume(audio, volume)` | identity; legacy alias retained |
| `audio.stop_audio` | `audio.stop` | `audio.stop(audio)` | identity; legacy alias retained |
| `audio.stop_all_audio` | `audio.stop_all` | `audio.stop_all()` | identity; legacy alias retained |
| `color.hex_from_hsv` | `color.hsv_to_hex` | `color.hsv_to_hex(hsv, result)` | identity; legacy alias retained |
| `color.lerp_to_by` | `color.lerp` | `color.lerp(start, end, amount, result)` | identity; legacy alias retained |
| `color.hex_from_rgb` | `color.rgb_to_hex` | `color.rgb_to_hex(rgb, result)` | identity; legacy alias retained |
| `color.convert_to_hsv` | `color.to_hsv` | `color.to_hsv(hex, result)` | identity; legacy alias retained |
| `color.convert_to_rgb` | `color.to_rgb` | `color.to_rgb(hex, result)` | identity; legacy alias retained |
| `console.error` | `console.error` | `console.error(message)` | identity; legacy alias retained |
| `console.log` | `console.log` | `console.log(message)` | identity; legacy alias retained |
| `console.warn` | `console.warn` | `console.warn(message)` | identity; legacy alias retained |
| `cookies.increase_by` | `cookies.add` | `cookies.add(cookie, amount)` | identity; legacy alias retained |
| `cookies.delete_cookie` | `cookies.delete` | `cookies.delete(cookie)` | identity; legacy alias retained |
| `cookies.get_cookie` | `cookies.get` | `cookies.get(cookie, result)` | identity; legacy alias retained |
| `cookies.set_to` | `cookies.set` | `cookies.set(cookie, value)` | identity; legacy alias retained |
| `functions.return` | `functions.return` | `functions.return(value)` | identity; legacy alias retained |
| `functions.run_function` | `functions.run` | `functions.run(function, arguments, result)` | identity; legacy alias retained |
| `functions.run_function_in_background` | `functions.run_background` | `functions.run_background(function, arguments)` | identity; legacy alias retained |
| `functions.run_function_protected` | `functions.run_protected` | `functions.run_protected(function, arguments, success, result)` | identity; legacy alias retained |
| `input.get_cursor_position` | `input.cursor_position` | `input.cursor_position(x, y)` | identity; legacy alias retained |
| `input.hide_mouse_cursor` | `input.hide_cursor` | `input.hide_cursor()` | identity; legacy alias retained |
| `input.down` | `input.key_down` | `if input.key_down(key):` | identity; legacy alias retained |
| `input.left_mouse_button_down` | `input.left_mouse_down` | `if input.left_mouse_down():` | identity; legacy alias retained |
| `input.set_mouse_icon_to` | `input.set_mouse_icon` | `input.set_mouse_icon(icon_id)` | identity; legacy alias retained |
| `input.show_mouse_cursor` | `input.show_cursor` | `input.show_cursor()` | identity; legacy alias retained |
| `input.get_viewport_size` | `input.viewport_size` | `input.viewport_size(width, height)` | identity; legacy alias retained |
| `logic.and` | `logic.and` | `if logic.and(left, right):` | identity; legacy alias retained |
| `logic.contains` | `logic.contains` | `if logic.contains(text, part):` | identity; legacy alias retained |
| `logic.is_equal_to` | `logic.equals` | `if logic.equals(left, right):` | identity; legacy alias retained |
| `logic.exists` | `logic.exists` | `if logic.exists(variable):` | identity; legacy alias retained |
| `logic.is_greater_or_equal_to` | `logic.greater_or_equal` | `if logic.greater_or_equal(left, right):` | identity; legacy alias retained |
| `logic.is_greater_than` | `logic.greater_than` | `if logic.greater_than(left, right):` | identity; legacy alias retained |
| `logic.log` | `logic.log` | `logic.log(message)` | identity; legacy alias retained |
| `logic.is_lower_or_equal_to` | `logic.lower_or_equal` | `if logic.lower_or_equal(left, right):` | identity; legacy alias retained |
| `logic.is_lower_than` | `logic.lower_than` | `if logic.lower_than(left, right):` | identity; legacy alias retained |
| `logic.nor` | `logic.nor` | `if logic.nor(left, right):` | identity; legacy alias retained |
| `logic.doesn_t_contain` | `logic.not_contains` | `if logic.not_contains(text, part):` | identity; legacy alias retained |
| `logic.is_not_equal_to` | `logic.not_equals` | `if logic.not_equals(left, right):` | identity; legacy alias retained |
| `logic.doesn_t_exist` | `logic.not_exists` | `if logic.not_exists(variable):` | identity; legacy alias retained |
| `logic.or` | `logic.or` | `if logic.or(left, right):` | identity; legacy alias retained |
| `logic.xor` | `logic.xor` | `if logic.xor(left, right):` | identity; legacy alias retained |
| `loops.break` | `loops.break` | `loops.break()` | identity; legacy alias retained |
| `loops.repeat_forever` | `loops.forever` | `for loops.forever():` | identity; legacy alias retained |
| `loops.log` | `loops.log` | `loops.log(message)` | identity; legacy alias retained |
| `loops.repeat_times` | `loops.repeat` | `for loops.repeat(count):` | identity; legacy alias retained |
| `math.apply` | `math.apply` | `math.apply(function, arguments, result)` | identity; legacy alias retained |
| `math.ceil` | `math.ceil` | `math.ceil(value)` | identity; legacy alias retained |
| `math.floor` | `math.floor` | `math.floor(value)` | identity; legacy alias retained |
| `math.modulo` | `math.mod` | `math.mod(dividend, divisor)` | identity; legacy alias retained |
| `math.power` | `math.pow` | `math.pow(base, exponent)` | identity; legacy alias retained |
| `math.round` | `math.round` | `math.round(value)` | identity; legacy alias retained |
| `navigation.get_query_string_parameter` | `navigation.query_param` | `navigation.query_param(name, result)` | identity; legacy alias retained |
| `navigation.redirect_to` | `navigation.redirect` | `navigation.redirect(url)` | identity; legacy alias retained |
| `navigation.get_url` | `navigation.url` | `navigation.url(result)` | identity; legacy alias retained |
| `network.get_local_display_name` | `network.display_name` | `network.display_name(result)` | identity; legacy alias retained |
| `network.broadcast_across_page` | `network.send_page` | `network.send_page(message)` | identity; legacy alias retained |
| `network.broadcast_across_site` | `network.send_site` | `network.send_site(message)` | identity; legacy alias retained |
| `network.broadcast_cross_site_to` | `network.send_to_site` | `network.send_to_site(page, message)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `network.get_local_user_id` | `network.user_id` | `network.user_id(result)` | identity; legacy alias retained |
| `network.get_local_username` | `network.username` | `network.username(result)` | identity; legacy alias retained |
| `objects.get_children_of` | `objects.children` | `objects.children(parent, result)` | identity; legacy alias retained |
| `objects.get_descendants_of` | `objects.descendants` | `objects.descendants(ancestor, result)` | identity; legacy alias retained |
| `objects.find_ancestor_named_in` | `objects.find_ancestor` | `objects.find_ancestor(object, name, result)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `objects.find_child_named_in` | `objects.find_child` | `objects.find_child(parent, name, result)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `objects.find_descendant_named_in` | `objects.find_descendant` | `objects.find_descendant(ancestor, name, result)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `objects.is_ancestor_of` | `objects.is_ancestor` | `if objects.is_ancestor(ancestor, object):` | identity; legacy alias retained |
| `objects.is_child_of` | `objects.is_child` | `if objects.is_child(child, parent):` | identity; legacy alias retained |
| `objects.is_descendant_of` | `objects.is_descendant` | `if objects.is_descendant(descendant, ancestor):` | identity; legacy alias retained |
| `objects.log` | `objects.log` | `objects.log(message)` | identity; legacy alias retained |
| `objects.get_parent_of` | `objects.parent` | `objects.parent(object, result)` | identity; legacy alias retained |
| `objects.parent_under` | `objects.set_parent` | `objects.set_parent(child, parent)` | identity; legacy alias retained |
| `tables.create_table` | `tables.create` | `tables.create(table)` | identity; legacy alias retained |
| `tables.delete_entry_of` | `tables.delete` | `tables.delete(table, key)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `tables.iterate_through_l_index_l_value` | `tables.each` | `for tables.each(table):` | identity; legacy alias retained |
| `tables.get_entry_of` | `tables.get` | `tables.get(table, key, result)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `tables.insert_at_position_of` | `tables.insert` | `tables.insert(table, index, value)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `tables.join_using` | `tables.join` | `tables.join(table, separator, result)` | identity; legacy alias retained |
| `tables.get_length_of` | `tables.length` | `tables.length(table, result)` | identity; legacy alias retained |
| `tables.log` | `tables.log` | `tables.log(message)` | identity; legacy alias retained |
| `tables.remove_entry_at_position_of` | `tables.remove` | `tables.remove(table, index)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `tables.set_entry_of_to` | `tables.set` | `tables.set(table, key, value)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `text.concatenate_with` | `text.concat` | `text.concat(first, second, result)` | identity; legacy alias retained |
| `text.get_length_of` | `text.length` | `text.length(text, result)` | identity; legacy alias retained |
| `text.lower` | `text.lower` | `text.lower(text, result)` | identity; legacy alias retained |
| `text.replace_in_by` | `text.replace` | `text.replace(text, search, replacement)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `text.sub` | `text.slice` | `text.slice(text, start, end)` | identity; legacy alias retained |
| `text.split` | `text.split` | `text.split(text, separator, table)` | identity; legacy alias retained |
| `text.upper` | `text.upper` | `text.upper(text, result)` | identity; legacy alias retained |
| `time.format_current_date_time` | `time.format_now` | `time.format_now(format, result)` | identity; legacy alias retained |
| `time.format_from_unix` | `time.format_unix` | `time.format_unix(timestamp, format, result)` | identity; legacy alias retained |
| `time.get_server_unix_timestamp` | `time.server_unix` | `time.server_unix(result)` | identity; legacy alias retained |
| `time.get_tick` | `time.tick` | `time.tick(result)` | identity; legacy alias retained |
| `time.get_timezone` | `time.timezone` | `time.timezone(result)` | identity; legacy alias retained |
| `time.get_unix_timestamp` | `time.unix` | `time.unix(result)` | identity; legacy alias retained |
| `logic.wait_seconds` | `time.wait` | `time.wait(seconds)` | identity; legacy alias retained |
| `ui.get_of_asset` | `ui.asset_info` | `ui.asset_info(info, asset_id, result)` | identity; legacy alias retained |
| `ui.get_all_attributes_of` | `ui.attributes` | `ui.attributes(object, result)` | identity; legacy alias retained |
| `ui.dark_theme_enabled` | `ui.dark_theme_enabled` | `if ui.dark_theme_enabled():` | identity; legacy alias retained |
| `ui.delete` | `ui.delete` | `ui.delete(object)` | identity; legacy alias retained |
| `ui.duplicate` | `ui.duplicate` | `ui.duplicate(object, result)` | identity; legacy alias retained |
| `ui.get_attribute` | `ui.get_attribute` | `ui.get_attribute(object, name, result)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `ui.get_property` | `ui.get_property` | `ui.get_property(object, property, result)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `ui.get_text_from` | `ui.get_text` | `ui.get_text(input, result)` | identity; legacy alias retained |
| `ui.make_invisible` | `ui.hide` | `ui.hide(object)` | identity; legacy alias retained |
| `ui.log` | `ui.log` | `ui.log(message)` | identity; legacy alias retained |
| `ui.get_objects_at_position` | `ui.objects_at` | `ui.objects_at(x, y, result)` | identity; legacy alias retained |
| `ui.set_attribute` | `ui.set_attribute` | `ui.set_attribute(object, name, value)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `ui.set_image_to` | `ui.set_image` | `ui.set_image(object, image_id)` | identity; legacy alias retained |
| `ui.set_property` | `ui.set_property` | `ui.set_property(object, property, value)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `ui.set_text_to` | `ui.set_text` | `ui.set_text(object, text)` | identity; legacy alias retained |
| `ui.make_visible` | `ui.show` | `ui.show(object)` | identity; legacy alias retained |
| `ui.tween_of_to` | `ui.tween` | `ui.tween(object, property, value, duration, style, direction)` | canonical parameters reordered into the original block field order; legacy alias retained |
| `variables.increase_by` | `variables.add` | `variables.add(variable, amount)` | identity; legacy alias retained |
| `variables.delete` | `variables.delete` | `variables.delete(variable)` | identity; legacy alias retained |
| `variables.divide_by` | `variables.divide` | `variables.divide(variable, amount)` | identity; legacy alias retained |
| `variables.multiply_by` | `variables.multiply` | `variables.multiply(variable, amount)` | identity; legacy alias retained |
| `variables.set_random` | `variables.random` | `variables.random(variable, minimum, maximum)` | identity; legacy alias retained |
| `variables.set` | `variables.set` | `variables.set(variable, value)` | identity; legacy alias retained |
| `variables.decrease_by` | `variables.subtract` | `variables.subtract(variable, amount)` | identity; legacy alias retained |

## Events

| Old event syntax | API v2 syntax | Mapping |
|---|---|---|
| `on load:` | `on load:` | legacy event name retained |
| `on button_pressed("<button>"):` | `on button_press(button):` | legacy event name retained |
| `on key_pressed("<arg1>"):` | `on key_press(key):` | legacy event name retained |
| `on mouse_enters("<arg1>"):` | `on mouse_enter(object):` | legacy event name retained |
| `on mouse_down_on("<button>"):` | `on mouse_down(object):` | legacy event name retained |
| `on avatar_item_bought("<avataritem>"):` | `on avatar_item_purchased(item):` | legacy event name retained |
| `on input_submitted("<input>"):` | `on input_submit(input):` | legacy event name retained |
| `on message_received():` | `on message_received:` | legacy event name retained |
| `on object_changed("<arg1>"):` | `on object_change(object):` | legacy event name retained |
| `on cross_site_message_received():` | `on site_message_received:` | legacy event name retained |
| `on donation_completed():` | `on donation_complete:` | legacy event name retained |

## Language construct

| Legacy catalog form | Preferred source form |
|---|---|
| `functions.define_function` / `top functions/6 [...]` | `def <function_name>():` |

## Parameter-order examples

```text
# v1: catalog field order (entry, table, value)
tables.set_entry_of_to("entry", "items", "value")

# v2: semantic API order (table, key, value)
tables.set("items", "entry", "value")

# both compile to the same original block fields
```

The compiler and decompiler use the block IDs and structure in `script/*.json`; this migration changes names and named-call argument order only. Generic `top`/`block` syntax is unchanged. See [API_V2.md](./API_V2.md) for all signatures, catalog field types, and examples.
