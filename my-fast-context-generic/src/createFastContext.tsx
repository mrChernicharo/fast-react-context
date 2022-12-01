import React, {
	useState,
	useRef,
	createContext,
	useContext,
	useCallback,
	ReactNode,
	useEffect,
	useSyncExternalStore, // meant to subscribe to a dataSource
} from "react";

export default function createFastContext<Store>(initialState: Store) {
	function useStoreData(): {
		get: () => Store;
		set: (value: Partial<Store>) => void;
		subscribe: (callback: () => void) => () => void;
	} {
		const store = useRef(initialState);

		const get = () => store.current;

		const subscribers = useRef(new Set<() => void>());

		const set = (value: Partial<Store>) => {
			store.current = { ...store.current, ...value };
			subscribers.current.forEach(callback => callback());
		};

		const subscribe = (callback: () => void) => {
			subscribers.current.add(callback);
			console.log(JSON.stringify({ subscribers }));
			return () => {
				console.log(JSON.stringify({ subscribers }));

				subscribers.current.delete(callback);
			};
		};

		return { get, set, subscribe };
	}

	type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

	const StoreContext = createContext<UseStoreDataReturnType | null>(null);

	const Provider = ({ children }: { children: ReactNode }) => {
		return (
			<StoreContext.Provider value={useStoreData()}>
				{children}
			</StoreContext.Provider>
		);
	};

	function useStore<T>(
		selector: (store: Store) => T
	): [T, (value: Partial<Store>) => void] {
		const store = useContext(StoreContext);
		if (!store) {
			throw new Error("Store not found!");
		}

		const [state, setState] = useState(() => selector(store.get()));
		useEffect(() => {
			return store.subscribe(() => setState(selector(store.get())));
		});
		// const state = useSyncExternalStore(store.subscribe, () => selector(store.get()));

		return [state, store.set];
	}

	return { Provider, useStore };
}
