export const extractDisputeResolution = (text: string) => {
  const regex = /{\s*"resolution"\s*:\s*\d+\s*}/s;

  const match = regex.exec(text);

  if (match) {
    console.log("match", match);

    const textWithoutResolution = text.replace(match[0], "");

    return {
      text: textWithoutResolution,
      ...JSON.parse(match[0]),
    };
  }

  return null;
};
