import React, {
	useState,
	useRef,
	createContext,
	useContext,
	useCallback,
	ReactNode,
	useEffect,
} from "react";

// useRef keeps track of values, that can be shared between components, but won't cause rerenders
// so we need to create a new communication system between storeData and components

// solution: pubsub!!!

// TextInput subscribes to the store, when store changes, it gets a callback, same to Display

// we'll want to be able to get, set and subscribe to the store

// look at this!
// subscribe: (callback: () => void) => () => void
// that's because when subscribe returns it unsubscribes

type Store = { first: string; last: string };

function useStoreData(): {
	get: () => Store;
	set: (value: Partial<Store>) => void;
	subscribe: (callback: () => void) => () => void;
} {
	const store = useRef({
		first: "",
		last: "",
	});

	const get = useCallback(() => store.current, []);

	const subscribers = useRef(new Set<() => void>());

	const set = useCallback((value: Partial<Store>) => {
		store.current = { ...store.current, ...value };
		subscribers.current.forEach(callback => callback());
	}, []);

	const subscribe = useCallback((callback: () => void) => {
		subscribers.current.add(callback);
		return () => subscribers.current.delete(callback);
	}, []);

	return { get, set, subscribe };
}

type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

const StoreContext = createContext<UseStoreDataReturnType | null>(null);

const Provider = ({ children }: { children: ReactNode }) => {
	return (
		<StoreContext.Provider value={useStoreData()}>{children}</StoreContext.Provider>
	);
};

const useStore = (): [Store, (value: Partial<Store>) => void] => {
	const store = useContext(StoreContext);
	if (!store) throw new Error("Store not found!");

	const [state, setState] = useState(store.get());

	useEffect(() => {
		return store.subscribe(() => setState(store.get()));
	}, []);

	return [state, store.set];
};

const TextInput = ({ value }: { value: "first" | "last" }) => {
	const [store, setStore] = useStore()!;
	return (
		<div className="field">
			{value}:{" "}
			<input
				value={store[value]}
				onChange={e => setStore({ ...store, [value]: e.target.value })}
			/>
		</div>
	);
};

const Display = ({ value }: { value: "first" | "last" }) => {
	const [store] = useStore()!;
	return (
		<div className="value">
			{value}: {store[value]}
		</div>
	);
};

// memo works, but we still have rerenders in every field when updating one
const FormContainer = () => {
	return (
		<div className="container">
			<h5>FormContainer</h5>
			<TextInput value="first" />
			<TextInput value="last" />
		</div>
	);
};

const DisplayContainer = () => {
	return (
		<div className="container">
			<h5>DisplayContainer</h5>
			<Display value="first" />
			<Display value="last" />
		</div>
	);
};

const ContentContainer = () => {
	return (
		<div className="container">
			<h5>ContentContainer</h5>
			<FormContainer />
			<DisplayContainer />
		</div>
	);
};

function App() {
	return (
		<Provider>
			<div className="container">
				<h5>App</h5>
				<ContentContainer />
			</div>
		</Provider>
	);
}

export default App;
