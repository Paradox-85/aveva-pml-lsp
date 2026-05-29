# Official PML Forms and UI

Sources:

- Form Concepts: Getting Started: https://docs.aveva.com/bundle/e3d-design/page/1026910.html
- Form and Gadget Callbacks: https://docs.aveva.com/bundle/e3d-design/page/1026925.html
- Forms: https://docs.aveva.com/bundle/e3d-design/page/1026966.html
- Commands: https://docs.aveva.com/bundle/e3d-design/page/1027412.html
- Form Layout: https://docs.aveva.com/bundle/e3d-design/page/1027974.html
- Menus: https://docs.aveva.com/bundle/e3d-design/page/1211102.html
- Frames: https://docs.aveva.com/bundle/e3d-design/page/1027068.html
- Gadgets and Their Attributes: https://docs.aveva.com/bundle/e3d-design/page/1027075.html
- Gadget Set: https://docs.aveva.com/bundle/e3d-design/page/1027113.html
- Alert Objects: https://docs.aveva.com/bundle/e3d-design/page/1027267.html

## Form declaration pattern

```pml
SETUP FORM !!MyForm DIALOG
  -- gadgets, callbacks, members
EXIT
```

## Gadget and callback pattern

The extracted parser supports form gadgets including `button`, `text`, `combo`, `option`, `toggle`, `container`, `menu`, `para`/`paragraph`, and `frame`.

Callbacks are validated by the core `FormReferenceValidator` when direct `!this.Method()` / `.Method()` callback strings refer to missing methods.

```pml
BUTTON .apply 'Apply' CALL '!this.Apply()'
DEFINE METHOD .Apply()
ENDMETHOD
```

## Layout

Layout constraints and full gadget attribute lists must be expanded from the official pages above during the full crawl pass.
