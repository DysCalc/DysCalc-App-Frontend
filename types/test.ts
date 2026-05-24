
export type TestItem = {
    id: string;
    question: string;
    correct?: number;
    match?: boolean;
}

export type TestFormat = {
    rationale: string;
    tests: TestItem[];
}

export type TestMetadata = {
    title: string;
    question_prompt: string;
}

export type TestRecord = {
    number: boolean
}

export type TestType = "number_comparison" | "dot_matching" | "number_series"
    | "single_addition" | "single_subtraction" | "complex_arithmetic"
