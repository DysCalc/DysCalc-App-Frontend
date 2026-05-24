
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
    response_time?: number
}

export type TestOutput = {
    answered: number
    correct: number
    total: number
    accuracy: number
    efficiency_score?: number
    elapsed_seconds: number
    records: TestRecord[]
}

export type TestType = "number_comparison" | "dot_matching" | "number_series"
    | "single_addition" | "single_subtraction" | "complex_arithmetic"
