import { extractComplianceLikelhood } from "../lambdas/common/complianceLikelihoodExtractor";

describe("extractComplianceLikelhood", () => {
    test("should extract valid JSON object containing violationLikelihood and problem", () => {
        const input = `Some text before 
        {
            "violationLikelihood": 3, "problem": "Some issue"
        } some text after`;
        const result = extractComplianceLikelhood(input);
        expect(result).not.toBeNull();
        expect(result).toBe('{"violationLikelihood":3,"problem":"Some issue"}');
    });

    test("should return null when no matching JSON object is found", () => {
        const input = "This text does not contain the required JSON object.";
        const result = extractComplianceLikelhood(input);
        expect(result).toBeNull();
    });

    test("should handle multiple matches but return only the first one", () => {
        const input = `{"violationLikelihood": 2, "problem": "First issue"} some text {"violationLikelihood": 4, "problem": "Second issue"}`;
        const result = extractComplianceLikelhood(input);
        expect(result).not.toBeNull();
        expect(result).toBe('{"violationLikelihood":2,"problem":"First issue"}');
    });
});
