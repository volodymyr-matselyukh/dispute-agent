import { extractDisputeResolution } from "../lambdas/common/disputeResolutionExtractor";

describe("extractDisputeResolution", () => {
  test("should extract valid JSON object containing resolution", () => {
    const input = `Some text before 
        {
            "resolution": 100
        } some text after`;
    const result = extractDisputeResolution(input);
    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      text: `Some text before 
         some text after`,
      resolution: 100,
    });
  });

  test("should return null when no matching JSON object is found", () => {
    const input = "This text does not contain the required JSON object.";
    const result = extractDisputeResolution(input);
    expect(result).toBeNull();
  });

  test("should handle multiple matches but return only the first one", () => {
    const input = `ololo {"resolution": 2} some text {"resolution": 4}`;
    const result = extractDisputeResolution(input);
    expect(result).not.toBeNull();
    expect(result).toMatchObject({ resolution: 2, text: `ololo  some text {"resolution": 4}` });
  });
});
