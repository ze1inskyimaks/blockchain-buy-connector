export const getErrorMessage = (error: any): string => {
  console.error("Full blockchain error:", error);
  const errorString = error.toString();
  const match = errorString.match(/execution reverted: "([^"]+)"/);
  return match ? match[1] : "Unknown error occurred";
};