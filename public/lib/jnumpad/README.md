# jQuery.NumPad
Flexible touch-optimized numeric keypad for web applications based on jQuery. One of the best things about jQuery.NumPad is that it can easily fit into most UI frameworks using jQuery by merely setting a few templates! The numeric keypad can be used to fill inputs, password fields, general div-elements or entire table columns.

## Demos
- With jQuery mobile: [http://a.kabachnik.info/numeric-keypad-for-jquerymobile.html](http://a.kabachnik.info/numeric-keypad-for-jquerymobile.html)
- With Bootstrap: [http://a.kabachnik.info/jquery-numpad.html](http://a.kabachnik.info/jquery-numpad.html)
- Stand alone: coming soon!

## Documentation
[http://a.kabachnik.info/jquery-numpad.html](http://a.kabachnik.info/jquery-numpad.html)

## Quick start

1) Include the plugin and the CSS in your header

```html
<link rel="stylesheet" href="path_to_numpad_folder/jquery.numpad.css">
<script type="text/javascript" src="path_to_numpad_folder/jquery.numpad.js"></script>
```

2) Initialize numpads for every element you want to toggle a numeric keypad

```javascript
function($){
	$('selector1').numpad();
}
```

## TODOs & Known bugs
- Fix conflicts with the locale based number formatting on input fields with type="number".
- Add position options to place the keypad above or aside the target element
- Make a simple calculator

## License
jQuery.NumPad is an open source project by [Andrej Kabachnik](http://a.kabachnik.info), that is licensed under [MIT](http://opensource.org/licenses/MIT). If you like the plugin an wish to support further development, you can show your appriciation by a <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=B2Y3Y6E45FDBU">donation</a>. Even small donations are a great support!
