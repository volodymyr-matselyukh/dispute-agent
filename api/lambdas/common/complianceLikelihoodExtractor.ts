export const extractComplianceLikelhood = (text: string) => {
  const regex =
    /{[\s\n]*"violationLikelihood"\s*:\s*\d+\s*,\s*"problem"\s*:\s*".*?"[\s\n]*}/s;

  const match = regex.exec(text);

  if (match) {
    return JSON.stringify(JSON.parse(match[0]));
  }

  return null;
};
