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

## Extracted official manual additions: PML form patterns
## Official PML Form patterns

AVEVA form training material uses both `define form` with `endobject` and `setup form` with `exit` styles depending on product generation and customisation context. The LSP should recognise both command-style form declarations and PML2 method callbacks.

### Form definition structure

```pml
define form !!myForm
  title 'My Form Title'
  button .run |Run| callback |!!myForm.doAction()|
  text .status width 40
endobject
```

```pml
setup form !!myForm dialog docking right
  title |My Form Title|
  paragraph .intro text |Select elements and press Run|
  button .run |Run| callback |!this.doAction()| width 10
exit
```

### Show, hide, and reinitialise

```pml
if (!!myForm.shown()) then
  !!myForm.initialise(!param)
else
  show !!myForm
endif

!!myForm.show()
!!myForm.hide()
```

### Common gadget declarations

```pml
button .apply |Apply| callback |!this.applyChanges()| APPLY width 8
paragraph .message text |Ready|
text .filter width 30
list .elements width 40 height 12 callback |!this.onPick()|
frame .options width 45
toggle .includeBranches |Include branches| callback |!this.refresh()|
radio .mode |Mode| choices |Fast| |Full|
option .scope |Scope| choices |CE| |SITE| |WORLD|
textpane .log width 80 height 15
```

### Callback methods

```pml
define method .doAction()
  !selected = !this.elements.val
  handle any
    !!FMSYS.setProgressText(|Running action for | & !selected.string())
  elsehandle
    $P Form action failed: $!!Error.text
  endhandle
endmethod
```

### Menus

```pml
bar menu .mainMenu
menu .file |File|
button .run |Run| callback |!this.doAction()|
button .close |Close| callback |!this.hide()|
exit
exit

popup menu .elementPopup
button .goto |Go To| callback |!this.gotoSelected()|
button .report |Report| callback |!this.reportSelected()|
exit
```

### Progress from a form

```pml
define method .runWithProgress()
  !items = !this.elements.items()
  !total = !items.size()
  !!FMSYS.setProgress(0)
  do !i indices !items
    !!FMSYS.setProgressText(|Processing | & !i.string() & | of | & !total.string())
    !!FMSYS.setProgress((!i * 100) / !total)
  enddo
  !!FMSYS.setProgress(100)
endmethod
```
