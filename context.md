# Code Context

## Files Retrieved

1.  `package.json` - показывает основные команды для сборки и запуска, а также зависимости.
2.  `docs/examples/t1_collection_xlsx_export.pmlmac` и `t2_sessionHistory_xlsx_export.pmlmac` - примеры PML макросов.
3.  `src/core/data/code-examples-corpus.json` - содержит примеры кода PML, которые могут быть использованы для тестирования.
4.  `dist/mcp/pml-kb-tools.js` - скомпилированный код инструментов, имеющих отношение к PML.

## Key Code

Из `package.json`:

```json
"scripts": {
    "build": "tsc --noEmit false",
    "start": "node dist/server.js",
    "start:http": "node dist/server.js --http-stream",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "validate:kb": "npm run build -- --pretty false && node dist/knowledge/validation/validate-kb.js"
}
```

Это основные команды для работы с проектом.

## Architecture

- Это TypeScript проект, который компилируется в JavaScript.
- `tsc` используется для сборки, результат помещается в `dist`.
- Запуск осуществляется командой `node dist/server.js`.
- Проект содержит инструменты для работы с PML, включая базу знаний и примеры кода.
- MCP-инструменты, по всей видимости, находятся в `dist/mcp`.

## Start Here

Начать стоит с `package.json`, чтобы понять, как собирать и запускать проект. Далее, изучить `docs/examples` и `src/core/data/code-examples-corpus.json` для получения примеров PML кода для тестирования.

## Supervisor coordination

### Риски
- Проект является сервером. Запуск `npm start` или `npm run start:http` может привести к запуску сетевого сервиса. Это нужно делать с осторожностью.
- Не до конца понятно, как именно MCP инструменты интегрируются с AVEVA.

### Что нужно уточнить у пользователя
1.  Каким образом локальный сервер (`pml-lsp-mcp-server`) должен взаимодействовать с AVEVA?
2.  Есть ли какие-то конкретные сценарии PML, которые нужно протестировать в первую очередь?
3.  Можно ли безопасно запускать `npm run build` и `npm start` в текущем окружении?
