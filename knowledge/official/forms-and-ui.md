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

## Phase 3c Forms and UI patterns

### Dropdown List with Images

> [unverified] This `OPTION ... PIX ... PAIRS` shorthand is not confirmed in the checked AVEVA references; validate against the target AVEVA version before use.

```pml
OPTION .myOption 'List with images' PIX WIDTH 64 HEIGHT 64
  VAR LIST _myOption PAIRS |MYPICTURE.PNG| |1|
                           |MYPICTURE2.PNG| |2|
EXIT
```

### Form Lifecycle and Callbacks

- **InitCall / FirstShownCall**: Special form lifecycle callbacks defined in the form setup to trigger macros or methods upon initialization or when the form is first displayed.
- **WAITON**: Command used to pause macro execution until a specific form is dismissed.
  ```pml
  show !!myform
  WAITON FORM !!myform
  ```
- **CALLP**: Used to call a form with a pre-initialization macro (ICOMP = init macro, FCOMP = form).
  ```pml
  CALLP ICOMP FCOMP
  ```

### FMSYS Progress Bar

Control the system progress bar during long loops:

```pml
!!FMSYS.setProgress(0)
!percent = 100 * $!x / !items.Size()
!!FMSYS.setProgress(!percent)
```

### Open Forms Query

List all currently shown forms on the screen:

```pml
q var !!fmsys.shownforms()
```

### UI Context and Module Info

> [unverified] `!!appcntrl.formtitle` and `!!appcntrl.currentapp` were not confirmed in the checked AVEVA references; validate against the target AVEVA version before use.

Get the current module form title and application name:

```pml
Q VAR !!appcntrl.formtitle
Q VAR !!appcntrl.currentapp
```

### PML.NET Grid Control (Excel Data Source)

Bind a .NET grid control to an Excel file using `NETDATASOURCE`:

```pml
using namespace 'Aveva.Pdms.Presentation'
Import 'GridControl'
!grid = object NETGRIDCONTROL()
!nds  = object NETDATASOURCE('Grid Control Example', 'c:\excel.xls')
!grid.bindToDataSource(!nds)
!titles = !grid.getColumn(1)
```
