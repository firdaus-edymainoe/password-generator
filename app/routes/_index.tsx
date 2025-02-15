import type { MetaFunction } from "@remix-run/node";
import { FormEvent, useRef, useState } from "react";
import { CopyIcon } from "./CopyIcon";
import { CheckIcon } from "./CheckIcon";

export const meta: MetaFunction = () => {
	return [
		{ title: "Random Password Generator" },
		{ name: "description", content: "Secure Open Sourced Random Password Generator" },
	];
};

function generatePassword(includeUppercase: boolean, includeLowercase: boolean, includeNumber: boolean, includeSymbol: boolean, length: number = 12, excludeCharacters: string = ""): string {
	if (length < 1 || isNaN(length) || typeof length !== 'number') {
		return "Password length must be a number greater than 0.";
	}

	let characters = "";
	if (includeUppercase) {
		characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	}
	if (includeLowercase) {
		characters += "abcdefghijklmnopqrstuvwxyz";
	}
	if (includeNumber) {
		characters += "0123456789";
	}
	if (includeSymbol) {
		characters += "!@#$%^&*()_+~`|}{[]\\:;?><,./-=";
	}

	// Remove excluded characters
	characters = characters.replace(new RegExp(`[${excludeCharacters.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}]`, 'g'), '');

	if (characters === "") {
		return "No characters available after exclusion. Please check your exclusion list or include more character types.";
	}

	let password = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		password += characters.charAt(randomIndex);
	}
	return password;
}

function Checkbox({ id, label, defaultChecked = true }: { id: string, label: string, defaultChecked?: boolean }) {
	return (
		<div className="flex gap-2">
			<input type="checkbox" id={id} defaultChecked={defaultChecked} />
			<label htmlFor={id}>{label}</label>
		</div>
	)
}

export default function Index() {
	const formRef = useRef<HTMLFormElement>(null)
	const [password, setPassword] = useState(generatePassword(true, true, true, true))
	const [copied, setCopied] = useState(false);

	function handleSubmit(e: FormEvent) {
		e.preventDefault()

		const includeUppercase = getFormValueById("uppercase")
		const includeLowercase = getFormValueById("lowercase")
		const includeNumber = getFormValueById("number")
		const includeSymbol = getFormValueById("symbol")
		const passwordLength = getPasswordLength();
		const excludedCharsResult = getExcludedChars();

		const newPassword = generatePassword(includeUppercase, includeLowercase, includeNumber, includeSymbol, passwordLength, excludedCharsResult)
		setPassword(newPassword)
	}

	function getFormValueById(id: string) {
		const uppercaseInput = formRef.current?.elements.namedItem(id) as HTMLInputElement;
		if (uppercaseInput) {
			console.log("Uppercase from form:", uppercaseInput.checked);
			return uppercaseInput.checked
		} else {
			console.error("Could not find uppercase input element.");
			return false
		}
	}

	function getPasswordLength(): number {
		const lengthInput = formRef.current?.elements.namedItem("length") as HTMLInputElement;
		if (!lengthInput) return 12

		const length = Number(lengthInput.value)

		if (length < 1 || isNaN(length) || typeof length !== 'number' || !Number.isInteger(length)) {
			return 12
		}

		return length
	}

	function getExcludedChars(): string | string {
		const excludeInput = formRef.current?.elements.namedItem("exclude") as HTMLInputElement;

		if (!excludeInput) {
			return "Exclude input not found";
		}

		const excludedChars = excludeInput.value;

		if (excludedChars.length > 0) {
			// Option 1: Return as a string (as currently used in generatePassword)
			return excludedChars;
		} else {
			return ""; // Or if you choose to return an array
		}
	}

	const copyToClipboard = async () => {
		if (password) {
			try {
				await navigator.clipboard.writeText(password);
				setCopied(true);
				setTimeout(() => setCopied(false), 3000); // Reset copied state after 3 seconds
			} catch (err) {
				console.error("Failed to copy: ", err);
				alert("Failed to copy password. Please copy it manually.");
			}
		}
	};

	return (
		<div className="flex flex-col gap-8 h-svh items-center justify-center">
			<div>
				<header>Random Password Generator</header>
			</div>
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<label htmlFor="generated-password">Password</label>
					<div className="flex gap-2">
						<input id="generated-password" className="border-2 p-2 rounded-full" value={password} />
						<button onClick={copyToClipboard} disabled={!password}>
							{copied ? <CheckIcon /> : <CopyIcon />}
						</button>
					</div>

				</div>
				<div>
					<form
						ref={formRef}
						onSubmit={handleSubmit}
						className="flex flex-col gap-4"
					>
						<div className="flex flex-col gap-2">
							<label htmlFor="length">Password Length</label>
							<input type="number" id="length" className="border-2 p-2 rounded-full" defaultValue={12} min={8} />
						</div>
						<Checkbox
							id="uppercase"
							label="Include Uppercases"
						/>
						<Checkbox
							id="lowercase"
							label="Include Lowercases"
						/>
						<Checkbox
							id="number"
							label="Include Numbers"
						/>
						<Checkbox
							id="symbol"
							label="Include Symbols"
						/>
						<div className="flex flex-col gap-2">
							<label htmlFor="exclude">Exclude Characters</label>
							<input
								type="text"
								id="exclude"
								className="border-2 p-2 rounded-full"
							/>
						</div>
						<button type="submit" className="bg-purple-800 px-4 py-2 rounded-full text-white">Generate</button>
					</form>
				</div>
			</div>
			<div>
				<p>Open sourced on <a className="underline" href="https://github.com/firdaus-edymainoe/password-generator" target="_blank" rel="noreferrer">GitHub</a></p>
			</div>
		</div>
	);
}