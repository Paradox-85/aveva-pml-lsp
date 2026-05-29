// FMSYS methods (Form Management System)
export const FmsysMethods = [
	'setProgressText', 'setProgress', 'main', 'show', 'hide',
	'shown', 'initialise', 'callback'
] as const;

// ARRAY object methods
export const ArrayMethods = [
	'append', 'clear', 'size', 'sort', 'sortUnique', 'unique',
	'intersect', 'difference', 'reIndex', 'sortedIndices', 'evaluate'
] as const;

// STRING object methods
export const StringMethods = [
	'length', 'upcase', 'lowcase', 'match', 'matchWild', 'occurs',
	'split', 'replace', 'before', 'after', 'substring', 'trim',
	'real', 'dbref', 'string', 'boolean', 'format'
] as const;

// FILE object methods
export const FileMethods = [
	'exists', 'deletefile', 'writefile', 'readfile', 'fullname',
	'dtm', 'files', 'isOpen', 'close'
] as const;

// COLLECTION object methods
export const CollectionMethods = [
	'scope', 'type', 'filter', 'results', 'expression'
] as const;

// Universal methods (available on all PML objects)
export const UniversalMethods = [
	'set', 'unset', 'delete', 'clear', 'objectType', 'attributes', 'methods'
] as const;
