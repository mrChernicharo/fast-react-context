import createFastContext from "./createFastContext";

const { Provider, useStore } = createFastContext({
	first: "John",
	last: "Doe",
	phone: "202 5559800",
	agreed: false,
});

const TextInput = ({ value }: { value: "first" | "last" | "phone" }) => {
	const [fieldValue, setStore] = useStore(store => store[value])!;
	if (typeof fieldValue !== "string") return null;

	return (
		<div className="field">
			{value}:{" "}
			<input
				value={fieldValue}
				onChange={e => setStore({ [value]: e.target.value })}
			/>
		</div>
	);
};

const Checkbox = ({ value }: { value: "agreed" }) => {
	const [fieldValue, setStore] = useStore(store => store[value])!;
	if (typeof fieldValue !== "boolean") return null;

	return (
		<div className="field">
			{value}:{" "}
			<input
				type="checkbox"
				checked={fieldValue}
				onChange={e => setStore({ [value]: e.target.checked })}
			/>
		</div>
	);
};

const Display = ({ value }: { value: "first" | "last" | "phone" | "agreed" }) => {
	const [fieldValue] = useStore(store => store[value])!;
	return (
		<div className="value">
			{value}: {fieldValue.toString()}
		</div>
	);
};

const FormContainer = () => {
	return (
		<div className="container">
			<h5>FormContainer</h5>
			<TextInput value="first" />
			<TextInput value="last" />
			<TextInput value="phone" />
			<Checkbox value="agreed" />
		</div>
	);
};

const DisplayContainer = () => {
	return (
		<div className="container">
			<h5>DisplayContainer</h5>
			<Display value="first" />
			<Display value="last" />
			<Display value="phone" />
			<Display value="agreed" />
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
