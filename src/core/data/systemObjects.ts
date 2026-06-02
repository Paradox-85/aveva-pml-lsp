// PML system object method and value constants used by completion/diagnostic providers.
// Names are stored in the spelling commonly seen in PML examples; consumers should compare case-insensitively.

// FMSYS methods (Forms and Menus System)
export const FmsysMethods = [
	'setProgressText', 'setProgress', 'setInterrupt', 'clearInterrupt',
	'main', 'show', 'hide', 'shown', 'initialise', 'callback',
	'loadForm', 'currentDocument', 'refreshViews', 'checkFormReferences'
] as const;

// CMSYS methods (Command Manager / .NET command integration)
export const CmsysMethods = [
	'addCommand', 'removeCommand', 'command', 'commands', 'execute',
	'enable', 'disable', 'visible', 'checked', 'refresh'
] as const;

// ARRAY object methods
export const ArrayMethods = [
	'append', 'clear', 'size', 'sort', 'sortUnique', 'unique',
	'intersect', 'difference', 'reIndex', 'sortedIndices', 'evaluate',
	'last', 'first', 'invert', 'insert', 'remove'
] as const;

// STRING object methods
export const StringMethods = [
	'length', 'upcase', 'lowcase', 'match', 'matchWild', 'occurs',
	'empty', 'before', 'after', 'boolean', 'dbref', 'split',
	'replace', 'substring', 'trim', 'real', 'string', 'format',
	'eqNoCase'
] as const;

// FILE object methods
export const FileMethods = [
	'open', 'close', 'readFile', 'readRecord', 'writeFile',
	'exists', 'deleteFile', 'fullName', 'files', 'dtm', 'isOpen'
] as const;

// COLLECTION object methods
export const CollectionMethods = [
	'scope', 'type', 'filter', 'results', 'expression',
	'setScope', 'setType', 'setFilter', 'setExpression', 'collect'
] as const;

// SESSION object methods
export const SessionMethods = [
	'mdb', 'user', 'project', 'team', 'dbs', 'mdbs', 'users', 'teams', 'projects'
] as const;

// MDB object methods and members
export const MdbMethods = [
	'mdb', 'current', 'deferred', 'mode', 'name', 'description', 'refno'
] as const;

// DB object methods and members
export const DbObjectMethods = [
	'name', 'description', 'refno', 'type', 'filename', 'session', 'claim', 'release', 'savework'
] as const;

// POSITION object methods and members
export const PositionMethods = [
	'east', 'north', 'up', 'origin', 'wrt', 'distance', 'midpoint', 'string'
] as const;

// DIRECTION / ORIENTATION object helpers
export const DirectionMethods = [
	'north', 'east', 'up', 'wrt', 'opposite', 'string'
] as const;

export const OrientationMethods = [
	'alpha', 'beta', 'gamma', 'wrt', 'string'
] as const;

// GPHVIEWS object methods
export const GphviewsMethods = [
	'drawlist', 'limits', 'look', 'rotate', 'isometric', 'plan',
	'elevation', 'window', 'close', 'copy', 'measure', 'navigate',
	'tag', 'saveViews', 'restoreViews', 'colour', 'clipbox',
	'viewIndex', 'nextAvailable', 'remove', 'refresh', 'zoom',
	'pan', 'walk', 'centre', 'add', 'clear', 'display', 'undisplay'
] as const;

// DRAWLIST helpers used in production macros
export const DrawlistMethods = [
	'members', 'add', 'remove', 'clear', 'colour', 'translucency',
	'visibility', 'edges', 'limits', 'collect'
] as const;

// Universal methods (available on all PML objects / common object services)
export const UniversalMethods = [
	'set', 'unset', 'delete', 'clear', 'objectType', 'attributes',
	'methods', 'members', 'string', 'copy', 'clone', 'valid', 'defined'
] as const;

// TRACK directive event names commonly used by form code.
export const TrackEvents = [
	'CE', 'ADD', 'REMOVE', 'DELETE', 'RENAME', 'CHANGE',
	'MODIFY', 'SAVEWORK', 'MDB', 'MODULE', 'FORM', 'GADGET'
] as const;

// MTOC / menu-toolbar-command values.
export const MtocValues = [
	'BAR', 'MENU', 'POPUP', 'BUTTON', 'COMMAND', 'TOOLBAR',
	'SEPARATOR', 'TOGGLE', 'RADIO', 'GROUP'
] as const;

// STRING.String('Dn') and related format codes.
export const StringFormatCodes = [
	'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6',
	'F0', 'F1', 'F2', 'F3', 'E0', 'E1', 'E2', 'G', 'N'
] as const;

// COLLECTION command keywords.
export const CollectionKeywords = [
	'COLLECT', 'ALL', 'FOR', 'FROM', 'WHERE', 'WITH', 'EVALUATE',
	'EXPRESSION', 'SCOPE', 'TYPE', 'FILTER', 'RESULTS', 'DRAWLIST'
] as const;

// Global/special PML functions and commands that behave like system entry points.
export const SystemGlobalFunctions = [
	'current session', 'sessions', 'projects', 'teams', 'users', 'mdbs', 'dbs',
	'object', 'array', 'file', 'position', 'direction', 'orientation', 'collection',
	'alert', 'confirm', 'prompt', 'alpha request', 'aid', 'pin', 'pick'
] as const;

// APPXLOAD keys used by application loading customisation.
export const AppxloadKeys = [
	'APPWARE', 'APPGENERAL', 'APPUI', 'APPSTARTUP', 'APPDESIGN',
	'APPDRAFT', 'APPMARINE', 'APPADMIN', 'APPISODRAFT'
] as const;

// ATTDEF supported attribute value types.
export const AttdefTypes = [
	'TEXT', 'STRING', 'REAL', 'INTEGER', 'BOOLEAN', 'LOGICAL',
	'DBREF', 'REF', 'POSITION', 'DIRECTION', 'ORIENTATION', 'ARRAY'
] as const;

// ATTDEF definition flags/codes.
export const AttdefDefiCodes = [
	'DEFI', 'UDAT', 'UDATUNSET', 'UDET', 'UDETUNSET',
	'READONLY', 'WRITEABLE', 'DEFAULT', 'VALIDATE'
] as const;
