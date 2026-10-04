# @snolly/context-store

Redux-like store for React with mutable-style reducers, granular subscriptions and optional persistence (localStorage, AsyncStorage or anything else).

- Write reducers as plain mutations — the store stays immutable under the hood.
- Components re-render only when the value they select actually changes.
- Fast on large stores: a dispatch copies only the changed paths (copy-on-write), not the whole state.
- Save the whole store or chosen keys to any storage and restore it on start.
- Fully typed with TypeScript.

## Installation

```sh
npm install @snolly/context-store
```

Requires `react` and `react-dom` 18.

## Quick start

```ts
// store.ts
import createStore, { createAction, ActionTypes } from "@snolly/context-store";

type Todo = { id: number; title: string; done: boolean };

const initialState = {
	todos: [] as Todo[],
	filter: "all" as "all" | "done",
};

export const actions = {
	addTodo: createAction<Todo>()("ADD_TODO"),
	toggleTodo: createAction<number>()("TOGGLE_TODO"),
	clear: createAction()("CLEAR"),
};

type Actions = ActionTypes<typeof actions>;

export const { StoreProvider, useSelector, useDispatch, isRestored } =
	createStore(initialState, (store, action: Actions) => {
		switch (action.type) {
			case "ADD_TODO":
				store.todos.push(action.payload);
				break;
			case "TOGGLE_TODO": {
				const todo = store.todos.find((t) => t.id === action.payload);
				if (todo) todo.done = !todo.done;
				break;
			}
			case "CLEAR":
				store.todos = [];
				break;
		}
	});
```

```tsx
// App.tsx
import { StoreProvider, useSelector, useDispatch, actions } from "./store";

const Todos = () => {
	const todos = useSelector((store) => store.todos);
	const dispatch = useDispatch();

	return (
		<ul>
			{todos.map((todo) => (
				<li key={todo.id} onClick={() => dispatch(actions.toggleTodo(todo.id))}>
					{todo.done ? "✓ " : ""}
					{todo.title}
				</li>
			))}
		</ul>
	);
};

const App = () => (
	<StoreProvider>
		<Todos />
	</StoreProvider>
);
```

## API

### `createStore(initialState, reducer, options?)`

Returns `{ StoreProvider, useSelector, useDispatch, isRestored }`.

#### `reducer`

Either a single function for the whole store:

```ts
createStore(initialState, (store, action) => {
	if (action.type === "INCREMENT") store.count++;
});
```

or an object of reducers, one per top-level key:

```ts
createStore(initialState, {
	game: (game, action: Actions) => {
		if (action.type === "INCREMENT") game.count += game.power;
	},
	settings: (settings, action: Actions) => {
		if (action.type === "RESET") return { ...settings, level: 0 };
	},
});
```

A reducer can mutate the state it receives, or return a value. A value returned from a single reducer is shallow-merged into the store; a value returned from a key reducer replaces that key.

The state passed to a reducer is a draft. Only use it synchronously inside the reducer — it can't be accessed after the reducer returns. Plain objects and arrays are tracked; other objects (`Map`, `Date`, class instances) are kept by reference, so replace them instead of mutating them.

#### `options`

| Option       | Description                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `deepEqual`  | `(a, b) => boolean`. Used to decide whether a selected value changed. Defaults to a built-in deep comparison.     |
| `deepClone`  | `(obj) => obj`. If set, the whole store is cloned with it before each reducer call instead of copy-on-write. Slow on large stores; only for special cases. |
| `persistent` | Persistence settings, see below.                                                                                  |

### `StoreProvider`

Wrap the part of the app that uses the store. Restores persisted data on mount.

### `useSelector(selector)`

```ts
const count = useSelector((store) => store.game.count);
```

The component re-renders only when the selected value changes (by reference first, then by `deepEqual`).

### `useDispatch()`

```ts
const dispatch = useDispatch();
dispatch(actions.increment());
```

Must be used inside `StoreProvider`.

### `isRestored()`

A hook that returns `true` once persisted data has been restored (immediately if persistence is off). Useful for showing a splash screen.

```ts
const ready = isRestored();
```

### `createAction<Payload>()(type)`

Creates a typed action creator:

```ts
const increment = createAction()("INCREMENT"); // increment() -> { type: "INCREMENT" }
const addRobot = createAction<Robot>()("ADD_ROBOT"); // addRobot(robot) -> { type: "ADD_ROBOT", payload: robot }
```

### `ActionTypes<typeof actions>`

Union of the actions produced by an object of action creators — use it to type the reducer's `action` argument.

## Persistence

```ts
createStore(initialState, reducer, {
	persistent: {
		use: true, // optional, default true
		storeKeys: ["game"], // optional: save only these keys
		setData: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
		getData: (key) => {
			const data = localStorage.getItem(key);
			return data ? JSON.parse(data) : data;
		},
	},
});
```

- `getData` and `setData` may be sync or return a promise (e.g. AsyncStorage in React Native).
- Without `storeKeys` the whole store is saved under the `context-store` key after every change.
- With `storeKeys` each key is saved separately under `context-store-<key>`, and only the keys that changed are written.
- Saved data is restored when `StoreProvider` mounts; `isRestored()` becomes `true` afterwards.

## License

ISC
